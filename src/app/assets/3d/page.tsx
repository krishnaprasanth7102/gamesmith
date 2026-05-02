"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { BoxSelect, Maximize2, ShoppingCart, Download, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssets } from "@/hooks/use-assets";
import { useFirestore, useAuth } from "@/firebase";
import { logDownload } from "@/lib/firestore-service";
import { useToast } from "@/hooks/use-toast";

export default function ThreeDAssetsPage() {
  const { assets, loading } = useAssets("3D Models");
  const { firestore } = useFirestore();
  const { auth } = useAuth();
  const { toast } = useToast();

  const handleDownload = async (assetId: string, downloadUrl: string) => {
    if (!firestore || !auth?.currentUser) {
      toast({
        title: "AUTHENTICATION_REQUIRED",
        description: "You must be logged in to initialize a retrieval.",
        variant: "destructive"
      });
      return;
    }

    try {
      await logDownload(firestore, assetId, auth.currentUser.uid);
      window.open(downloadUrl, '_blank');
      toast({
        title: "RETRIEVAL_INITIALIZED",
        description: "Connecting to geometry storage node...",
      });
    } catch (error: any) {
      toast({
        title: "PROTOCOL_ERROR",
        description: "Failed to log retrieval metadata.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 w-full min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-2 break-words leading-tight">
              Geometry Archive
            </h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em]">High-Fidelity 3D Assets &amp; Rigging Modules</p>
          </div>
          <BoxSelect className="size-10 sm:size-14 text-red-900/20 shrink-0" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-72 bg-[#050505] border border-red-900/10 animate-pulse" />
             ))
          ) : assets.length > 0 ? (
            assets.map((asset) => (
              <div key={asset.id} className="group bg-[#050505] border border-red-900/10 flex flex-col hover:border-red-600/50 transition-all duration-500 overflow-hidden w-full min-w-0">
                <div className="h-48 sm:h-56 overflow-hidden relative">
                  <img
                    src={asset.img}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                    alt={asset.name}
                  />
                  <div className="absolute top-3 right-3 bg-black/80 border border-white/10 px-2 py-1 flex items-center gap-1.5">
                    <Maximize2 className="size-3 text-red-500" />
                    <span className="text-[9px] font-black uppercase">PBR_READY</span>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex flex-col flex-1 min-w-0">
                  {/* Name + Price row */}
                  <div className="flex items-start justify-between gap-3 mb-3 min-w-0">
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight leading-tight break-words flex-1 min-w-0">
                      {asset.name}
                    </h3>
                    <span className="text-white font-black text-xs sm:text-sm bg-red-600 px-2.5 py-1 shrink-0 whitespace-nowrap">
                      {asset.price === "0.00" || asset.price === "0" ? "Free" : `$${asset.price}`}
                    </span>
                  </div>

                  <p className="text-zinc-500 text-xs font-medium mb-5 leading-relaxed line-clamp-2 uppercase tracking-tight">{asset.description}</p>

                  {/* Footer row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4 mt-auto">
                    <div className="flex gap-4 text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
                      <span>DOWNLOADS: <span className="text-zinc-300">{asset.downloadCount > 1000 ? `${(asset.downloadCount / 1000).toFixed(1)}K` : asset.downloadCount}</span></span>
                      <span>STATUS: <span className="text-green-500">READY</span></span>
                    </div>
                    <Button 
                      onClick={() => handleDownload(asset.id!, asset.externalDownloadUrl)}
                      className="bg-transparent border border-red-900/40 hover:bg-red-600 hover:border-red-600 text-white h-9 px-4 rounded-none text-[9px] font-black uppercase tracking-widest transition-all shrink-0"
                    >
                      <Download className="size-3 mr-2" /> Retrieve Asset
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
               <p className="text-zinc-600 text-xs font-black uppercase tracking-[0.4em]">Geometry Archive Empty</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
