/**
 * Knowledge Exploder - Decentralized CRDT State Synchronization Bus
 * Architecture: LWW-Element-Set (Last-Write-Wins Element Set) with Lamport Clocks & BroadcastChannel.
 * Guarantees convergence across high-frequency 100-agent Swarm Autopilot cycles and concurrent browser tabs.
 */

import {
  WhiteboardElement,
  WhiteboardConnection,
  WorkspaceCodeFile,
  ProjectTaskTicket,
  MultimediaAsset,
  WorkspaceSnapshot,
  GraphData
} from '../types';

export type CRDTEntityType =
  | 'whiteboardElements'
  | 'whiteboardConnections'
  | 'codeFiles'
  | 'tickets'
  | 'assets';

export interface CRDTRecord<T> {
  id: string;
  item: T;
  lamport: number;
  timestamp: number;
  peerId: string;
}

export interface CRDTTombstone {
  id: string;
  lamport: number;
  timestamp: number;
  peerId: string;
}

export interface CRDTMessage<T = unknown> {
  type: 'CRDT_DELTA_ADD' | 'CRDT_DELTA_REMOVE' | 'CRDT_DELTA_UPDATE' | 'CRDT_FULL_SYNC_REQ' | 'CRDT_FULL_SYNC_RESP';
  entityType?: CRDTEntityType;
  record?: CRDTRecord<T>;
  tombstone?: CRDTTombstone;
  fullState?: SerializedCRDTState;
  lamport: number;
  peerId: string;
}

export interface SerializedCRDTState {
  peerId: string;
  lamport: number;
  whiteboardElements: { adds: CRDTRecord<WhiteboardElement>[]; removes: CRDTTombstone[] };
  whiteboardConnections: { adds: CRDTRecord<WhiteboardConnection>[]; removes: CRDTTombstone[] };
  codeFiles: { adds: CRDTRecord<WorkspaceCodeFile>[]; removes: CRDTTombstone[] };
  tickets: { adds: CRDTRecord<ProjectTaskTicket>[]; removes: CRDTTombstone[] };
  assets: { adds: CRDTRecord<MultimediaAsset>[]; removes: CRDTTombstone[] };
}

export type CRDTListener = (entityType: CRDTEntityType, action: 'ADD' | 'UPDATE' | 'REMOVE' | 'SYNC') => void;

class CRDTStateBus {
  private peerId: string;
  private lamport: number = 0;
  private channel: BroadcastChannel | null = null;
  private listeners: Set<CRDTListener> = new Set();

  // Internal LWW-Element-Sets for all Creative Studio modules
  private stores: {
    whiteboardElements: {
      adds: Map<string, CRDTRecord<WhiteboardElement>>;
      removes: Map<string, CRDTTombstone>;
    };
    whiteboardConnections: {
      adds: Map<string, CRDTRecord<WhiteboardConnection>>;
      removes: Map<string, CRDTTombstone>;
    };
    codeFiles: {
      adds: Map<string, CRDTRecord<WorkspaceCodeFile>>;
      removes: Map<string, CRDTTombstone>;
    };
    tickets: {
      adds: Map<string, CRDTRecord<ProjectTaskTicket>>;
      removes: Map<string, CRDTTombstone>;
    };
    assets: {
      adds: Map<string, CRDTRecord<MultimediaAsset>>;
      removes: Map<string, CRDTTombstone>;
    };
  };

