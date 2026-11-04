import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Crosshair, 
  Minimize2, 
  Maximize2, 
  RotateCcw, 
  Sliders, 
  ChevronDown, 
  ChevronUp,
  Layers,
  Sparkles
} from 'lucide-react';
import { KnowledgeContinent, ContinentPhysicsConfig } from '../types';

interface ContinentControlsHUDProps {
  continents: KnowledgeContinent[];
  config: ContinentPhysicsConfig;
  onChangeConfig: (updater: (prev: ContinentPhysicsConfig) => ContinentPhysicsConfig) => void;
  onFocusContinent: (continentId: string) => void;
  onToggleCollapseContinent: (continentId: string) => void;
  onResetContinentAnchors: () => void;
  onOpenContinentWorkspace?: (continent: KnowledgeContinent) => void;
  autoCollapse?: boolean;
}

export const ContinentControlsHUD: React.FC<ContinentControlsHUDProps> = ({
  continents,
  config,
  onChangeConfig,
  onFocusContinent,
  onToggleCollapseContinent,
  onResetContinentAnchors,
  onOpenContinentWorkspace,
  autoCollapse = false
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(!autoCollapse);
  const [showSliders, setShowSliders] = useState<boolean>(false);

  useEffect(() => {
    setIsOpen(!autoCollapse);
  }, [autoCollapse]);

  const totalCollapsed = config.collapsedContinentIds.length;

  return (
    <aside 
      className="absolute bottom-14 left-4 z-30 w-76 max-w-[calc(100vw-2rem)] bg-[#07090e]/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.75)] text-slate-100 select-none transition-all duration-200"
      aria-label="Knowledge Continents Controls"
    >
      {/* Header Bar */}
      <div className="px-4 py-3 border-b border-slate-800/90 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="truncate">
            <h2 className="text-xs font-semibold tracking-wide text-slate-100 truncate">
              Knowledge Continents
            </h2>
            <p className="text-[11px] text-slate-400 font-mono tabular-nums truncate">
              {continents.length} Regions · {totalCollapsed > 0 ? `${totalCollapsed} Folded` : 'All Expanded'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onChangeConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
              config.enabled
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle relationship-based spatial clustering"
          >
            {config.enabled ? 'Active' : 'Unified'}
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title={isOpen ? 'Collapse panel' : 'Expand panel'}
          >
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Sub-navigation bar for Physics Sliders vs Reset */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowSliders(!showSliders)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showSliders ? 'Hide Tectonic Physics' : 'Show Tectonic Physics'}</span>
            </button>

            <button
              type="button"
              onClick={onResetContinentAnchors}
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-slate-400 hover:text-slate-100 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Reset dragged continent positions, isolation, and folded states"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Layout</span>
            </button>
          </div>

          {/* Live Physics Sliders */}
          {showSliders && config.enabled && (
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/90 space-y-3">
              {/* Continent Gravity */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="continent-gravity-slider" className="text-slate-300 font-medium">
                    Continent Gravity
                  </label>
                  <span className="font-mono tabular-nums text-cyan-400 font-semibold">
                    {(config.gravity * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  id="continent-gravity-slider"
                  type="range"
                  min={0.05}
                  max={0.95}
                  step={0.05}
                  value={config.gravity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChangeConfig(prev => ({ ...prev, gravity: val }));
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Tectonic Separation */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="continent-separation-slider" className="text-slate-300 font-medium">
                    Tectonic Separation
                  </label>
                  <span className="font-mono tabular-nums text-cyan-400 font-semibold">
                    {config.separation} <span className="text-[10px] text-slate-500 font-normal">px</span>
                  </span>
                </div>
                <input
                  id="continent-separation-slider"
                  type="range"
                  min={160}
                  max={560}
                  step={20}
                  value={config.separation}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onChangeConfig(prev => ({ ...prev, separation: val }));
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Topographic Membrane Opacity */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="continent-hull-slider" className="text-slate-300 font-medium">
                    Topographic Contours
                  </label>
                  <span className="font-mono tabular-nums text-cyan-400 font-semibold">
                    {Math.round(config.hullOpacity * 100)}%
                  </span>
                </div>
                <input
                  id="continent-hull-slider"
                  type="range"
                  min={0.15}
                  max={1.0}
                  step={0.05}
                  value={config.hullOpacity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChangeConfig(prev => ({ ...prev, hullOpacity: val }));
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          )}

          {/* Active Continents Directory */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-medium flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Relationship Archipelagos</span>
              </span>
              {config.isolatedContinentId && (
                <button
                  type="button"
                  onClick={() => onChangeConfig(prev => ({ ...prev, isolatedContinentId: null }))}
                  className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer font-medium whitespace-nowrap shrink-0"
                >
                  Show All
                </button>
              )}
            </div>

            <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
              {continents.map((continent) => {
                const isIsolated = config.isolatedContinentId === continent.id;
                const isCollapsed = config.collapsedContinentIds.includes(continent.id);

                return (
                  <div
                    key={continent.id}
                    className={`px-2.5 py-2 rounded-lg border transition-colors flex items-center justify-between gap-2 ${
                      isIsolated
                        ? 'bg-slate-800/90 border-cyan-500/60'
                        : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onFocusContinent(continent.id)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group"
                      title={`Fly camera to ${continent.label} (${continent.nodeCount} nodes)`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: continent.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                          {continent.label}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                          {continent.nodeCount} {continent.nodeCount === 1 ? 'node' : 'nodes'} · Mass {continent.aggregateMass.toFixed(1)}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      {onOpenContinentWorkspace && (
                        <button
                          type="button"
                          data-swarm-target={`continent-workspace-${continent.id}`}
                          onClick={() => onOpenContinentWorkspace(continent)}
                          className="p-1.5 rounded border bg-sky-500/15 border-sky-500/40 text-sky-300 hover:bg-sky-500/30 hover:border-sky-400 transition-colors cursor-pointer"
                          title={`Morph ${continent.label} into Creative Workspace Studio`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        data-swarm-target={`continent-focus-${continent.id}`}
                        onClick={() => onFocusContinent(continent.id)}
                        className={`p-1.5 rounded border transition-colors cursor-pointer ${
                          isIsolated
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-slate-700'
                        }`}
                        title={isIsolated ? 'Exit continent isolation' : 'Fly-zoom and isolate continent'}
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        data-swarm-target={`continent-fold-${continent.id}`}
                        onClick={() => onToggleCollapseContinent(continent.id)}
                        className={`p-1.5 rounded border transition-colors cursor-pointer ${
                          isCollapsed
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-slate-700'
                        }`}
                        title={isCollapsed ? 'Expand macro-continent into individual nodes' : 'Collapse continent into single macro-node'}
                      >
                        {isCollapsed ? (
                          <Maximize2 className="w-3.5 h-3.5" />
                        ) : (
                          <Minimize2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Hint */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Drag continent beacons on canvas to rearrange</span>
          </div>
        </div>
      )}
    </aside>
  );
};
