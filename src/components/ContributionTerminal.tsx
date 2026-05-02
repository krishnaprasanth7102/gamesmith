"use client";

import { useState } from "react";
import { useAuth, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { GitFork, Upload, MessageSquareCode, ShieldCheck, Zap, ArrowRight, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export function ContributionTerminal() {
  const { auth, storage } = useAuth(); // Actually useStorage will be needed but wait, useAuth doesn't return storage. 
  const { user } = useUser();
  const { storage: fbStorage } = useStorage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [packageFile, setPackageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    codename: "",
    description: "",
    complexity: "MEDIUM",
    threatLevel: "A-TIER",
    engines: ["UNREAL"],
    imageUrl: "",
    githubRepo: "",
    assets: "MODULAR_PBR",
    logic: "BEHAVIOR_TREE",
    combat: "HYBRID",
    lore: "EXTRACTED_LOG"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.currentUser || !user || !fbStorage) return;

    setIsSubmitting(true);
    
    try {
      let finalImageUrl = formData.imageUrl;
      let finalRepoUrl = formData.githubRepo;

      // Upload Image
      if (imageFile) {
        const imageRef = ref(fbStorage, `bosses/${user.uid}/${Date.now()}_${imageFile.name}`);
        const uploadTask = await uploadBytesResumable(imageRef, imageFile);
        finalImageUrl = await getDownloadURL(uploadTask.ref);
      }

      // Upload Package
      if (packageFile) {
        const pkgRef = ref(fbStorage, `bosses/${user.uid}/${Date.now()}_${packageFile.name}`);
        const uploadTask = await uploadBytesResumable(pkgRef, packageFile);
        finalRepoUrl = await getDownloadURL(uploadTask.ref);
      }

      const bossData = {
        ...formData,
        imageUrl: finalImageUrl,
        githubRepo: finalRepoUrl,
        contributorId: user.uid,
        contributorName: user.displayName || "Anonymous",
        downloadCount: 0,
        version: "1.0.0",
        createdAt: serverTimestamp(),
        packages: {
          assets: formData.assets,
          logic: formData.logic,
          combat: formData.combat,
          lore: formData.lore
        }
      };

      await addDoc(collection(auth.app.firestore(), "bosses"), bossData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsFormOpen(false);
        setImageFile(null);
        setPackageFile(null);
        setFormData({
          name: "", codename: "", description: "", complexity: "MEDIUM", 
          threatLevel: "A-TIER", engines: ["UNREAL"], imageUrl: "", githubRepo: "",
          assets: "MODULAR_PBR", logic: "BEHAVIOR_TREE", combat: "HYBRID", lore: "EXTRACTED_LOG"
        });
      }, 3000);
    } catch (e: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'bosses',
        operation: 'create',
        requestResourceData: bossData
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="protocol" className="bg-black py-16 sm:py-32 lg:py-40 px-6 relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        
        <div className="w-full mb-12 sm:mb-20 lg:mb-32">
           <div className="text-red-600 font-black text-[9px] sm:text-[10px] tracking-[0.4em] sm:tracking-[0.5em] uppercase mb-6 sm:mb-8 flex items-center justify-center gap-3 sm:gap-4">
             <GitFork className="size-4" /> OPEN_SOURCE_PROTOCOL
           </div>
           <h2 className="text-2xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase mb-6 sm:mb-8 leading-[0.95] sm:leading-[0.9] max-w-4xl mx-auto">
             DEPLOY_YOUR_ENTITY
           </h2>
           <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto px-4">
             Predatory collaboration is the core of FORGOTTEN. Fork existing binary modules or push entirely new tactical constructs to the global database.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 w-full">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 h-fit">
              <button 
                onClick={() => user ? setIsFormOpen(true) : document.getElementById('login-trigger')?.click()}
                className="p-6 sm:p-8 border border-white/10 hover:border-red-600 transition-all group bg-black/50 backdrop-blur-md text-left"
              >
                 <Upload className="size-6 sm:size-8 text-red-600 mb-4 sm:mb-6 group-hover:scale-110 transition-transform" />
                 <h4 className="font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[9px] sm:text-[10px] mb-2">PUSH_ENTITY</h4>
                 <p className="text-[8px] sm:text-[9px] text-muted-foreground leading-relaxed font-mono uppercase">Submit binary packages to staging.</p>
              </button>
              <div className="p-6 sm:p-8 border border-white/10 hover:border-red-600 transition-all group bg-black/50 backdrop-blur-md text-left">
                 <MessageSquareCode className="size-6 sm:size-8 text-red-600 mb-4 sm:mb-6 group-hover:scale-110 transition-transform" />
                 <h4 className="font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[9px] sm:text-[10px] mb-2">OPTIMIZE_AI</h4>
                 <p className="text-[8px] sm:text-[9px] text-muted-foreground leading-relaxed font-mono uppercase">Refine behavior patterns and combat logic.</p>
              </div>
           </div>

           <div className="bg-red-600 p-8 sm:p-12 relative overflow-hidden group w-full text-left">
              <div className="absolute -right-12 sm:-right-16 -bottom-12 sm:-bottom-16 opacity-10 group-hover:scale-105 transition-transform duration-[3000ms] pointer-events-none">
                <ShieldCheck className="size-48 sm:size-[350px] text-white" />
              </div>

              <div className="relative z-10 text-white">
                 <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                   <div className="h-0.5 w-8 sm:w-12 bg-white" />
                   <h3 className="text-xl sm:text-3xl font-black tracking-tighter uppercase">ARSENAL_DATA</h3>
                 </div>

                 <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                    <div className="flex justify-between items-end border-b border-white/30 pb-2 sm:pb-3">
                       <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-60">Active_Entities</span>
                       <span className="text-2xl sm:text-4xl font-black leading-none tabular-nums">1,204</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/30 pb-2 sm:pb-3">
                       <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-60">Global_Forks</span>
                       <span className="text-2xl sm:text-4xl font-black leading-none tabular-nums">8,942</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-white/30 pb-2 sm:pb-3">
                       <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-60">Verified_Devs</span>
                       <span className="text-2xl sm:text-4xl font-black leading-none tabular-nums">443</span>
                    </div>
                 </div>

                 <button className="w-full h-14 sm:h-16 bg-white text-black font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[9px] sm:text-[10px] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3 sm:gap-4 group/btn">
                    ACCESS REPOSITORY
                    <ArrowRight className="size-3 sm:size-4 group-hover:translate-x-2 transition-transform" />
                 </button>
                 
                 <div className="mt-6 sm:mt-8 flex items-center justify-center lg:justify-start gap-2 sm:gap-3 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] opacity-60">
                    <Zap className="size-3 fill-white" />
                    STATUS: SYNCHRONIZED
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Contribution Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => !isSubmitting && setIsFormOpen(false)} />
          <div className="relative w-full max-w-4xl bg-black border border-white/10 p-6 sm:p-12 overflow-y-auto max-h-[90vh] scrollbar-hide">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 text-white/40 hover:text-red-600 transition-colors z-30"
              disabled={isSubmitting}
            >
              <X className="size-6 sm:size-8" />
            </button>

            {success ? (
              <div className="min-h-[30vh] sm:min-h-[40vh] flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8">
                <div className="size-12 sm:size-16 border-2 border-green-500 text-green-500 flex items-center justify-center animate-pulse">
                  <ShieldCheck className="size-6 sm:size-8" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase mb-2">UPLOAD_COMPLETE</h3>
                  <p className="text-muted-foreground font-mono uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[8px] sm:text-[9px]">Entity staging successful.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-10 text-left">
                <div>
                  <h3 className="text-2xl sm:text-5xl font-black tracking-tighter uppercase mb-1 sm:mb-2">DEPLOY_UNIT</h3>
                  <p className="text-red-600 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]">Automated binary assessment required.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-red-600">ENTITY_NAME</label>
                      <input 
                        required
                        className="w-full bg-white/5 border border-white/10 p-3 sm:p-4 text-white focus:border-red-600 outline-none uppercase font-black text-lg sm:text-xl"
                        placeholder="E.G. MALPHAS"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-red-600">CODENAME</label>
                      <input 
                        required
                        className="w-full bg-white/5 border border-white/10 p-3 sm:p-4 text-white focus:border-red-600 outline-none uppercase font-black tracking-[0.1em] text-[10px] sm:text-xs"
                        placeholder="E.G. VOID_WING"
                        value={formData.codename}
                        onChange={(e) => setFormData({...formData, codename: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-red-600">DESCRIPTION</label>
                      <textarea 
                        required
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 p-3 sm:p-4 text-white focus:border-red-600 outline-none font-body text-[10px] sm:text-xs leading-relaxed"
                        placeholder="Detail tactical behavior..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-red-600">THREAT_TIER</label>
                        <select 
                          className="w-full bg-white/5 border border-white/10 p-3 sm:p-4 text-white focus:border-red-600 outline-none uppercase font-black text-[8px] sm:text-[9px] appearance-none"
                          value={formData.threatLevel}
                          onChange={(e) => setFormData({...formData, threatLevel: e.target.value as any})}
                        >
                          <option>C-TIER</option>
                          <option>B-TIER</option>
                          <option>A-TIER</option>
                          <option>S-TIER</option>
                          <option>OMEGA</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-red-600">COMPLEXITY</label>
                        <select 
                          className="w-full bg-white/5 border border-white/10 p-3 sm:p-4 text-white focus:border-red-600 outline-none uppercase font-black text-[8px] sm:text-[9px] appearance-none"
                          value={formData.complexity}
                          onChange={(e) => setFormData({...formData, complexity: e.target.value as any})}
                        >
                          <option>LOW</option>
                          <option>MEDIUM</option>
                          <option>HIGH</option>
                          <option>EXTREME</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-red-600">PREVIEW_IMAGE (UPLOAD)</label>
                      <input 
                        type="file"
                        accept="image/*"
                        required
                        className="w-full bg-white/5 border border-white/10 p-2 sm:p-3 text-white focus:border-red-600 outline-none font-mono text-[8px] sm:text-[9px] file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[8px] file:font-black file:uppercase file:tracking-widest file:bg-red-600 file:text-white hover:file:bg-white hover:file:text-black file:transition-colors"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-red-600">PACKAGE_ARCHIVE (.ZIP)</label>
                      <input 
                        type="file"
                        accept=".zip,.rar,.7z"
                        className="w-full bg-white/5 border border-white/10 p-2 sm:p-3 text-white focus:border-red-600 outline-none font-mono text-[8px] sm:text-[9px] file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[8px] file:font-black file:uppercase file:tracking-widest file:bg-red-600 file:text-white hover:file:bg-white hover:file:text-black file:transition-colors"
                        onChange={(e) => setPackageFile(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 border border-red-600/30 bg-red-600/5 flex items-start gap-3 sm:gap-4">
                  <AlertCircle className="size-4 sm:size-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-[8px] sm:text-[9px] text-muted-foreground uppercase leading-relaxed font-mono">
                    Submission constitutes licensing under GameSmith Open Protocol. Logic must be engine-agnostic for global compatibility.
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 sm:h-16 bg-red-600 text-white font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 sm:gap-4 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">SYNCHRONIZING...</span>
                  ) : (
                    <>
                      <Upload className="size-3 sm:size-4" />
                      SUBMIT_TO_ARSENAL
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
