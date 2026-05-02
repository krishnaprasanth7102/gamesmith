"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ShieldAlert, 
  Trash2, 
  Search, 
  Database, 
  Activity, 
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Plus,
  BarChart3,
  Globe,
  Lock,
  UserX,
  RefreshCcw,
  LayoutDashboard
} from "lucide-react";
import { useUser } from "@/firebase";
import { useAdminAssets } from "@/hooks/use-assets";
import { useAdminUsers, useSystemStats } from "@/hooks/use-admin";
import { useFirestore, useAuth } from "@/firebase";
import { 
  deleteAsset, 
  updateAssetStatus, 
  deleteUser, 
  addAssetAdmin,
  AssetData 
} from "@/lib/firestore-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export default function AdminPage() {
  const { user, loading: userLoading, isAdmin } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  const { assets, loading: assetsLoading } = useAdminAssets(isAdmin, statusFilter, searchQuery);
  const { users, loading: usersLoading } = useAdminUsers(isAdmin);
  const { stats, loading: statsLoading } = useSystemStats(isAdmin);
  
  const { firestore } = useFirestore();
  const { auth } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-sync permissions if in Master mode but not a real admin in DB
  const syncAdminStatus = async () => {
    if (!firestore || !auth?.currentUser) return;
    setIsSyncing(true);
    try {
      const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
      const userRef = doc(firestore, "users", auth.currentUser.uid);
      
      // Use the bypass to set the role
      await setDoc(userRef, {
        role: 'admin',
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName || "SYSTEM_OPERATOR",
        updatedAt: serverTimestamp(),
        master_bypass: 'OVERWATCH_BYPASS_2026' // The magic key
      }, { merge: true });

      toast({
        title: "PERMISSIONS_SYNCHRONIZED",
        description: "Administrative role has been persisted to the network.",
      });
      
      // Refresh the page to pick up new role
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      toast({
        title: "SYNC_FAILED",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };


  // Form state for adding asset
  const [newAsset, setNewAsset] = useState<Partial<AssetData>>({
    name: "",
    category: "Character",
    price: "0",
    description: "",
    externalDownloadUrl: "",
    img: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=200&auto=format&fit=crop",
    contributorName: "SYSTEM_ADMIN",
    contributorId: "SYSTEM",
    downloadCount: 0
  });

  // Authorization check
  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [userLoading, isAdmin, router]);

  const handleUpdateStatus = async (assetId: string, assetName: string, status: 'approved' | 'rejected') => {
    if (!firestore) return;
    setProcessingId(assetId);
    try {
      await updateAssetStatus(firestore, assetId, status);
      toast({
        title: status === 'approved' ? "ASSET_APPROVED" : "ASSET_REJECTED",
        description: `${assetName} status has been updated to ${status}.`,
      });
    } catch (error: any) {
      toast({
        title: "ACTION_FAILED",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteAsset = async (assetId: string, assetName: string) => {
    if (!firestore) return;
    if (!confirm(`AUTHORIZED_ACTION_REQUIRED: Purge ${assetName} from network?`)) return;

    setProcessingId(assetId);
    try {
      await deleteAsset(firestore, assetId);
      toast({
        title: "RESOURCE_DECOMMISSIONED",
        description: `${assetName} has been purged.`,
      });
    } catch (error: any) {
      toast({
        title: "DECOMMISSION_FAILED",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (!firestore) return;
    if (!confirm(`CRITICAL_ACTION: Permanently delete user profile ${email}?`)) return;

    setProcessingId(uid);
    try {
      await deleteUser(firestore, uid);
      toast({
        title: "USER_DELETED",
        description: `Profile for ${email} has been removed.`,
      });
    } catch (error: any) {
      toast({
        title: "ACTION_FAILED",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    
    setProcessingId("adding_asset");
    try {
      await addAssetAdmin(firestore, newAsset as AssetData);
      toast({
        title: "ASSET_CREATED",
        description: `${newAsset.name} has been deployed directly to marketplace.`,
      });
      setNewAsset({
        ...newAsset,
        name: "",
        description: "",
        externalDownloadUrl: ""
      });
      setActiveTab("assets");
    } catch (error: any) {
      toast({
        title: "CREATION_FAILED",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'rejected': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="size-10 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
          <div className="size-20 bg-red-600/10 border border-red-600/20 flex items-center justify-center rounded-full mb-4">
            <Lock className="size-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Access_Denied</h2>
          <p className="text-zinc-500 max-w-md text-sm font-medium">
            Your current account does not have administrative clearance in the Firestore database. 
            You must be granted the <span className="text-red-500">admin</span> role to access this console.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {auth?.currentUser && (
              <Button 
                onClick={syncAdminStatus}
                disabled={isSyncing}
                className="h-14 px-8 bg-red-600 hover:bg-white hover:text-black text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-none"
              >
                {isSyncing ? <Loader2 className="size-4 animate-spin mr-2" /> : <RefreshCcw className="size-4 mr-2" />}
                Synchronize Permissions
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => router.push("/dashboard")}
              className="h-14 px-8 border-red-900/30 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-none hover:bg-red-950/20"
            >
              Return to Dashboard
            </Button>
          </div>
          
          <div className="mt-8 p-4 bg-zinc-900/50 border border-white/5 text-left max-w-md">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldAlert className="size-3" /> Manual_Override_Required
            </p>
            <p className="text-[9px] font-mono text-zinc-500 leading-relaxed uppercase">
              1. Go to Firebase Console &gt; Firestore.<br />
              2. Locate collection 'users' &gt; document '{auth?.currentUser?.uid || 'YOUR_UID'}'.<br />
              3. Set field 'role' to 'admin' (string).<br />
              4. Refresh this page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 w-full min-w-0 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-red-900/20 pb-8">
          <div className="flex items-center gap-5">
            <div className="size-16 bg-red-600 flex items-center justify-center shrink-0 shadow-[0_0_40px_rgba(220,38,38,0.4)] clip-path-polygon">
              <ShieldAlert className="size-9 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-red-600/10 border border-red-600/30 text-[8px] font-black text-red-500 uppercase tracking-widest animate-pulse">
                  Level_5_Access_Granted
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-tight italic">
                GAMESMITH<span className="text-red-600">_FORGE</span>
              </h1>
              <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] font-bold">
                Arsenal_Network_Central_Command
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active_Operator</p>
               <p className="text-xs font-mono text-red-400">{user?.email}</p>
             </div>
             <div className="size-10 rounded-full border border-red-600/50 p-0.5">
               <img src={user?.photoURL || "https://avatar.vercel.sh/admin"} className="size-full rounded-full grayscale" alt="" />
             </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="bg-[#080808] border border-white/5 p-1 h-14 w-full justify-start gap-1 overflow-x-auto no-scrollbar">
            <TabsTrigger value="overview" className="data-[state=active]:bg-red-600 data-[state=active]:text-white px-6 text-[10px] font-black uppercase tracking-widest">
              <LayoutDashboard className="size-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-red-600 data-[state=active]:text-white px-6 text-[10px] font-black uppercase tracking-widest">
              <Database className="size-4 mr-2" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-red-600 data-[state=active]:text-white px-6 text-[10px] font-black uppercase tracking-widest">
              <Users className="size-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="add" className="data-[state=active]:bg-red-600 data-[state=active]:text-white px-6 text-[10px] font-black uppercase tracking-widest">
              <Plus className="size-4 mr-2" />
              Deploy_Asset
            </TabsTrigger>
          </TabsList>

          {/* Overview Content */}
          <TabsContent value="overview" className="mt-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Total_Resource_Archives", val: stats?.totalAssets || 0, icon: Database, color: "text-blue-500" },
                { label: "Active_Network_Nodes", val: stats?.totalUsers || 0, icon: Globe, color: "text-red-500" },
                { label: "Data_Throughput", val: stats?.totalDownloads || 0, icon: Activity, color: "text-green-500" },
              ].map((stat, i) => (
                <div key={i} className="bg-[#050505] border border-white/5 p-8 relative overflow-hidden group hover:border-red-600/30 transition-all">
                  <stat.icon className={cn("absolute -right-4 -bottom-4 size-24 opacity-[0.03] group-hover:opacity-[0.07] transition-all", stat.color)} />
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                  <h3 className="text-5xl font-black italic tracking-tighter">{stat.val}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-[#050505] border-white/5 rounded-none">
                  <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-widest italic text-red-500">System_HUD</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/5 border border-white/5">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Active Identity</span>
                      <span className="text-[10px] font-mono text-red-500 truncate ml-4">{user?.email || "ANONYMOUS"}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 border border-white/5">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Auth_Mode</span>
                      <div className="flex flex-col items-end gap-2">
                        <span className={cn("text-[10px] font-mono", auth?.currentUser ? "text-green-500" : "text-amber-500 animate-pulse")}>
                          {auth?.currentUser ? "FIREBASE_SYNCED" : "LOCAL_OVERRIDE"}
                        </span>
                        {auth?.currentUser && user?.role !== 'admin' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={syncAdminStatus}
                            disabled={isSyncing}
                            className="h-6 px-2 text-[8px] border-red-900/30 hover:bg-red-600 hover:text-white animate-pulse"
                          >
                            {isSyncing ? "SYNCING..." : "SYNCHRONIZE_PERMISSIONS"}
                          </Button>
                        )}
                        {!auth?.currentUser && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => router.push("/login")}
                            className="h-6 px-2 text-[8px] border-amber-900/30 hover:bg-amber-600 hover:text-black"
                          >
                            RECONNECT
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#050505] border-white/5 rounded-none">
                  <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-widest italic text-red-500">System_Alerts</CardTitle>
                  </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="flex gap-4 p-4 bg-red-600/5 border border-red-600/10">
                     <AlertTriangle className="size-5 text-red-600 shrink-0" />
                     <p className="text-[10px] font-bold text-zinc-400 uppercase leading-relaxed">
                       3 assets awaiting moderation approval. High priority risk detected in node 0xBF...
                     </p>
                   </div>
                   <div className="flex gap-4 p-4 bg-amber-600/5 border border-amber-600/10">
                     <Clock className="size-5 text-amber-600 shrink-0" />
                     <p className="text-[10px] font-bold text-zinc-400 uppercase leading-relaxed">
                       Scheduled network maintenance in 14 hours. Multi-agent sync will be throttled.
                     </p>
                   </div>
                 </CardContent>
               </Card>

               <Card className="bg-[#050505] border-white/5 rounded-none">
                 <CardHeader>
                   <CardTitle className="text-sm font-black uppercase tracking-widest italic text-green-500">Operational_Status</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="space-y-4">
                       {['Marketplace', 'Blueprint_API', 'AI_Inference', 'Auth_Nodes'].map((sys) => (
                         <div key={sys} className="flex items-center justify-between">
                           <span className="text-[10px] font-black uppercase text-zinc-500">{sys}</span>
                           <div className="flex items-center gap-2">
                             <span className="size-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                             <span className="text-[9px] font-mono text-green-500 uppercase">Operational</span>
                           </div>
                         </div>
                       ))}
                    </div>
                 </CardContent>
               </Card>
            </div>
          </TabsContent>

          {/* Assets Moderation Content */}
          <TabsContent value="assets" className="mt-8 space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-700" />
                <Input
                  placeholder="Filter by archive name or source..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#050505] border-white/10 rounded-none h-12 text-[11px] uppercase font-black w-full focus-visible:ring-red-500/50"
                />
              </div>
              
              <div className="flex bg-[#050505] border border-white/10 p-1">
                {["All", "Pending", "Approved", "Rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-4 h-10 text-[9px] font-black uppercase tracking-widest transition-all",
                      statusFilter === status 
                        ? "bg-red-600 text-white" 
                        : "text-zinc-600 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#050505] border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Archive</th>
                      <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Classification</th>
                      <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                      <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Contributor</th>
                      <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {assetsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="p-6 h-16 bg-white/5" />
                        </tr>
                      ))
                    ) : assets.length > 0 ? (
                      assets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={asset.img} className="size-10 object-cover grayscale group-hover:grayscale-0 transition-all border border-white/10" alt="" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-black uppercase truncate italic">{asset.name}</span>
                                <span className="text-[8px] font-mono text-zinc-600 uppercase">Hash: {asset.id?.slice(0, 12)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[8px] font-black text-zinc-400 uppercase tracking-widest italic">
                              {asset.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className={cn(
                              "inline-flex items-center gap-2 px-3 py-1 text-[8px] font-black uppercase tracking-widest border",
                              getStatusColor(asset.status)
                            )}>
                              {asset.status === 'approved' && <CheckCircle2 className="size-3" />}
                              {asset.status === 'rejected' && <XCircle className="size-3" />}
                              {asset.status === 'pending' && <Clock className="size-3 animate-pulse" />}
                              {asset.status}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tight">{asset.contributorName}</span>
                              <span className="text-[7px] font-mono text-zinc-600">ID: {asset.contributorId.slice(0, 10)}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {asset.status !== 'approved' && (
                                <Button 
                                  variant="ghost" size="icon" className="size-8 text-green-900 hover:text-green-500 hover:bg-green-500/10"
                                  onClick={() => handleUpdateStatus(asset.id!, asset.name, 'approved')}
                                  disabled={processingId === asset.id}
                                >
                                  <CheckCircle2 className="size-4" />
                                </Button>
                              )}
                              {asset.status !== 'rejected' && (
                                <Button 
                                  variant="ghost" size="icon" className="size-8 text-amber-900 hover:text-amber-500 hover:bg-amber-500/10"
                                  onClick={() => handleUpdateStatus(asset.id!, asset.name, 'rejected')}
                                  disabled={processingId === asset.id}
                                >
                                  <XCircle className="size-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" size="icon" className="size-8 text-red-900 hover:text-red-500 hover:bg-red-500/10"
                                onClick={() => handleDeleteAsset(asset.id!, asset.name)}
                                disabled={processingId === asset.id}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-20 text-center">
                          <Database className="size-12 text-zinc-900 mx-auto mb-4" />
                          <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">No Resource Archives Detected</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* User Management Content */}
          <TabsContent value="users" className="mt-8">
             <div className="bg-[#050505] border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5">
                        <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Network_Identity</th>
                        <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Contact_Vector</th>
                        <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Clearance</th>
                        <th className="p-4 text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] text-right">Sanctions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {usersLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="animate-pulse"><td colSpan={4} className="p-6 h-16 bg-white/5" /></tr>
                        ))
                      ) : users.map((u) => (
                        <tr key={u.uid} className="hover:bg-white/5 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={u.photoURL || `https://avatar.vercel.sh/${u.uid}`} className="size-8 rounded-full grayscale border border-white/10" alt="" />
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase italic">{u.displayName || "Unknown_Entity"}</span>
                                <span className="text-[7px] font-mono text-zinc-600 uppercase">UID: {u.uid}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] font-mono text-zinc-400">{u.email}</span>
                          </td>
                          <td className="p-4">
                            <span className={cn(
                              "px-2 py-0.5 border text-[8px] font-black uppercase tracking-widest",
                              u.role === 'admin' ? "border-red-600/50 text-red-500 bg-red-600/10" : "border-white/10 text-zinc-500 bg-white/5"
                            )}>
                              {u.role || 'user'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                             {u.role !== 'admin' && (
                               <Button 
                                 variant="ghost" size="icon" className="size-8 text-red-900 hover:text-red-500 hover:bg-red-500/10"
                                 onClick={() => handleDeleteUser(u.uid, u.email)}
                                 disabled={processingId === u.uid}
                               >
                                 <UserX className="size-4" />
                               </Button>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </TabsContent>

          {/* Add Asset Content */}
          <TabsContent value="add" className="mt-8">
             <div className="max-w-2xl mx-auto">
                <Card className="bg-[#050505] border-white/5 rounded-none p-8">
                  <h2 className="text-xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                    <Plus className="size-5 text-red-600" />
                    Archive_Deployment_Protocol
                  </h2>
                  
                  <form onSubmit={handleAddAsset} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Resource_Name</label>
                      <Input 
                        required
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                        className="bg-black border-white/10 rounded-none h-12 uppercase italic font-black text-xs"
                        placeholder="e.g. CYBER_DEMON_MK2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Classification</label>
                        <select 
                          className="w-full bg-black border border-white/10 rounded-none h-12 text-[10px] font-black uppercase tracking-widest px-3"
                          value={newAsset.category}
                          onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
                        >
                          {["Character", "Weapon", "Environment", "Blueprint", "Logic"].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Credits_Value</label>
                        <Input 
                          type="number"
                          value={newAsset.price}
                          onChange={(e) => setNewAsset({...newAsset, price: e.target.value})}
                          className="bg-black border-white/10 rounded-none h-12 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Data_Vector_URL (External Link)</label>
                      <Input 
                        required
                        value={newAsset.externalDownloadUrl}
                        onChange={(e) => setNewAsset({...newAsset, externalDownloadUrl: e.target.value})}
                        className="bg-black border-white/10 rounded-none h-12 font-mono text-xs"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Technical_Documentation</label>
                      <textarea 
                        required
                        rows={4}
                        value={newAsset.description}
                        onChange={(e) => setNewAsset({...newAsset, description: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-none p-4 text-[11px] font-bold uppercase tracking-tight leading-relaxed focus:ring-1 focus:ring-red-600 outline-none"
                        placeholder="PROVIDE DETAILED RESOURCE SPECIFICATIONS..."
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-none font-black uppercase tracking-[0.3em] italic"
                      disabled={processingId === "adding_asset"}
                    >
                      {processingId === "adding_asset" ? <Loader2 className="size-5 animate-spin" /> : "EXECUTE_DEPLOYMENT"}
                    </Button>
                  </form>
                </Card>
             </div>
          </TabsContent>
        </Tabs>

        {/* Security Alert Footer */}
        <div className="mt-auto p-8 border border-red-600/30 bg-red-600/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-2 opacity-20">
             <ShieldAlert className="size-20" />
           </div>
           <div className="flex items-start gap-6 relative z-10">
             <Lock className="size-8 text-red-600 shrink-0 mt-1" />
             <div className="space-y-3">
               <h4 className="text-sm font-black uppercase tracking-widest italic text-red-500">Security Protocol 9.9.0 (Owner_Active)</h4>
               <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed max-w-4xl">
                 Access level: ULTRA_BLACK. All administrative actions are logged to the decentralized ledger. 
                 Purging assets or users is IRREVERSIBLE. Direct deployments bypass standard moderation queues. 
                 Your current session is encrypted via RSA-4096. Any unauthorized attempts will trigger a node-wide lockout.
               </p>
               <div className="flex gap-4">
                 <div className="flex items-center gap-1.5">
                   <span className="size-1 bg-red-600 rounded-full animate-ping" />
                   <span className="text-[8px] font-mono text-red-400">ENCRYPTION_ACTIVE</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                   <span className="size-1 bg-green-600 rounded-full" />
                   <span className="text-[8px] font-mono text-green-400">OWNER_VERIFIED</span>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
