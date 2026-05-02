"use client";

import { useState, useMemo } from "react";
import { useCollection, useAuth, useFirestore } from "@/firebase";
import { collection, doc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { Download, Terminal, Cpu, ShieldAlert, CheckCircle2, Bot, Tag, Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Boss } from "@/lib/boss-data";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export function BossArsenal() {
  const { auth } = useAuth();
  const { firestore } = useFirestore();
  const [selectedBossId, setSelectedBossId] = useState<string | null>(null);
  const [isArming, setIsArming] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const bossesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "bosses");
  }, [firestore]);

  const { data: bosses, loading } = useCollection<Boss>(bossesQuery);

  const selectedBoss = useMemo(() => {
    if (!bosses || bosses.length === 0) return null;
    return bosses.find(b => b.id === selectedBossId) || bosses[0];
  }, [bosses, selectedBossId]);

  const handleDownload = () => {
    if (!selectedBoss || !firestore || !auth?.currentUser) return;
    setIsArming(true);
    setDownloadSuccess(false);
    const logId = doc(collection(firestore, "downloads")).id;
    const logRef = doc(firestore, "downloads", logId);
    const bossRef = doc(firestore, "bosses", selectedBoss.id);
    const logData = { bossId: selectedBoss.id, userId: auth.currentUser.uid, timestamp: serverTimestamp() };
    setDoc(logRef, logData).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: logRef.path, operation: 'create', requestResourceData: logData }));
    });
    updateDoc(bossRef, { downloadCount: increment(1) }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: bossRef.path, operation: 'update', requestResourceData: { downloadCount: 'increment' } }));
    });
    setTimeout(() => {
      setIsArming(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center font-mono text-red-600 gap-6">
        <div className="size-10 border-4 border-red-600 border-t-transparent animate-spin" />
        <div className="animate-pulse uppercase tracking-[0.6em] text-[10px]">Loading_Enemy_AI_Catalog...</div>
      </div>
    );
  }

  if (!bosses || bosses.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center font-mono text-muted-foreground gap-6 border-y border-white/10 px-6 text-center">
        <Bot className="size-10 text-red-600 opacity-50" />
        <div className="uppercase tracking-[0.3em] text-sm">No Entities Detected</div>
        <p className="text-xs text-white/30 max-w-xs">Be the first to upload an enemy AI asset to the marketplace.</p>
        <a href="#protocol" className="text-red-600 text-xs font-black uppercase hover:underline tracking-widest">Upload_First_Asset →</a>
      </div>
    );
  }

  return (
    <section id="entities" className="min-h-screen bg-black border-y border-white/10 relative flex flex-col lg:flex-row max-w-[100vw] overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-5 pointer-events-none" />

      {/* LEFT: Entity List */}
      <div className="w-full lg:w-[360px] xl:w-[420px] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col bg-black relative z-10 shrink-0">
        <div className="p-6 sm:p-8 border-b border-white/10 sticky top-0 bg-black z-20">
          <div className="flex items-center gap-3 mb-3">
            <Bot className="size-4 text-red-600" />
            <span className="text-red-600 font-bold text-[10px] tracking-[0.5em] uppercase">ENEMY AI CATALOG</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tighter uppercase leading-none mb-2">FREE ASSETS</div>
          <p className="text-[10px] text-white/30 font-mono">
            {bosses.length} entities available · Download instantly
          </p>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[40vh] lg:max-h-none scrollbar-hide">
          {bosses.map((boss) => (
            <button
              key={boss.id}
              onClick={() => {
                setSelectedBossId(boss.id);
                setDownloadSuccess(false);
                if (window.innerWidth < 1024) {
                  document.getElementById('boss-details')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={cn(
                "w-full p-5 sm:p-6 text-left transition-all relative group border-b border-white/5",
                selectedBoss?.id === boss.id ? "bg-white text-black" : "hover:bg-red-600/5"
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className={cn(
                    "text-[8px] font-black tracking-[0.2em] uppercase mb-1 flex items-center gap-2",
                    selectedBoss?.id === boss.id ? "text-black/40" : "text-red-600"
                  )}>
                    <Tag className="size-2.5" />
                    THREAT_{boss.threatLevel} · {boss.complexity}
                  </div>
                  <div className="text-lg sm:text-xl font-black tracking-tighter uppercase truncate leading-none">{boss.name}</div>
                  <div className={cn("text-[9px] mt-1 flex items-center gap-2", selectedBoss?.id === boss.id ? "text-black/40" : "text-white/30")}>
                    <Download className="size-2.5" />
                    {boss.downloadCount} downloads · Free
                  </div>
                </div>
                <ChevronRight className={cn(
                  "size-4 shrink-0 transition-transform",
                  selectedBoss?.id === boss.id ? "text-black" : "text-red-600 -rotate-45 group-hover:rotate-0"
                )} />
              </div>
              {selectedBoss?.id === boss.id && (
                <div className="absolute left-0 top-0 w-1.5 h-full bg-red-600" />
              )}
            </button>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="p-6 border-t border-white/10 bg-black">
          <a
            href="/library"
            className="w-full h-10 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:border-red-600 hover:text-red-500 transition-all"
          >
            View Full Marketplace <ChevronRight className="size-3" />
          </a>
        </div>
      </div>

      {/* RIGHT: Entity Detail */}
      {selectedBoss && (
        <div id="boss-details" className="flex-1 relative flex flex-col bg-black overflow-y-auto overflow-x-hidden">
          {/* Hero Banner */}
          <div className="h-[30vh] sm:h-[40vh] relative overflow-hidden shrink-0 border-b border-white/10">
            <img
              src={selectedBoss.imageUrl}
              alt={selectedBoss.name}
              className="w-full h-full object-cover grayscale brightness-[0.25] contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            {/* Engine tags */}
            <div className="absolute top-6 right-6 z-20 flex flex-wrap justify-end gap-2 max-w-[220px]">
              {selectedBoss.engines.map(eng => (
                <div key={eng} className="bg-black/90 border border-red-600/60 px-3 py-1 text-[8px] font-black tracking-widest text-white uppercase backdrop-blur-md">
                  {eng}
                </div>
              ))}
              <div className="bg-red-600 px-3 py-1 text-[8px] font-black tracking-widest text-white uppercase">FREE</div>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-8 left-6 sm:left-12 z-20 max-w-[90%]">
              <div className="text-red-600 text-[9px] font-black tracking-[0.5em] uppercase mb-2">ENEMY AI ENTITY</div>
              <div className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white uppercase leading-[0.8] mb-3">{selectedBoss.codename}</div>
              <div className="flex items-center gap-4 text-[9px] font-mono text-white/30 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Users className="size-3" /> {selectedBoss.downloadCount} Downloads</span>
                <span>·</span>
                <span>ID: {selectedBoss.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-12 lg:p-20 flex-1">
            <div className="max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-20">

              <div className="space-y-10">
                <div>
                  <h3 className="text-red-600 text-[10px] font-black tracking-[0.5em] mb-5 uppercase flex items-center gap-3">
                    <ShieldAlert className="size-4" /> ENTITY DESCRIPTION
                  </h3>
                  <p className="text-base sm:text-lg font-medium leading-relaxed text-white/80">
                    {selectedBoss.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 border border-white/10 bg-white/[0.02] text-center">
                    <div className="text-white/30 text-[8px] font-black tracking-widest uppercase mb-1.5">Threat</div>
                    <div className="text-xl font-black text-red-600">{selectedBoss.threatLevel}</div>
                  </div>
                  <div className="p-4 border border-white/10 bg-white/[0.02] text-center">
                    <div className="text-white/30 text-[8px] font-black tracking-widest uppercase mb-1.5">Downloads</div>
                    <div className="text-xl font-black text-white">{selectedBoss.downloadCount}</div>
                  </div>
                  <div className="p-4 border border-green-500/20 bg-green-500/5 text-center">
                    <div className="text-green-400/60 text-[8px] font-black tracking-widest uppercase mb-1.5">Price</div>
                    <div className="text-xl font-black text-green-400">FREE</div>
                  </div>
                </div>

                <div className="p-5 border border-white/10 bg-black flex items-center justify-between">
                  <div>
                    <div className="text-white/30 text-[8px] font-black tracking-widest uppercase mb-1">Contributor</div>
                    <div className="text-sm font-black uppercase text-white">{selectedBoss.contributorName}</div>
                  </div>
                  <div className="size-2 bg-red-600 animate-pulse" />
                </div>

                {/* Blueprint Playground CTA */}
                <div className="p-5 border border-red-600/20 bg-red-600/5 flex items-start gap-4">
                  <div className="size-9 shrink-0 bg-red-600/20 border border-red-600/40 flex items-center justify-center">
                    <Cpu className="size-4 text-red-600" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">Blueprint Playground</div>
                    <p className="text-[10px] text-white/40 leading-relaxed mb-3">
                      Generate custom AI logic for this entity type using a text prompt. No code required.
                    </p>
                    <a href="/playground" className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-white transition-colors flex items-center gap-1">
                      Open Playground <ChevronRight className="size-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <h3 className="text-red-600 text-[10px] font-black tracking-[0.5em] mb-6 uppercase flex items-center gap-3">
                    <Cpu className="size-4" /> PACKAGE CONTENTS
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(selectedBoss.packages).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between border-b border-white/10 pb-4 group">
                        <span className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black group-hover:text-red-600 transition-colors">{key}</span>
                        <span className="text-[9px] font-mono text-white/50 group-hover:text-white transition-colors">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download CTA */}
                <div>
                  {!auth?.currentUser ? (
                    <div className="p-8 border-2 border-dashed border-red-600/30 bg-red-600/5 text-center flex flex-col items-center gap-4">
                      <div className="size-12 border border-red-600/30 flex items-center justify-center">
                        <Bot className="size-5 text-red-600 opacity-50" />
                      </div>
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.5em]">Sign In to Download</p>
                      <p className="text-[9px] text-white/30 font-mono max-w-[200px]">Authentication required to track downloads. The asset is always free.</p>
                      <button
                        onClick={() => document.getElementById('login-trigger')?.click()}
                        className="text-[10px] font-black uppercase text-white bg-red-600 px-8 py-3 hover:bg-white hover:text-black transition-all tracking-[0.3em] w-full max-w-[200px]"
                      >
                        Initialize Access
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={handleDownload}
                        disabled={isArming}
                        className={cn(
                          "w-full h-16 sm:h-20 relative flex items-center justify-center gap-4 transition-all border-2 border-red-600 font-black tracking-[0.3em] uppercase text-xs sm:text-sm",
                          isArming ? "bg-red-600 text-white cursor-wait"
                            : downloadSuccess ? "bg-green-600 border-green-600 text-white"
                              : "bg-red-600 text-white hover:bg-transparent hover:text-red-600"
                        )}
                      >
                        {isArming ? (
                          <span className="animate-pulse">Preparing Package...</span>
                        ) : downloadSuccess ? (
                          <><CheckCircle2 className="size-6" /><span>Download Complete!</span></>
                        ) : (
                          <><Download className="size-6" /><span>Download Free Asset</span></>
                        )}
                      </button>
                      <div className="flex justify-between items-center px-1 text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">
                        <span>Free — No License Required</span>
                        <span>MIT License</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}