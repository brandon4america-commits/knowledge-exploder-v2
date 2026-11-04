import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, HardDrive, Download, Upload, Trash2, RefreshCw, CheckCircle2, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { getStorageStats, exportEvolutionaryStateFile, clearEvolutionaryMemory, StorageStats } from '../services/storageService';
import { AutogenesisState, WorkspaceSnapshot } from '../types';

interface EvolutionaryStateMemoryHUDProps {
  autogenesis: AutogenesisState;
  snapshotCount: number;
  onSaveStateNow: () => void;
  onImportState: (fileContent: string) => void;
  onResetMemory: () => void;
  onExportState: () => void;
  systemNotice?: string | null;
}

export const EvolutionaryStateMemoryHUD: React.FC<EvolutionaryStateMemoryHUDProps> = ({
  autogenesis,
  snapshotCount,
  onSaveStateNow,
  onImportState,
  onResetMemory,
  onExportState,
  systemNotice
}) => {
  const [stats, setStats] = useState<StorageStats>(() => getStorageStats());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(getStorageStats());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleManualSave = () => {
    setIsSaving(true);
    onSaveStateNow();
    setTimeout(() => {
      setStats(getStorageStats());
      setIsSaving(false);
    }, 400);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        onImportState(content);
        setStats(getStorageStats());
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="relative inline-block select-none">
      {/* HUD Trigger Button */}
      <button
        type="button"
        data-swarm-target="memory-persistence-hud-trigger"
        onClick={() => setIsExpanded(prev => !prev)}
        className={cn(
          'px-2.5 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer font-mono text-[10px]',
          isExpanded
            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300'
        )}
        title="Evolutionary State Memory Persistence HUD (Persisted Across Sessions)"
      >
        <div className="relative flex items-center justify-center">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <div className="flex items-center gap-1.5 font-bold">
          <span className="uppercase text-emerald-300">Memory Sync</span>
          <span className="text-slate-500">·</span>
          <span className="text-sky-300">{autogenesis.generationVersion}</span>
          <span className="hidden sm:inline text-slate-400">({autogenesis.mutations.length} mut)</span>
        </div>
      </button>

      {/* Expanded Control Panel Dropdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full mt-2 w-80 bg-slate-950/95 border-2 border-emerald-500/40 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-50 text-slate-200 space-y-3 font-mono"
          >
            {/* HUD Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase text-white tracking-wider">
                  Evolutionary State Memory
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/40">
                ACTIVE PERSISTENCE
              </span>
            </div>

            {/* Storage Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Current Generation</span>
                <span className="font-bold text-sky-400 text-xs">{autogenesis.generationVersion}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Saved Mutations</span>
                <span className="font-bold text-emerald-400 text-xs">{autogenesis.mutations.length} Lineage Steps</span>
              </div>
              <div>
                <span className="text-slate-500 block">Storage Quota</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-300"
                      style={{ width: `${Math.max(4, stats.quotaPercent)}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-300 text-[9px]">{stats.formattedSize}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Last Auto-Sync</span>
                <span className="font-bold text-amber-300 text-[10px]">{stats.lastSavedAt}</span>
              </div>
            </div>

            {/* Active Hypothesis Persistence Indicator */}
            {autogenesis.activeHypothesis && (
              <div className="p-2 rounded-lg bg-sky-950/40 border border-sky-500/30 text-[9.5px]">
                <span className="text-sky-400 font-bold uppercase block mb-0.5">Active Evolution Hypothesis:</span>
                <p className="text-slate-300 line-clamp-2 leading-relaxed italic">
                  "{autogenesis.activeHypothesis}"
                </p>
              </div>
            )}

            {/* Quick Action Control Buttons */}
            <div className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={handleManualSave}
                disabled={isSaving}
                className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/60 text-emerald-200 text-[10px] font-bold uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw className={cn('w-3.5 h-3.5 text-emerald-400', isSaving && 'animate-spin')} />
                <span>{isSaving ? 'Persisting State...' : 'Flush & Persist State Memory Now'}</span>
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={onExportState}
                  className="py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300 hover:text-white text-[9.5px] font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download className="w-3 h-3 text-sky-400" />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 hover:text-white text-[9.5px] font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Upload className="w-3 h-3 text-amber-400" />
                  <span>Import JSON</span>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />

              {/* Reset Evolutionary Memory Button with Confirmation */}
              {!confirmClear ? (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="w-full py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-100 text-[9px] font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Trash2 className="w-3 h-3 text-rose-400" />
                  <span>Purge Persistent Memory</span>
                </button>
              ) : (
                <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-300 text-[9px] font-bold">
                    <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>Purge all saved evolutionary state?</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onResetMemory();
                        setConfirmClear(false);
                        setIsExpanded(false);
                      }}
                      className="flex-1 py-1 rounded bg-rose-500 text-white font-bold text-[9px] uppercase cursor-pointer"
                    >
                      Confirm Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[9px] uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Invariant Note */}
            <div className="text-[8.5px] text-slate-500 text-center border-t border-slate-800/80 pt-2 flex items-center justify-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
              <span>Auto-persisted during and across browser sessions</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
