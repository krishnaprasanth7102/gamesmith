"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Play, Trash2, BookOpen, X, ChevronRight, ChevronLeft,
  RotateCcw, Square, Terminal, Cpu, GitBranch, Heart,
  TrendingUp, TrendingDown, Zap, Plus, Minus, Search, 
  Settings2, Layers, Compass, Code, ListTree, Sparkles
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type PortKind = "exec" | "bool" | "float" | "string";
interface Port { id: string; label: string; kind: PortKind; }
interface BPNode { id: string; type: string; label: string; x: number; y: number; inputs: Port[]; outputs: Port[]; description: string; color: string; category: string; }
interface Connection { id: string; fromNode: string; fromPort: string; toNode: string; toPort: string; }
interface DraftConn { fromNode: string; fromPort: string; fromDir: "output" | "input"; startX: number; startY: number; mouseX: number; mouseY: number; }

// ─── Constants ────────────────────────────────────────────────────────────────
const NODE_W = 210;
const HEADER_H = 44;
const PORT_H = 30;

function getPortPos(node: BPNode, portId: string, dir: "input" | "output") {
  const ports = dir === "input" ? node.inputs : node.outputs;
  const idx = ports.findIndex(p => p.id === portId);
  return { 
    x: dir === "input" ? node.x : node.x + NODE_W, 
    y: node.y + HEADER_H + idx * PORT_H + PORT_H / 2 + 4 
  };
}

const PORT_COLORS: Record<PortKind, string> = { 
  exec: "#ffffff", 
  bool: "#881337", // Maroon for Boolean in UE
  float: "#22c55e", // Light green for Float in UE
  string: "#d946ef" // Magenta for String in UE 
};

// ─── Catalog ─────────────────────────────────────────────────────────────────
const CATALOG: Record<string, Omit<BPNode, "id" | "x" | "y">> = {
  // Events
  START:        { category: "Events", type: "START",        label: "START",                 color: "#dc2626", description: "Entry point. Fires once at Begin Play.",                                                                                inputs: [],                                                      outputs: [{ id: "exec",    label: "Exec",           kind: "exec"  }] },
  EVENT_TICK:   { category: "Events", type: "EVENT_TICK",   label: "EVENT TICK",            color: "#f97316", description: "Fires every frame. Drives continuous polling.",                                                                         inputs: [],                                                      outputs: [{ id: "exec",    label: "Exec",           kind: "exec"  }] },
  
  // Logic Flow
  BRANCH:       { category: "Flow Control", type: "BRANCH",       label: "BRANCH",                color: "#eab308", description: "If/Else gate. Routes True or False based on condition.",                                                               inputs: [{ id: "exec_in", label: "Exec", kind: "exec" }, { id: "condition", label: "Condition", kind: "bool" }], outputs: [{ id: "true",    label: "True",  kind: "exec" }, { id: "false",   label: "False", kind: "exec"  }] },
  SEQUENCE:     { category: "Flow Control", type: "SEQUENCE",     label: "SEQUENCE",              color: "#a855f7", description: "Fires multiple execution pins sequentially.",                                                                        inputs: [{ id: "exec_in", label: "Exec", kind: "exec" }],       outputs: [{ id: "then_0",  label: "Then 0", kind: "exec" }, { id: "then_1",  label: "Then 1", kind: "exec"  }] },
  DELAY:        { category: "Flow Control", type: "DELAY",        label: "DELAY",                 color: "#a855f7", description: "Pauses execution logic for a duration.",                                                                             inputs: [{ id: "exec_in", label: "Exec", kind: "exec" }, { id: "duration", label: "Duration", kind: "float" }], outputs: [{ id: "completed", label: "Completed", kind: "exec" }] },

  // Variables
  SET_VARIABLE: { category: "Variables", type: "SET_VARIABLE", label: "SET VARIABLE",          color: "#8b5cf6", description: "Sets a boss state variable to the given value.",                                                                       inputs: [{ id: "exec_in", label: "Exec", kind: "exec" }, { id: "value",     label: "Value",     kind: "float" }], outputs: [{ id: "exec",    label: "Exec",           kind: "exec"  }] },
  GET_HEALTH:   { category: "Variables", type: "GET_HEALTH",   label: "GET PLAYER HEALTH",     color: "#22c55e", description: "Returns player health (0–100) as a float.",                                                                            inputs: [],                                                      outputs: [{ id: "health",  label: "Health (float)", kind: "float" }] },
  
  // Actions
  INCREASE_DIFF:{ category: "Boss Actions", type: "INCREASE_DIFF",label: "INCREASE DIFFICULTY",   color: "#3b82f6", description: "Increases boss multiplier. Faster attacks, more damage.",                                                              inputs: [{ id: "exec_in", label: "Exec", kind: "exec"  }],       outputs: [{ id: "exec",    label: "Exec",           kind: "exec"  }] },
  DECREASE_DIFF:{ category: "Boss Actions", type: "DECREASE_DIFF",label: "DECREASE DIFFICULTY",   color: "#3b82f6", description: "Decreases boss multiplier. Easier tempo for struggling players.",                                                     inputs: [{ id: "exec_in", label: "Exec", kind: "exec"  }],       outputs: [{ id: "exec",    label: "Exec",           kind: "exec"  }] },
  PRINT_STRING: { category: "Boss Actions", type: "PRINT_STRING", label: "PRINT STRING",          color: "#14b8a6", description: "Logs a string to the debugging HUD.",                                                                                 inputs: [{ id: "exec_in", label: "Exec", kind: "exec" }, { id: "in_string", label: "String", kind: "string" }], outputs: [{ id: "exec", label: "Exec", kind: "exec" }] },

  // Math
  COMPARE_FLOAT:{ category: "Math", type: "COMPARE_FLOAT",label: "COMPARE FLOAT",         color: "#22c55e", description: "Compares float A against float B.",                                                                                    inputs: [{ id: "a", label: "A", kind: "float" }, { id: "b", label: "B", kind: "float" }], outputs: [{ id: "exec", label: "Exec", kind: "exec" }, { id: "greater", label: ">", kind: "exec"}, { id: "equal", label: "==", kind: "exec"}, { id: "less", label: "<", kind: "exec"}] },
};

