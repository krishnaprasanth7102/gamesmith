import { NextResponse } from 'next/server';

// ─── Shared Catalog (from BlueprintPlayground) ────────────────────────────────
type PortKind = "exec" | "bool" | "float" | "string";
interface Port { id: string; label: string; kind: PortKind; }

const CATALOG: Record<string, { category: string; type: string; label: string; color: string; description: string; inputs: Port[]; outputs: Port[] }> = {
  START:        { category: "Events", type: "START",        label: "START",                 color: "#dc2626", description: "Entry point. Fires once at Begin Play.",                                                                                inputs: [],                                                      outputs: [{ id: "exec",    label: "Exec",           kind: "exec"  }] },
  EVENT_TICK:   { category: "Events", type: "EVENT_TICK",   label: "EVENT TICK",            color: "#f97316", description: "Fires every frame. Drives continuous polling.",                                                                         inputs: [],                                                      outputs: [{ id: "exec",    label: "Exec",           kind: "exec"  }] },
  BRANCH:       { category: "Flow Control", type: "BRANCH",       label: "BRANCH",                color: "#eab308", description: "If/Else gate. Routes True or False based on condition.",                                                               inputs: [{ id: "exec_in", label: "Exec", kind: "exec" }, { id: "condition", label: "Condition", kind: "bool" }], outputs: [{ id: "true",    label: "True",  kind: "exec" }, { id: "false",   label: "False", kind: "exec"  }] },
  SEQUENCE:     { category: "Flow Control", type: "SEQUENCE",     label: "SEQUENCE",              color: "#a855f7", description: "Fires multiple execution pins sequentially.",                                                                        inputs: [{ id: "exec_in", label: "Exec", kind: "exec" }],       outputs: [{ id: "then_0",  label: "Then 0", kind: "exec" }, { id: "then_1",  label: "Then 1", kind: "exec"  }] },
  DELAY:        { category: "Flow Control", type: "DELAY",        label: "DELAY",                 color: "#a855f7", description: "Pauses execution logic for a duration.",                                                                             inputs: [{ id: "exec_in", label: "Exec", kind: "exec" }, { id: "duration", label: "Duration", kind: "float" }], outputs: [{ id: "completed", label: "Completed", kind: "exec" }] },
  SET_VARIABLE: { category: "Variables", type: "SET_VARIABLE", label: "SET VARIABLE",          color: "#8b5cf6", description: "Sets a boss state variable to the given value.",                                                                       inputs: [{ id: "exec_in", label: "Exec", kind: "exec" }, { id: "value",     label: "Value",     kind: "float" }], outputs: [{ id: "exec",    label: "Exec",           kind: "exec"  }] },
  GET_HEALTH:   { category: "Variables", type: "GET_HEALTH",   label: "GET PLAYER HEALTH",     color: "#22c55e", description: "Returns player health (0–100) as a float.",                                                                            inputs: [],                                                      outputs: [{ id: "health",  label: "Health (float)", kind: "float" }] },
  INCREASE_DIFF:{ category: "Boss Actions", type: "INCREASE_DIFF",label: "INCREASE DIFFICULTY",   color: "#3b82f6", description: "Increases boss multiplier. Faster attacks, more damage.",                                                              inputs: [{ id: "exec_in", label: "Exec", kind: "exec"  }],       outputs: [{ id: "exec",    label: "Exec",           kind: "exec"  }] },
  DECREASE_DIFF:{ category: "Boss Actions", type: "DECREASE_DIFF",label: "DECREASE DIFFICULTY",   color: "#3b82f6", description: "Decreases boss multiplier. Easier tempo for struggling players.",                                                     inputs: [{ id: "exec_in", label: "Exec", kind: "exec"  }],       outputs: [{ id: "exec",    label: "Exec",           kind: "exec"  }] },
  PRINT_STRING: { category: "Boss Actions", type: "PRINT_STRING", label: "PRINT STRING",          color: "#14b8a6", description: "Logs a string to the debugging HUD.",                                                                                 inputs: [{ id: "exec_in", label: "Exec", kind: "exec" }, { id: "in_string", label: "String", kind: "string" }], outputs: [{ id: "exec", label: "Exec", kind: "exec" }] },
  COMPARE_FLOAT:{ category: "Math", type: "COMPARE_FLOAT",label: "COMPARE FLOAT",         color: "#22c55e", description: "Compares float A against float B.",                                                                                    inputs: [{ id: "a", label: "A", kind: "float" }, { id: "b", label: "B", kind: "float" }], outputs: [{ id: "exec", label: "Exec", kind: "exec" }, { id: "greater", label: ">", kind: "exec"}, { id: "equal", label: "==", kind: "exec"}, { id: "less", label: "<", kind: "exec"}] },
};

