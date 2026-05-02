
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  BrainCircuit,
  Box,
  Layers,
  Upload,
  User,
  Settings,
  LogOut,
  Terminal,
  ChevronRight,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { ShieldAlert } from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { auth } = useAuth();
  const { user, isAdmin } = useUser();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Asset Store", href: "/assets", icon: ShoppingBag },
    { name: "AI Assets", href: "/assets/ai", icon: BrainCircuit },
    { name: "3D Assets", href: "/assets/3d", icon: Box },
    { name: "Playground", href: "/playground", icon: Layers },
    { name: "Upload", href: "/upload", icon: Upload },
  ];

  const bottomItems = [
    ...(isAdmin ? [{ name: "Overwatch", href: "/admin", icon: ShieldAlert }] : []),
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-[90] lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-[#050505] border-r border-red-900/20 flex flex-col z-[100] transition-transform duration-300 ease-in-out shrink-0",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-red-900/10">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="size-7 bg-red-600 flex items-center justify-center shrink-0">
              <Terminal className="size-4 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase leading-none">GAMESMITH</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-zinc-500 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[8px] font-bold text-zinc-700 uppercase tracking-widest mb-3">Navigation</p>
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center justify-between px-3 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all rounded-none",
                pathname === item.href
                  ? "bg-red-600/10 border-l-2 border-red-600 text-white"
                  : "text-zinc-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("size-4 shrink-0", pathname === item.href ? "text-red-600" : "text-zinc-700 group-hover:text-red-500")} />
                {item.name}
              </div>
              {pathname === item.href && <ChevronRight className="size-3 text-red-600" />}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3 border-t border-red-900/10 space-y-1">
          {bottomItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all border-l-2 border-transparent",
                pathname === item.href && "text-white"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.name}
            </Link>
          ))}
          <button
            onClick={() => {
              if (auth) signOut(auth);
              if (onClose) onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-500 transition-all"
          >
            <LogOut className="size-4 shrink-0" />
            Disconnect
          </button>
        </div>
      </aside>
    </>
  );
}
