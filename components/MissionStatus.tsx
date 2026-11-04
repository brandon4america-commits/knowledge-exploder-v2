import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { DiscoveryMission } from '../types';

interface MissionStatusProps {
  mission: DiscoveryMission | null;
  autoCollapse?: boolean;
}

const MissionStatus: React.FC<MissionStatusProps> = ({ mission, autoCollapse = false }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(autoCollapse);

  useEffect(() => {
    setIsCollapsed(autoCollapse);
  }, [autoCollapse]);

  if (!mission) return null;

  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="absolute top-14 left-4 z-20 w-76 max-w-[calc(100vw-2rem)] bg-[#07090e]/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.75)] text-slate-100 select-none overflow-hidden"
    >
      <div
        onClick={() => setIsCollapsed(prev => !prev)}
        className="px-3.5 py-2.5 border-b border-slate-800/80 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-900/60 transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3 h-3 text-sky-400 shrink-0" />
            <span>Mission Protocol</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 tabular-nums">{Math.round(mission.progress || 0)}%</span>
          </div>
          <h2 className="text-xs font-bold text-white tracking-tight truncate mt-0.5">
            {mission.topic}
          </h2>
        </div>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setIsCollapsed(prev => !prev);
          }}
          className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          title={isCollapsed ? 'Expand Mission Telemetry' : 'Minimize Mission Telemetry'}
        >
          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-3.5 space-y-3.5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              <span>Milestone Synchronization</span>
              <span className="text-sky-300 tabular-nums">{Math.round(mission.progress || 0)}%</span>
            </div>
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${mission.progress}%` }}
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"
              />
            </div>
          </div>

          <ul className="space-y-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/90">
            {mission.milestones.map((m, i) => (
              <li
                key={i}
                className={cn(
                  'flex items-start gap-2.5 text-[10px] font-medium leading-snug transition-colors',
                  mission.progress > (i + 1) * 30 ? 'text-sky-300' : 'text-slate-400'
                )}
              >
                <div
                  className={cn(
                    'mt-1 w-2 h-2 rounded-full shrink-0 border',
                    mission.progress > (i + 1) * 30
                      ? 'bg-sky-400 border-sky-200'
                      : 'bg-slate-800 border-slate-700'
                  )}
                />
                <span>{m}</span>
              </li>
            ))}
          </ul>

          <AnimatePresence>
            {mission.lastSynthesis && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="p-3 bg-sky-950/30 rounded-lg border border-sky-500/30"
              >
                <div className="text-[9px] font-mono font-bold text-sky-400 uppercase tracking-wider mb-1">
                  Cognitive Core Synthesis
                </div>
                <p className="text-[11px] text-slate-200 leading-relaxed line-clamp-3">
                  {mission.lastSynthesis}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default MissionStatus;

