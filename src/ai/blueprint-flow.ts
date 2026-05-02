
"use server";

// ─── MASSIVE UNREAL ENGINE NODE CATALOG ─────────────────────────────────────────
type PortKind = "exec" | "bool" | "float" | "string" | "vector" | "integer" | "object" | "transform" | "rotator";
interface Port { id: string; label: string; kind: PortKind; }

const CATALOG: Record<string, { category: string; type: string; label: string; color: string; description: string; inputs: Port[]; outputs: Port[] }> = {
  // --- EVENTS (RED) ---
  START: { category: "Events", type: "START", label: "BeginPlay", color: "#dc2626", description: "Fires once when Actor spawns.", inputs: [], outputs: [{ id: "exec", label: "Exec", kind: "exec" }] },
  EVENT_TICK: { category: "Events", type: "EVENT_TICK", label: "Event Tick", color: "#dc2626", description: "Fires every frame.", inputs: [], outputs: [{ id: "exec", label: "Exec", kind: "exec" }, { id: "delta", label: "Delta Seconds", kind: "float" }] },
  EVENT_HIT: { category: "Events", type: "EVENT_HIT", label: "OnComponentHit", color: "#dc2626", description: "Fires on collision.", inputs: [], outputs: [{ id: "exec", label: "Exec", kind: "exec" }, { id: "other", label: "Other", kind: "object" }] },
  OVERLAP_BEGIN: { category: "Events", type: "OVERLAP_BEGIN", label: "OnComponentBeginOverlap", color: "#dc2626", description: "Fires when overlapping.", inputs: [], outputs: [{ id: "exec", label: "Exec", kind: "exec" }] },

  // --- FLOW CONTROL (GRAY) ---
  SEQUENCE: { category: "Flow Control", type: "SEQUENCE", label: "Sequence", color: "#808080", description: "Execute pins in sequence.", inputs: [{ id: "in", label: "Exec", kind: "exec" }], outputs: [{ id: "0", label: "Then 0", kind: "exec" }, { id: "1", label: "Then 1", kind: "exec" }] },
  BRANCH: { category: "Flow Control", type: "BRANCH", label: "Branch", color: "#808080", description: "If/Else conditional.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "cond", label: "Condition", kind: "bool" }], outputs: [{ id: "t", label: "True", kind: "exec" }, { id: "f", label: "False", kind: "exec" }] },
  DELAY: { category: "Flow Control", type: "DELAY", label: "Delay", color: "#808080", description: "Wait for N seconds.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "d", label: "Duration", kind: "float" }], outputs: [{ id: "out", label: "Completed", kind: "exec" }] },
  DO_ONCE: { category: "Flow Control", type: "DO_ONCE", label: "Do Once", color: "#808080", description: "Execute only once until Reset.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "res", label: "Reset", kind: "exec" }], outputs: [{ id: "out", label: "Out", kind: "exec" }] },
  GATE: { category: "Flow Control", type: "GATE", label: "Gate", color: "#808080", description: "Open/Close flow gate.", inputs: [{ id: "open", label: "Open", kind: "exec" }, { id: "close", label: "Close", kind: "exec" }, { id: "ent", label: "Enter", kind: "exec" }], outputs: [{ id: "ex", label: "Exit", kind: "exec" }] },

  // --- MATH (GREEN) ---
  PLUS_FLOAT: { category: "Math", type: "PLUS_FLOAT", label: "Add (Float)", color: "#22c55e", description: "Sum A and B.", inputs: [{ id: "a", label: "A", kind: "float" }, { id: "b", label: "B", kind: "float" }], outputs: [{ id: "sum", label: "Result", kind: "float" }] },
  V_PLUS_V: { category: "Math", type: "V_PLUS_V", label: "Vector + Vector", color: "#22c55e", description: "Add two 3D vectors.", inputs: [{ id: "a", label: "A", kind: "vector" }, { id: "b", label: "B", kind: "vector" }], outputs: [{ id: "res", label: "Result", kind: "vector" }] },
  PERCENT: { category: "Math", type: "PERCENT", label: "% (Modulo)", color: "#22c55e", description: "A % B.", inputs: [{ id: "a", label: "A", kind: "integer" }, { id: "b", label: "B", kind: "integer" }], outputs: [{ id: "res", label: "Result", kind: "integer" }] },
  LERP: { category: "Math", type: "LERP", label: "Lerp", color: "#22c55e", description: "Linear interpolation between A/B.", inputs: [{ id: "a", label: "A", kind: "float" }, { id: "b", label: "B", kind: "float" }, { id: "alpha", label: "Alpha", kind: "float" }], outputs: [{ id: "res", label: "Result", kind: "float" }] },

  // --- AI (INDIGO) ---
  AI_MOVE_TO: { category: "AI", type: "AI_MOVE_TO", label: "AI Move To", color: "#6366f1", description: "Moves AI pawn to destination.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "pawn", label: "Pawn", kind: "object" }, { id: "dest", label: "Destination", kind: "vector" }], outputs: [{ id: "success", label: "On Success", kind: "exec" }, { id: "fail", label: "On Fail", kind: "exec" }] },

  // --- TRANSFORMS (BLUE) ---
  SET_LOC: { category: "Utilities", type: "SET_LOC", label: "SetActorLocation", color: "#3b82f6", description: "Moves actor to location.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "new_loc", label: "New Location", kind: "vector" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },
  ADD_ROT: { category: "Utilities", type: "ADD_ROT", label: "AddActorLocalRotation", color: "#3b82f6", description: "Rotates actor locally.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "delta", label: "Delta Rotation", kind: "rotator" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },
  GET_WORLD_LOC: { category: "Utilities", type: "GET_WORLD_LOC", label: "GetWorldLocation", color: "#3b82f6", description: "Returns world coord.", inputs: [{ id: "comp", label: "Target", kind: "object" }], outputs: [{ id: "loc", label: "Location", kind: "vector" }] },

  // --- MOVEMENT (YELLOW) ---
  ADD_MOVEMENT_INPUT: { category: "Movement", type: "ADD_MOVEMENT_INPUT", label: "Add Movement Input", color: "#eab308", description: "Applies directional movement.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "dir", label: "World Direction", kind: "vector" }, { id: "scale", label: "Scale Value", kind: "float" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },

  // --- PHYSICS (ORANGE) ---
  ADD_IMPULSE: { category: "Physics", type: "ADD_IMPULSE", label: "Add Impulse", color: "#f97316", description: "Apply physics force.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "imp", label: "Impulse", kind: "vector" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },
  SET_SIM_PHYS: { category: "Physics", type: "SET_SIM_PHYS", label: "SetSimulatePhysics", color: "#f97316", description: "Toggle physics simulation.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "sim", label: "Simulate", kind: "bool" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },

  // --- GAMEPLAY (TEAL) ---
  SPAWN_ACTOR: { category: "Gameplay", type: "SPAWN_ACTOR", label: "SpawnActorFromClass", color: "#0d9488", description: "Spawns new entity.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "tr", label: "Spawn Transform", kind: "transform" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }, { id: "act", label: "Actor", kind: "object" }] },
  APPLY_DAMAGE: { category: "Gameplay", type: "APPLY_DAMAGE", label: "Apply Damage", color: "#0d9488", description: "Deals damage to actor.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "act", label: "Damaged Actor", kind: "object" }, { id: "amt", label: "Base Damage", kind: "float" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },
  DESTROY_ACTOR: { category: "Gameplay", type: "DESTROY_ACTOR", label: "Destroy Actor", color: "#0d9488", description: "Removes actor from world.", inputs: [{ id: "in", label: "Exec", kind: "exec" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },

  // --- AUDIO (PURPLE) ---
  PLAY_SOUND_LOC: { category: "Audio", type: "PLAY_SOUND_LOC", label: "PlaySoundAtLocation", color: "#9333ea", description: "Plays 3D spatial sound.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "loc", label: "Location", kind: "vector" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },
  STOP_SOUND: { category: "Audio", type: "STOP_SOUND", label: "Stop Audio Component", color: "#9333ea", description: "Kills specific sound.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "comp", label: "Audio Comp", kind: "object" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },

  // --- UI (PINK) ---
  CREATE_WIDGET: { category: "UI", type: "CREATE_WIDGET", label: "CreateWidget", color: "#db2777", description: "Instantiates UI class.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "cl", label: "Widget Class", kind: "string" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }, { id: "wid", label: "Return Value", kind: "object" }] },
  ADD_TO_VIEWPORT: { category: "UI", type: "ADD_TO_VIEWPORT", label: "AddToViewport", color: "#db2777", description: "Displays UI on screen.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "target", label: "Target", kind: "object" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },
  
  // --- CAMERA (CYAN) ---
  CAMERA_SHAKE: { category: "Camera", type: "CAMERA_SHAKE", label: "StartCameraShake", color: "#0891b2", description: "Executes screenshake.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "scale", label: "Scale", kind: "float" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },
  SET_VIEW_TARGET: { category: "Camera", type: "SET_VIEW_TARGET", label: "SetViewTargetWithBlend", color: "#0891b2", description: "Smoothly switches camera.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "new_act", label: "New View Target", kind: "object" }, { id: "bl", label: "Blend Time", kind: "float" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },
};

const CATALOG_INSTRUCTIONS = Object.keys(CATALOG).map(key => {
  const item = CATALOG[key];
  return `- ${key}: ${item.description} (In: ${item.inputs.map(p => p.id).join(",")} | Out: ${item.outputs.map(p => p.id).join(",")})`;
}).join("\n");

export async function blueprintFlow(prompt: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log("OPENROUTER_KEY_DETECTED:", apiKey ? "YES (sk-or-...)" : "NO");
  
  // MOCK FALLBACK for missing API keys
  if (!apiKey) {
    console.warn("AI_LINK_OFFLINE: Using deterministic fallback logic.");
    return {
      nodes: [
        { id: "start", ...CATALOG.START, x: 100, y: 150 },
        { id: "seq", ...CATALOG.SEQUENCE, x: 450, y: 150 },
        { id: "delay", ...CATALOG.DELAY, x: 800, y: 150 }
      ],
      connections: [
        { fromNode: "start", fromPort: "exec", toNode: "seq", toPort: "in" },
        { fromNode: "seq", fromPort: "0", toNode: "delay", toPort: "in" }
      ],
      summary: "AI_SIM_MODE: Deterministic logic generated due to service restriction.",
    };
  }

  const systemInstruction = `You are an Unreal Engine Blueprint generator.

STRICT RULES:
- NEVER use SetActorLocation for movement.
- NEVER use Event Tick unless absolutely required.
- ALWAYS use correct nodes for the task.
- Movement must use Add Movement Input or AI Move To.
- Systems must include proper execution flow and looping.

If rules are violated → output is invalid.

Task:
"${prompt}"

KNOWLEDGE BASE DATA (Use these types and port IDs ONLY):
${CATALOG_INSTRUCTIONS}

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "blueprint": {
    "nodes": [
      { "id": "N1", "name": "NODE_TYPE", "x": 0, "y": 0 }
    ],
    "connections": [
      { "from": "N1.PORT_ID", "to": "N2.PORT_ID", "type": "execution/data" }
    ],
    "steps": [ "1. Add BeginPlay...", "2. Connect to Sequence..." ],
    "explanation": "A deep technical explanation of how this system functions in Unreal Engine."
  }
}

Return ONLY correct Blueprint logic in JSON format.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://gamesmith.com',
        'X-Title': 'GameSmith Blueprint Forge'
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ]
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error("OpenRouter Error Body:", JSON.stringify(errBody, null, 2));
      const errMsg = errBody.error?.message || response.statusText;
      throw new Error(`OpenRouter Failure: ${response.status} - ${errMsg}`);
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content;
    console.log("AI Raw Response:", text);
    if (!text) throw new Error("AI returned empty content.");
    
    // Robust JSON extraction to handle markdown wrappers
    text = text.trim();
    if (text.startsWith("```")) {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        text = match[1];
      }
    }
    
    let raw;
    try {
      raw = JSON.parse(text);
    } catch (parseErr) {
      throw new Error(`JSON_PARSE_ERROR: ${text.slice(0, 50)}...`);
    }

    const output = raw.blueprint || raw; // Handle both direct and nested structure
    
    if (!output || !Array.isArray(output.nodes)) {
      throw new Error("INVALID_AI_SCHEMA: 'nodes' must be an array.");
    }
    
    // Enrich and validate (map 'name' to 'type' for catalog lookup)
    const enrichedNodes = output.nodes
      .filter((n: any) => n && (n.type || n.name) && CATALOG[n.type || n.name])
      .map((n: any) => {
        const type = n.type || n.name;
        return { ...CATALOG[type], ...n, type, id: n.id || `n_${Math.random()}` };
      });

    const validNodeIds = new Set(enrichedNodes.map((n: any) => n.id));
    
    // Map dot-notation connections (N1.Exec -> fromNode: N1, fromPort: Exec)
    const validConnections = (output.connections || []).map((c: any) => {
      if (c.from && c.to) {
        const [fNode, fPort] = c.from.split('.');
        const [tNode, tPort] = c.to.split('.');
        return { fromNode: fNode, fromPort: fPort, toNode: tNode, toPort: tPort };
      }
      return c;
    }).filter((c: any) => 
      c && validNodeIds.has(c.fromNode) && validNodeIds.has(c.toNode)
    );

    if (enrichedNodes.length === 0) {
      throw new Error("EMPTY_GRAPH: AI failed to generate any valid nodes from the catalog.");
    }

    return {
      nodes: enrichedNodes,
      connections: validConnections,
      summary: output.explanation || output.message || "Logic synthesis successful.",
    };
  } catch (e: any) {
    console.error("AI_FLOW_FAILED:", e);
    const errText = (e.message || "Logic synthesis failed.").slice(0, 50);
    return {
      nodes: [
        { id: "start", ...CATALOG.START, x: 100, y: 150 },
        { id: "err", ...CATALOG.BRANCH, x: 450, y: 150, label: `ERROR: ${errText}` }
      ],
      connections: [{ fromNode: "start", fromPort: "exec", toNode: "err", toPort: "in" }],
      summary: `CRITICAL: ${e.message || "Logic synthesis failed."}`,
    };
  }
}
