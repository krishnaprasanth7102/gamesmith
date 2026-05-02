
"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldCheck, Lock, Eye, FileText, Fingerprint, Activity } from "lucide-react";

export default function ProtocolPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="mb-20 text-center">
            <h1 className="text-6xl font-black uppercase tracking-tighter mb-6">Security_Protocol_2.1</h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.6em]">Rules of Engagement & System Integrity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
                { title: "Node_Authorization", icon: Fingerprint, text: "All users must maintain an active handshake to access the tactical marketplace." },
                { title: "Encryption_Standard", icon: Lock, text: "Data transfers are end-to-end encrypted with RSA-4096 standards." },
                { title: "Privacy_Sentinel", icon: Eye, text: "Operative identities are masked by default to ensure maximum project secrecy." },
                { title: "Asset_Integrity", icon: ShieldCheck, text: "Each deployment undergoes neural diagnostic sweeps before live integration." },
            ].map((p, i) => (
                <div key={i} className="bg-[#050505] border border-red-900/10 p-12 flex flex-col gap-8 group hover:bg-red-950/20 transition-all">
                    <p.icon className="size-10 text-red-600 group-hover:scale-110 transition-transform" />
                    <h3 className="text-2xl font-black uppercase tracking-tight">{p.title}</h3>
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-tight leading-relaxed">{p.text}</p>
                </div>
            ))}
        </div>

        <div className="mt-20 p-12 bg-zinc-900/10 border border-white/5 space-y-8">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <FileText className="size-6 text-red-600" />
                <h3 className="text-xl font-black uppercase tracking-tight">Legal_Terms</h3>
            </div>
            <p className="text-zinc-600 text-[10px] leading-relaxed uppercase tracking-widest font-bold">
                By accessing the Gamesmith Multiverse, you agree to uphold the integrity of the collective ecosystem. Redistribution of proprietary core modules without explicit node clearance is strictly prohibited under Protocol 1.1-B.
            </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
