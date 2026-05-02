
"use client";

import Link from "next/link";
import { Terminal, Github, Twitter, Youtube, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 sm:py-20 px-4 sm:px-6 border-t border-white/5 bg-black overflow-x-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10 sm:gap-16">
        <div className="max-w-xs">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-8 bg-red-600 flex items-center justify-center">
              <Terminal className="size-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase leading-none text-white">GAMESMITH</span>
          </div>
          <p className="text-zinc-600 text-xs leading-relaxed uppercase tracking-tight font-bold">
            The professional standard for AI-assisted game development. Secure. Tactical. Open-Source.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 sm:gap-12 lg:gap-24">
          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Platform</h5>
            <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <Link href="/assets" className="hover:text-white transition-colors">Asset Store</Link>
                <Link href="/playground" className="hover:text-white transition-colors">Playground</Link>
                <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
            </div>
          </div>
          <div className="space-y-6">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Company</h5>
            <div className="flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                <Link href="/about" className="hover:text-white transition-colors">About</Link>
                <Link href="/protocol" className="hover:text-white transition-colors">Protocol</Link>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          <div className="space-y-6 col-span-2 md:col-span-1">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Social</h5>
            <div className="flex gap-6 text-zinc-500">
                <Link href="#" className="hover:text-white transition-all"><Github className="size-5" /></Link>
                <Link href="#" className="hover:text-white transition-all"><Twitter className="size-5" /></Link>
                <Link href="#" className="hover:text-white transition-all"><Youtube className="size-5" /></Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 sm:mt-24 pt-8 sm:pt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8">
          <p className="text-[8px] sm:text-[9px] font-mono text-zinc-700 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-center sm:text-left">
              © 2026 GAMESMITH MULTIVERSE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[8px] sm:text-[9px] font-mono text-zinc-700 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              <Link href="/privacy" className="hover:text-red-500 transition-colors">Privacy_Policy</Link>
              <Link href="/tos" className="hover:text-red-500 transition-colors">Terms_Of_Service</Link>
              <div className="flex items-center gap-2">
                  <Shield className="size-3 text-red-950" />
                  <span>Verified_Node</span>
              </div>
          </div>
      </div>
    </footer>
  );
}
