"use client";

import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notification-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, ShieldCheck, Users, Settings, LogOut,
  ScrollText, Bell, X, Menu, AlertTriangle,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",     href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "KYC",           href: "/admin/kyc",       icon: ShieldCheck },
  { label: "Utilisateurs",  href: "/admin/users",     icon: Users },
  { label: "Litiges",       href: "/admin/disputes",  icon: AlertTriangle },
  { label: "Bannissements", href: "/admin/ban-logs",  icon: ScrollText },
  { label: "Paramètres",    href: "/admin/settings",  icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { toast, dismissToast } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.replace("/login"); return; }
    if (!loading && user && user.role !== "SUPER_ADMIN") { router.replace("/dashboard"); }
  }, [user, loading, router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#fffffe] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#ffd803] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-[#2d334a]/40 uppercase tracking-widest">Chargement…</p>
        </div>
      </div>
    );
  }

  if (user.role !== "SUPER_ADMIN") return null;

  return (
    <div className="min-h-screen bg-[#fffffe]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-[#dfe5f2] z-50 px-4 md:px-6">
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between">

          {/* Logo + nav desktop */}
          <div className="flex items-center gap-8">
            <Link href="/admin/dashboard" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 relative group-hover:rotate-12 transition-transform">
                <Image src="/images/logo/logotontine.svg" alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-xl font-black text-[#272343] tracking-tighter">
                Tontine<span className="text-[#ffd803]">Pro</span>
                <span className="ml-2 text-[10px] font-black uppercase tracking-widest bg-[#272343] text-[#ffd803] px-2 py-0.5 rounded-md">
                  Admin
                </span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
                      isActive ? "bg-[#272343] text-[#ffd803]" : "text-[#2d334a]/40 hover:text-[#272343] hover:bg-[#f8fafc]"
                    }`}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/dashboard"
              className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-[#bae8e8] rounded-xl text-xs font-black uppercase tracking-widest text-[#272343] hover:bg-[#bae8e8] transition-all">
              Vue Organisateur
            </Link>
            <div className="h-8 w-[1px] bg-[#dfe5f2] hidden sm:block" />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-black text-[#272343]">{user.name}</p>
              <p className="text-[10px] font-bold text-[#2d334a]/40 uppercase tracking-widest">Super Admin</p>
            </div>
            <button onClick={logout}
              className="hidden md:flex p-3 bg-[#f8fafc] text-[#f25f4c] rounded-2xl hover:bg-[#f25f4c]/10 transition-all border border-[#dfe5f2]"
              title="Déconnexion">
              <LogOut className="h-5 w-5" />
            </button>
            {/* Hamburger mobile */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[#272343] hover:bg-[#f8fafc] rounded-xl transition-all">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 pt-20" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-20 left-0 right-0 bg-[#272343] border-b border-white/10 shadow-xl animate-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}>
            <div className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                      isActive ? "bg-[#ffd803] text-[#272343]" : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}>
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-white/10 my-2" />
              <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all">
                Vue Organisateur
              </Link>
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm text-[#f25f4c] hover:bg-[#f25f4c]/10 transition-all">
                <LogOut className="h-5 w-5" /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-[1200px] mx-auto">{children}</div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-4 md:right-6 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-[#272343] text-white rounded-2xl shadow-2xl p-4 pr-10 max-w-sm w-full relative">
            <button onClick={dismissToast}
              className="absolute top-3 right-3 p-1 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#ffd803]/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="h-4 w-4 text-[#ffd803]" />
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm text-white leading-tight">{toast.title}</p>
                <p className="text-xs text-white/60 font-medium mt-1 leading-relaxed line-clamp-2">{toast.body}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
