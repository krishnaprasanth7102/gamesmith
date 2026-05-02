"use client";

import { useEffect, useState } from "react";
import { Bot, Cpu, Package, Sparkles, ChevronDown, ArrowRight } from "lucide-react";

export function SystemBoot() {
  const [dots, setDots] = useState("");
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    const progInterval = setInterval(() => {
      setProgress(p => (p < 100 ? p + 2 : 100));
    }, 25);
    return () => { clearInterval(dotInterval); clearInterval(progInterval); };
  }, []);

  const stats = [
    { value: "2,400+", label: "Enemy AIs" },
    { value: "18K+", label: "Downloads" },
    { value: "Free", label: "Always" },
    { value: "3 Engines", label: "Supported" },
  ];

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black px-6 py-20">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      {/* Red ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[70vw] max-w-[700px] bg-red-600/8 blur-[150px] rounded-full pointer-events-none" />

      <div
        className="z-10 text-center w-full max-w-6xl flex flex-col items-center mx-auto"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease' }}
      >
        {/* Status badge */}
        <div className="mb-10 flex items-center justify-center gap-4 w-full">
          <div className="h-px flex-1 max-w-[80px] bg-red-600/40" />
          <div className="border border-red-600/60 px-5 py-2 text-[9px] tracking-[0.4em] text-red-500 animate-pulse uppercase font-black bg-red-600/5 backdrop-blur-sm whitespace-nowrap flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-red-500 animate-ping inline-block" />
            AI_SYSTEMS_ONLINE — {progress}%
          </div>
          <div className="h-px flex-1 max-w-[80px] bg-red-600/40" />
        </div>

        {/* Main heading */}
        <h1 className="text-[13vw] sm:text-[10vw] md:text-[9vw] font-black leading-none tracking-tighter text-white select-none uppercase mb-6 relative">
          GAMESMITH
        </h1>
        <p className="text-base sm:text-xl md:text-2xl font-medium text-white/50 tracking-wide max-w-3xl mb-4 leading-relaxed">
          The <span className="text-white font-bold">open ecosystem</span> for game enemy AI.{" "}
          <span className="text-red-500">Generate blueprints with a prompt.</span>{" "}
          Download free AI assets for any engine.
        </p>
        <p className="text-sm text-white/30 tracking-widest uppercase font-mono mb-14">
          Unreal Engine · Unity · Godot · Free Forever
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full max-w-lg mx-auto">
          <a
            href="/playground"
            className="flex-1 h-14 bg-red-600 text-white text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all group"
          >
            <Sparkles className="size-4 group-hover:scale-125 transition-transform" />
            Generate Blueprint
          </a>
          <a
            href="/library"
            className="flex-1 h-14 border border-white/20 text-white text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:border-red-600 hover:text-red-500 transition-all group"
          >
            <Package className="size-4 group-hover:scale-125 transition-transform" />
            Browse Marketplace
          </a>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md mx-auto h-[2px] bg-white/10 relative overflow-hidden mb-4">
          <div
            className="absolute inset-y-0 left-0 bg-red-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-mono text-[9px] text-red-600/60 uppercase tracking-[0.5em] text-center mb-16">
          Loading AI core systems{dots}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="border border-white/10 p-5 bg-white/[0.02] flex flex-col items-center gap-1 hover:border-red-600/40 transition-colors">
              <div className="text-2xl sm:text-3xl font-black text-white">{s.value}</div>
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <a href="#entities" className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 group">
        <span className="text-[8px] font-black uppercase tracking-[0.5em] text-red-600 opacity-40 group-hover:opacity-100 transition-opacity">EXPLORE_ENTITIES</span>
        <ChevronDown className="size-5 text-red-600 animate-bounce" />
      </a>
    </section>
  );
}