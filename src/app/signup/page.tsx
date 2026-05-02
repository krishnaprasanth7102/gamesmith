
"use client";

import { useState } from "react";
import { useAuth } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, Mail, Lock, User, Chrome, ArrowRight, Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { handleAuthError } from "@/lib/auth-actions";
import Link from "next/link";

export default function SignupPage() {
  const { auth } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(userCred.user, { displayName: name });
      }
      
      // Initialize user document in Firestore
      const { firestore } = initializeFirebase();
      const userDocRef = doc(firestore, "users", userCred.user.uid);
      await setDoc(userDocRef, {
        uid: userCred.user.uid,
        displayName: name || userCred.user.displayName || "Unknown_Operative",
        email: userCred.user.email,
        photoURL: userCred.user.photoURL,
        role: "user",
        createdAt: serverTimestamp()
      });

      toast({ title: "IDENTITY ESTABLISHED", description: "Welcome to the Gamesmith network." });
      router.push("/dashboard");
    } catch (err: any) {
      const { error } = handleAuthError(err);
      toast({ title: "REGISTRATION ERROR", description: error, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSignup = async () => {
    if (!auth) return;
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      
      // Initialize user document in Firestore if it doesn't exist
      const { firestore } = initializeFirebase();
      const userDocRef = doc(firestore, "users", userCred.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: userCred.user.uid,
          displayName: userCred.user.displayName || "Unknown_Operative",
          email: userCred.user.email,
          photoURL: userCred.user.photoURL,
          role: "user",
          createdAt: serverTimestamp()
        });
      }

      toast({ title: "IDENTITY ESTABLISHED", description: "Successfully joined via Google." });
      router.push("/dashboard");
    } catch (err: any) {
      const { error } = handleAuthError(err);
      toast({ title: "REGISTRATION ERROR", description: error, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-body">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(220,38,38,0.1),transparent_70%)]" />
        <div className="grid-bg absolute inset-0 opacity-20" />
        <div className="scanline" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="mb-8 sm:mb-12 flex flex-col items-center text-center">
            <div className="size-14 sm:size-16 bg-red-950/20 border border-red-500/30 flex items-center justify-center mb-5 sm:mb-6 relative group">
                <div className="absolute inset-0 bg-red-600/10 blur-xl group-hover:bg-red-600/20 transition-all duration-700" />
                <UserPlus className="size-7 sm:size-8 text-red-500 relative z-10" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase mb-2">New Operative</h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em]">Establish Persistent Identity Protocol</p>
        </div>

        <div className="glass-red p-5 sm:p-8 shadow-[0_0_80px_-12px_rgba(220,38,38,0.2)]">
          <form onSubmit={onSignup} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-red-500/80 underline decoration-red-900/50 underline-offset-4">Callsign (Display Name)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-700" />
                <Input 
                  type="text" 
                  placeholder="Ghost_Protocol" 
                  className="pl-10 bg-black/40 border-red-900/30 focus-visible:ring-red-500/50 rounded-none h-11 text-xs font-bold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-red-500/80 underline decoration-red-900/50 underline-offset-4">Designation (Email)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-700" />
                <Input 
                  type="email" 
                  placeholder="agent@gamesmith.io" 
                  className="pl-10 bg-black/40 border-red-900/30 focus-visible:ring-red-500/50 rounded-none h-11 text-xs font-bold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-red-500/80 underline decoration-red-900/50 underline-offset-4">Security Key (Password)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-700" />
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  className="pl-10 bg-black/40 border-red-900/30 focus-visible:ring-red-500/50 rounded-none h-11 font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              className="w-full bg-red-600 hover:bg-white hover:text-black text-white h-14 rounded-none font-black uppercase tracking-[0.3em] text-[10px] transition-all group mt-4 relative overflow-hidden"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isLoading ? <Loader2 className="animate-spin size-5" /> : (
                <span className="flex items-center gap-2 relative z-10">
                  Establish_Identity <ArrowRight className="size-4 group-hover:translate-x-2 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="my-10 flex items-center gap-4">
            <div className="h-px bg-red-900/20 flex-1" />
            <span className="text-[9px] uppercase font-bold text-zinc-800 tracking-[0.4em]">Rapid_Auth</span>
            <div className="h-px bg-red-900/20 flex-1" />
          </div>

          <Button 
            variant="outline" 
            onClick={onGoogleSignup}
            className="w-full bg-black/20 border-red-900/30 hover:border-red-500 text-white h-11 rounded-none font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-3 transition-all"
            disabled={isLoading}
          >
            <Chrome className="size-4 text-zinc-600" /> Establish via Google
          </Button>
        </div>

        <div className="mt-8 text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                Already Authorized? <Link href="/login" className="text-red-500 font-black hover:underline ml-2">Initialize Login</Link>
            </p>
        </div>
      </div>

      <div className="absolute top-6 right-6 sm:top-10 sm:right-10 size-14 sm:size-20 border-t-2 border-r-2 border-red-900/30" />
      <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 size-14 sm:size-20 border-b-2 border-l-2 border-red-900/30" />
    </div>
  );
}