const INITIAL_NODES: BPNode[] = [];
const INITIAL_CONNS: Connection[] = [];

const TOOLBAR_GROUPS = Object.entries(CATALOG).reduce((acc, [key, val]) => {
  if (!acc[val.category]) acc[val.category] = [];
  acc[val.category].push(val);
  return acc;
}, {} as Record<string, any[]>);


// ─── Helper Functions ─────────────────────────────────────────────────────────

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.abs(x2 - x1);
  const c = Math.max(dx * 0.55, 60);
  return `M${x1},${y1} C${x1 + c},${y1} ${x2 - c},${y2} ${x2},${y2}`;
}

// ─── Port Components ──────────────────────────────────────────────────────────

function PortDot({ kind, side, connected, onDown, onUp }: { kind: PortKind; side: "left" | "right"; connected?: boolean; onDown: (e: React.MouseEvent) => void; onUp: () => void }) {
  const size = kind === "exec" ? 12 : 10;
  const isExec = kind === "exec";
  const color = PORT_COLORS[kind];
  
  return (
    <div
      data-port="1"
      onMouseDown={e => { e.stopPropagation(); onDown(e); }}
      onMouseUp={e => { e.stopPropagation(); onUp(); }}
      className="group relative flex items-center justify-center transition-all"
      style={{
        width: size, height: size, flexShrink: 0,
        marginLeft: side === "left" ? -size / 2 - 1 : undefined,
        marginRight: side === "right" ? -size / 2 - 1 : undefined,
        cursor: "crosshair",
        zIndex: 10
      }}
    >
      <div 
        style={{
          width: "100%", height: "100%",
          borderRadius: isExec ? "2px" : "50%",
          backgroundColor: connected ? color : "transparent",
          border: `2px solid ${color}`,
          transition: "all 0.2s ease",
        }}
        className="group-hover:scale-125 group-hover:shadow-[0_0_10px_currentColor]"
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BlueprintPlayground() {
  const [nodes, setNodes] = useState<BPNode[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNS);
  const [panOffset, setPanOffset] = useState({ x: 300, y: 100 });

  const [scale, setScale] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftConn, setDraftConn] = useState<DraftConn | null>(null);

  // AI Prompt State
  const [promptText, setPromptText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Simulation State
  const [simRunning, setSimRunning] = useState(false);
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [activeConns, setActiveConns] = useState<Set<string>>(new Set());
  const [simVars, setSimVars] = useState<{ health: number; difficulty: number } | null>(null);
  
  // HUD
  const [logs, setLogs] = useState<string[]>([]);

  // Learn Mode
  const [learnSteps, setLearnSteps] = useState<{nodeId: string, title: string, text: string}[]>([]);
  const [tutorialSteps, setTutorialSteps] = useState<string[]>([]);
  const [unrealCode, setUnrealCode] = useState<string>("");
  const [learnMode, setLearnMode] = useState(false);
  const [learnStep, setLearnStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ nodeId: string; smx: number; smy: number; nx: number; ny: number } | null>(null);
  const panRef = useRef<{ smx: number; smy: number; ox: number; oy: number } | null>(null);
  const panOffsetRef = useRef(panOffset);
  const scaleRef = useRef(scale);
  const nodesRef = useRef(nodes);
  const draftRef = useRef(draftConn);

  useEffect(() => { panOffsetRef.current = panOffset; }, [panOffset]);
  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { draftRef.current = draftConn; }, [draftConn]);

  // Viewport calculation
  const toCanvas = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { 
      x: (clientX - rect.left - panOffsetRef.current.x) / scaleRef.current, 
      y: (clientY - rect.top - panOffsetRef.current.y) / scaleRef.current 
    };
  };

  // Keyboard events
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        setNodes(prev => prev.filter(n => n.id !== selectedId));
        setConnections(prev => prev.filter(c => c.fromNode !== selectedId && c.toNode !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", kd);
    return () => window.removeEventListener("keydown", kd);
  }, [selectedId]);

  // Global mouse handlers
  useEffect(() => {
    const move = (e: MouseEvent) => {
      const pos = toCanvas(e.clientX, e.clientY);

      if (draftRef.current) setDraftConn(prev => prev ? { ...prev, mouseX: pos.x, mouseY: pos.y } : null);

      if (dragRef.current) {
        const { nodeId, smx, smy, nx, ny } = dragRef.current;
        const dx = (e.clientX - smx) / scaleRef.current;
        const dy = (e.clientY - smy) / scaleRef.current;
        setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x: nx + dx, y: ny + dy } : n));
      }

      if (panRef.current) {
        const { smx, smy, ox, oy } = panRef.current;
        setPanOffset({ x: ox + (e.clientX - smx), y: oy + (e.clientY - smy) });
      }
    };
    const up = () => { dragRef.current = null; panRef.current = null; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, []);

  // Canvas Interactions
  const handleCanvasMD = (e: React.MouseEvent) => {
    if (e.button === 0) {
      const target = e.target as HTMLElement;
      if (target.closest("[data-node]") || target.closest("[data-port]")) return;
      setSelectedId(null);
      setDraftConn(null);
      panRef.current = { smx: e.clientX, smy: e.clientY, ox: panOffsetRef.current.x, oy: panOffsetRef.current.y };
    }
  };

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Node & Port Interactions
  const handleNodeMD = (nodeId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedId(nodeId);
    const n = nodesRef.current.find(x => x.id === nodeId)!;
    dragRef.current = { nodeId, smx: e.clientX, smy: e.clientY, nx: n.x, ny: n.y };
  };

  const handlePortMD = (nodeId: string, portId: string, dir: "output" | "input", e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const node = nodesRef.current.find(n => n.id === nodeId)!;
    const pos = getPortPos(node, portId, dir);
    setDraftConn({ fromNode: nodeId, fromPort: portId, fromDir: dir, startX: pos.x, startY: pos.y, mouseX: pos.x, mouseY: pos.y });
  };

  const handlePortMU = (nodeId: string, portId: string, dir: "output" | "input") => {
    const dc = draftRef.current;
    if (!dc) return;
    let fN: string, fP: string, tN: string, tP: string;
    if (dc.fromDir === "output" && dir === "input")       { fN = dc.fromNode; fP = dc.fromPort; tN = nodeId; tP = portId; }
    else if (dc.fromDir === "input" && dir === "output")  { fN = nodeId; fP = portId; tN = dc.fromNode; tP = dc.fromPort; }
    else { setDraftConn(null); return; }
    
    if (fN === tN) { setDraftConn(null); return; }
    
    // Prevent duplicate connections
    const exists = connections.some(c => c.fromNode === fN && c.fromPort === fP && c.toNode === tN && c.toPort === tP);
    if (!exists) setConnections(prev => [...prev, { id: `c_${Date.now()}`, fromNode: fN, fromPort: fP, toNode: tN, toPort: tP }]);
    setDraftConn(null);
  };

  const addNode = (type: string, cx?: number, cy?: number) => {
    const def = CATALOG[type];
    if (!def) return;
    const spawnX = cx ?? (-panOffsetRef.current.x + (canvasRef.current?.clientWidth ?? 600) / 2) / scaleRef.current;
    const spawnY = cy ?? (-panOffsetRef.current.y + (canvasRef.current?.clientHeight ?? 400) / 2) / scaleRef.current;
    
    setNodes(prev => [...prev, { id: `n_${Date.now()}`, ...def, x: spawnX, y: spawnY }]);
  };

  // Zooming
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newScale = Math.min(Math.max(0.2, scale + delta), 2);
      
      // Zoom towards mouse
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const dx = (mx - panOffset.x) * (newScale / scale - 1);
        const dy = (my - panOffset.y) * (newScale / scale - 1);
        setPanOffset(p => ({ x: p.x - dx, y: p.y - dy }));
      }
      setScale(newScale);
    }
  };

  const handleZoom = (factor: number) => {
    const newScale = Math.min(Math.max(0.2, scale * factor), 2);
    setScale(newScale);
  };

  const resetGraph = () => {
    setNodes(INITIAL_NODES);
    setConnections(INITIAL_CONNS);
    setSelectedId(null);
    setActiveNodes(new Set());
    setActiveConns(new Set());
    setSimVars(null);
    setSimRunning(false);
    setLogs([]);
    setScale(1);
    setPanOffset({ x: window.innerWidth / 3, y: 100 });
  };

  // ─── AI Generation via Puter.js Anonymous Mode (no login, no API key) ────────
  const handleAIGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptText.trim() || isGenerating) return;

    setSimRunning(false);
    setIsGenerating(true);

    const catalogInstructions = Object.keys(CATALOG).map(key => {
      const item = CATALOG[key];
      const ins = item.inputs.map((p: Port) => p.id).join(", ") || "none";
      const outs = item.outputs.map((p: Port) => p.id).join(", ") || "none";
      return `- ${key}: ${item.description} (In: ${ins} | Out: ${outs})`;
    }).join("\n");

    const prompt = `Act as an expert Unreal Engine 5 Blueprint Developer. Convert the user request into a visual Blueprint node graph.

STRICT RULES:
- ONLY use node types from the catalog below. NEVER invent new types.
- Always start with START or EVENT_TICK.
- Spread nodes ~300px apart horizontally (x: 100, 400, 700...). Keep y between 100–300.
- Every connection must reference valid node ids AND valid port ids from the catalog.
- Output ONLY raw JSON. No markdown. No explanation outside the JSON.

AVAILABLE NODES:
${catalogInstructions}

Return this EXACT JSON structure:
{
  "nodes": [{ "id": "n1", "type": "NODE_TYPE", "x": 100, "y": 150 }],
  "connections": [{ "id": "c1", "fromNode": "n1", "fromPort": "PORT_ID", "toNode": "n2", "toPort": "PORT_ID" }],
  "message": "One sentence summary.",
  "explanations": [{ "nodeId": "n1", "explanation": "Why this node is placed here." }],
  "tutorial": ["Step 1: ...", "Step 2: ..."],
  "unrealBlueprint": "BEGIN OBJECT\\nClass=...\\nEND OBJECT"
}

My Request: "${promptText}"`;

    try {
      const puter = (window as any).puter;
      if (!puter) throw new Error("Puter.js not loaded yet. Please refresh the page.");

      // Anonymous mode — no login popup required
      const response = await puter.ai.chat(prompt, {
        model: 'qwen/qwen3-235b-a22b',
        temperature: 0.1,
      });

      const rawText: string = typeof response === "string"
        ? response
        : response?.message?.content ?? String(response ?? "");

      // Safe JSON extraction — handles accidental markdown from the model
      const cleanJSON = rawText
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();

      const output = JSON.parse(cleanJSON);

      // Enrich nodes from catalog, silently drop hallucinated types
      const enrichedNodes = (output.nodes || [])
        .filter((n: any) => CATALOG[n.type])
        .map((n: any) => ({ ...CATALOG[n.type], id: n.id, x: n.x, y: n.y }));

      const validNodeIds = new Set(enrichedNodes.map((n: any) => n.id));
      const validConnections = (output.connections || []).filter((c: any) =>
        validNodeIds.has(c.fromNode) && validNodeIds.has(c.toNode)
      );

      setNodes(enrichedNodes);
      setConnections(validConnections);

      const generatedExplanations = (output.explanations || []).map((ex: any, i: number) => ({
        nodeId: ex.nodeId,
        title: enrichedNodes.find((n: any) => n.id === ex.nodeId)?.label || `Step ${i + 1}`,
        text: ex.explanation,
      }));

      setLearnSteps(generatedExplanations);
      setTutorialSteps(output.tutorial || []);
      setUnrealCode(output.unrealBlueprint || "");
      setLogs([`[Puter AI] Generated: "${promptText}". ${output.message || ""}`]);
      setPanOffset({ x: window.innerWidth / 3, y: 150 });
      setScale(1);

      if (generatedExplanations.length > 0) {
        setLearnMode(true);
        setLearnStep(0);
      }
    } catch (err: any) {
      console.error(err);
      setLogs([`[Error] Puter AI failed: ${err.message}`]);
    } finally {
      setIsGenerating(false);
      setPromptText("");
    }
  };


  // Engine Simulation loop
  const runSim = useCallback(async () => {
    if (simRunning) return;
    setSimRunning(true);
    setActiveNodes(new Set());
    setActiveConns(new Set());
    setLogs([]);

    const health = 35;
    const vars = { health, difficulty: 1.0 };
    setSimVars(vars);

    const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
    const ns = nodesRef.current;
    const cs = connections;

    const visited = new Set<string>();
    const queue: string[] = [];
    const startN = ns.find(n => n.type === "START" || n.type === "EVENT_TICK");
    if (!startN) { setSimRunning(false); return; }
    queue.push(startN.id);

    while (queue.length > 0) {
      const nid = queue.shift()!;
      if (visited.has(nid)) continue; // Prevent infinite loops
      visited.add(nid);
      
      setActiveNodes(prev => new Set([...prev, nid]));
      await sleep(550); // Engine tick speed

      const node = ns.find(n => n.id === nid);
      if (!node) continue;

      // Exec Side Effects
      if (node.type === "INCREASE_DIFF") { vars.difficulty = Math.min(3, +(vars.difficulty + 0.5).toFixed(1)); setSimVars({ ...vars }); }
      if (node.type === "DECREASE_DIFF") { vars.difficulty = Math.max(0.5, +(vars.difficulty - 0.5).toFixed(1)); setSimVars({ ...vars }); }
      if (node.type === "PRINT_STRING") { setLogs(l => [...l, `[LogBlueprintUserMessages] Debug: Fired!`]); }

      // Route outgoing execution pins
      const outs = cs.filter(c => c.fromNode === nid);
      for (const conn of outs) {
        let shouldTraverse = false;
        
        // Logical Gates
        if (node.type === "BRANCH") {
          const cond = vars.health < 50;
          if (cond && conn.fromPort === "true") shouldTraverse = true;
          if (!cond && conn.fromPort === "false") shouldTraverse = true;
        } else if (node.type === "COMPARE_FLOAT") {
          // Mock compare for demo purposes
          const cond = vars.health < 50; 
          if (cond && conn.fromPort === "less") shouldTraverse = true;
          if (!cond && conn.fromPort === "greater") shouldTraverse = true;
        } else {
          // Standard passthrough
          shouldTraverse = true; // For Sequence and Normal Execs
        }

        if (shouldTraverse) {
          setActiveConns(prev => new Set([...prev, conn.id]));
          await sleep(300);
          queue.push(conn.toNode);
        }
      }
    }

    await sleep(1500);
    setActiveNodes(new Set());
    setActiveConns(new Set());
    setSimRunning(false);
  }, [connections, simRunning]);

  const selectedNode = nodes.find(n => n.id === selectedId) ?? null;
  const learnHighlight = learnMode ? learnSteps[learnStep]?.nodeId : null;

  const downloadBP = () => {
    const blob = new Blob([unrealCode || "No blueprint content generated."], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GameSmith_Blueprint.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="playground" className="min-h-screen bg-black border-y border-white/10 relative overflow-x-hidden flex flex-col w-full">
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.6}}`}</style>

      {/* Editor Header */}
      <div className="border-b border-white/10 bg-black relative z-20 shrink-0">
        <div className="px-3 sm:px-6 py-3 sm:py-5 flex flex-col gap-3">
          {/* Title row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-red-600 rounded shrink-0">
                <Compass className="size-4 sm:size-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-black tracking-tight uppercase leading-none">Blueprint Playground</h2>
                <p className="text-white/40 text-[10px] font-mono mt-0.5 hidden sm:block">Unreal Engine visual logic node simulator.</p>
              </div>
            </div>
            {/* Action buttons row */}
            <div className="flex flex-wrap gap-1.5 shrink-0">
            {learnSteps.length > 0 && (
              <button onClick={() => { setLearnMode(!learnMode); setLearnStep(0); }} className={cn("flex items-center gap-2 px-4 py-2 font-black text-[10px] uppercase tracking-widest border transition-all rounded-sm", learnMode ? "bg-white text-black border-white" : "border-white/20 text-white/70 hover:border-red-600 hover:text-white")}>
                <BookOpen size={14} /> Explanations
              </button>
            )}
            {tutorialSteps.length > 0 && (
              <button onClick={() => setShowTutorial(true)} className="flex items-center gap-2 px-4 py-2 font-black text-[10px] uppercase tracking-widest border border-white/20 text-white/70 hover:border-red-600 hover:text-white transition-all rounded-sm">
                <ListTree size={14} /> Full Tutorial
              </button>
            )}
            {unrealCode && (
              <button onClick={downloadBP} className="flex items-center gap-2 px-4 py-2 font-black text-[10px] uppercase tracking-widest border border-white/20 text-white/70 hover:border-blue-500 hover:text-white transition-all rounded-sm">
                <Code size={14} /> Download UE Script
              </button>
            )}
            <button onClick={resetGraph} className="flex items-center gap-2 px-4 py-2 font-black text-[10px] uppercase tracking-widest border border-white/20 text-white/70 hover:border-red-600 hover:text-white transition-all rounded-sm">
              <RotateCcw size={14} /> Reset
            </button>
            </div>
          </div>

          {/* AI Generator Search Bar */}
          <form onSubmit={handleAIGenerate} className="w-full">
            <div className="relative group">
              <div className={cn("absolute -inset-0.5 bg-gradient-to-r from-red-600 to-purple-600 rounded-sm opacity-20 group-hover:opacity-40 transition duration-500 blur", isGenerating && "animate-pulse opacity-60")}></div>
              <div className="relative flex items-center bg-black border border-white/10 rounded-sm overflow-hidden">
                <div className={cn("pl-3 opacity-70 shrink-0", isGenerating ? "animate-spin text-purple-400" : "animate-pulse text-red-500")}>
                  <Sparkles size={14} />
                </div>
                <input
                  type="text"
                  value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                  placeholder="Prompt AI to generate a boss mechanic..."
                  className="w-full min-w-0 bg-transparent border-none py-2.5 px-3 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:ring-0"
                  disabled={isGenerating}
                />
                <button
                  type="submit"
                  disabled={isGenerating || !promptText.trim()}
                  className="px-3 py-2.5 bg-white/5 hover:bg-white/10 disabled:hover:bg-white/5 text-white/80 font-black text-[10px] uppercase tracking-widest border-l border-white/10 disabled:opacity-30 transition-colors shrink-0 whitespace-nowrap"
                >
                  {isGenerating ? "..." : "Generate"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {isGenerating && (
         <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-40 flex items-center justify-center flex-col gap-4 pointer-events-auto transition-opacity duration-300">
           <Sparkles size={48} className="text-purple-500 animate-bounce" />
           <div className="text-white font-black uppercase tracking-widest text-xl drop-shadow-lg">Synthesizing Logic...</div>
         </div>
      )}

      {showTutorial && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-[#111] border border-white/20 w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-lg shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-[#111] z-10">
              <h3 className="text-2xl font-black uppercase text-white tracking-widest">Step-By-Step Tutorial</h3>
              <button onClick={() => setShowTutorial(false)} className="text-white/50 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              {tutorialSteps.map((step, idx) => (
                 <div key={idx} className="flex gap-4 items-start">
                    <div className="bg-red-600/20 text-red-500 font-mono font-bold w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-red-600/30">
                      {idx + 1}
                    </div>
                    <div className="text-white/80 leading-relaxed text-lg pt-1">
                      {step}
                    </div>
                 </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-[700px] relative">


        {/* Canvas System */}
        <div
          ref={canvasRef}
          onMouseDown={handleCanvasMD}
          onContextMenu={handleCanvasContextMenu}
          onWheel={handleWheel}
          className="flex-1 relative overflow-hidden bg-[#111]"
          style={{ cursor: panRef.current ? "grabbing" : "grab" }}
        >
          {/* Blueprint Grid Background Pattern */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{ 
              backgroundImage: "radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)", 
              backgroundSize: `${32 * scale}px ${32 * scale}px`,
              backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
            }} 
          />

          <div style={{ position: "absolute", transformOrigin: "0 0", transform: `translate(${panOffset.x}px,${panOffset.y}px) scale(${scale})`, width: 4000, height: 4000 }}>
            {/* Edge Rendering */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
              <defs>
                <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              {connections.map((c, i) => {
                const fn = nodes.find(n => n.id === c.fromNode);
                const tn = nodes.find(n => n.id === c.toNode);
                if (!fn || !tn) return null;
                const fp = getPortPos(fn, c.fromPort, "output");
                const tp = getPortPos(tn, c.toPort, "input");
                const active = activeConns.has(c.id);
                const fromPort = fn.outputs.find(p => p.id === c.fromPort);
                const col = active ? "#dc2626" : fromPort ? PORT_COLORS[fromPort.kind] : "#ffffff";
                
                return (
                  <g key={c.id}>
                    {/* Shadow / Click Target */}
                    <path d={bezier(fp.x, fp.y, tp.x, tp.y)} stroke="transparent" strokeWidth={18} fill="none" style={{ cursor: "pointer", pointerEvents: "auto" }} onClick={() => setConnections(prev => prev.filter(x => x.id !== c.id))} />
                    
                    {/* Base wire */}
                    <path d={bezier(fp.x, fp.y, tp.x, tp.y)} stroke={col} strokeWidth={active ? 3.5 : 2.5} fill="none" opacity={active ? 1 : 0.6} filter={active ? "url(#glow)" : undefined} strokeDasharray={active ? "8 4" : undefined} style={active ? { animation: "dash 0.5s linear infinite" } : undefined} />
                    <style>{`@keyframes dash{to{stroke-dashoffset:-12}}`}</style>
                    
                    {/* Disconnect indicator on hover */}
                    <g className="opacity-0 hover:opacity-100 transition-opacity" style={{pointerEvents: "none"}}>
                      <circle cx={(fp.x + tp.x) / 2} cy={(fp.y + tp.y) / 2} r={12} fill="#dc2626" />
                      <text x={(fp.x + tp.x) / 2} y={(fp.y + tp.y) / 2 + 4} fill="white" fontSize={12} textAnchor="middle" fontWeight="bold">×</text>
                    </g>
                  </g>
                );
              })}

              {/* Live Dragging Connection */}
              {draftConn && (
                <path
                  d={draftConn.fromDir === "output"
                    ? bezier(draftConn.startX, draftConn.startY, draftConn.mouseX, draftConn.mouseY)
                    : bezier(draftConn.mouseX, draftConn.mouseY, draftConn.startX, draftConn.startY)}
                  stroke="#ffffff" strokeWidth={2} fill="none" strokeDasharray="6 4" opacity={0.8} />
              )}
            </svg>

            {/* Nodes Rendering */}
            {nodes.map(node => {
              const selected = selectedId === node.id;
              const active = activeNodes.has(node.id);
              const highlight = learnHighlight === node.id;

              return (
                <div 
                  key={node.id} 
                  data-node="1" 
                  onMouseDown={e => handleNodeMD(node.id, e)} 
                  className={cn("absolute rounded-lg shadow-xl border-2 transition-colors", active ? "border-red-500 shadow-red-500/50 blink-anim" : selected ? "border-white" : highlight ? "border-yellow-500 shadow-yellow-500/30" : "border-black/50 hover:border-white/30")}
                  style={{ left: node.x, top: node.y, width: NODE_W, backgroundColor: "#1e1e1e", userSelect: "none", zIndex: selected ? 20 : 1 }}
                >
                  {/* Node Header */}
                  <div className="rounded-t flex items-center px-3 py-2 gap-2 border-b border-black/50" style={{ backgroundColor: node.color, height: HEADER_H, background: `linear-gradient(90deg, ${node.color}ff 0%, ${node.color}55 100%)` }}>
                    <Layers fill="rgba(0,0,0,0.3)" stroke="none" size={18} className="shrink-0" />
                    <span className="font-bold text-[13px] text-white uppercase tracking-wider overflow-hidden text-ellipsis whitespace-nowrap drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{node.label}</span>
                  </div>

                  {/* Ports Area */}
                  <div className="p-2 pb-3 bg-gradient-to-b from-[#222] to-[#1a1a1a] rounded-b flex flex-col gap-1">
                    {/* Inputs & Outputs side by side alignment emulation by rendering rows if they match, or just listing */}
                    <div className="flex justify-between w-full">
                       {/* Left side Inputs */}
                      <div className="flex flex-col gap-1 w-1/2">
                        {node.inputs.map(p => {
                          const connected = connections.some(c => c.toNode === node.id && c.toPort === p.id);
                          return (
                            <div key={p.id} className="relative flex items-center h-[28px] gap-2">
                              <PortDot kind={p.kind} side="left" connected={connected} onDown={e => handlePortMD(node.id, p.id, "input", e)} onUp={() => handlePortMU(node.id, p.id, "input")} />
                              <span className="text-[11px] font-medium text-gray-300 drop-shadow-md">{p.label}</span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Right side Outputs */}
                      <div className="flex flex-col gap-1 w-1/2 items-end">
                        {node.outputs.map(p => {
                          const connected = connections.some(c => c.fromNode === node.id && c.fromPort === p.id);
                          return (
                            <div key={p.id} className="relative flex items-center h-[28px] gap-2 justify-end">
                              <span className="text-[11px] font-medium text-gray-300 drop-shadow-md">{p.label}</span>
                              <PortDot kind={p.kind} side="right" connected={connected} onDown={e => handlePortMD(node.id, p.id, "output", e)} onUp={() => handlePortMU(node.id, p.id, "output")} />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Context Menu for GameSmith */}

          {/* Overlays / Widgets */}
          
          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col gap-1 bg-black/80 backdrop-blur-md border border-white/10 p-1 rounded z-30">
            <button onClick={() => handleZoom(1.2)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"><Plus size={16} /></button>
            <div className="text-[9px] font-mono text-center text-white/40 font-bold py-1 select-none">{Math.round(scale * 100)}%</div>
            <button onClick={() => handleZoom(0.8)} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"><Minus size={16} /></button>
          </div>

          {/* Simulation Output Logger */}
          {simVars && (
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-[280px] sm:w-72 flex flex-col gap-4 z-30 pointer-events-none">
              
              {/* Output Log */}
              {logs.length > 0 && (
                <div className="bg-black/90 border-l-2 border-blue-500 p-3 shadow-xl backdrop-blur-sm pointer-events-auto max-h-40 overflow-y-auto">
                  <div className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Code size={12}/> Output Log</div>
                  <div className="space-y-1">
                    {logs.map((log, i) => <div key={i} className="text-[10px] font-mono text-white/80 break-words">{log}</div>)}
                  </div>
                </div>
              )}

              {/* State Monitor */}
              <div className="bg-black/90 border border-red-600/30 p-4 shadow-xl backdrop-blur-sm pointer-events-auto">
                <div className="text-[10px] text-red-600 font-black tracking-widest uppercase mb-4 flex items-center gap-2"><Settings2 size={14}/> Engine State</div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-white/60 mb-1">
                      <span>Player Health</span> <span className="text-green-400">{simVars.health}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${simVars.health}%` }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-white/60 mb-1">
                      <span>Difficulty Multiplier</span> <span className="text-red-400">{simVars.difficulty.toFixed(1)}x</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded overflow-hidden"><div className="h-full bg-red-600" style={{ width: `${Math.min(100, (simVars.difficulty / 3) * 100)}%` }} /></div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Learn Mode Banner */}
      {learnMode && learnSteps.length > 0 && (
        <div className="bg-red-600 border-t-4 border-red-800 relative z-30 shadow-[0_-10px_40px_rgba(220,38,38,0.2)]">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="bg-white p-3 rounded-full shrink-0 shadow-lg">
                <BookOpen size={20} className="text-red-700" />
              </div>
              <div>
                <div className="text-white/80 text-[10px] font-black tracking-widest uppercase mb-1 drop-shadow-md">Step {learnStep + 1} of {learnSteps.length}</div>
                <h4 className="text-2xl font-black uppercase text-white drop-shadow-lg leading-tight">{learnSteps[learnStep]?.title}</h4>
                <p className="text-sm font-medium text-white/90 mt-2 max-w-3xl leading-relaxed">{learnSteps[learnStep]?.text}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setLearnStep(s => Math.max(0, s - 1))} disabled={learnStep === 0} className="px-5 py-3 bg-black/20 hover:bg-black/40 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors disabled:opacity-30">Prev</button>
              <button onClick={() => setLearnStep(s => Math.min(learnSteps.length - 1, s + 1))} disabled={learnStep === learnSteps.length - 1} className="px-5 py-3 bg-white text-red-700 hover:bg-black hover:text-white font-bold text-xs uppercase tracking-wider rounded shadow-md transition-colors disabled:opacity-30">Next</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
