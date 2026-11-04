import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  FileText, 
  Cpu, 
  Share2, 
  Download, 
  Check, 
  Filter, 
  ChevronRight, 
  Workflow
} from 'lucide-react';
import { AbstractionTier, GraphData, DiscoveryMission } from '../types';
import { cn } from '../lib/utils';

interface AbstractionNavigatorProps {
  currentTier: AbstractionTier;
  setTier: (tier: AbstractionTier) => void;
  graphData: GraphData;
  mission: DiscoveryMission | null;
  activeRelationshipFilter: string | null;
  setActiveRelationshipFilter: (rel: string | null) => void;
}

const TIERS: Array<{
  key: AbstractionTier;
  level: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    key: 'LEVEL_1_EXECUTIVE',
    level: 'L1',
    title: 'Executive Synthesis',
    description: 'High-level cognitive thesis, core objective, and strategic vectors.',
    icon: <FileText className="w-3.5 h-3.5" />
  },
  {
    key: 'LEVEL_2_CONCEPTUAL',
    level: 'L2',
    title: 'Conceptual Taxonomy',
    description: 'Interconnected concepts, parent-child hierarchies, and core domain anchors.',
    icon: <Layers className="w-3.5 h-3.5" />
  },
  {
    key: 'LEVEL_3_ARCHITECTURAL',
    level: 'L3',
    title: 'Architectural Systems',
    description: 'Causal mechanisms, capability dependencies, and systemic governance.',
    icon: <Cpu className="w-3.5 h-3.5" />
  },
  {
    key: 'LEVEL_4_IMPLEMENTATION',
    level: 'L4',
    title: 'Implementation Graph',
    description: 'Concrete functional pathways, operational primitives, and live node states.',
    icon: <Workflow className="w-3.5 h-3.5" />
  },
  {
    key: 'LEVEL_5_MACHINE',
    level: 'L5',
    title: 'Machine-Readable (RDF)',
    description: 'Formal semantic ontology serialized into JSON-LD & machine vectors.',
    icon: <Share2 className="w-3.5 h-3.5" />
  }
];

