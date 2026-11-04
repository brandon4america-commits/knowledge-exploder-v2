import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Crosshair, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { GraphNode, GraphLink } from '../types';

interface NodeSearchBarProps {
  nodes: GraphNode[];
  links?: GraphLink[];
  focusedNodeId?: string | null;
  onJumpFocus: (node: GraphNode) => void;
}

const NodeSearchBar: React.FC<NodeSearchBarProps> = ({
  nodes,
  links = [],
  focusedNodeId,
  onJumpFocus
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate connection counts for rich autocomplete preview
  const connectionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    links.forEach(l => {
      const sId = typeof l.source === 'string' ? l.source : l.source.id;
      const tId = typeof l.target === 'string' ? l.target : l.target.id;
      if (sId) counts.set(sId, (counts.get(sId) || 0) + 1);
      if (tId) counts.set(tId, (counts.get(tId) || 0) + 1);
    });
    return counts;
  }, [links]);

  // Filter and prioritize matching nodes
  const filteredNodes = useMemo(() => {
    if (!nodes || nodes.length === 0) return [];
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
      // When query is empty, show up to 6 highest priority nodes (root / high strength / non-ghost)
      return [...nodes]
        .sort((a, b) => {
          if (a.id === focusedNodeId) return -1;
          if (b.id === focusedNodeId) return 1;
          const scoreA = (a.strength || 0) * 10 - (a.depth || 0) * 2;
          const scoreB = (b.strength || 0) * 10 - (b.depth || 0) * 2;
          return scoreB - scoreA;
        })
        .slice(0, 6);
    }

    return [...nodes]
      .filter(n => {
        const label = (n.label || '').toLowerCase();
        const id = (n.id || '').toLowerCase();
        return label.includes(trimmed) || id.includes(trimmed);
      })
      .sort((a, b) => {
        const labelA = (a.label || '').toLowerCase();
        const labelB = (b.label || '').toLowerCase();
        const exactA = labelA === trimmed;
        const exactB = labelB === trimmed;
        if (exactA && !exactB) return -1;
        if (!exactA && exactB) return 1;

        const startsA = labelA.startsWith(trimmed);
        const startsB = labelB.startsWith(trimmed);
        if (startsA && !startsB) return -1;
        if (!startsA && startsB) return 1;

        return (b.strength || 0) - (a.strength || 0);
      })
      .slice(0, 8);
  }, [nodes, query, focusedNodeId]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global keyboard shortcut '/' or 'Ctrl+K' to focus jump search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in another input/textarea
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') {
        if (document.activeElement === inputRef.current && e.key === 'Escape') {
          setIsOpen(false);
          inputRef.current?.blur();
        }
        return;
      }

      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectNode = (node: GraphNode) => {
    onJumpFocus(node);
    setQuery(node.label);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (filteredNodes.length > 0 ? (prev + 1) % filteredNodes.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (filteredNodes.length > 0 ? (prev - 1 + filteredNodes.length) % filteredNodes.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredNodes.length > 0 && filteredNodes[selectedIndex]) {
        handleSelectNode(filteredNodes[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Group colors matching graph palette
  const colors = ['#0ea5e9', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Highlight matching letters in label
  const renderHighlightedLabel = (label: string, search: string) => {
    if (!search.trim()) return <span>{label}</span>;
    const lowerLabel = label.toLowerCase();
    const lowerSearch = search.trim().toLowerCase();
    const idx = lowerLabel.indexOf(lowerSearch);

    if (idx === -1) return <span>{label}</span>;

    const before = label.substring(0, idx);
    const match = label.substring(idx, idx + lowerSearch.length);
    const after = label.substring(idx + lowerSearch.length);

    return (
      <span className="truncate">
        <span>{before}</span>
        <span className="text-sky-300 font-black underline underline-offset-2 decoration-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">
          {match}
        </span>
        <span>{after}</span>
      </span>
    );
  };

  const hasNodes = nodes && nodes.length > 0;

  return (
    <div className="relative w-52 sm:w-60 lg:w-72 select-none" ref={dropdownRef}>
      {/* Compact Search Bar Input */}
      <div 
        className={cn(
          "relative flex items-center bg-slate-900/90 border-2 rounded-2xl transition-all duration-300 shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]",
          isOpen
            ? "border-sky-400 ring-2 ring-sky-400/30 shadow-[0_0_20px_rgba(14,165,233,0.3)] bg-slate-900"
            : "border-sky-500/40 hover:border-sky-400/60"
        )}
      >
        <div className="pl-3.5 pr-2 flex items-center justify-center text-sky-400">
          <Crosshair className={cn("w-4 h-4 transition-transform duration-300", isOpen && "rotate-90 text-sky-300")} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={!hasNodes}
          onChange={e => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => hasNodes && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={hasNodes ? "Jump to node... [/]" : "No active graph nodes"}
          className={cn(
            "w-full bg-transparent py-2.5 text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none",
            !hasNodes && "cursor-not-allowed opacity-60"
          )}
        />

        <div className="pr-3 flex items-center gap-1.5">
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-bold text-sky-400/80 bg-slate-950/80 border border-sky-500/30 rounded-md shadow-sm">
              /
            </kbd>
          )}

          {hasNodes && (
            <span className="text-[9px] font-mono font-bold text-sky-400/70 hidden lg:inline-block">
              {nodes.length}
            </span>
          )}
        </div>
      </div>

      {/* Live Auto-Complete Dropdown List */}
      <AnimatePresence>
        {isOpen && hasNodes && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-950/95 border-2 border-sky-400/80 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_24px_rgba(14,165,233,0.35)] backdrop-blur-2xl overflow-hidden ring-1 ring-white/10"
          >
            {/* Header info bar */}
            <div className="px-3.5 py-2 bg-slate-900/90 border-b border-sky-500/30 flex items-center justify-between text-[8px] font-mono font-black tracking-widest uppercase">
              <span className="text-sky-300 flex items-center gap-1.5">
                <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                {query.trim() ? `Matching Nodes (${filteredNodes.length})` : 'Top Topological Nodes'}
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <span>Select</span>
                <CornerDownLeft className="w-2.5 h-2.5 text-sky-400" />
              </span>
            </div>

            {/* List of matching nodes */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
              {filteredNodes.length > 0 ? (
                filteredNodes.map((node, index) => {
                  const isSelected = index === selectedIndex;
                  const isCurrentlyFocused = node.id === focusedNodeId;
                  const color = colors[node.group % colors.length];
                  const connCount = connectionCounts.get(node.id) || 0;

                  return (
                    <div
                      key={node.id}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => handleSelectNode(node)}
                      className={cn(
                        "group px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 flex items-center justify-between gap-2.5 border",
                        isSelected
                          ? "bg-sky-500/20 border-sky-400/80 shadow-[0_0_15px_rgba(14,165,233,0.35)]"
                          : "border-transparent hover:bg-slate-900/60 text-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Node status / color dot */}
                        <div className="relative shrink-0 flex items-center justify-center">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ 
                              backgroundColor: color, 
                              boxShadow: `0 0 8px ${color}` 
                            }}
                          />
                          {isCurrentlyFocused && (
                            <span className="absolute -inset-1 rounded-full border border-sky-400 animate-ping opacity-75" />
                          )}
                        </div>

                        {/* Label & micro details */}
                        <div className="flex flex-col min-w-0">
                          <div className={cn(
                            "text-xs font-black tracking-tight truncate flex items-center gap-1.5",
                            isSelected ? "text-white" : "text-slate-200"
                          )}>
                            {renderHighlightedLabel(node.label, query)}
                            {node.isGhost && (
                              <span className="text-[7px] font-mono uppercase px-1.5 py-0.2 rounded bg-sky-950/80 border border-sky-400/50 text-sky-300">
                                Ghost
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[8px] font-mono text-slate-400">
                            <span>[NODE_{node.id.split('-')[0].toUpperCase()}]</span>
                            <span>•</span>
                            <span>Tier {node.depth ?? 0}</span>
                            <span>•</span>
                            <span className="text-sky-400/90">{connCount} links</span>
                          </div>
                        </div>
                      </div>

                      {/* Jump button / Enter indicator */}
                      <div className="shrink-0 flex items-center gap-1.5 pl-2">
                        {isSelected ? (
                          <span className="text-[9px] font-mono font-bold text-sky-300 bg-sky-500/30 px-2 py-0.5 rounded-md border border-sky-400 flex items-center gap-1">
                            <span>Jump</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-400">
                            #{index + 1}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 px-4 text-center">
                  <p className="text-xs font-semibold text-slate-400">No matching node labels found</p>
                  <p className="text-[9px] font-mono text-slate-500 mt-1">Try expanding new conceptual vectors</p>
                </div>
              )}
            </div>

            {/* Quick footer helper */}
            <div className="px-3 py-1.5 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-[8px] font-mono text-slate-500">
              <span>↑↓ to navigate</span>
              <span>ESC to dismiss</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NodeSearchBar;
