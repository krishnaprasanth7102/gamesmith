"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Github, Loader2, Shield } from "lucide-react";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GithubAuthProvider, updateProfile } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ isOpen, onOpenChange }: AuthModalProps) {
  const { auth } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleAuthError = (error: any) => {
    let message = "Authentication failed. Please verify your credentials.";
    const code = error.code || "";

    if (code === 'auth/invalid-credential') message = "Invalid email or password.";
    if (code === 'auth/email-already-in-use') message = "An account with this email already exists.";
    if (code === 'auth/operation-not-allowed') message = "Sign-in provider is not enabled in Firebase Console. Please enable Email/Password and Google.";
    if (code.includes('api-key') || error.message?.includes('API key')) message = "System configuration error. Connection to mainframe lost (Check Firebase Config).";

    toast({
      title: "AUTHORIZATION ERROR",
      description: message,
      variant: "destructive",
    });
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onOpenChange(false);
      toast({ title: "ACCESS GRANTED", description: "Authentication successful." });
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(userCred.user, { displayName: name });
      }
      onOpenChange(false);
      toast({ title: "IDENTITY ESTABLISHED", description: "Welcome to the network." });
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onGithubLogin = async () => {
    if (!auth) return;
    setIsLoading(true);
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      onOpenChange(false);
      toast({ title: "ACCESS GRANTED", description: "GitHub authentication successful." });
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#050505] border border-red-900/50 p-0 overflow-hidden shadow-[0_0_50px_-12px_rgba(220,38,38,0.25)] text-white font-body selection:bg-red-600 selection:text-white">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <div className="h-1 bg-gradient-to-r from-red-900/50 via-red-500 to-red-900/50" />
        <div className="p-6 sm:p-8 relative z-10">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="size-14 bg-red-950/30 border border-red-500/20 flex items-center justify-center mb-5 relative group">
              <div className="absolute inset-0 bg-red-600/20 blur-md group-hover:bg-red-600/30 transition-all duration-700" />
              <Shield className="size-6 text-red-500 relative z-10" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase font-mono">Terminal Access</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-1">Provide Credentials</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-black border border-red-900/30 p-1">
              <TabsTrigger value="login" className="data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase tracking-[0.2em] text-[10px] font-black transition-all rounded-sm">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase tracking-[0.2em] text-[10px] font-black transition-all rounded-sm">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-0">
              <form onSubmit={onLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-[0.15em] text-red-500/80">Email Designation</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="agent@domain.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black/50 border-red-900/30 focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500/50 rounded-none placeholder:text-zinc-800 text-sm h-11" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[9px] font-black uppercase tracking-[0.15em] text-red-500/80">Security Key</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/50 border-red-900/30 focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500/50 rounded-none h-11" 
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-white hover:text-black text-white rounded-none h-12 uppercase tracking-[0.2em] font-black text-[10px] transition-all duration-300 mt-2"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Authenticate"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="mt-0">
              <form onSubmit={onRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[9px] font-black uppercase tracking-[0.15em] text-red-500/80">Operative Callsign</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ghost" 
                    className="bg-black/50 border-red-900/30 focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500/50 rounded-none placeholder:text-zinc-800 text-sm h-11" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-[9px] font-black uppercase tracking-[0.15em] text-red-500/80">Email Designation</Label>
                  <Input 
                    id="reg-email" 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@domain.com" 
                    className="bg-black/50 border-red-900/30 focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500/50 rounded-none placeholder:text-zinc-800 text-sm h-11" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-[9px] font-black uppercase tracking-[0.15em] text-red-500/80">Security Key</Label>
                  <Input 
                    id="reg-password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/50 border-red-900/30 focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500/50 rounded-none h-11" 
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-white hover:text-black text-white rounded-none h-12 uppercase tracking-[0.2em] font-black text-[10px] transition-all duration-300 mt-2"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Establish Identity"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-red-900/30" />
              </div>
              <div className="relative flex justify-center text-[9px] uppercase font-black tracking-widest">
                <span className="bg-[#050505] px-4 text-red-500/50">External Override</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onGithubLogin}
              className="mt-6 w-full bg-transparent border-red-900/50 hover:bg-red-950/20 hover:border-red-500/50 text-white rounded-none transition-all duration-300 h-12 uppercase tracking-[0.2em] text-[10px] font-bold"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-3 h-4 w-4 text-zinc-400" />
              )}
              Initialize via GitHub
            </Button>
          </div>
        </div>
        
        {/* Scanline Effect overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-0 opacity-20 mix-blend-overlay"></div>
      </DialogContent>
    </Dialog>
  );
}