const CATALOG_KEYS = Object.keys(CATALOG);
const CATALOG_INSTRUCTIONS = CATALOG_KEYS.map(key => {
  const item = CATALOG[key];
  const ins = item.inputs.map(p => p.id).join(", ") || "none";
  const outs = item.outputs.map(p => p.id).join(", ") || "none";
  return `- ${key} (Inputs: ${ins} | Outputs: ${outs})`;
}).join("\n");

// Simple in-memory rate limiter (5 requests per minute per IP)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limitInfo = rateLimitCache.get(ip);

  if (!limitInfo || now > limitInfo.resetTime) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + 60 * 1000 });
    return true;
  }

  if (limitInfo.count >= 5) {
    return false;
  }

  limitInfo.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown_ip";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too Many Requests. Please wait a minute.' }, { status: 429 });
    }

    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) throw new Error("Missing Google GenAI API Key");

    const systemInstruction = `You are an expert Unreal Engine Blueprint system designer. 
Your task is to convert Unreal Engine functionality into Blueprint node logic based on the user request.

USER REQUEST: "${prompt}"

KNOWLEDGE BASE DATA:
${CATALOG_INSTRUCTIONS}

INSTRUCTIONS:
1. Analyze the user request carefully to extract logical flow.
2. Use ONLY the provided knowledge base data (do not invent unknown nodes).
3. Convert the functionality into a complete, end-to-end Blueprint node logic chain starting from an entry point (START or EVENT_TICK).
4. Be precise and practical. Use real Unreal Blueprint concepts.

SPATIAL RULES:
- Spread out coordinate (X, Y) roughly 300px apart horizontally for flow.
- Ensure nodes do not overlap.

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "nodes": [
    { "id": "n1", "type": "NODE_TYPE", "x": 0, "y": 0 }
  ],
  "connections": [
    { "id": "c1", "fromNode": "n1", "fromPort": "PORT_ID", "toNode": "n2", "toPort": "PORT_ID" }
  ],
  "message": "A professional summary of the generated logic.",
  "explanations": [
    { "nodeId": "n1", "explanation": "Why this node is used here." }
  ],
  "tutorial": [
    "Step 1: ...",
    "Step 2: ..."
  ],
  "unrealBlueprint": "BEGIN OBJECT\\n...\\nEND OBJECT"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.1, // Even lower for maximum precision
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API Error: ${err}`);
    }

    const data = await response.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) throw new Error("No textual output from Gemini.");

    const output = JSON.parse(textOutput);

    // Enrich the AI's simplified node map with full CATALOG metadata, filtering out hallucinations
    const enrichedNodes = output.nodes
      .filter((n: any) => CATALOG[n.type])
      .map((n: any) => {
        const def = CATALOG[n.type];
        return { ...def, id: n.id, x: n.x, y: n.y };
      });

    // Filter connections to ensure they only reference existing enriched nodes
    const validNodeIds = new Set(enrichedNodes.map((n: any) => n.id));
    const validConnections = (output.connections || []).filter((c: any) => 
      validNodeIds.has(c.fromNode) && validNodeIds.has(c.toNode)
    );

    return NextResponse.json({
        nodes: enrichedNodes,
        connections: validConnections,
        summary: output.message,
        explanations: output.explanations || [],
        tutorial: output.tutorial || [],
        unrealBlueprint: output.unrealBlueprint || ""
    });
  } catch (error: any) {
    console.error('Blueprint Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate blueprint' }, { status: 500 });
  }
}
