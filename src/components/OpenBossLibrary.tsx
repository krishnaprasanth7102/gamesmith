"use client";

import { useState, useMemo } from "react";
import { useCollection, useFirestore, useAuth } from "@/firebase";
import { collection, doc, updateDoc, increment } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/firestore/use-memo-firebase";
import { UploadBossModal } from "@/components/UploadBossModal";
import { AuthModal } from "@/components/AuthModal";
import { 
  Download, Terminal, Tag, Archive, Search, SortAsc, 
  ChevronDown, Star, ShoppingCart, Filter, Layers, 
  Zap, Shield, Target, Plus, Check
} from "lucide-react";
import { cn } from "@/lib/utils";

type OpenBoss = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  fileUrl: string;
  fileName: string;
  fileSize: number;
  downloadCount: number;
  createdAt?: any;
};

// ─── Static Demo Assets ───────────────────────────────────────────────────────
// These always appear in the marketplace even without Firebase uploads.
const DUMMY_ASSETS: OpenBoss[] = [
  {
    id: "demo_phantasm",
    name: "Phantasm — Stealth Assassin AI",
    description: "Phases in and out of visibility using custom shader logic. Stalks the player from shadows and strikes only when attack success probability exceeds 85%. Includes full behavior tree.",
    tags: ["aggressive", "stealth", "unreal", "hard"],
    fileUrl: "#",
    fileName: "phantasm_ai_v1.2.zip",
    fileSize: 3.8 * 1024 * 1024,
    downloadCount: 3217,
  },
  {
    id: "demo_crawler",
    name: "Crawler-9 — Horror Swarm AI",
    description: "Spider-like movement with web-trap placement and ambush logic. Supports swarm coordination for up to 20 units simultaneously. Perfect for horror and survival game genres.",
    tags: ["aggressive", "swarm", "godot", "unity"],
    fileUrl: "#",
    fileName: "crawler9_swarm_ai_v1.0.zip",
    fileSize: 1.2 * 1024 * 1024,
    downloadCount: 6740,
  },
  {
    id: "demo_sentinel",
    name: "Sentinel-X — Tank Defender AI",
    description: "Heavy industrial defender with procedural limb destruction and adaptive defensive behavior. Tracks player movement patterns and adjusts shield stance in real time.",
    tags: ["defensive", "tank", "unreal", "unity"],
    fileUrl: "#",
    fileName: "sentinel_x_defender_v2.1.zip",
    fileSize: 5.4 * 1024 * 1024,
    downloadCount: 8942,
  },
  {
    id: "demo_necros",
    name: "Necros — Summoner AI",
    description: "Raises fallen enemies as undead minions. Maintains a dynamic army of up to 8 units. Prioritizes resurrection over direct combat while minions are alive. Full summoner state machine included.",
    tags: ["summoner", "magic", "ranged", "unity", "unreal", "godot"],
    fileUrl: "#",
    fileName: "necros_summoner_v1.1.zip",
    fileSize: 4.1 * 1024 * 1024,
    downloadCount: 2788,
  },
  {
    id: "demo_rampart",
    name: "Rampart — Charge Tank AI",
    description: "Corridor combat specialist using ricochet pathfinding to bounce off walls and maintain pressure. Features shield-break mechanics when sustaining damage above a threshold.",
    tags: ["defensive", "tank", "melee", "unity", "godot"],
    fileUrl: "#",
    fileName: "rampart_charge_ai_v1.3.zip",
    fileSize: 2.7 * 1024 * 1024,
    downloadCount: 4312,
  },
  {
    id: "demo_glitch",
    name: "Glitch-0 — Digital Enemy AI",
    description: "Cyberpunk AI that corrupts the player HUD and creates visual distractions. Teleports by glitching through walls. Can split into 3 copies temporarily to overwhelm the player.",
    tags: ["aggressive", "teleport", "godot", "unity"],
    fileUrl: "#",
    fileName: "glitch0_data_wraith_v0.9.zip",
    fileSize: 1.9 * 1024 * 1024,
    downloadCount: 5501,
  },
  {
    id: "demo_spectre",
    name: "Spectre-7 — Adaptive Psychic AI",
    description: "Learns from the player's movement and attack history over 60 seconds. Predicts dodge directions and adjusts projectile trajectories to intercept with 70% accuracy. Includes prediction engine module.",
    tags: ["ranged", "magic", "hard", "unreal", "unity"],
    fileUrl: "#",
    fileName: "spectre7_echo_mind_v2.0.zip",
    fileSize: 6.2 * 1024 * 1024,
    downloadCount: 1899,
  },
  {
    id: "demo_volcanis",
    name: "Volcanis — Fire Colossus AI",
    description: "Terrain-altering elemental boss that creates persistent lava zones as environmental hazards. Enters rage phase below 30% HP — attack speed doubles, movement becomes erratic.",
    tags: ["aggressive", "hard", "boss", "unreal"],
    fileUrl: "#",
    fileName: "volcanis_ash_tyrant_v3.0.zip",
    fileSize: 8.5 * 1024 * 1024,
    downloadCount: 512,
  },
  {
    id: "demo_malphas",
    name: "Malphas — Aerial Combat AI",
    description: "Multi-phase aerial enemy using high-frequency shadow bursts designed for vertical arenas with destructible environments. Adapts flight patterns based on player altitude. 4K PBR assets included.",
    tags: ["aggressive", "ranged", "unity", "unreal", "godot"],
    fileUrl: "#",
    fileName: "malphas_void_wing_v1.0.zip",
    fileSize: 12.3 * 1024 * 1024,
    downloadCount: 1204,
  },
  {
    id: "demo_titan",
    name: "Titan-Alpha — Mega Boss AI",
    description: "3-phase multi-arena boss. Phase 1: ground slams. Phase 2: guided missile barrage. Phase 3: self-healing + minion wave. Full LOD mesh, destruction physics, and multi-phase controller included.",
    tags: ["aggressive", "boss", "hard", "unreal"],
    fileUrl: "#",
    fileName: "titan_alpha_colossus_v4.0.zip",
    fileSize: 18.7 * 1024 * 1024,
    downloadCount: 987,
  },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}_B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}_KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}_MB`;
}

const CATEGORIES = [
  { name: "All Assets", icon: Layers },
  { name: "Aggressive AI", icon: Zap },
  { name: "Defensive AI", icon: Shield },
  { name: "Ranged Patterns", icon: Target },
];

export function OpenBossLibrary() {
  const { firestore } = useFirestore();
  const { auth } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Assets");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "popular">("popular");
  const [showSort, setShowSort] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const bossesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // We fetch all to do client-side filtering for this demo marketplace
    return collection(firestore, "open_bosses");
  }, [firestore]);

  const { data: bosses, loading } = useCollection<OpenBoss>(bossesQuery);

  const filtered = useMemo(() => {
    // Merge real Firebase uploads (if any) with static dummy assets
    const realBosses = bosses ?? [];
    const realIds = new Set(realBosses.map(b => b.id));
    const dummiesNotUploaded = DUMMY_ASSETS.filter(d => !realIds.has(d.id));
    const allAssets = [...realBosses, ...dummiesNotUploaded];

    let result = allAssets.filter((b) => {

      const matchesSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.description.toLowerCase().includes(search.toLowerCase());
      
      // Simple tag mapping for categories
      let matchesCategory = true;
      if (activeCategory !== "All Assets") {
        if (activeCategory === "Aggressive AI") matchesCategory = b.tags?.includes("hard") || b.tags?.includes("aggressive") || b.name.toLowerCase().includes("aggro");
        else if (activeCategory === "Defensive AI") matchesCategory = b.tags?.includes("defensive") || b.tags?.includes("tank");
        else if (activeCategory === "Ranged Patterns") matchesCategory = b.tags?.includes("ranged") || b.tags?.includes("magic");
        
        // Fallback: just show some if tags aren't perfectly aligned
        if (!b.tags) matchesCategory = false; 
      }
      return matchesSearch && matchesCategory;
    });

    if (sortBy === "popular") {
      result = [...result].sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0));
    } else {
      result = [...result].sort((a, b) => {
        const aTime = a.createdAt?.seconds ?? 0;
        const bTime = b.createdAt?.seconds ?? 0;
        return bTime - aTime;
      });
    }
    return result;
  }, [bosses, search, activeCategory, sortBy]);

  const handleDownload = async (boss: OpenBoss) => {
    if (!auth?.currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setDownloadingId(boss.id);
    try {
      // Only write download count to Firestore for real (non-demo) assets
      if (firestore && !boss.id.startsWith("demo_")) {
        const bossRef = doc(firestore, "open_bosses", boss.id);
        await updateDoc(bossRef, { downloadCount: increment(1) });
      }
      const a = document.createElement("a");
      a.href = boss.fileUrl;
      a.download = boss.fileName || `${boss.name}.zip`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setDownloadingId(null), 1500);
    }
  };

  const allAssets = [...(bosses ?? []), ...DUMMY_ASSETS.filter(d => !(bosses ?? []).find(b => b.id === d.id))];
  const featuredBoss = allAssets.length > 0 ? [...allAssets].sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0))[0] : null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Marketplace Header */}
      <div className="bg-[#0a0a0a] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-4 shrink-0">
            <div className="size-10 bg-red-600 rounded flex items-center justify-center">
              <ShoppingCart className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight leading-none">Asset Store</h1>
              <div className="text-[10px] text-red-500 font-mono tracking-widest uppercase mt-1">Boss AI Blueprints</div>
            </div>
          </div>
          
          <div className="flex-1 max-w-2xl hidden md:flex relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/50 to-purple-600/50 rounded blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative w-full flex items-center bg-black border border-white/10 rounded overflow-hidden">
              <Search className="absolute left-4 size-5 text-white/30" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for mechanics, behaviors, genres..." 
                className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-sm font-medium text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-4">
            <UploadBossModal />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1600px] mx-auto w-full flex flex-col lg:flex-row">
        
        {/* Left Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 p-6 lg:border-r border-white/5 space-y-8 h-fit lg:sticky lg:top-20">
          <div>
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Filter className="size-3" /> Categories
            </h3>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors",
                      active ? "bg-red-600/10 text-red-500" : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="size-4" />
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Price</h3>
            <div className="space-y-2 text-sm text-white/60">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-4 h-4 rounded border border-red-500 bg-red-600 flex items-center justify-center">
                  <Check className="size-3 text-white" />
                </div>
                <span className="group-hover:text-white transition-colors">Free</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer opacity-50">
                <div className="w-4 h-4 rounded border border-white/20" />
                <span>Paid (Coming Soon)</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10 min-w-0">
          
          {/* Featured Hero (Only show if all assets and no search) */}
          {activeCategory === "All Assets" && !search && featuredBoss && (
            <div className="mb-12 rounded-xl border border-white/10 overflow-hidden relative group bg-black">
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
              {/* Abstract thumbnail background */}
              <div className="absolute inset-0 opacity-40 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #dc2626 0%, transparent 60%), radial-gradient(circle at 30% 70%, #d946ef 0%, transparent 60%)' }} />
              
              <div className="relative z-20 p-8 md:p-12 h-full flex flex-col justify-center max-w-2xl">
                <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">Featured Asset</div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">{featuredBoss.name}</h2>
                <p className="text-white/60 text-lg line-clamp-2 md:line-clamp-3 mb-8">{featuredBoss.description}</p>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleDownload(featuredBoss)}
                    disabled={downloadingId === featuredBoss.id}
                    className="bg-white text-black px-8 py-3 rounded font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2"
                  >
                    {downloadingId === featuredBoss.id ? "Adding..." : "Add to Project - Free"}
                  </button>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-current" />)}
                    <span className="text-white/40 text-xs ml-2 font-mono">(4.9)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid Header and Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">
              {search ? 'Search Results' : activeCategory}
            </h2>
            
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/40 font-mono">{filtered.length} assets found</span>
              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors"
                >
                  Sort by: {sortBy === "newest" ? "Newest" : "Popular"}
                  <ChevronDown className="size-4" />
                </button>
                {showSort && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#18181b] border border-white/10 rounded shadow-xl z-30 overflow-hidden">
                    {(["newest", "popular"] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setSortBy(opt); setShowSort(false); }}
                        className={cn(
                          "w-full text-left px-4 py-3 text-xs font-bold transition-colors",
                          sortBy === opt ? "bg-red-500/10 text-red-500" : "text-white/70 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {opt === "newest" ? "Release Date (Newest)" : "Most Downloaded"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Asset Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 animate-pulse rounded-lg aspect-[4/3]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-white/10 rounded-xl">
              <Archive className="size-16 text-white/20 mb-6" />
              <h3 className="text-xl font-bold mb-2">No assets found</h3>
              <p className="text-white/50 mb-8 max-w-md">Try adjusting your search criteria or categories to find what you're looking for.</p>
              <button 
                onClick={() => {setSearch(""); setActiveCategory("All Assets");}}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-bold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {filtered.map((boss) => (
                <MarketplaceCard
                  key={boss.id}
                  boss={boss}
                  isDownloading={downloadingId === boss.id}
                  onDownload={() => handleDownload(boss)}
                />
              ))}
            </div>
          )}

        </main>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </div>
  );
}

function MarketplaceCard({
  boss,
  isDownloading,
  onDownload,
}: {
  boss: OpenBoss;
  isDownloading: boolean;
  onDownload: () => void;
}) {
  // Generate a deterministically pseudo-random rating between 4.0 and 5.0
  const rating = 4.0 + ((boss.id.charCodeAt(0) % 10) / 10);
  const reviewsCount = 10 + (boss.id.charCodeAt(boss.id.length-1) % 500);

  return (
    <article className="group bg-[#111] rounded-lg border border-white/5 overflow-hidden hover:border-white/20 transition-all duration-300 flex flex-col h-full hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      {/* Thumbnail Area */}
      <div className="aspect-video w-full bg-[#1a1a1a] relative overflow-hidden flex items-center justify-center">
        {/* Procedural colorful background based on name */}
        <div 
          className="absolute inset-0 opacity-40 transition-transform duration-700 group-hover:scale-110" 
          style={{ 
            background: `linear-gradient(135deg, #${Math.floor(Math.abs(Math.sin(boss.name.length) * 16777215)).toString(16).padStart(6,'0')} 0%, #000000 100%)` 
          }} 
        />
        <Terminal className="size-12 text-white/50 relative z-10 drop-shadow-2xl" />
        <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] z-10" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="font-bold text-white text-lg leading-tight line-clamp-1 group-hover:text-red-500 transition-colors">
            {boss.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center text-yellow-500">
            <Star className="size-3 fill-current" />
            <span className="text-[11px] font-bold ml-1 text-white/80">{rating.toFixed(1)}</span>
          </div>
          <span className="text-[10px] text-white/30">({reviewsCount})</span>
        </div>

        <p className="text-xs text-white/50 line-clamp-2 mb-4 flex-1">
          {boss.description}
        </p>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
          {boss.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="text-[9px] uppercase tracking-wider bg-white/5 text-white/60 px-2 py-1 rounded whitespace-nowrap">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
          <div>
            <div className="font-black text-sm text-green-400">FREE</div>
            <div className="text-[9px] text-white/20 font-mono mt-0.5">{formatBytes(boss.fileSize || 0)}</div>
          </div>
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className={cn(
              "p-2 rounded flex items-center justify-center transition-colors",
              isDownloading 
                ? "bg-red-500/20 text-red-500" 
                : "bg-white/10 hover:bg-white text-white hover:text-black"
            )}
          >
            {isDownloading ? <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Plus className="size-4" />}
          </button>
        </div>
      </div>
    </article>
  );
}

