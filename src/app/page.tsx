
"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  ArrowRight,
  BrainCircuit,
  Box,
  Layers,
  Upload,
  Zap,
  Shield,
  ChevronRight,
  Globe,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-body selection:bg-red-600 overflow-x-hidden">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-32 overflow-hidden px-4 sm:px-6">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.1),transparent_50%)]" />
            <div className="grid-bg absolute inset-0 opacity-20" />
            <div className="scanline" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 rounded-none border border-red-900/30 bg-red-950/10 mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-red-500">Global Production Infrastructure v5.0</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter uppercase mb-6 sm:mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              Forge The Future
              <br />
              <span className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]">Of Game Logic</span>
            </h1>

            <p className="max-w-xl mx-auto text-zinc-500 text-sm sm:text-lg font-medium tracking-tight mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 px-2">
              GameSmith is the ultimate tactical arsenal for modern developers. Generate visual blueprints with advanced AI,
              access high-fidelity asset libraries, and deploy game mechanics faster than ever before.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 px-4 sm:px-0">
              <Button asChild size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 rounded-none bg-red-600 hover:bg-white hover:text-black text-white font-black uppercase tracking-[0.2em] text-[11px] transition-all group">
                <Link href="/signup">
                  Initialize Protocol <ArrowRight className="ml-3 size-4 group-hover:translate-x-2 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 rounded-none border-red-900/30 bg-transparent text-white font-black uppercase tracking-[0.2em] text-[11px] hover:bg-red-950/20 hover:border-red-500 transition-all">
                <Link href="/library">Browse Library</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section id="features" className="py-16 sm:py-32 px-4 sm:px-6 border-t border-white/5 relative bg-[#050505]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-6 mb-12 sm:mb-20">
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-3 sm:mb-4">Operational_Modules</h2>
                <h3 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
                  Command Your Game Design
                </h3>
              </div>
              <p className="text-zinc-600 text-sm font-medium tracking-tight max-w-xs">
                Next-gen systems built to eliminate technical debt and accelerate your creative vision.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
              {[
                { title: "AI Blueprint Forge", icon: BrainCircuit, desc: "Transform natural language into functional node-based logic graphs ready for engine implementation.", href: "/playground" },
                { title: "Tactical Asset Store", icon: Box, desc: "Premium, game-ready assets including 3D models, shaders, and visual effects for professional projects.", href: "/assets" },
                { title: "Overwatch Console", icon: Layers, desc: "Comprehensive management dashboard for moderating content, tracking performance, and scaling assets.", href: "/admin" },
                { title: "Contribution Node", icon: Upload, desc: "Secure gateway for developers to upload, share, and monetize their custom game mechanics.", href: "/upload" },
              ].map((feature, i) => (
                <Link key={i} href={feature.href} className="group bg-black p-6 sm:p-10 border-0 hover:bg-[#0a0a0a] transition-all duration-500">
                  <feature.icon className="size-8 sm:size-10 text-red-600 mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500" />
                  <h4 className="text-base sm:text-lg font-black uppercase tracking-tight mb-3">{feature.title}</h4>
                  <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8">{feature.desc}</p>
                  <div className="flex items-center gap-2 text-red-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Access Module <ChevronRight className="size-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 border-y border-white/5 bg-black">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-center">
            {[
              { val: "500K+", label: "Logic Nodes Synthesized", icon: Zap },
              { val: "25K", label: "Professional Operatives", icon: Globe },
              { val: "99.9%", label: "System Reliability", icon: Shield },
              { val: "100ms", label: "AI Latency Target", icon: Database },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 sm:gap-4">
                <stat.icon className="size-4 sm:size-5 text-zinc-800" />
                <span className="text-2xl sm:text-4xl font-black tracking-tighter text-white">{stat.val}</span>
                <span className="text-[8px] sm:text-[10px] font-bold text-red-600 uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 sm:py-40 px-4 sm:px-6 relative overflow-hidden bg-[#050505]">
          <div className="absolute inset-0 z-0">
            <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-[radial-gradient(circle_at_100%_100%,rgba(220,38,38,0.1),transparent_70%)]" />
          </div>
          <div className="max-w-3xl mx-auto relative z-10 text-center px-2">
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 sm:mb-8 italic leading-[0.85]">
              Ready To Deploy?
            </h2>
            <p className="text-zinc-500 mb-8 sm:mb-12 text-sm sm:text-lg">
              Join the elite network of developers building the next generation of games with GameSmith.
            </p>
            <Button asChild size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-16 rounded-none bg-white text-black hover:bg-red-600 hover:text-white font-black uppercase tracking-[0.3em] text-[11px] transition-all">
              <Link href="/signup">Establish Operative Identity</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
