"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Check, Code2, Rocket, Zap, Globe, Bot, Sparkles, Package, ArrowRight } from "lucide-react";

export function IntegrationMode() {
  const [copied, setCopied] = useState(false);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeExamples = {
    unreal: `#include "GameSmith/EnemyAI.h"\n\nvoid AGameManager::SpawnEnemy(FString EnemyID) {\n    // Load from GameSmith Marketplace\n    FEnemyPackage Entity = UGameSmithAPI::LoadEnemyAI(EnemyID);\n    Entity.InitializeAI();          // Start behavior tree\n    Entity.ConfigureDifficulty(1.5); // Set aggression level\n    Entity.DeployToWorld(GetWorld());\n}`,
    unity: `using GameSmith.EnemyAI;\n\npublic class EnemySpawner : MonoBehaviour {\n    void LoadEnemy(string id) {\n        // Fetch from GameSmith Marketplace\n        var enemy = GameSmithLibrary.LoadEnemyAI(id);\n        enemy.Instantiate(transform.position);\n        enemy.SetDifficulty(EnemyDifficulty.Hard);\n        enemy.BeginCombatSequence();\n    }\n}`,
    godot: `extends Node3D\n\nfunc deploy_enemy(enemy_id: String):\n    # Load free AI from GameSmith Marketplace\n    var library = get_node("/root/GameSmithLibrary")\n    var enemy = library.load_enemy_ai(enemy_id)\n    add_child(enemy)\n    enemy.set_difficulty(1.5)\n    enemy.activate_ai()`
  };

  const features = [
    {
      icon: Bot,
      title: "AI-Generated Blueprints",
      desc: "Type a prompt like 'boss attacks when player health drops below 50%' and instantly get a visual logic graph with step-by-step tutorials.",
      href: "/playground",
      cta: "Try GameSmith AI"
    },
    {
      icon: Package,
      title: "Premium AI Marketplace",
      desc: "Browse and download high-performance industrial-grade AI assets for Unreal, Unity, and Godot. 100% Free.",
      href: "/library",
      cta: "Browse Marketplace"
    },
    {
      icon: Sparkles,
      title: "Forge Your Legacy",
      desc: "Built a boss? Share it with the world. Upload your enemy AI scripts, behavior trees, and blueprints to our global decentralized network.",
      href: "#protocol",
      cta: "Start Forging"
    }
  ];

  return (
    <section id="integration" className="bg-black py-16 sm:py-32 lg:py-40 px-6 border-b border-white/10 relative overflow-hidden">
      <div className="absolute top-0 right-0 size-[400px] bg-red-600/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Feature Cards */}
        <div className="mb-20 sm:mb-32">
          <div className="text-center mb-12">
            <div className="text-red-600 font-black text-[10px] tracking-[0.6em] uppercase mb-4 flex items-center justify-center gap-3">
              <Bot className="size-4" /> ENGINE_CORE_V4
            </div>
            <h2 className="text-3xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase mb-6 leading-[0.9]">
              THE GAMESMITH ECOSYSTEM
            </h2>
            <p className="text-sm sm:text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
              Generate, download, and deploy advanced game logic. Built for developers who demand visual excellence and code stability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="border border-white/10 p-6 sm:p-8 bg-white/[0.02] flex flex-col gap-6 hover:border-red-600/40 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="size-10 sm:size-12 border border-red-600/30 bg-red-600/10 flex items-center justify-center group-hover:bg-red-600 transition-colors shrink-0">
                    <f.icon className="size-4 sm:size-5 text-red-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-[8px] sm:text-[9px] font-black text-white/20 tracking-widest uppercase truncate">NODE_0{i + 1}</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-black uppercase tracking-tight mb-2 sm:mb-3">{f.title}</div>
                  <p className="text-xs sm:text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </div>
                <a href={f.href} className="mt-auto text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-red-500 hover:text-white transition-colors flex items-center gap-2 w-max">
                  {f.cta} <ArrowRight className="size-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Engine Integration */}
        <div className="mb-12 sm:mb-20 flex flex-col items-center text-center">
          <div className="text-red-600 font-black text-[10px] tracking-[0.6em] uppercase mb-4 flex items-center gap-3">
            <Code2 className="size-4" /> NATIVE_ADAPTERS
          </div>
          <h3 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase mb-6 leading-[0.95] max-w-3xl">
            ONE COMMAND DEPLOYMENT
          </h3>
          <p className="text-sm sm:text-base text-white/40 max-w-xl leading-relaxed">
            Integration is seamless. Download your AI from the marketplace and inject it into your project with native engine support.
          </p>
        </div>

        <Tabs defaultValue="unreal" className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            <div className="lg:col-span-4 flex flex-col gap-6">
              <TabsList className="flex flex-col h-auto bg-transparent gap-2 items-stretch p-0">
                <TabsTrigger
                  value="unreal"
                  className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border border-white/10 data-[state=active]:bg-white data-[state=active]:text-black rounded-none uppercase font-black tracking-widest sm:tracking-[0.2em] text-[9px] sm:text-[10px] transition-all hover:border-red-600 whitespace-normal text-left"
                >
                  Unreal Engine 5.4+
                  <Rocket className="size-4 opacity-50 shrink-0 ml-2" />
                </TabsTrigger>
                <TabsTrigger
                  value="unity"
                  className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border border-white/10 data-[state=active]:bg-white data-[state=active]:text-black rounded-none uppercase font-black tracking-widest sm:tracking-[0.2em] text-[9px] sm:text-[10px] transition-all hover:border-red-600 whitespace-normal text-left"
                >
                  Unity 6+
                  <Zap className="size-4 opacity-50 shrink-0 ml-2" />
                </TabsTrigger>
                <TabsTrigger
                  value="godot"
                  className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border border-white/10 data-[state=active]:bg-white data-[state=active]:text-black rounded-none uppercase font-black tracking-widest sm:tracking-[0.2em] text-[9px] sm:text-[10px] transition-all hover:border-red-600 whitespace-normal text-left"
                >
                  Godot 4.3+
                  <Globe className="size-4 opacity-50 shrink-0 ml-2" />
                </TabsTrigger>
              </TabsList>

              <div className="space-y-5 bg-white/[0.02] p-6 border border-white/5">
                {[
                  "Generate your logic on the GameSmith AI Playground",
                  "Download the native script or blueprint representation",
                  "Drop into your project and watch the AI come alive"
                ].map((step, i) => (
                  <div key={i} className="flex gap-5 items-start group">
                    <div className="size-9 border-2 border-red-600/40 text-red-600 flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all">
                      0{i + 1}
                    </div>
                    <p className="text-[11px] text-white/40 leading-relaxed pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 w-full overflow-hidden">
              {Object.entries(codeExamples).map(([key, code]) => (
                <TabsContent key={key} value={key} className="m-0 focus-visible:outline-none">
                  <div className="relative group flex flex-col h-full w-full">
                    <div className="absolute top-4 right-4 z-20">
                      <button
                        onClick={() => copyCode(code)}
                        className="bg-red-600 hover:bg-white hover:text-black p-3 text-white transition-all"
                        title="Copy Code"
                      >
                        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      </button>
                    </div>
                    <div className="bg-white/[0.03] border border-white/10 p-8 sm:p-12 font-mono text-[11px] sm:text-sm leading-relaxed overflow-x-auto whitespace-pre min-h-[280px] flex items-center scrollbar-hide w-full">
                      <code className="text-white/70">{code}</code>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-6 text-[9px] text-white/20 font-mono uppercase tracking-[0.3em]">
                      <span className="flex items-center gap-2"><div className="size-1 bg-red-600 animate-pulse" /> SYNTAX: {key === 'unreal' ? 'C++ 20' : key === 'unity' ? 'C# 12' : 'GDScript 2.0'}</span>
                      <span className="bg-white/5 px-2 py-1 border border-white/10">STABLE_MODULE_v4</span>
                      <span className="text-green-500/60">OPEN_SOURCE</span>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
