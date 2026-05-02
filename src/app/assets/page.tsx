"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Search, Filter, ShoppingCart, Download, Star, ExternalLink, Box, BrainCircuit, Layout, Layers, ShieldCheck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAssets } from "@/hooks/use-assets";
import { useFirestore, useAuth } from "@/firebase";
import { logDownload } from "@/lib/firestore-service";
import { useToast } from "@/hooks/use-toast";

export default function AssetStorePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { assets, loading } = useAssets(activeCategory, searchQuery);
  const { firestore } = useFirestore();
  const { auth } = useAuth();
  const { toast } = useToast();

  const categories = [
    { name: "All", icon: Layout },
    { name: "Game AI", icon: BrainCircuit },
    { name: "3D Models", icon: Box },
    { name: "Environments", icon: Layers },
    { name: "Scripts", icon: Star },
  ];

  const handleDownload = async (assetId: string, downloadUrl: string) => {
    if (!firestore || !auth?.currentUser) {
      toast({
        title: "AUTHENTICATION_REQUIRED",
        description: "You must be logged in to initialize a download protocol.",
        variant: "destructive"
      });
      return;
    }

    try {
      // 1. Log the download in Firestore
      await logDownload(firestore, assetId, auth.currentUser.uid);
      
      // 2. Open the external download link in a new tab
      window.open(downloadUrl, '_blank');
      
      toast({
        title: "DOWNLOAD_INITIALIZED",
        description: "Redirecting to external resource node...",
      });
    } catch (error: any) {
      toast({
        title: "PROTOCOL_ERROR",
        description: "Failed to log download metadata.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter leading-tight break-words">
            Tactical_Marketplace
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest">
              <ShieldCheck className="size-3 shrink-0" /> Hardware_Verified
            </div>
            <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-[0.2em]">
              {!loading && `${assets.length} Assets Found`}
            </span>
          </div>
          {/* Search bar */}
          <div className="flex items-center gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-700" />
              <Input
                placeholder="Search Assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#050505] border-red-900/20 rounded-none h-11 text-[11px] uppercase font-black w-full"
              />
            </div>
            <Button variant="outline" className="h-11 w-11 p-0 border-red-900/20 bg-transparent hover:bg-red-600 hover:text-white rounded-none shrink-0">
              <Filter className="size-4" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 border whitespace-nowrap transition-all uppercase text-[9px] font-black tracking-widest rounded-none shrink-0",
                activeCategory === cat.name
                  ? "bg-red-600 border-red-600 text-white"
                  : "bg-[#050505] border-red-900/20 text-zinc-500 hover:border-red-500"
              )}
            >
              <cat.icon className="size-3.5" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Featured Banner */}
        <div className="relative w-full bg-red-950/20 border border-red-900/30 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200"
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-30"
            alt="Feature"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="relative z-10 p-6 sm:p-10 max-w-full">
            <span className="text-red-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 block">
              Protocols_Update
            </span>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black uppercase tracking-tighter mb-3 break-words leading-tight max-w-xs sm:max-w-sm lg:max-w-md">
              Neural NPC Systems 2.0 Released
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm mb-5 font-medium max-w-xs">
              New behavioral patterns with multi-agent coordination support.
            </p>
            <Button className="bg-red-600 hover:bg-white hover:text-black text-white px-6 rounded-none h-10 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
              Examine Documentation
            </Button>
          </div>
        </div>

        {/* Asset Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
             Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 bg-[#050505] border border-red-900/10 animate-pulse" />
             ))
          ) : assets.length > 0 ? (
            assets.map((asset) => (
              <div key={asset.id} className="group bg-[#050505] border border-red-900/10 overflow-hidden flex flex-col hover:border-red-600/50 transition-all duration-500">
                <div className="relative h-44 bg-zinc-900 overflow-hidden">
                  <img
                    src={asset.img}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    alt={asset.name}
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 text-[8px] font-black text-white uppercase tracking-widest">
                    {asset.category}
                  </div>
                  <button 
                    onClick={() => handleDownload(asset.id!, asset.externalDownloadUrl)}
                    className="absolute top-3 right-3 p-2 bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="size-3.5" />
                  </button>
                </div>
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="text-sm font-black uppercase tracking-tight leading-tight group-hover:text-red-500 transition-colors break-all flex-1">
                      {asset.name}
                    </h3>
                    <span className="text-sm font-black text-red-600 shrink-0">{asset.price === "0.00" || asset.price === "0" ? "Free" : `$${asset.price}`}</span>
                  </div>
                  <p className="text-zinc-500 text-[10px] font-medium mb-4 line-clamp-2 uppercase tracking-tight">
                    {asset.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                    <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                      <div className="flex items-center gap-1">
                        <Star className="size-3 text-red-500 fill-red-500" /> {asset.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="size-3" /> {asset.downloadCount > 1000 ? `${(asset.downloadCount / 1000).toFixed(1)}K` : asset.downloadCount}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleDownload(asset.id!, asset.externalDownloadUrl)}
                      className="h-7 w-7 p-0 hover:bg-red-600/10 hover:text-red-500 transition-all"
                    >
                      <ExternalLink className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
               <p className="text-zinc-600 text-xs font-black uppercase tracking-[0.4em]">No Assets Found in This Sector</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
