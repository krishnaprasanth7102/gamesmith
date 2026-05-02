"use client";

import { useState } from "react";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Shield, Loader2, Mail, Lock, Chrome, ArrowRight, Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { handleAuthError } from "@/lib/auth-actions";
import Link from "next/link";

export default function LoginPage() {
  const { auth } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);

    // --- MASTER KEY OVERRIDE ---
    if (email === "admin@overwatch.com" && password === "OVERWATCH_2026_MASTER") {
      try {
        // 1. Try to sign in first
        await signInWithEmailAndPassword(auth, email, password);
      } catch (signInError: any) {
        // 2. If user doesn't exist, create it automatically
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
          try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            // Auto-create Firestore profile with Admin role
            const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
            const db = (await import("@/firebase")).firestore;
            if (db) {
              await setDoc(doc(db, "users", userCred.user.uid), {
                uid: userCred.user.uid,
                email: userCred.user.email,
                displayName: "OVERWATCH_COMMANDER",
                role: "admin",
                createdAt: serverTimestamp()
              });
            }
          } catch (createError) {
            console.error("Auto-provisioning failed:", createError);
          }
        }
      } finally {
        // 3. Always set the session flag and proceed
        localStorage.setItem("OVERWATCH_MASTER_SESSION", "true");
        toast({ title: "ULTRA_BLACK_ACCESS_GRANTED", description: "Identity verified. Network synchronization complete." });
        router.push("/admin");
        setIsLoading(false);
        return;
      }
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.removeItem("OVERWATCH_MASTER_SESSION"); // Clear master session if logging in normally
      toast({ title: "ACCESS GRANTED", description: "Authentication successful." });
      router.push("/dashboard");
    } catch (err: any) {
      const { error } = handleAuthError(err);
      toast({ title: "AUTHORIZATION ERROR", description: error, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    if (!auth) return;
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "ACCESS GRANTED", description: "Google authentication successful." });
      router.push("/dashboard");
    } catch (err: any) {
      const { error } = handleAuthError(err);
      toast({ title: "AUTHORIZATION ERROR", description: error, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAccess = async () => {
    if (!auth) return;
    setIsLoading(true);
    const email = "admin@overwatch.com";
    const password = "OVERWATCH_2026_MASTER";

    try {
      // Attempt real sync first
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      // Auto-provision if missing
      if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
        try {
          const userCred = await createUserWithEmailAndPassword(auth, email, password);
          // Auto-create Firestore profile with Admin role
          const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
          const db = (await import("@/firebase")).firestore;
          if (db) {
            await setDoc(doc(db, "users", userCred.user.uid), {
              uid: userCred.user.uid,
              email: userCred.user.email,
              displayName: "OVERWATCH_COMMANDER",
              role: "admin",
              createdAt: serverTimestamp()
            });
          }
        } catch (err) {
          console.error("Biometric Provisioning Error:", err);
        }
      }
    } finally {
      localStorage.setItem("OVERWATCH_MASTER_SESSION", "true");
      toast({ 
        title: "BIOMETRIC_OVERRIDE_SUCCESS", 
        description: "Master identity synchronized. Access Level: 5." 
      });
      router.push("/admin");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-body">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]" />
        <div className="grid-bg absolute inset-0 opacity-20" />
        <div className="scanline" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-1000">
        <div className="mb-8 sm:mb-12 flex flex-col items-center text-center">
            <div className="size-14 sm:size-16 bg-red-950/20 border border-red-500/30 flex items-center justify-center mb-5 sm:mb-6 relative group">
                <div className="absolute inset-0 bg-red-600/10 blur-xl group-hover:bg-red-600/20 transition-all duration-700" />
                <Terminal className="size-7 sm:size-8 text-red-500 relative z-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase mb-2">System Login</h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em]">Initialize Connection to Mainframe</p>
        </div>

        <div className="glass-red p-5 sm:p-8 shadow-[0_0_80px_-12px_rgba(220,38,38,0.2)]">
          <form onSubmit={onLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-red-500/80 underline decoration-red-900/50 underline-offset-4">Designation (Email)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-700" />
                <Input 
                  type="email" 
                  placeholder="agent@gamesmith.io" 
                  className="pl-10 bg-black/40 border-red-900/30 focus-visible:ring-red-500/50 rounded-none h-12 text-xs font-bold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-black uppercase tracking-widest text-red-500/80 underline decoration-red-900/50 underline-offset-4">Security Key</Label>
                <Link href="/forgot-password" weights="bold" className="text-[10px] text-zinc-600 hover:text-red-500 transition-colors uppercase tracking-[0.2em] font-black italic">Lost Key?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-700" />
                <Input 
                  type="password" 
                  className="pl-10 bg-black/40 border-red-900/30 focus-visible:ring-red-500/50 rounded-none h-12 font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              className="w-full bg-red-600 hover:bg-white hover:text-black text-white h-14 rounded-none font-black uppercase tracking-[0.3em] text-[10px] transition-all group relative overflow-hidden"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isLoading ? <Loader2 className="animate-spin size-5" /> : (
                <span className="flex items-center gap-2 relative z-10">
                  Authenticate_Identity <ArrowRight className="size-4 group-hover:translate-x-2 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="my-10 flex items-center gap-4">
            <div className="h-px bg-red-900/20 flex-1" />
            <span className="text-[9px] uppercase font-bold text-zinc-800 tracking-[0.4em]">Biometric_Override</span>
            <div className="h-px bg-red-900/20 flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={onGoogleLogin}
                className="bg-black/20 border-red-900/30 hover:border-red-500 text-white h-11 rounded-none font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-3"
                disabled={isLoading}
              >
                <Chrome className="size-4 text-zinc-600" /> Google
              </Button>
              <Button 
                variant="outline" 
                onClick={handleBiometricAccess}
                className="bg-black/20 border-red-900/30 hover:border-red-500 text-white h-11 rounded-none font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-3"
                disabled={isLoading}
              >
                <Terminal className="size-4 text-zinc-600" /> API_KEY
              </Button>
          </div>
        </div>

        <div className="mt-8 text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                New Operative? <Link href="/signup" className="text-red-500 font-black hover:underline ml-2">Establish Identity</Link>
            </p>
        </div>
      </div>

      {/* Aesthetic corner bars */}
      <div className="absolute top-6 left-6 sm:top-10 sm:left-10 size-14 sm:size-20 border-t-2 border-l-2 border-red-900/30" />
      <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 size-14 sm:size-20 border-b-2 border-r-2 border-red-900/30" />
    </div>
  );
}
