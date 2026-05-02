"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Upload, FileText, DollarSign, Tag, Image as ImageIcon, CheckCircle2, ChevronRight, BarChart3, TrendingUp, Users, Globe, ShieldCheck, Link as LinkIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useFirestore, useAuth } from "@/firebase";
import { addAsset } from "@/lib/firestore-service";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { firestore } = useFirestore();
  const { auth } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "Game AI",
    price: "Free",
    description: "",
    externalDownloadUrl: "",
    img: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=400" // Default placeholder
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFinalize = async () => {
    if (!firestore || !auth?.currentUser) return;
    
    setIsSubmitting(true);
    try {
      await addAsset(firestore, {
        ...formData,
        contributorId: auth.currentUser.uid,
        contributorName: auth.currentUser.displayName || "Anonymous",
        downloadCount: 0,
        rating: 5.0
      });
      
      toast({
        title: "DEPLOYMENT_SUCCESSFUL",
        description: "Your asset is now live in the tactical marketplace.",
      });
      setStep(3);
    } catch (error: any) {
      toast({
        title: "DEPLOYMENT_FAILED",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 w-full min-w-0">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-2 break-words">
            Creator Portal
          </h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em]">
            Deploy Assets to the Multi-Agent Network
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 1, name: "Resource_Link" },
            { id: 2, name: "Meta_Definition" },
            { id: 3, name: "Protocol_Auth" },
          ].map((s) => (
            <div key={s.id} className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer" onClick={() => step < 3 && setStep(s.id)}>
              <div className={cn(
                "size-8 sm:size-10 flex items-center justify-center border font-black text-xs transition-all shrink-0",
                step >= s.id ? "border-red-600 bg-red-600 text-white" : "border-red-900/30 text-zinc-700"
              )}>
                0{s.id}
              </div>
              <span className={cn(
                "text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                step === s.id ? "text-white" : "text-zinc-700"
              )}>
                {s.name}
              </span>
              {s.id < 3 && <ChevronRight className="size-3 text-zinc-800 shrink-0" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 w-full min-w-0">
          {/* Main form */}
          <div className="lg:col-span-2 min-w-0">
            <div className="space-y-8 bg-[#050505] border border-red-900/10 p-5 sm:p-8">
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="space-y-4">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-red-500/80 flex items-center gap-2">
                      <LinkIcon className="size-3" /> Public Download Link
                    </Label>
                    <div className="bg-red-950/10 border border-red-900/20 p-6 space-y-4">
                       <p className="text-[10px] text-zinc-400 leading-relaxed uppercase font-bold">
                         Provide a public link (Google Drive, Dropbox, or Direct URL). 
                         Ensure permissions are set to <span className="text-red-500">"Anyone with the link"</span>.
                       </p>
                       <Input 
                        className="bg-black border-red-900/40 text-xs font-bold rounded-none h-12 focus:border-red-600" 
                        placeholder="https://drive.google.com/..." 
                        value={formData.externalDownloadUrl}
                        onChange={(e) => handleInputChange("externalDownloadUrl", e.target.value)}
                       />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-red-500/80 flex items-center gap-2">
                        <FileText className="size-3" /> Resource Title
                      </Label>
                      <Input 
                        className="bg-black border-red-900/20 text-xs font-bold rounded-none h-11" 
                        placeholder="e.g. Advanced_Patrol_AI" 
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-red-500/80 flex items-center gap-2">
                        <Tag className="size-3" /> Category
                      </Label>
                      <select 
                        className="w-full bg-black border border-red-900/20 text-xs font-bold rounded-none h-11 px-3 text-white outline-none focus:border-red-600"
                        value={formData.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                      >
                        <option>Game AI</option>
                        <option>3D Models</option>
                        <option>Environments</option>
                        <option>Scripts</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-red-500/80 flex items-center gap-2">
                      <DollarSign className="size-3" /> Pricing (USD)
                    </Label>
                    <Input 
                      className="bg-black border-red-900/20 text-xs font-bold rounded-none h-11" 
                      placeholder="0.00 for Free Tier" 
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-red-500/80 flex items-center gap-2">
                      <ImageIcon className="size-3" /> Description
                    </Label>
                    <Textarea 
                      className="bg-black border-red-900/20 text-xs font-medium rounded-none min-h-[120px] scrollbar-hide" 
                      placeholder="Describe the functionality and system requirements..." 
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-12 sm:py-20 animate-in fade-in zoom-in duration-500 space-y-6">
                  <div className="size-20 sm:size-24 bg-red-600 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                    <CheckCircle2 className="size-10 sm:size-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-3">Integrity_Verified</h3>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-medium max-w-xs mx-auto">
                      All assets are indexed in the tactical marketplace for rapid deployment.
                    </p>
                  </div>
                  <Button 
                    onClick={() => router.push("/assets")}
                    className="w-full sm:w-auto h-14 px-10 bg-red-600 hover:bg-white hover:text-black text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-none transition-all"
                  >
                    View in Marketplace
                  </Button>
                </div>
              )}

              {step < 3 && (
                <div className="pt-6 flex items-center justify-between gap-3 border-t border-white/5 flex-wrap">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    className="text-zinc-600 hover:text-white uppercase text-[10px] font-black tracking-widest px-6"
                    disabled={step === 1 || isSubmitting}
                  >
                    Previous
                  </Button>
                  {step === 1 ? (
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!formData.externalDownloadUrl}
                      className="bg-red-600 hover:bg-white hover:text-black text-white px-8 rounded-none h-11 text-[10px] font-black uppercase tracking-widest group"
                    >
                      Next Step <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFinalize}
                      disabled={isSubmitting || !formData.name || !formData.description}
                      className="bg-red-600 hover:bg-white hover:text-black text-white px-8 rounded-none h-11 text-[10px] font-black uppercase tracking-widest group"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin size-4" /> : "Finalize Deployment"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar stats */}
          <aside className="space-y-5 min-w-0">
            <div className="bg-[#050505] border border-red-900/10 p-5 sm:p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <BarChart3 className="size-4 text-red-600 shrink-0" />
                <h3 className="text-[11px] font-black uppercase tracking-widest">Creator Diagnostics</h3>
              </div>
              <div className="space-y-6">
                {[
                  { label: "Active_Deployments", val: "14", icon: Globe },
                  { label: "Network_Impressions", val: "842K", icon: TrendingUp },
                  { label: "Operative_Users", val: "2.4K", icon: Users },
                ].map((diag, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-700">
                      <diag.icon className="size-3 shrink-0" />
                      <span className="text-[9px] font-black uppercase tracking-widest truncate">{diag.label}</span>
                    </div>
                    <span className="text-xl sm:text-2xl font-black">{diag.val}</span>
                    <div className="h-1 w-full bg-zinc-900 rounded-none overflow-hidden">
                      <div className="h-full bg-red-600 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-600/5 border border-red-900/30 p-5 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                <ShieldCheck className="size-4 shrink-0" /> Legal Protocol 2.1
              </p>
              <p className="text-zinc-600 text-[10px] leading-relaxed uppercase tracking-tight font-bold">
                By deploying assets, you grant Gamesmith non-exclusive redistribution rights within the tactical ecosystem.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
