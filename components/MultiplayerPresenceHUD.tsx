/**
 * Multiplayer Presence & Live Cursor Teleportation HUD
 * Renders remote swarm collaborators, their live avatar badges, and cursor telemetry.
 */

import React from 'react';
import { Users, Radio, Globe, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { RemoteCollaborator } from '../types';

interface MultiplayerPresenceHUDProps {
  collaborators: RemoteCollaborator[];
  isMultiplayerActive: boolean;
  onToggleMultiplayer: () => void;
  className?: string;
}

export const MultiplayerPresenceHUD: React.FC<MultiplayerPresenceHUDProps> = ({
  collaborators,
  isMultiplayerActive,
  onToggleMultiplayer,
  className = ''
}) => {
  return (
    <div
      className={cn(
        'absolute top-4 left-6 z-30 select-none font-sans flex items-center gap-2',
        className
      )}
      aria-label="Multiplayer Collaboration & Live Cursors"
    >
      <div className="bg-[#07090e]/95 border border-slate-800/90 rounded-xl shadow-2xl backdrop-blur-md px-3 py-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMultiplayer}
          className={cn(
            'flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer',
            isMultiplayerActive
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
          )}
          title={isMultiplayerActive ? 'Disconnect Multiplayer CRDT Stream' : 'Connect Enterprise Multiplayer Mesh'}
        >
          <div className="relative flex items-center justify-center w-2 h-2">
            <span className={cn('absolute w-2 h-2 rounded-full', isMultiplayerActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500')} />
            <span className={cn('w-2 h-2 rounded-full', isMultiplayerActive ? 'bg-emerald-400' : 'bg-slate-500')} />
          </div>
          <span>{isMultiplayerActive ? 'Multiplayer Active' : 'Offline Mesh'}</span>
        </button>

        {isMultiplayerActive && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800/80">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {collaborators.map(c => (
                <div
                  key={c.id}
                  className="relative group flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-mono font-black text-white border-2 border-[#07090e] shadow"
                  style={{ backgroundColor: c.color }}
                  title={`${c.name} (${c.role}) · Active in ${c.activeModule}`}
                >
                  {c.name.substring(0, 2).toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-[10px] font-mono text-slate-400 pl-1 tabular-nums">
              {collaborators.length} Peers
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
