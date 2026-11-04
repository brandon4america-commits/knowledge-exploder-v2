# Implementation Plan: Generative AI Sub-Graph Synthesis & Dynamic Divergence Diff Heatmap (Graphiverse v2.6.0)

## 1. Executive Summary
Expand Knowledge Exploder (Graphiverse v2.6.0) with two major architectural capabilities chosen by the user:
1. **Generative AI Sub-Graph Synthesis with Dynamic Gemini Expansion**: Empowering users and autonomous swarms to synthesize fine-grained ontological microcosms using the Gemini model (`gemini-3.8-flash`), generating 6–12 specialized concept micro-nodes with epistemic edge predicates and physics anchors.
2. **Dynamic Diff Heatmap Highlighting Structural Divergence**: An analytical visual engine for split-screen counterfactual playback (Viewport A vs Viewport B) that dynamically computes and renders topological differences (added/removed/mutated nodes and synaptic conductivities) with high-visibility glow heatmaps and divergence telemetry.

---

## 2. Proposed Architecture & Component Changes

### A. AI Sub-Graph Synthesis Service (`/services/geminiService.ts` & `/types.ts`)
- **Type Definitions (`/types.ts`)**:
  - Add `SubGraphSynthesisRequest` and `SubGraphSynthesisResponse`.
  - Add `TopologicalDivergenceDiff` representing node status (`UNCHANGED`, `ADDED_IN_FORK`, `REMOVED_IN_FORK`, `MUTATED_PROPERTY`) and link status (`ADDED_SYNAPSE`, `REMOVED_SYNAPSE`, `CONDUCTIVITY_DRIFT`).
  - Add divergence score metrics to `CounterfactualFork`.
- **Gemini Service Integration (`/services/geminiService.ts`)**:
  - Implement `synthesizeNodeSubGraph(concept: string, parentContext: string, domain: string): Promise<GeminiGraphResponse>` using `gemini-3.8-flash`.
  - Provide a deterministic mathematical fallback generator for offline resilience and rate-limit circuit breaking.

### B. Dynamic Divergence Diff Engine (`/services/divergenceDiffEngine.ts`)
- Create a dedicated topological difference engine:
  - `computeTopologicalDiff(canonical: GraphData, forked: GraphData): TopologicalDivergenceDiff`
  - Calculates Hamming edge distance, Jaccard node similarity index, and normalized Structural Divergence Score ($S_{\text{div}} \in [0, 100\%]$).
  - Determines per-node divergence heat intensity ($H_i \in [0, 1]$) based on local synaptic reconfiguration.

### C. Divergence Diff Heatmap Overlay (`/components/DivergenceDiffOverlay.tsx`)
- High-performance SVG overlay mounted over both Viewport A and Viewport B in split-screen mode:
  - **Viewport A (Canonical)**: Red/amber phosphor reticles on nodes or synapses severed or mutated in the fork.
  - **Viewport B (Forked)**: Vibrant emerald/cyan phosphor auras on newly materialized counterfactual branches and intensified pathways.
  - Color-ramped chromatic rings based on local strain and topological difference.

### D. Interactive UI & Controls
- **`InsightOverlay.tsx`**:
  - Upgrade the "Dive Microcosm" action to a dual-state control: "Dive Microcosm" and "AI Synthesize Sub-Graph" with live progress indicators.
- **`VcrTimelineController.tsx`**:
  - Add a **Divergence Diff Heatmap Toggle** (`[SHOW DIFF HEATMAP]`).
  - Render live diff telemetry: $\Delta$ Nodes, $\Delta$ Synapses, and Divergence Index percentage.
  - Add **Focus Divergence Hotspot** button that pans camera to the node with highest structural variance.
- **`Graph.tsx` & `App.tsx`**:
  - Mount `DivergenceDiffOverlay` in Viewport A and Viewport B when split-screen is active.
  - Wire `handleSynthesizeSubGraph` to orchestrate Gemini generation and seamless breadcrumb camera dive.

---

## 3. Step-by-Step Implementation Sequence

1. **Types & Schema (`/types.ts`)**:
   - Define `TopologicalDivergenceDiff`, `NodeDiffStatus`, `LinkDiffStatus`, and `SubGraphSynthesisSpec`.
2. **Divergence Engine (`/services/divergenceDiffEngine.ts`)**:
   - Implement `computeTopologicalDiff` with node/link set operations and divergence scoring.
3. **AI Generation (`/services/geminiService.ts`)**:
   - Implement `synthesizeNodeSubGraph` with structured prompting for specialized micro-ontologies and robust fallback.
4. **Diff Heatmap Component (`/components/DivergenceDiffOverlay.tsx`)**:
   - Create the visual SVG heatmap layer rendering chromatic halos and dashed divergence vectors.
5. **Graph Viewport Integration (`/components/Graph.tsx`)**:
   - Accept `divergenceDiff?: TopologicalDivergenceDiff` and `divergenceRole?: 'CANONICAL' | 'FORK'`.
   - Mount `<DivergenceDiffOverlay />` under the HUD layers.
6. **Timeline HUD Update (`/components/VcrTimelineController.tsx`)**:
   - Display dynamic divergence metrics badge and toggle for the diff heatmap.
7. **Main Orchestrator (`/App.tsx`)**:
   - Wire `topologicalDiff` memoization between `canonicalViewportData` and `divergentViewportData`.
   - Connect dynamic Gemini sub-graph synthesis to `handleDiveMicrocosm`.
8. **Verification & Testing**:
   - Run `lint_applet` and `compile_applet` to guarantee type safety and successful bundling.

---

## 4. Implementation Status
**Completed:**
- [x] Generative AI Sub-Graph Synthesis with Gemini Flash cascade and deterministic fallback
- [x] Dynamic Diff Heatmap Highlighting Structural Divergence across split-screen counterfactual forking
- [x] Epicenter focus crosshairs and divergence telemetry HUD in VCR controller
- [x] Zero compilation or lint errors across TypeScript architecture
