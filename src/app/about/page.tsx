
"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Info, Shield, Target, Users, MapPin, Mail, MessageSquare, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30">
      <Navbar />
      <main className="pt-32 pb-20">
        <section className="px-6 max-w-7xl mx-auto mb-32">
            <div className="flex flex-col lg:flex-row items-center gap-20">
                <div className="flex-1">
                    <h1 className="text-7xl font-black uppercase tracking-tighter mb-8 leading-[0.8]">The_Multiverse_Standard</h1>
                    <p className="text-zinc-500 text-lg leading-relaxed uppercase tracking-tight font-bold mb-12">
                        Gamesmith is a tactical software initiative dedicated to bridging the gap between AI behavioral logic and 3D environment architecture.
                    </p>
                    <div className="grid grid-cols-2 gap-12">
                        <div>
                            <h4 className="text-3xl font-black mb-2 text-red-600">2021</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Protocol_Founded</p>
                        </div>
                        <div>
                            <h4 className="text-3xl font-black mb-2 text-red-600">85K+</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Nodes_Deployed</p>
                        </div>
                    </div>
                </div>
                <div className="flex-1 relative">
                    <div className="aspect-square bg-red-950/20 border border-red-900/10 p-12 flex items-center justify-center relative group">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800')] bg-cover grayscale opacity-20 group-hover:opacity-40 transition-opacity" />
                        <Shield className="size-32 text-red-600 relative z-10 animate-pulse" />
                    </div>
                    <div className="absolute -top-4 -right-4 size-16 border-t-4 border-r-4 border-red-600" />
                    <div className="absolute -bottom-4 -left-4 size-16 border-b-4 border-l-4 border-red-600" />
                </div>
            </div>
        </section>

        <section className="bg-zinc-900/10 py-32 border-y border-white/5 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
                {[
                    { title: "Tactical_Precision", desc: "Every asset is stress-tested against high-performance engine metrics.", icon: Target },
                    { title: "AI_Sovereignty", desc: "Our neural scripts are self-learning and optimized for multi-agent ecosystems.", icon: Zap },
                    { title: "Global_Handshake", desc: "A connected network of creators deploying the future of interactive art.", icon: Users },
                ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-6">
                        <item.icon className="size-10 text-red-600" />
                        <h3 className="text-xl font-black uppercase tracking-tight">{item.title}</h3>
                        <p className="text-zinc-600 text-sm leading-relaxed uppercase tracking-tight font-bold">{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>

        <section className="px-6 max-w-7xl mx-auto py-32" id="contact">
            <div className="bg-red-600 p-16 flex flex-col md:flex-row items-center justify-between gap-12 group cursor-crosshair">
                <div className="max-w-xl">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-6">Establish_Communications</h2>
                    <p className="text-red-100 text-lg font-bold uppercase tracking-tight">Need technical support or corporate integration? Our operations team is active 24/7.</p>
                </div>
                <div className="flex flex-col gap-4 shrink-0">
                    <Button className="bg-white text-black hover:bg-black hover:text-white px-12 h-16 rounded-none text-xs font-black uppercase tracking-widest flex items-center gap-4 transition-all">
                        <Mail className="size-5" /> agent@gamesmith.io
                    </Button>
                    <Button className="bg-black/20 text-white hover:bg-white hover:text-black px-12 h-16 rounded-none text-xs font-black uppercase tracking-widest flex items-center gap-4 transition-all border border-black/10">
                        <MessageSquare className="size-5" /> Secure_Chat
                    </Button>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
