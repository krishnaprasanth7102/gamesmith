
"use client";

import { Sidebar } from "./Sidebar";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="size-10 border-2 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 w-full min-w-0">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-[#050505] border-b border-red-900/20 shrink-0">
          <span className="text-base font-black tracking-tighter uppercase">GAMESMITH</span>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-white hover:bg-red-600/20 transition-colors rounded"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 xl:p-12 w-full min-w-0 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Scanline effect */}
      <div className="scanline opacity-20 pointer-events-none" />
    </div>
  );
}
