"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { BrainCircuit, Star, Download, ShoppingCart, ArrowRight, Zap, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAssets } from "@/hooks/use-assets";
import { useFirestore, useAuth } from "@/firebase";
import { logDownload } from "@/lib/firestore-service";
import { useToast } from "@/hooks/use-toast";

export default function AIAssetsPage() {
  const { assets, loading } = useAssets("Game AI");
  const { firestore } = useFirestore();
  const { auth } = useAuth();
  const { toast } = useToast();

  const handleDownload = async (assetId: string, downloadUrl: string) => {
    if (!firestore || !auth?.currentUser) {
      toast({
        title: "AUTHENTICATION_REQUIRED",
        description: "You must be logged in to initialize a deployment.",
        variant: "destructive"
      });
      return;
    }

    try {
      await logDownload(firestore, assetId, auth.currentUser.uid);
      window.open(downloadUrl, '_blank');
      toast({
        title: "DEPLOYMENT_INITIALIZED",
        description: "Connecting to neural resource node...",
      });
    } catch (error: any) {
      toast({
        title: "PROTOCOL_ERROR",
        description: "Failed to log deployment metadata.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 sm:gap-12 w-full min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-2 sm:mb-4 break-words">
              Neural AI Systems
            </h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em]">
              High-Performance Behavioral Kernels
            </p>
          </div>
          <BrainCircuit className="size-10 sm:size-14 text-red-900/20 shrink-0" />
        </div>

        {/* Asset Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
          {loading ? (
             Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 bg-[#050505] border border-red-900/10 animate-pulse" />
             ))
          ) : assets.length > 0 ? (
            assets.map((asset) => (
              <div key={asset.id} className="group bg-[#050505] border border-red-900/10 flex flex-col sm:flex-row hover:border-red-600/50 transition-all duration-500 overflow-hidden w-full min-w-0">
                <div className="w-full sm:w-40 h-40 sm:h-auto shrink-0 overflow-hidden relative">
                  <img
                    src={asset.img}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    alt={asset.name}
                  />
                  <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 min-w-0">
                  <div className="min-w-0">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <h3 className="text-base sm:text-lg font-black uppercase tracking-tight break-words flex-1 min-w-0 leading-tight">
                        {asset.name}
                      </h3>
                      <span className="text-red-600 font-black text-sm shrink-0">{asset.price === "0.00" || asset.price === "0" ? "Free" : `$${asset.price}`}</span>
                    </div>
                    <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-4 line-clamp-2">{asset.description}</p>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3 text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <Star className="size-3 text-red-500" /> {asset.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="size-3" /> {asset.downloadCount > 1000 ? `${(asset.downloadCount / 1000).toFixed(1)}K` : asset.downloadCount}
                      </span>
                    </div>
                    <Button 
                      onClick={() => handleDownload(asset.id!, asset.externalDownloadUrl)}
                      className="bg-red-600 hover:bg-white hover:text-black text-white h-9 px-4 rounded-none text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0"
                    >
                      <Download className="size-3" /> Deploy
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
               <p className="text-zinc-600 text-xs font-black uppercase tracking-[0.4em]">Neural Archive Empty</p>
            </div>
          )}
        </div>

        {/* CTA Banner */}
        <div className="bg-red-950/10 border border-red-900/20 p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10 w-full min-w-0">
          <Zap className="size-10 text-red-500 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-2xl font-black uppercase tracking-tighter mb-2 break-words">
              Neural Synthesis Engine
            </h3>
            <p className="text-zinc-500 text-xs sm:text-sm font-medium leading-relaxed">
              Use our playground to generate custom AI behavioral scripts using natural language prompts.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto h-11 px-6 border-red-900/30 rounded-none bg-transparent text-white font-black uppercase tracking-widest text-[9px] hover:bg-red-600 hover:text-white transition-all shrink-0">
            <Link href="/playground">
              AI Playground <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
