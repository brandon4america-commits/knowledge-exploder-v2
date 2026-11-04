/**
 * Quantum Analytics Studio & Pathfinding Terminal
 * Displays shortest axiomatic geodesics, topological entropy, and anomaly heatmaps.
 */

import React, { useState } from 'react';
import {
  Compass,
  Cpu,
  Layers,
  Zap,
  TrendingUp,
  AlertTriangle,
  GitCommit,
  BarChart2,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { GraphNode, QuantumAnalyticsMetrics } from '../types';

interface QuantumAnalyticsStudioProps {
  nodes: GraphNode[];
  metrics: QuantumAnalyticsMetrics;
  selectedStartId: string | null;
  selectedEndId: string | null;
  onSelectStartNode: (id: string | null) => void;
  onSelectEndNode: (id: string | null) => void;
  onRecalculate: () => void;
  className?: string;
}

export const QuantumAnalyticsStudio: React.FC<QuantumAnalyticsStudioProps> = ({
  nodes,
  metrics,
  selectedStartId,
  selectedEndId,
  onSelectStartNode,
  onSelectEndNode,
  onRecalculate,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'PATHFINDING' | 'HEATMAP' | 'CENTRALITY'>('PATHFINDING');

  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-[#07090e]/95 border-l border-slate-800/90 text-slate-100 font-sans select-none overflow-hidden',
        className
      )}
    >
      {/* Studio Header */}
      <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-slate-950/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-950/85 border border-sky-500/40 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
              Quantum Analytics Studio
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              Geodesic Pathfinding & Topological Entropy
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRecalculate}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-400 hover:text-white transition-colors cursor-pointer"
          title="Recalculate Quantum Analytics"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 border-b border-slate-800/80 bg-slate-950/40 text-[10px] font-mono font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('PATHFINDING')}
          className={cn(
            'py-2.5 text-center transition-colors border-b-2 cursor-pointer',
            activeTab === 'PATHFINDING'
              ? 'border-sky-400 text-sky-300 bg-sky-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          Pathfinding
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('HEATMAP')}
          className={cn(
            'py-2.5 text-center transition-colors border-b-2 cursor-pointer',
            activeTab === 'HEATMAP'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          Anomaly Heatmap
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('CENTRALITY')}
          className={cn(
            'py-2.5 text-center transition-colors border-b-2 cursor-pointer',
            activeTab === 'CENTRALITY'
              ? 'border-amber-400 text-amber-300 bg-amber-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          Centrality
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {activeTab === 'PATHFINDING' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <span className="text-[10px] font-mono uppercase font-bold text-sky-400 block tracking-wider">
                Axiomatic Geodesic Route
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Source Node</label>
                  <select
                    value={selectedStartId || ''}
                    onChange={e => onSelectStartNode(e.target.value || null)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-200 text-xs focus:ring-1 focus:ring-sky-400"
                  >
                    <option value="">-- Select Source --</option>
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Target Node</label>
                  <select
                    value={selectedEndId || ''}
                    onChange={e => onSelectEndNode(e.target.value || null)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-slate-200 text-xs focus:ring-1 focus:ring-sky-400"
                  >
                    <option value="">-- Select Target --</option>
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 font-mono text-[11px]">
                <span className="text-slate-400">Path Cost (Impedance):</span>
                <span className="text-sky-300 font-bold tabular-nums">{metrics.pathCost}</span>
              </div>
            </div>

            {/* Path Steps */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">
                Traversal Sequence ({metrics.shortestPathNodeIds.length} Nodes)
              </span>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {metrics.shortestPathNodeIds.map((id, index) => {
                  const node = nodeMap.get(id);
                  if (!node) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-[11px]"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-500/40 text-sky-400 flex items-center justify-center text-[10px] shrink-0 font-bold">
                          {index + 1}
                        </span>
                        <span className="text-slate-200 truncate font-semibold">{node.label}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                        {node.continentId || 'Core'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'HEATMAP' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Topological Entropy</span>
                <span className="text-lg font-bold text-emerald-400 tabular-nums">
                  {(metrics.networkEntropy * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Anomaly Index</span>
                <span className="text-lg font-bold text-amber-400 tabular-nums">
                  {nodes.length > 0 ? `${Math.round(nodes.reduce((acc, n) => acc + (metrics.anomalyMap.get(n.id) || 0), 0) / nodes.length * 100)}%` : '0%'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">
                Node Anomaly Risk Index
              </span>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {nodes.map(n => {
                  const risk = metrics.anomalyMap.get(n.id) || 0.2;
                  const riskColor = risk > 0.7 ? 'text-rose-400 bg-rose-950/30 border-rose-500/40' : risk > 0.4 ? 'text-amber-400 bg-amber-950/30 border-amber-500/40' : 'text-emerald-400 bg-emerald-950/30 border-emerald-500/40';
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        'flex items-center justify-between p-2 rounded-lg border font-mono text-[11px]',
                        riskColor
                      )}
                    >
                      <span className="text-slate-200 truncate font-semibold">{n.label}</span>
                      <span className="tabular-nums font-bold">{(risk * 100).toFixed(0)}% Risk</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'CENTRALITY' && (
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block tracking-wider">
              Eigenvector & Degree Centrality Matrix
            </span>
            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {metrics.centralityRankings.map((item, idx) => (
                <div
                  key={item.nodeId}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-[11px]"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-slate-400 w-4 text-right shrink-0 font-bold">#{idx + 1}</span>
                    <span className="text-slate-200 truncate font-semibold">{item.label}</span>
                  </div>
                  <span className="text-sky-300 font-bold tabular-nums shrink-0">
                    {item.score.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
