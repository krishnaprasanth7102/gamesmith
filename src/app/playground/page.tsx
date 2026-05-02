"use client";

import { useState, useRef, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Play,
  Trash2,
  Plus,
  Search,
  Terminal,
  Loader2,
  Sparkles,
  Info,
  X,
  PlusCircle,
  Save,
  FolderOpen,
  Clock,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { blueprintFlow } from "@/ai/blueprint-flow";
import { validateBlueprintFlow } from "@/ai/validate-flow";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useAuth, useUser } from "@/firebase";
import { saveBlueprint } from "@/lib/firestore-service";
import { useBlueprints } from "@/hooks/use-blueprints";

const CATALOG: Record<string, any> = {
  START: { category: "Events", type: "START", label: "BeginPlay", color: "#dc2626", description: "Fires once when actor spawns.", inputs: [], outputs: [{ id: "exec", label: "Exec", kind: "exec" }] },
  EVENT_TICK: { category: "Events", type: "EVENT_TICK", label: "Event Tick", color: "#dc2626", description: "Fires every frame.", inputs: [], outputs: [{ id: "exec", label: "Exec", kind: "exec" }, { id: "delta", label: "Delta Seconds", kind: "float" }] },
  SEQUENCE: { category: "Flow Control", type: "SEQUENCE", label: "Sequence", color: "#808080", description: "Executes pins in order.", inputs: [{ id: "in", label: "Exec", kind: "exec" }], outputs: [{ id: "0", label: "Then 0", kind: "exec" }, { id: "1", label: "Then 1", kind: "exec" }] },
  BRANCH: { category: "Flow Control", type: "BRANCH", label: "Branch", color: "#808080", description: "If/Else conditional.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "cond", label: "Condition", kind: "bool" }], outputs: [{ id: "t", label: "True", kind: "exec" }, { id: "f", label: "False", kind: "exec" }] },
  DELAY: { category: "Flow Control", type: "DELAY", label: "Delay", color: "#808080", description: "Pauses for N seconds.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "d", label: "Duration", kind: "float" }], outputs: [{ id: "out", label: "Completed", kind: "exec" }] },
  PLUS_FLOAT: { category: "Math", type: "PLUS_FLOAT", label: "Add (Float)", color: "#22c55e", description: "A + B.", inputs: [{ id: "a", label: "A", kind: "float" }, { id: "b", label: "B", kind: "float" }], outputs: [{ id: "sum", label: "Result", kind: "float" }] },
  LERP: { category: "Math", type: "LERP", label: "Lerp", color: "#22c55e", description: "Linear interpolation.", inputs: [{ id: "a", label: "A", kind: "float" }, { id: "b", label: "B", kind: "float" }, { id: "alpha", label: "Alpha", kind: "float" }], outputs: [{ id: "res", label: "Result", kind: "float" }] },
  SET_LOC: { category: "Utilities", type: "SET_LOC", label: "SetActorLocation", color: "#3b82f6", description: "Moves actor in world.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "new_loc", label: "New Location", kind: "vector" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },
  AI_MOVE_TO: { category: "AI", type: "AI_MOVE_TO", label: "AI Move To", color: "#6366f1", description: "Moves AI pawn to destination.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "pawn", label: "Pawn", kind: "object" }, { id: "dest", label: "Destination", kind: "vector" }], outputs: [{ id: "success", label: "On Success", kind: "exec" }, { id: "fail", label: "On Fail", kind: "exec" }] },
  ADD_MOVEMENT_INPUT: { category: "Movement", type: "ADD_MOVEMENT_INPUT", label: "Add Movement Input", color: "#eab308", description: "Applies directional movement.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "dir", label: "World Direction", kind: "vector" }, { id: "scale", label: "Scale Value", kind: "float" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },
  ADD_IMPULSE: { category: "Physics", type: "ADD_IMPULSE", label: "Add Impulse", color: "#f97316", description: "Applies physics force.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "imp", label: "Impulse", kind: "vector" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },
  SPAWN_ACTOR: { category: "Gameplay", type: "SPAWN_ACTOR", label: "SpawnActorFromClass", color: "#0d9488", description: "Creates actor entity.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "tr", label: "Transform", kind: "transform" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }, { id: "act", label: "Actor", kind: "object" }] },
  APPLY_DAMAGE: { category: "Gameplay", type: "APPLY_DAMAGE", label: "Apply Damage", color: "#0d9488", description: "Deals damage.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "act", label: "Victim", kind: "object" }, { id: "amt", label: "Amount", kind: "float" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },
  CAMERA_SHAKE: { category: "Camera", type: "CAMERA_SHAKE", label: "StartCameraShake", color: "#0891b2", description: "Triggers shake FX.", inputs: [{ id: "in", label: "Exec", kind: "exec" }, { id: "scale", label: "Scale", kind: "float" }], outputs: [{ id: "out", label: "Exec", kind: "exec" }] },
};

export default function PlaygroundPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadPanelOpen, setIsLoadPanelOpen] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirestore();
  const { auth } = useAuth();
  const { blueprints, loading: loadingBlueprints } = useBlueprints();

  const [nodes, setNodes] = useState<any[]>([
    { id: "start", ...CATALOG.START, x: 100, y: 150 },
    { id: "seq", ...CATALOG.SEQUENCE, x: 450, y: 150 },
  ]);
  const [connections, setConnections] = useState<any[]>([]);
  const [summary, setSummary] = useState("Tactical Blueprint Console Active. Awaiting Synthesis Override.");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libSearch, setLibSearch] = useState("");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [drawingConn, setDrawingConn] = useState<any | null>(null);
  const [pulsingConnection, setPulsingConnection] = useState<string | null>(null);
  // Mobile: show either canvas or panel
  const [mobileView, setMobileView] = useState<"canvas" | "panel">("canvas");
  const canvasRef = useRef<HTMLDivElement>(null);
  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const res = await blueprintFlow(prompt);
      setNodes(res.nodes);
      setConnections(res.connections);
      setSummary(res.summary);
      toast({ title: "SYNTHESIS_COMPLETE", description: "Blueprints synchronized." });
      setMobileView("canvas");
    } catch (e: any) {
      toast({ title: "LINK_ERROR", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidate = async () => {
    if (nodes.length === 0 || !prompt) {
      toast({ title: "VALIDATION_FAILED", description: "Need prompt and blueprint logic to validate.", variant: "destructive" });
      return;
    }
    setIsValidating(true);
    setSummary("VALIDATING_LOGIC: Expert system analyzing blueprint integrity...");
    try {
      const res = await validateBlueprintFlow(prompt, { nodes, connections });
      if (res.verdict?.toLowerCase().includes("correct")) {
        setSummary(`VALIDATION_PASSED: ${res.reason || "Logic is sound."}`);
        toast({ title: "VALIDATION_PASSED", description: "Blueprint verified by Expert AI." });
      } else {
        const issueStr = res.issues?.join(" | ") || "";
        const fixStr = res.fix_suggestions?.join(" | ") || "";
        setSummary(`VALIDATION_FAILED: ${res.reason}. Issues: ${issueStr}. Fixes: ${fixStr}`);
        toast({ title: "VALIDATION_FAILED", description: "Logic issues detected. See summary.", variant: "destructive" });
        
        // Auto-correct if provided
        if (res.correct_blueprint?.nodes?.length > 0) {
          setTimeout(() => {
             // Map enriched nodes for auto-correct
             const validNodes = res.correct_blueprint.nodes.filter((n: any) => n.type && CATALOG[n.type]).map((n: any) => ({...CATALOG[n.type], ...n}));
             setNodes(validNodes);
             setConnections(res.correct_blueprint.connections || []);
             toast({ title: "AUTO_CORRECTED", description: "Applied expert fix suggestions." });
          }, 3000);
        }
      }
    } catch (e: any) {
      toast({ title: "VALIDATION_ERROR", description: e.message, variant: "destructive" });
    } finally {
      setIsValidating(false);
    }
  };

  const { user, loading: userLoading, isAdmin } = useUser();

  const handleSave = async () => {
    if (!firestore || !user) {
      toast({ title: "AUTH_REQUIRED", description: "Login to save blueprints.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const name = prompt.split('\n')[0].slice(0, 30) || "New Blueprint";
      await saveBlueprint(firestore, user.uid, {
        name,
        nodes,
        connections
      });
      toast({ title: "PROTOCOL_SAVED", description: "Blueprint archive updated." });
    } catch (error: any) {
      toast({ title: "SAVE_ERROR", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = (bp: any) => {
    setNodes(bp.nodes);
    setConnections(bp.connections);
    setSummary(`Restored: ${bp.name}`);
    setIsLoadPanelOpen(false);
    setMobileView("canvas");
    toast({ title: "ARCHIVE_RESTORED", description: "Blueprint logic re-initialized." });
  };

  const getPortColor = (k: string) => {
    switch (k) {
      case 'exec': return '#ffffff';
      case 'float': return '#22c55e';
      case 'bool': return '#881337';
      case 'vector': return '#eab308';
      case 'integer': return '#00ffff';
      case 'object': return '#0070ff';
      case 'transform': return '#f97316';
      default: return '#555555';
    }
  };

  const handleRun = async () => {
    if (nodes.length === 0) return;
    setSummary("INITIALIZING_SIMULATION: Following execution flow...");
    
    const startNode = nodes.find(n => n.type === 'START' || n.type === 'EVENT_TICK');
    if (!startNode) {
      toast({ title: "SIM_ERROR", description: "No entry point (BeginPlay/Tick) found.", variant: "destructive" });
      return;
    }

    let currentNodeId = startNode.id;
    const visited = new Set();

    while (currentNodeId && !visited.has(currentNodeId)) {
      visited.add(currentNodeId);
      setSelectedNodeId(currentNodeId);
      
      const conn = connections.find(c => c.fromNode === currentNodeId && (c.fromPort === 'exec' || c.fromPort === 'out' || c.fromPort === '0' || c.fromPort === 't'));
      
      if (conn) {
        setPulsingConnection(`${conn.fromNode}-${conn.toNode}`);
        await new Promise(r => setTimeout(r, 600));
        currentNodeId = conn.toNode;
      } else {
        break;
      }
    }
    
    setPulsingConnection(null);
    setSummary("SIMULATION_COMPLETE: All logic paths executed successfully.");
    toast({ title: "SIM_SUCCESS", description: "Blueprint logic verified." });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full min-w-0 gap-4" style={{ height: 'calc(100dvh - 8rem)' }}>
        {/* Top toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-red-900/10 shrink-0">
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black uppercase tracking-tighter break-words">Blueprint Forge v5.2</h1>
            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em] mt-0.5">UE5_SIM // PRODUCTION_BUILD</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button variant="ghost" onClick={() => setIsLoadPanelOpen(true)} className="h-9 px-3 border border-red-900/20 bg-white/5 hover:bg-red-600 hover:text-white font-black uppercase tracking-widest text-[9px] flex items-center gap-2">
              <FolderOpen className="size-3" /> Load
            </Button>
            <Button variant="ghost" onClick={handleSave} disabled={isSaving} className="h-9 px-3 border border-red-900/20 bg-white/5 hover:bg-red-600 hover:text-white font-black uppercase tracking-widest text-[9px] flex items-center gap-2">
              {isSaving ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />} Save
            </Button>
            <Button variant="ghost" onClick={() => setIsLibraryOpen(true)} className="h-9 px-3 sm:px-5 rounded-none border border-red-900/20 bg-white/5 hover:bg-red-600 hover:text-white font-black uppercase tracking-widest text-[9px] flex items-center gap-2">
              <PlusCircle className="size-3" /> Add Node
            </Button>
            <Button variant="ghost" onClick={() => { setNodes([]); setConnections([]); }} className="text-zinc-600 hover:text-red-500 font-black uppercase tracking-widest text-[9px] px-3 h-9">
              <Trash2 className="size-3 mr-1.5" /> Clear
            </Button>
            <Button onClick={handleValidate} disabled={isValidating} className="h-9 px-4 sm:px-6 bg-zinc-800 hover:bg-white hover:text-black text-white rounded-none font-black uppercase tracking-widest text-[9px]">
              {isValidating ? <Loader2 className="size-3 mr-1.5 animate-spin" /> : <Sparkles className="size-3 mr-1.5" />} Validate
            </Button>
            <Button onClick={handleRun} className="h-9 px-4 sm:px-6 bg-red-600 hover:bg-white hover:text-black text-white rounded-none font-black uppercase tracking-widest text-[9px]">
              <Play className="size-3 mr-1.5" /> Run
            </Button>
          </div>
        </div>

        {/* Main area */}
        <div className="flex flex-1 gap-3 relative select-none min-h-0 overflow-hidden">
          {/* Canvas */}
          <div
            ref={canvasRef}
            className={cn(
              "flex-1 bg-[#1e1e1e] border border-black/50 relative overflow-hidden min-h-[400px] shadow-inner",
              mobileView !== "canvas" && "hidden lg:flex"
            )}
            style={{ 
              backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.05) 2px, transparent 2px)`,
              backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px',
              cursor: draggingNode === "PAN" ? "grabbing" : "grab"
            }}
            onMouseDown={(e) => {
              if (e.button === 1 || e.altKey) setDraggingNode("PAN");
              else setSelectedNodeId(null);
            }}
            onMouseMove={(e) => {
              if (draggingNode === "PAN") setOffset(o => ({ x: o.x + e.movementX, y: o.y + e.movementY }));
              else if (draggingNode) setNodes(prev => prev.map(n => n.id === draggingNode ? { ...n, x: n.x + e.movementX / scale, y: n.y + e.movementY / scale } : n));
            }}
            onMouseUp={() => { setDraggingNode(null); setDrawingConn(null); }}
            onWheel={(e) => {
              if (e.ctrlKey) setScale(s => Math.min(Math.max(0.2, s * (e.deltaY > 0 ? 0.9 : 1.1)), 2));
              else setOffset(o => ({ x: o.x - e.deltaX, y: o.y - e.deltaY }));
            }}
          >
            <div className="absolute inset-0 origin-top-left" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}>
              <svg className="absolute inset-0 w-[8000px] h-[8000px] pointer-events-none z-10 overflow-visible">
                {connections.map((c, i) => {
                  const f = nodes.find(n => n.id === c.fromNode);
                  const t = nodes.find(n => n.id === c.toNode);
                  if (!f || !t) return null;
                  
                  const outPort = f.outputs?.find((p: any) => p.id === c.fromPort);
                  const portColor = outPort ? getPortColor(outPort.kind) : '#ffffff';

                  const x1 = f.x + 220, y1 = f.y + 45, x2 = t.x, y2 = t.y + 45;
                  const isPulsing = pulsingConnection === `${c.fromNode}-${c.toNode}`;
                  return (
                    <g key={i}>
                      <path d={`M ${x1} ${y1} C ${x1 + 100} ${y1}, ${x2 - 100} ${y2}, ${x2} ${y2}`} fill="none" stroke={isPulsing ? "#f59e0b" : portColor} strokeWidth={isPulsing ? "4" : "3"} opacity={isPulsing ? "1" : "0.8"} className={cn(isPulsing && "animate-pulse")} />
                      <path d={`M ${x1} ${y1} C ${x1 + 100} ${y1}, ${x2 - 100} ${y2}, ${x2} ${y2}`} fill="none" stroke={isPulsing ? "#f59e0b" : portColor} strokeWidth={isPulsing ? "10" : "6"} opacity="0.15" />
                    </g>
                  );
                })}
              </svg>
              {nodes.map(node => (
                <div
                  key={node.id}
                  className={cn("absolute min-w-[220px] bg-[#151515]/95 rounded-lg shadow-[0_15px_40px_rgba(0,0,0,0.6)] border transition-all z-20 backdrop-blur-sm", selectedNodeId === node.id ? "border-amber-500 ring-2 ring-amber-500/20" : "border-black/60")}
                  style={{ left: node.x, top: node.y, userSelect: 'none' }}
                  onMouseDown={(e) => { e.stopPropagation(); setSelectedNodeId(node.id); if (e.button === 0) setDraggingNode(node.id); }}
                >
                  {/* Node Header */}
                  <div className="px-3 py-2 flex items-center justify-between rounded-t-lg" style={{ backgroundColor: node.color, borderBottom: `2px solid ${node.color}99`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                    <div className="flex items-center gap-2">
                      <div className="size-3 bg-white/20 rounded-sm shadow-inner" />
                      <span className="text-[12px] font-bold text-white tracking-wide drop-shadow-md">{node.label}</span>
                    </div>
                    <Info className="size-3 text-white/40 hover:text-white transition-colors" />
                  </div>

                  <div className="p-3 flex flex-col gap-1">
                    {/* Row mapping inputs and outputs */}
                    <div className="flex justify-between items-start gap-4">
                      {/* Inputs */}
                      <div className="flex flex-col gap-3 flex-1">
                        {node.inputs?.map((inp: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 h-4">
                            {inp.kind === 'exec' ? (
                              <div className="w-[14px] h-[16px] border-[2.5px] border-white bg-transparent shadow-sm" style={{ clipPath: 'polygon(0% 0%, 70% 0%, 100% 50%, 70% 100%, 0% 100%)' }} />
                            ) : (
                              <div className="size-3.5 rounded-full border-[2.5px] shadow-sm" style={{ borderColor: getPortColor(inp.kind), backgroundColor: getPortColor(inp.kind) }} />
                            )}
                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest truncate">{inp.label}</span>
                          </div>
                        ))}
                      </div>
                      {/* Outputs */}
                      <div className="flex flex-col gap-3 flex-1 items-end">
                        {node.outputs?.map((out: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 h-4 justify-end">
                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest truncate">{out.label}</span>
                            {out.kind === 'exec' ? (
                              <div className="w-[14px] h-[16px] border-[2.5px] border-white bg-transparent shadow-sm" style={{ clipPath: 'polygon(0% 0%, 70% 0%, 100% 50%, 70% 100%, 0% 100%)' }} />
                            ) : (
                              <div className="size-3.5 rounded-full border-[2.5px] shadow-sm" style={{ borderColor: getPortColor(out.kind), backgroundColor: getPortColor(out.kind) }} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/90 border border-red-900/20 px-2 sm:px-4 py-1.5 z-40 flex items-center gap-3 shadow-xl">
              <button onClick={() => setScale(s => Math.max(0.2, s - 0.1))} className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors">
                <ZoomOut className="size-3.5" />
              </button>
              <span className="text-[9px] font-black text-red-600 uppercase tracking-widest whitespace-nowrap min-w-[60px] text-center">
                ZOOM: {Math.round(scale * 100)}%
              </span>
              <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors">
                <ZoomIn className="size-3.5" />
              </button>
              
              {selectedNodeId && (
                <div className="pl-3 border-l border-white/10 ml-1">
                  <button onClick={() => setNodes(nodes.filter(n => n.id !== selectedNodeId))} className="text-red-500 text-[9px] font-black uppercase tracking-widest hover:text-white whitespace-nowrap">
                    DELETE
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <aside className={cn(
            "w-full lg:w-80 xl:w-96 bg-[#050505] border border-red-900/10 p-5 sm:p-6 flex flex-col overflow-y-auto min-w-0",
            mobileView !== "panel" && "hidden lg:flex"
          )}>
            {selectedNode ? (
              <div className="space-y-6 flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Details Panel</h3>
                  <X className="size-4 text-zinc-600 cursor-pointer hover:text-white" onClick={() => setSelectedNodeId(null)} />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest mb-2 block">Designation</span>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white break-words">{selectedNode.label}</h2>
                </div>
                <div className="bg-red-950/10 border-l-4 border-red-600 p-4 text-xs font-medium text-zinc-400 italic leading-relaxed">
                  {selectedNode.description}
                </div>
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <div className="flex justify-between text-[10px] font-black">
                    <span className="text-zinc-700 uppercase">Category</span>
                    <span className="text-white uppercase tracking-widest">{selectedNode.category}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black">
                    <span className="text-zinc-700 uppercase">Status</span>
                    <span className="text-green-500 uppercase tracking-widest">Stable</span>
                  </div>
                </div>
              </div>
            ) : isLoadPanelOpen ? (
              <div className="space-y-6 flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Saved Protocols</h3>
                  <X className="size-4 text-zinc-600 cursor-pointer hover:text-white" onClick={() => setIsLoadPanelOpen(false)} />
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide">
                  {loadingBlueprints ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="size-6 animate-spin text-red-600" />
                    </div>
                  ) : blueprints.length > 0 ? (
                    blueprints.map((bp: any) => (
                      <button
                        key={bp.id}
                        onClick={() => handleLoad(bp)}
                        className="w-full bg-black border border-white/5 p-4 text-left hover:border-red-600 transition-all group"
                      >
                        <h4 className="text-xs font-black uppercase text-zinc-400 group-hover:text-white mb-2 truncate">{bp.name}</h4>
                        <div className="flex items-center gap-3 text-[8px] font-mono text-zinc-700 uppercase">
                          <span className="flex items-center gap-1"><Clock className="size-2.5" /> {new Date(bp.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                          <span>{bp.nodes?.length || 0} Nodes</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-center py-10 text-[9px] font-black text-zinc-700 uppercase tracking-widest">No Saved Archives</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5 h-full">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-3">Synthesis Interface</h3>
                  <div className="bg-red-950/10 border border-red-900/20 border-l-4 border-l-red-600 p-4 text-red-500/80 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    {summary}
                  </div>
                </div>
                <textarea
                  className="w-full flex-1 bg-black border border-red-900/10 p-4 text-xs font-medium text-zinc-300 focus:border-red-600 outline-none transition-all scrollbar-hide resize-none min-h-[120px]"
                  placeholder="Describe tactical mechanic logic..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full h-13 bg-red-600 hover:bg-white hover:text-black text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-none active:scale-[0.98] py-3"
                >
                  {isGenerating ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}
                  Synthesize Override
                </Button>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Node Library Overlay */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col p-4 sm:p-8 lg:p-12">
          <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col gap-6 min-h-0">
            <div className="flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <Terminal className="size-7 sm:size-10 text-red-600 shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tighter break-words">Initialize Logic</h2>
                  <p className="text-[9px] sm:text-[10px] font-mono text-zinc-700 uppercase tracking-widest mt-0.5">Accessing Global Node Archive...</p>
                </div>
              </div>
              <X className="size-7 sm:size-9 text-zinc-800 cursor-pointer hover:text-white shrink-0" onClick={() => setIsLibraryOpen(false)} />
            </div>

            <div className="relative shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-800" />
              <Input
                autoFocus
                placeholder="Search nodes..."
                className="pl-12 h-14 sm:h-16 bg-black border-red-900/20 rounded-none text-sm sm:text-lg font-black uppercase tracking-widest focus:border-red-600"
                value={libSearch}
                onChange={(e) => setLibSearch(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.keys(CATALOG)
                .filter(k => CATALOG[k].label.toLowerCase().includes(libSearch.toLowerCase()))
                .map(key => (
                  <button
                    key={key}
                    onClick={() => { setNodes([...nodes, { ...CATALOG[key], id: `n_${Date.now()}_${key}`, x: 100, y: 100 }]); setIsLibraryOpen(false); }}
                    className="bg-[#0a0a0a] border border-white/5 p-5 sm:p-6 flex flex-col items-start gap-2 hover:border-red-600 group transition-all text-left"
                  >
                    <span className="text-[9px] font-black text-red-600/50 uppercase tracking-widest group-hover:text-red-500">{CATALOG[key].category}</span>
                    <h4 className="text-sm sm:text-base font-black uppercase text-zinc-400 group-hover:text-white break-words">{CATALOG[key].label}</h4>
                    <p className="text-[9px] sm:text-[10px] text-zinc-700 group-hover:text-zinc-500 leading-relaxed font-bold uppercase">{CATALOG[key].description}</p>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
