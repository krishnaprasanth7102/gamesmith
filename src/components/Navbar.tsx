"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { Terminal, Menu, X, Zap, LogOut, Layers, LayoutDashboard, Lock, ShoppingBag, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { auth } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      // Clear Master Session
      localStorage.removeItem("OVERWATCH_MASTER_SESSION");
      
      if (auth) {
        await signOut(auth);
      }
      
      setIsMobileMenuOpen(false);
      
      // Force a full refresh to clear all reactive states (especially for master mode)
      window.location.href = "/";
    } catch (error) {
      console.error("LOGOUT_CRITICAL_FAILURE:", error);
      // Panic fallback: hard redirect
      window.location.href = "/";
    }
  };

  const navLinks = [
    { name: "Assets", href: "/assets", icon: ShoppingBag },
    { name: "Playground", href: "/playground", icon: Layers },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Integration", href: "/#integration", icon: Zap },
    ...(user ? [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] : []),
  ];

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b",
          isScrolled
            ? "bg-black/95 backdrop-blur-xl py-3 border-white/10"
            : "bg-transparent py-5 sm:py-8 border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="size-8 sm:size-9 bg-red-600 flex items-center justify-center group-hover:rotate-90 transition-transform duration-700 shrink-0">
              <Terminal className="size-4 sm:size-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-black tracking-tighter uppercase leading-tight">GAMESMITH</span>
              <span className="text-[6px] sm:text-[8px] font-bold text-red-600 tracking-widest uppercase">Tactical Arsenal v4.0</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-10">
            <div className="flex items-center gap-5 lg:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-white transition-colors flex items-center gap-2 group"
                >
                  <link.icon className="size-3 text-red-600 group-hover:scale-125 transition-transform" />
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-white/10" />

            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-black uppercase tracking-tight text-white leading-none group-hover:text-red-500 transition-colors">
                      {user.displayName || "Operative"}
                    </span>
                    <span className="text-[8px] font-mono text-red-600 uppercase tracking-widest mt-1">Authorized</span>
                  </div>
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.uid || 'default'}`}
                    alt=""
                    className="size-8 border border-red-600/30 grayscale group-hover:grayscale-0 transition-all cursor-crosshair"
                  />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-red-600 transition-all"
                  title="Disconnect"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2"
              >
                <Lock className="size-3" /> Access
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white p-2 hover:bg-red-600/20 transition-colors rounded"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col md:hidden">
          {/* Menu Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
              <div className="size-8 bg-red-600 flex items-center justify-center">
                <Terminal className="size-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase">GAMESMITH</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-zinc-400 hover:text-white"
              aria-label="Close menu"
            >
              <X size={28} />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto px-5 py-8">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-4 border border-white/5 hover:border-red-600/50 hover:bg-red-950/10 transition-all group"
                >
                  <link.icon size={20} className="text-red-600 shrink-0" />
                  <span className="text-xl font-black uppercase tracking-tight">{link.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Auth Section */}
          <div className="px-5 py-6 border-t border-white/10">
            {user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10">
                  <img
                    src={user.photoURL || "https://api.dicebear.com/7.x/pixel-art/svg?seed=" + user.uid}
                    alt=""
                    className="size-12 border border-red-600 grayscale"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-black uppercase truncate">{user.displayName || "Operative"}</span>
                    <span className="text-[10px] font-mono text-red-600 tracking-widest truncate">ID: {user?.uid?.slice(0, 8) || "UNKNOWN"}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full h-12 border border-red-600 text-red-600 font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all"
                >
                  <LogOut size={16} /> Terminate Session
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full h-12 bg-red-600 text-white font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all"
              >
                <Lock size={18} /> Initialize Access
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}