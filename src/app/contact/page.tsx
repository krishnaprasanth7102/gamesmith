
"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Mail, MessageSquare, MapPin, Phone, Send, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600/30">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="mb-20">
            <h1 className="text-6xl font-black uppercase tracking-tighter mb-6">Establish_Comm_Link</h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.6em]">24/7 Operational Support & Inquiries</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-12">
                <div className="bg-[#050505] border border-red-900/10 p-12 space-y-10">
                    {[
                        { label: "Dispatch_Email", val: "ops@gamesmith.io", icon: Mail },
                        { label: "Tactical_Direct", val: "+1 (888) GS-PROTC", icon: Phone },
                        { label: "Base_Node", val: "Sector 04, New Berlin Core", icon: MapPin },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-2">
                             <div className="flex items-center gap-3 text-red-600">
                                 <item.icon className="size-4" />
                                 <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                             </div>
                             <span className="text-2xl font-black uppercase tracking-tight">{item.val}</span>
                        </div>
                    ))}
                </div>
                
                <div className="p-8 bg-zinc-900/10 border border-white/5 flex items-center gap-6">
                    <Shield className="size-8 text-red-950" />
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                        Secure communication encrypted with SHA-256. All logs are managed by regional nodes.
                    </p>
                </div>
            </div>

            <div className="bg-[#050505] border border-red-900/10 p-12">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-12">Open_Transmission</h3>
                <form className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">Identity_Reference</span>
                            <Input placeholder="AGENT_NAME" className="bg-black border-red-900/20 rounded-none h-12 text-xs font-bold" />
                        </div>
                        <div className="space-y-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">Comm_Designation</span>
                            <Input placeholder="EMAIL_ADDRESS" className="bg-black border-red-900/20 rounded-none h-12 text-xs font-bold" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">Message_Payload</span>
                        <Textarea placeholder="TRANSMIT_DATA..." className="bg-black border-red-900/20 rounded-none min-h-[200px] text-sm font-medium" />
                    </div>
                    <Button className="w-full bg-red-600 hover:bg-white hover:text-black text-white h-16 rounded-none font-black uppercase tracking-[0.4em] text-[10px] transition-all flex items-center gap-4">
                        <Send className="size-4" /> Finalize_Transmission
                    </Button>
                </form>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
