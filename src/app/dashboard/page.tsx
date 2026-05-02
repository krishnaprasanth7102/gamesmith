"use client";

import { useState, useEffect } from "react";

import DashboardLayout from "@/components/DashboardLayout";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  Activity, 
  Cpu, 
  Database, 
  Fingerprint,
  Calendar,
  Zap,
  ArrowUpRight,
  BrainCircuit,
  Terminal,
  ChevronRight,
  Layers,
  Loader2
} from "lucide-react";
import { useBlueprints } from "@/hooks/use-blueprints";
import { useUserAssets } from "@/hooks/use-assets";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useUser();
  const { blueprints, loading: loadingBlueprints } = useBlueprints();
  const { assets, loading: loadingAssets } = useUserAssets();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="size-8 animate-spin text-red-600" />
        </div>
      </DashboardLayout>
    );
  }

  const totalDownloads = assets.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);

  return (
    <DashboardLayout>
      <div className="mb-8 sm:mb-12 flex flex-wrap items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-1 sm:mb-2 break-words">Command Center</h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em]">Operative Status: Optimal</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 bg-red-950/10 border border-red-900/20 shrink-0">
          <Activity className="size-3.5 text-red-500 animate-pulse" />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Network Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
        {[
          { label: "Security Audit", value: "Verified", icon: Shield, color: "text-red-500" },
          { label: "Saved Protocols", value: loadingBlueprints ? "..." : blueprints.length.toString(), icon: BrainCircuit, color: "text-red-500" },
          { label: "Live Assets", value: loadingAssets ? "..." : assets.length.toString(), icon: Database, color: "text-zinc-500" },
          { label: "Total Downloads", value: loadingAssets ? "..." : totalDownloads.toString(), icon: Zap, color: "text-red-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#050505] border border-red-900/20 p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 group hover:border-red-500 transition-colors min-w-0">
            <div className="flex justify-between items-start">
              <stat.icon className={`size-4 sm:size-5 ${stat.color} shrink-0`} />
              <ArrowUpRight className="size-3 text-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg sm:text-2xl font-black tracking-tighter uppercase break-words">{stat.value}</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1 break-words">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0">
          <div className="bg-[#050505] border border-red-900/20 p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between mb-6 pb-4 border-b border-white/5 gap-3">
              <h3 className="text-base sm:text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <Fingerprint className="size-4 sm:size-5 text-red-600 shrink-0" /> Biometric Reference
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
              <div className="space-y-1 min-w-0">
                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Callsign</span>
                <p className="text-base font-black uppercase break-words">{user?.displayName || "UNRESOLVED"}</p>
              </div>
              <div className="space-y-1 min-w-0">
                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Email</span>
                <p className="text-xs font-mono text-zinc-400 break-all">{user?.email}</p>
              </div>
              <div className="space-y-1 min-w-0">
                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Created</span>
                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-red-950 shrink-0" />
                  <p className="font-mono text-xs">{user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toDateString() : "N/A"}</p>
                </div>
              </div>
              <div className="space-y-1 min-w-0">
                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Encryption ID</span>
                <p className="font-mono text-[10px] text-zinc-600 break-all">{user?.uid}</p>
              </div>
            </div>
          </div>

          <div className="bg-black border border-red-900/20 p-5 sm:p-8 font-mono text-[10px]">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
              <Terminal className="size-4 text-red-600 shrink-0" />
              <span className="font-black uppercase tracking-[0.2em]">Live System Log</span>
            </div>
            <div className="space-y-3 text-zinc-500 overflow-y-auto h-40 sm:h-48 scrollbar-hide">
              <p><span className="text-zinc-800">[11:20:01]</span> HANDSHAKE_SUCCESS: Dashboard protocol initialized.</p>
              <p><span className="text-zinc-800">[11:20:05]</span> CACHE_SYNC: {assets.length} Assets verified in local storage.</p>
              <p><span className="text-zinc-800">[11:20:12]</span> WEBSOCKET_CONNECT: Secure pipe established to Frankfurt_Node_02.</p>
              <p><span className="text-red-900/50">[11:21:44]</span> SECURITY_NOTICE: Auto logout in 72 hours.</p>
              <p><span className="text-zinc-800">[11:22:10]</span> HEARTBEAT: Ping 28ms. Stability 100%.</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 sm:space-y-8 min-w-0">
          <div className="bg-red-600 p-6 sm:p-8 flex flex-col gap-5 sm:gap-8">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-white leading-tight">Execute New Simulation</h3>
            <p className="text-red-100 text-sm font-medium leading-relaxed">Access the blueprint playground to generate enemy AI nodes using natural language prompts.</p>
            <button 
              onClick={() => router.push("/playground")}
              className="h-12 sm:h-14 bg-black text-white font-black uppercase tracking-widest text-[9px] sm:text-[10px] flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all"
            >
              Open Playground <Layers className="size-4" />
            </button>
          </div>

          <div className="bg-[#080808] border border-red-900/20 p-6 sm:p-8 flex flex-col gap-6">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Active_Protocols</h3>
               <div className="space-y-4">
                   {loadingBlueprints ? (
                      <div className="flex justify-center py-4"><Loader2 className="size-4 animate-spin text-zinc-800" /></div>
                   ) : blueprints.length > 0 ? (
                      blueprints.slice(0, 3).map((bp: any, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border border-white/5 bg-black/50 group cursor-pointer hover:border-red-600/50 transition-all" onClick={() => router.push("/playground")}>
                           <div className="flex flex-col min-w-0">
                               <span className="text-[11px] font-black uppercase truncate">{bp.name}</span>
                               <span className="text-[9px] font-mono text-zinc-700">Blueprint_Node_{bp.nodes?.length || 0}</span>
                           </div>
                           <ChevronRight className="size-3 text-zinc-800 group-hover:text-red-500 transition-colors" />
                        </div>
                      ))
                   ) : (
                      <p className="text-[9px] font-black text-zinc-800 uppercase tracking-widest text-center py-4">No Active Protocols</p>
                   )}
               </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
