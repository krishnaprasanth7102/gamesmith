"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useUser } from "@/firebase";
import { User, Mail, Shield, Key, MapPin, Calendar, Edit3, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user } = useUser();

  return (
    <DashboardLayout>
      <div className="w-full min-w-0 max-w-4xl">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-2 break-words">Operative Profile</h1>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-8 sm:mb-12">Authorized Personnel Only</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="size-40 rounded-none border-2 border-red-900/30 p-2 bg-black relative">
                <img 
                  src={user?.photoURL || "https://api.dicebear.com/7.x/pixel-art/svg?seed=" + user?.uid} 
                  alt="Avatar" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100" 
                />
                <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="size-8 text-white" />
                </div>
              </div>
              {/* Tactical decor */}
              <div className="absolute -top-2 -left-2 size-6 border-t-2 border-l-2 border-red-600" />
              <div className="absolute -bottom-2 -right-2 size-6 border-b-2 border-r-2 border-red-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black uppercase tracking-tight mb-1">{user?.displayName || "UNRESOLVED"}</h3>
              <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest italic">Node_ID: {user?.uid.slice(0, 12)}...</p>
            </div>
            <Button variant="outline" className="w-full h-11 border-red-900/30 rounded-none font-black uppercase tracking-widest text-[9px] hover:bg-red-600 hover:text-white transition-all">
               <Edit3 className="size-3 mr-2" /> Modify_Identity
            </Button>
          </div>

          {/* Info Section */}
          <div className="md:col-span-2 space-y-6 sm:space-y-8 min-w-0">
            <div className="bg-[#050505] border border-red-900/10 p-5 sm:p-8 space-y-6 sm:space-y-8 relative overflow-hidden">
                {/* Decorative grid */}
                <div className="grid-bg absolute inset-0 opacity-5 pointer-events-none" />
                
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 pb-4 border-b border-white/5">Biometric_Data</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2">
                      <Mail className="size-3" /> External_Comm_Link
                    </label>
                    <p className="font-mono text-xs sm:text-sm text-zinc-300 break-all">{user?.email}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2">
                      <Shield className="size-3" /> Security_Privilege
                    </label>
                    <p className="text-sm font-black uppercase text-red-500">
                      {user?.role === 'admin' ? 'OVERWATCH_LEVEL_ADMIN' : 'OPERATIVE_LEVEL_04'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="size-3" /> Established_Protocol
                    </label>
                    <p className="font-mono text-sm text-zinc-300">{user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-700 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="size-3" /> Primary_Node
                    </label>
                    <p className="text-sm font-black uppercase text-zinc-300">NORTH_AM_01</p>
                  </div>
                </div>
            </div>

            <div className="bg-[#050505] border border-red-900/10 p-8 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 pb-4 border-b border-white/5">Authentication_Keys</h4>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-black border border-white/5 group hover:border-red-900/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Key className="size-4 text-zinc-700 shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-widest break-words">Multi-Factor Auth</span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-green-500">ACTIVE</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-black border border-white/5 group hover:border-red-900/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <Shield className="size-4 text-zinc-700 shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-widest break-words">Device Authorization</span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-zinc-700">3 NODES</span>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
