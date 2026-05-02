
"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookOpen, Shield, Code, Terminal, Zap, Info, Mail } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="mb-20">
            <h1 className="text-6xl font-black uppercase tracking-tighter mb-6">Tactical_Documentation</h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.6em]">System Architecture & Integration Manuals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <aside className="space-y-12">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-8">Navigation_Tree</h3>
                    <div className="space-y-4">
                        {["Initialize_Node", "Blueprint_Logic", "Multi-Agent_Sync", "Asset_Deployment", "Security_API"].map(link => (
                            <div key={link} className="flex items-center gap-4 text-xs font-bold text-zinc-500 hover:text-white cursor-pointer transition-colors group">
                                <Code className="size-3 text-red-950 group-hover:text-red-500" /> {link}
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            <div className="md:col-span-2 space-y-16">
                <section>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-4">
                        <Terminal className="size-6 text-red-600" /> Node_Initialization
                    </h2>
                    <div className="p-8 bg-zinc-900/10 border border-white/5 space-y-6 leading-relaxed text-zinc-400">
                        <p>To begin integrating Gamesmith into your UE5 environment, download the tactical plugin from the creator portal. Execute the handshake protocol to sync your local node with the global multiverse.</p>
                        <div className="p-6 bg-black font-mono text-[11px] text-red-500 border-l-2 border-red-600">
                            git clone https://multiverse.gamesmith.io/tactical-ue-plugin.git
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-4">
                        <Zap className="size-6 text-red-600" /> Blueprint_Synthesis
                    </h2>
                    <div className="p-8 bg-zinc-900/10 border border-white/5 space-y-6 leading-relaxed text-zinc-400">
                        <p>Our AI uses advanced Neural Kernels to translate natural language into visual logic. When generating blueprints, ensure your prompts are descriptive of the behavioral outcome.</p>
                        <ul className="list-disc list-inside space-y-4 marker:text-red-600">
                            <li>Identify health thresholds</li>
                            <li>Define range-based triggers</li>
                            <li>Establish procedural attack patterns</li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
