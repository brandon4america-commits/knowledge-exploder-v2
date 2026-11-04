import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json());

  const graphSchema = {
    type: Type.OBJECT,
    properties: {
      nodes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            label: { type: Type.STRING },
            group: { type: Type.INTEGER },
            description: { type: Type.STRING },
            strength: { type: Type.NUMBER },
            isGhost: { type: Type.BOOLEAN, description: "If true, this is a predicted concept waiting for materialization." }
          },
          required: ["id", "label", "group", "description", "strength"]
        }
      },
      links: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            source: { type: Type.STRING },
            target: { type: Type.STRING },
            relationship: { type: Type.STRING },
            strength: { type: Type.NUMBER }
          },
          required: ["source", "target", "relationship"]
        }
      },
      briefing: { type: Type.STRING, description: "Mission synthesis for the Command Hub." },
      milestones: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Specific cognitive milestones to achieve in this mission."
      }
    },
    required: ["nodes", "links", "briefing", "milestones"]
  };

  // Server-side multi-model circuit breaker to handle per-model free-tier quota limits (429)
  const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  const exhaustedModels = new Map<string, number>();

  const isQuotaError = (err: any): boolean => {
    const msg = String(err?.message || err || '').toLowerCase();
    return (
      err?.status === 429 ||
      err?.code === 429 ||
      msg.includes('429') ||
      msg.includes('quota') ||
      msg.includes('resource_exhausted') ||
      msg.includes('rate limit')
    );
  };

  async function generateWithModelCascade(params: {
    contents: string;
    config?: Record<string, any>;
  }): Promise<string | null> {
    if (!apiKey) return null;
    const now = Date.now();

    for (const model of CANDIDATE_MODELS) {
      const resetAt = exhaustedModels.get(model);
      if (resetAt && now < resetAt) {
        continue;
      }
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        if (isQuotaError(err)) {
          // Trip circuit breaker for this specific model for 60 minutes
          exhaustedModels.set(model, Date.now() + 60 * 60 * 1000);
          continue;
        }
        // For non-quota transient errors, cool down model briefly for 60 seconds
        exhaustedModels.set(model, Date.now() + 60 * 1000);
      }
    }
    return null;
  }

  app.post('/api/gemini/initiate-mission', async (req, res) => {
    const { topic, type } = req.body;
    const text = await generateWithModelCascade({
      contents: `Architect a ${type} ontology mission for "${topic}". 
      Transform information into an interconnected semantic knowledge graph.
      Define parent, child, and sibling concept layers with weighted semantic synapses including:
      IsA, PartOf, DependsOn, Uses, Enables, Influences, Extends, Implements, Secures, Optimizes, Governs.
      Provide 5 primary foundational nodes and 3 predictive 'ghost' nodes for emergent expansion.
      Establish a rigorous cognitive briefing and 3 specific mission milestones.`,
      config: {
        systemInstruction: "You are the Omega Point Semantic Intelligence System. You transform concepts into hierarchical ontologies and weighted knowledge graphs. You map multi-tier relationships (IsA, PartOf, DependsOn, Enables, Optimizes).",
        responseMimeType: "application/json",
        responseSchema: graphSchema,
      }
    });

    if (text) {
      try {
        return res.json(JSON.parse(text));
      } catch {
        // Fall through to structured local synthesis
      }
    }

    return res.json({ fallback: true });
  });

  app.post('/api/gemini/expand-node', async (req, res) => {
    const { nodeLabel, contextTopic, existingNodes, missionType } = req.body;
    const text = await generateWithModelCascade({
      contents: `Recursive ontological deep-dive: "${nodeLabel}" within domain "${contextTopic}". Bias: ${missionType}. 
      Identify hidden dependencies, constraints, capabilities, and emergent behaviors.
      Create weighted relationships (IsA, PartOf, DependsOn, Enables, Influences, Extends, Implements, Secures, Optimizes).
      Avoid existing concepts: ${(existingNodes || []).join(', ')}.`,
      config: {
        systemInstruction: "You are an autonomous semantic knowledge architect. Map deep cognitive vectors and ontological synapses.",
        responseMimeType: "application/json",
        responseSchema: graphSchema,
      }
    });

    if (text) {
      try {
        return res.json(JSON.parse(text));
      } catch {
        // Fall through to structured local expansion
      }
    }

    return res.json({ fallback: true });
  });

  app.post('/api/gemini/synthesize-subgraph', async (req, res) => {
    const { concept, contextTopic, existingNodes } = req.body;
    const text = await generateWithModelCascade({
      contents: `Architect a fine-grained fractal microcosm sub-graph for concept "${concept}" within domain "${contextTopic || 'Universal Knowledge'}".
      Synthesize 6 to 10 specialized sub-concept micro-nodes (such as foundational axioms, invariant invariants, operational dynamics, homeostatic feedback loops, and empirical validation points).
      Link the root concept "${concept}" to each sub-node using epistemic predicates: IsA, PartOf, DependsOn, Uses, Enables, Influences, Extends, Implements, Secures, Optimizes.
      Also cross-link neighboring sub-nodes to form a cohesive intra-cluster mesh.
      Avoid duplicating existing nodes: ${(existingNodes || []).join(', ')}.`,
      config: {
        systemInstruction: "You are the Omega Point Fractal Ontology Engine. You architect rich, self-contained sub-graph microcosms with weighted epistemic relationships and coherent intra-cluster topology.",
        responseMimeType: "application/json",
        responseSchema: graphSchema,
      }
    });

    if (text) {
      try {
        return res.json(JSON.parse(text));
      } catch {
        // Fall through to fallback
      }
    }

    return res.json({ fallback: true });
  });

  app.post('/api/gemini/synthesize-mission', async (req, res) => {
    const { topic, nodes } = req.body;
    const concepts = (nodes || []).slice(0, 12).map((n: any) => n.label).join(', ');
    const fallbackText = `Unified Omega Field Synthesis [${topic || 'Sovereign Topology'}]: Across ${nodes?.length || 0} active ontological nodes (${concepts}), the manifold converges toward a self-stabilizing cybernetic attractor where high-resonance clusters govern cross-domain causal pathways.`;

    const text = await generateWithModelCascade({
      contents: `Perform a meta-synthesis of the current neural map for "${topic}". Current concepts: ${concepts}. What is the 'Omega Point' of this specific inquiry?`,
      config: {
        systemInstruction: "Synthesize disparate information into a unified field theory of the user's current search topic.",
      }
    });

    return res.json({ text: text || fallbackText, fallback: !text });
  });

  app.post('/api/gemini/chat-node', async (req, res) => {
    const { node, context } = req.body;
    const fallbackChat = `Synthetic Resonance [${node?.label || 'Concept'}]: Verified structural isomorphism and low-entropy causal pathway within ${context || 'the active knowledge graph'}.`;

    const text = await generateWithModelCascade({
      contents: `Context: ${context}. Analyzing: ${node?.label} (${node?.description}). Identify latent patterns and emergent properties.`,
    });

    return res.json({ text: text || fallbackChat, fallback: !text });
  });

  app.post('/api/gemini/generate-code', async (req, res) => {
    const { topic, targetConcept, language } = req.body;
    const lang = language || 'typescript';

    const text = await generateWithModelCascade({
      contents: `Generate a concise, clean, production-grade ${lang} code module (around 25-35 lines) that models or implements "${targetConcept}" within the domain "${topic}". Return ONLY raw code without markdown fences.`,
    });

    if (text) {
      const rawCode = text
        .replace(/^```[a-zA-Z]*\n?/gm, '')
        .replace(/```$/gm, '')
        .trim();
      if (rawCode) {
        return res.json({ code: rawCode });
      }
    }

    return res.json({ fallback: true });
  });

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
