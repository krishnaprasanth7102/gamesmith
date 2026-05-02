
"use client";

import { useState } from "react";
import { useAuth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Mail, ArrowLeft, Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { auth } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
      toast({ title: "RESET DISPATCHED", description: "Security key override instructions sent to your designation." });
    } catch (err: any) {
      toast({ title: "SYSTEM ERROR", description: "Could not dispatch reset sequence. Verify designation.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden font-body">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="scanline" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-12 flex flex-col items-center">
            <div className="size-16 bg-red-950/20 border border-red-500/30 flex items-center justify-center mb-6 relative group">
                <div className="absolute inset-0 bg-red-600/10 blur-xl group-hover:bg-red-600/20 transition-all duration-700" />
                <KeyRound className="size-8 text-red-500 relative z-10" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Key Recovery</h1>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em]">Override security protocols</p>
        </div>

        <div className="bg-[#050505] border border-red-900/30 p-8 shadow-[0_0_50px_-12px_rgba(220,38,38,0.2)]">
          {!isSent ? (
            <form onSubmit={onReset} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-red-500/80">Operative Designation (Email)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-700" />
                  <Input 
                    type="email" 
                    placeholder="agent@gamesmith.io" 
                    className="pl-10 bg-black/50 border-red-900/30 focus-visible:ring-red-500/50 rounded-none h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                className="w-full bg-red-600 hover:bg-white hover:text-black text-white h-14 rounded-none font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin size-5" /> : "Dispatch Recovery Sequence"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-6">
              <div className="p-4 bg-red-950/20 border border-red-500/20 text-red-400 text-[10px] uppercase tracking-widest font-bold">
                Transmission Successful. Check your inbox for security override link.
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsSent(false)}
                className="w-full bg-transparent border-red-900/30 hover:border-red-500 text-white h-12 rounded-none font-black uppercase tracking-widest text-[9px]"
              >
                Retry Transmission
              </Button>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-red-900/10">
            <Link href="/login" className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 hover:text-white transition-colors uppercase tracking-widest font-black">
              <ArrowLeft className="size-3" /> Abort and Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