export const AbstractionNavigator: React.FC<AbstractionNavigatorProps> = ({
  currentTier,
  setTier,
  graphData,
  mission,
  activeRelationshipFilter,
  setActiveRelationshipFilter
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copiedRdf, setCopiedRdf] = useState<boolean>(false);

  // Extract all unique semantic relationships in the graph
  const relationships = Array.from(new Set(graphData.links.map(l => l.relationship).filter(Boolean))) as string[];

  // Export Machine-Readable JSON-LD Ontology
  const handleExportRdf = () => {
    const jsonLd = {
      "@context": {
        "owl": "http://www.w3.org/2002/07/owl#",
        "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
        "omega": "https://omega-point.ai/ontology#"
      },
      "@id": `omega:${encodeURIComponent(mission?.topic || 'inquiry')}`,
      "@type": "omega:OntologicalSystem",
      "rdfs:label": mission?.topic || 'Inquiry',
      "omega:synergyLevel": mission?.synergyLevel || 0,
      "omega:nodes": graphData.nodes.map(n => ({
        "@id": `omega:node_${n.id}`,
        "rdfs:label": n.label,
        "omega:description": n.description,
        "omega:depth": n.depth,
        "omega:strength": n.strength,
        "omega:isGhost": !!n.isGhost
      })),
      "omega:synapses": graphData.links.map(l => ({
        "@type": `omega:${l.relationship || 'RelatedTo'}`,
        "omega:source": `omega:node_${typeof l.source === 'string' ? l.source : l.source.id}`,
        "omega:target": `omega:node_${typeof l.target === 'string' ? l.target : l.target.id}`,
        "omega:weight": l.strength || 0.5
      }))
    };

    navigator.clipboard.writeText(JSON.stringify(jsonLd, null, 2));
    setCopiedRdf(true);
    setTimeout(() => setCopiedRdf(false), 2500);
  };

  return (
    <div className="absolute top-3 right-4 z-30 flex flex-col items-end gap-2 select-none max-w-[calc(100vw-2rem)]">
      {/* Abstraction Bar Trigger */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[#07090e]/95 border border-slate-800 shadow-lg backdrop-blur-md">
        <div className="hidden sm:flex items-center gap-1.5 pr-2 text-sky-400 font-bold text-[9px] uppercase tracking-wider border-r border-slate-800">
          <Layers className="w-3 h-3" />
          <span>Tier</span>
        </div>

        {/* Tier Badges */}
        <div className="flex items-center gap-1">
          {TIERS.map(t => (
            <button
              key={t.key}
              data-swarm-target={`tier-btn-${t.key}`}
              onClick={() => setTier(t.key)}
              className={cn(
                "px-2.5 py-1 rounded-xl text-[9px] font-mono font-bold transition-all border",
                currentTier === t.key
                  ? "bg-sky-500 text-white border-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.6)] font-black scale-105"
                  : "text-slate-400 border-transparent hover:text-white hover:bg-sky-500/15"
              )}
              title={`${t.level}: ${t.title}`}
            >
              <span className="flex items-center gap-1">
                {t.icon}
                <span>{t.level}</span>
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "p-1.5 rounded-xl border-2 transition-all ml-1",
            isExpanded
              ? "bg-sky-500/20 text-sky-300 border-sky-400"
              : "bg-slate-900/80 text-slate-400 border-sky-500/30 hover:border-sky-400 hover:text-white"
          )}
          title="Toggle Deep Navigator"
        >
          <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-90")} />
        </button>
      </div>

      {/* Expanded Tier Details & Semantic Pathway Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="w-96 p-5 rounded-3xl bg-slate-950/95 border-2 border-sky-400/60 shadow-[0_0_40px_rgba(14,165,233,0.3)] ring-1 ring-white/20 backdrop-blur-2xl space-y-4 text-slate-200"
          >
            {/* Current Tier Detail */}
            {(() => {
              const active = TIERS.find(t => t.key === currentTier) || TIERS[0];
              return (
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border-2 border-sky-500/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                      {active.icon}
                      {active.level}: {active.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[8px] font-mono font-bold border border-sky-400/40">Active Vector</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium italic">
                    {active.description}
                  </p>
                </div>
              );
            })()}

            {/* Semantic Synapse Filter */}
            {relationships.length > 0 && (
              <div className="space-y-2 pt-2 border-t-2 border-sky-500/20">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-sky-400">
                    <Filter className="w-3 h-3" /> Semantic Synapse Filter
                  </span>
                  {activeRelationshipFilter && (
                    <button
                      onClick={() => setActiveRelationshipFilter(null)}
                      className="text-[8px] text-sky-400 hover:text-white underline font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {relationships.map(rel => (
                    <button
                      key={rel}
                      onClick={() => setActiveRelationshipFilter(activeRelationshipFilter === rel ? null : rel)}
                      className={cn(
                        "px-2.5 py-1 rounded-xl text-[9px] font-mono font-bold transition-all border",
                        activeRelationshipFilter === rel
                          ? "bg-sky-500 text-white border-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.5)] font-black"
                          : "bg-slate-900/80 text-slate-400 border-sky-500/30 hover:border-sky-400 hover:text-white"
                      )}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RDF JSON-LD Machine Export */}
            <div className="pt-2 border-t-2 border-sky-500/20 flex items-center justify-between">
              <div className="text-[9px] font-mono text-slate-400">
                <span>Machine Ontology Format: </span>
                <span className="text-sky-400 font-bold">JSON-LD / RDF</span>
              </div>
              <button
                onClick={handleExportRdf}
                className="px-3 py-1.5 rounded-xl bg-sky-500/20 border-2 border-sky-400/60 hover:bg-sky-500/30 hover:border-sky-300 text-sky-300 hover:text-white text-[9px] font-bold font-mono transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(14,165,233,0.2)]"
              >
                {copiedRdf ? <Check className="w-3 h-3 text-emerald-400" /> : <Download className="w-3 h-3 text-sky-400" />}
                {copiedRdf ? 'Copied RDF' : 'Export JSON-LD'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AbstractionNavigator;
