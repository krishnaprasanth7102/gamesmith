
"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Bell,
  Lock,
  Eye,
  Terminal,
  Database,
  Zap,
  ShieldAlert,
  Monitor
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="w-full min-w-0 max-w-3xl">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-2 break-words leading-tight">
          System Config
        </h1>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-8 sm:mb-12">
          Platform Interface Calibration
        </p>

        <div className="flex flex-col gap-6">
          {/* Interface Category */}
          <div className="bg-[#050505] border border-red-900/10 overflow-hidden">
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-white/5 flex items-center gap-3">
              <Monitor className="size-4 text-red-600 shrink-0" />
              <h2 className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-white break-words">
                Visual Interface Protocols
              </h2>
            </div>
            <div className="px-5 sm:px-6 py-5 space-y-6">
              {[
                { name: "Scanline Overlay", desc: "Enable CRT-style terminal interference patterns.", icon: Terminal, active: true },
                { name: "Grid System Diagnostics", desc: "Display tactical coordinate grid on backgrounds.", icon: Eye, active: true },
                { name: "High Contrast Mode", desc: "Maximize accessibility for tactical environments.", icon: Zap, active: false },
              ].map((item, i) => (
                <div key={i} className="flex items-start sm:items-center justify-between gap-4 group">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="size-8 sm:size-9 bg-black border border-white/5 flex items-center justify-center text-zinc-700 group-hover:text-red-500 transition-colors shrink-0 mt-0.5 sm:mt-0">
                      <item.icon className="size-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-black uppercase tracking-tight text-white mb-0.5 break-words">{item.name}</span>
                      <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed break-words">{item.desc}</span>
                    </div>
                  </div>
                  <Switch checked={item.active} className="data-[state=checked]:bg-red-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Security Category */}
          <div className="bg-[#050505] border border-red-900/10 overflow-hidden">
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-white/5 flex items-center gap-3">
              <Lock className="size-4 text-red-600 shrink-0" />
              <h2 className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-white break-words">
                Security &amp; Encryption
              </h2>
            </div>
            <div className="px-5 sm:px-6 py-5 space-y-6">
              {/* Factory Reset */}
              <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 p-4 bg-red-950/10 border border-red-900/30">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <ShieldAlert className="size-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-100 break-words block">
                      Critical Action
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-red-300 break-words block">
                      Factory Reset
                    </span>
                  </div>
                </div>
                <button className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:underline shrink-0 whitespace-nowrap">
                  Pursue Reset
                </button>
              </div>

              {[
                { name: "Session Auto Logout", desc: "Automatically disconnect after 4 hours of inactivity.", icon: Bell },
                { name: "Database Sync", desc: "Keep local assets mirrored with the cloud repository.", icon: Database },
              ].map((item, i) => (
                <div key={i} className="flex items-start sm:items-center justify-between gap-4 group">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="size-8 sm:size-9 bg-black border border-white/5 flex items-center justify-center text-zinc-700 group-hover:text-red-500 transition-colors shrink-0 mt-0.5 sm:mt-0">
                      <item.icon className="size-3.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-black uppercase tracking-tight text-white mb-0.5 break-words">{item.name}</span>
                      <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed break-words">{item.desc}</span>
                    </div>
                  </div>
                  <Switch defaultChecked className="data-[state=checked]:bg-red-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