  constructor() {
    this.peerId = `peer-${Math.random().toString(36).substring(2, 9)}-${Date.now().toString(36)}`;
    this.stores = {
      whiteboardElements: { adds: new Map(), removes: new Map() },
      whiteboardConnections: { adds: new Map(), removes: new Map() },
      codeFiles: { adds: new Map(), removes: new Map() },
      tickets: { adds: new Map(), removes: new Map() },
      assets: { adds: new Map(), removes: new Map() }
    };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('knowledge-exploder-crdt-omega');
        this.channel.onmessage = this.handleChannelMessage.bind(this);
        // Request sync from existing peers
        this.broadcast({
          type: 'CRDT_FULL_SYNC_REQ',
          lamport: this.tickLamport(),
          peerId: this.peerId
        });
      } catch (err) {
        console.warn('[CRDT] BroadcastChannel unavailable, running in local-memory mode', err);
      }
    }
  }

  public getPeerId(): string {
    return this.peerId;
  }

  public getLamport(): number {
    return this.lamport;
  }

  private tickLamport(): number {
    return ++this.lamport;
  }

  private updateClock(remoteLamport: number) {
    this.lamport = Math.max(this.lamport, remoteLamport) + 1;
  }

  private isNewer(
    aLamport: number,
    aTime: number,
    aPeer: string,
    bLamport: number,
    bTime: number,
    bPeer: string
  ): boolean {
    if (aLamport !== bLamport) return aLamport > bLamport;
    if (aTime !== bTime) return aTime > bTime;
    return aPeer > bPeer;
  }

  private broadcast(msg: CRDTMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (err) {
        console.warn('[CRDT] Failed to post message to BroadcastChannel', err);
      }
    }
  }

  private handleChannelMessage(event: MessageEvent<CRDTMessage>) {
    const msg = event.data;
    if (!msg || msg.peerId === this.peerId) return;

    this.updateClock(msg.lamport);

    switch (msg.type) {
      case 'CRDT_FULL_SYNC_REQ':
        this.broadcast({
          type: 'CRDT_FULL_SYNC_RESP',
          fullState: this.exportSerializedState(),
          lamport: this.tickLamport(),
          peerId: this.peerId
        });
        break;

      case 'CRDT_FULL_SYNC_RESP':
        if (msg.fullState) {
          this.mergeSerializedState(msg.fullState);
        }
        break;

      case 'CRDT_DELTA_ADD':
      case 'CRDT_DELTA_UPDATE':
        if (msg.entityType && msg.record) {
          this.applyRemoteAdd(msg.entityType, msg.record);
        }
        break;

      case 'CRDT_DELTA_REMOVE':
        if (msg.entityType && msg.tombstone) {
          this.applyRemoteRemove(msg.entityType, msg.tombstone);
        }
        break;
    }
  }

  private applyRemoteAdd<T>(entityType: CRDTEntityType, record: CRDTRecord<T>) {
    const store = this.stores[entityType] as unknown as {
      adds: Map<string, CRDTRecord<T>>;
      removes: Map<string, CRDTTombstone>;
    };

    const tombstone = store.removes.get(record.id);
    if (tombstone) {
      if (this.isNewer(tombstone.lamport, tombstone.timestamp, tombstone.peerId, record.lamport, record.timestamp, record.peerId)) {
        return; // Tombstone is strictly newer, reject addition
      }
      store.removes.delete(record.id);
    }

    const current = store.adds.get(record.id);
    if (!current || this.isNewer(record.lamport, record.timestamp, record.peerId, current.lamport, current.timestamp, current.peerId)) {
      store.adds.set(record.id, record);
      this.notifyListeners(entityType, current ? 'UPDATE' : 'ADD');
    }
  }

  private applyRemoteRemove(entityType: CRDTEntityType, tombstone: CRDTTombstone) {
    const store = this.stores[entityType] as unknown as {
      adds: Map<string, CRDTRecord<unknown>>;
      removes: Map<string, CRDTTombstone>;
    };

    const currentTombstone = store.removes.get(tombstone.id);
    if (currentTombstone && this.isNewer(currentTombstone.lamport, currentTombstone.timestamp, currentTombstone.peerId, tombstone.lamport, tombstone.timestamp, tombstone.peerId)) {
      return;
    }

    const currentAdd = store.adds.get(tombstone.id);
    if (currentAdd) {
      if (this.isNewer(currentAdd.lamport, currentAdd.timestamp, currentAdd.peerId, tombstone.lamport, tombstone.timestamp, tombstone.peerId)) {
        return; // Add is newer than this tombstone
      }
      store.adds.delete(tombstone.id);
    }

    store.removes.set(tombstone.id, tombstone);
    this.notifyListeners(entityType, 'REMOVE');
  }

  // Public CRUD operations with automatic LWW conflict resolution
  public setElement<T extends { id: string }>(
    entityType: CRDTEntityType,
    item: T,
    authorAgent?: string
  ): void {
    const store = this.stores[entityType] as unknown as {
      adds: Map<string, CRDTRecord<T>>;
      removes: Map<string, CRDTTombstone>;
    };

    const lamport = this.tickLamport();
    const timestamp = Date.now();
    const effectivePeer = authorAgent || this.peerId;

    const record: CRDTRecord<T> = {
      id: item.id,
      item,
      lamport,
      timestamp,
      peerId: effectivePeer
    };

    // Remove any older tombstone
    store.removes.delete(item.id);
    store.adds.set(item.id, record);

    this.broadcast({
      type: 'CRDT_DELTA_ADD',
      entityType,
      record: record as CRDTRecord<unknown>,
      lamport,
      peerId: this.peerId
    });

    this.notifyListeners(entityType, 'UPDATE');
  }

  public updateElement<T extends { id: string }>(
    entityType: CRDTEntityType,
    id: string,
    mutator: (prev: T) => T,
    authorAgent?: string
  ): T | null {
    const store = this.stores[entityType] as unknown as {
      adds: Map<string, CRDTRecord<T>>;
      removes: Map<string, CRDTTombstone>;
    };

    const existing = store.adds.get(id);
    if (!existing) return null;

    const updatedItem = mutator(existing.item);
    const lamport = this.tickLamport();
    const timestamp = Date.now();
    const effectivePeer = authorAgent || this.peerId;

    const record: CRDTRecord<T> = {
      id,
      item: updatedItem,
      lamport,
      timestamp,
      peerId: effectivePeer
    };

    store.adds.set(id, record);

    this.broadcast({
      type: 'CRDT_DELTA_UPDATE',
      entityType,
      record: record as CRDTRecord<unknown>,
      lamport,
      peerId: this.peerId
    });

    this.notifyListeners(entityType, 'UPDATE');
    return updatedItem;
  }

  public removeElement(entityType: CRDTEntityType, id: string, authorAgent?: string): void {
    const store = this.stores[entityType] as unknown as {
      adds: Map<string, CRDTRecord<unknown>>;
      removes: Map<string, CRDTTombstone>;
    };

    const lamport = this.tickLamport();
    const timestamp = Date.now();
    const effectivePeer = authorAgent || this.peerId;

    const tombstone: CRDTTombstone = {
      id,
      lamport,
      timestamp,
      peerId: effectivePeer
    };

    store.adds.delete(id);
    store.removes.set(id, tombstone);

    this.broadcast({
      type: 'CRDT_DELTA_REMOVE',
      entityType,
      tombstone,
      lamport,
      peerId: this.peerId
    });

    this.notifyListeners(entityType, 'REMOVE');
  }

  public getElements<T>(entityType: CRDTEntityType): T[] {
    const store = this.stores[entityType] as unknown as {
      adds: Map<string, CRDTRecord<T>>;
      removes: Map<string, CRDTTombstone>;
    };
    const list: T[] = [];
    for (const [id, rec] of store.adds.entries()) {
      if (!store.removes.has(id)) {
        list.push(rec.item);
      }
    }
    return list;
  }

  public getElement<T>(entityType: CRDTEntityType, id: string): T | null {
    const store = this.stores[entityType] as unknown as {
      adds: Map<string, CRDTRecord<T>>;
      removes: Map<string, CRDTTombstone>;
    };
    if (store.removes.has(id)) return null;
    const rec = store.adds.get(id);
    return rec ? rec.item : null;
  }

  // Mass Seed / Initialize from initial arrays without overriding newer data
  public seedInitialState(initialData: {
    whiteboardElements?: WhiteboardElement[];
    whiteboardConnections?: WhiteboardConnection[];
    codeFiles?: WorkspaceCodeFile[];
    tickets?: ProjectTaskTicket[];
    assets?: MultimediaAsset[];
  }) {
    if (initialData.whiteboardElements && this.stores.whiteboardElements.adds.size === 0) {
      initialData.whiteboardElements.forEach(el => this.setElement('whiteboardElements', el, 'SEED_AGENT'));
    }
    if (initialData.whiteboardConnections && this.stores.whiteboardConnections.adds.size === 0) {
      initialData.whiteboardConnections.forEach(c => this.setElement('whiteboardConnections', c, 'SEED_AGENT'));
    }
    if (initialData.codeFiles && this.stores.codeFiles.adds.size === 0) {
      initialData.codeFiles.forEach(f => this.setElement('codeFiles', f, 'SEED_AGENT'));
    }
    if (initialData.tickets && this.stores.tickets.adds.size === 0) {
      initialData.tickets.forEach(t => this.setElement('tickets', t, 'SEED_AGENT'));
    }
    if (initialData.assets && this.stores.assets.adds.size === 0) {
      initialData.assets.forEach(a => this.setElement('assets', a, 'SEED_AGENT'));
    }
  }

  public exportSerializedState(): SerializedCRDTState {
    return {
      peerId: this.peerId,
      lamport: this.lamport,
      whiteboardElements: {
        adds: Array.from(this.stores.whiteboardElements.adds.values()),
        removes: Array.from(this.stores.whiteboardElements.removes.values())
      },
      whiteboardConnections: {
        adds: Array.from(this.stores.whiteboardConnections.adds.values()),
        removes: Array.from(this.stores.whiteboardConnections.removes.values())
      },
      codeFiles: {
        adds: Array.from(this.stores.codeFiles.adds.values()),
        removes: Array.from(this.stores.codeFiles.removes.values())
      },
      tickets: {
        adds: Array.from(this.stores.tickets.adds.values()),
        removes: Array.from(this.stores.tickets.removes.values())
      },
      assets: {
        adds: Array.from(this.stores.assets.adds.values()),
        removes: Array.from(this.stores.assets.removes.values())
      }
    };
  }

  public mergeSerializedState(remoteState: SerializedCRDTState) {
    this.updateClock(remoteState.lamport);

    const mergeStore = <T>(
      entityType: CRDTEntityType,
      adds: CRDTRecord<T>[],
      removes: CRDTTombstone[]
    ) => {
      adds.forEach(rec => this.applyRemoteAdd(entityType, rec));
      removes.forEach(tomb => this.applyRemoteRemove(entityType, tomb));
    };

    mergeStore('whiteboardElements', remoteState.whiteboardElements.adds, remoteState.whiteboardElements.removes);
    mergeStore('whiteboardConnections', remoteState.whiteboardConnections.adds, remoteState.whiteboardConnections.removes);
    mergeStore('codeFiles', remoteState.codeFiles.adds, remoteState.codeFiles.removes);
    mergeStore('tickets', remoteState.tickets.adds, remoteState.tickets.removes);
    mergeStore('assets', remoteState.assets.adds, remoteState.assets.removes);

    this.notifyListeners('whiteboardElements', 'SYNC');
  }

  // Hydrate directly from a Time-Travel Snapshot
  public loadSnapshot(snapshot: WorkspaceSnapshot) {
    this.tickLamport();
    const now = Date.now();

    // Clean current stores
    (['whiteboardElements', 'whiteboardConnections', 'codeFiles', 'tickets', 'assets'] as CRDTEntityType[]).forEach(k => {
      this.stores[k].adds.clear();
      this.stores[k].removes.clear();
    });

    snapshot.whiteboardElements?.forEach(el => this.setElement('whiteboardElements', el, 'SNAPSHOT_RESTORE'));
    snapshot.whiteboardConnections?.forEach(c => this.setElement('whiteboardConnections', c, 'SNAPSHOT_RESTORE'));
    snapshot.codeFiles?.forEach(f => this.setElement('codeFiles', f, 'SNAPSHOT_RESTORE'));
    snapshot.tickets?.forEach(t => this.setElement('tickets', t, 'SNAPSHOT_RESTORE'));
    snapshot.assets?.forEach(a => this.setElement('assets', a, 'SNAPSHOT_RESTORE'));

    this.notifyListeners('whiteboardElements', 'SYNC');
  }

  public subscribe(listener: CRDTListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(entityType: CRDTEntityType, action: 'ADD' | 'UPDATE' | 'REMOVE' | 'SYNC') {
    this.listeners.forEach(fn => {
      try {
        fn(entityType, action);
      } catch (e) {
        console.error('[CRDT] Listener threw error:', e);
      }
    });
  }

  public destroy() {
    this.listeners.clear();
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}

// Global singleton instance for app-wide and cross-module synchronization
export const crdtBus = new CRDTStateBus();
