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
    <div className="min-h-screen bg-[#fffffe] flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-[#dfe5f2] fixed h-full z-50 p-6">
        {/* Logo */}
        <Link href="/admin/dashboard" className="flex items-center gap-3 group shrink-0 mb-10">
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

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${
                  isActive ? "bg-[#272343] text-[#ffd803]" : "text-[#2d334a]/40 hover:text-[#272343] hover:bg-[#f8fafc]"
                }`}>
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User & Actions */}
        <div className="pt-6 border-t border-[#dfe5f2] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-[#272343] line-clamp-1">{user.name}</p>
              <p className="text-[10px] font-bold text-[#2d334a]/40 uppercase tracking-widest">Super Admin</p>
            </div>
            <button onClick={logout}
              className="p-3 bg-[#f8fafc] text-[#f25f4c] rounded-2xl hover:bg-[#f25f4c]/10 transition-all border border-[#dfe5f2]"
              title="Déconnexion">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <Link href="/dashboard"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-[#bae8e8] rounded-xl text-xs font-black uppercase tracking-widest text-[#272343] hover:bg-[#bae8e8] transition-all">
            Vue Organisateur
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:pl-72 min-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between h-20 bg-white border-b border-[#dfe5f2] px-4 fixed top-0 w-full z-40">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group shrink-0">
            <div className="w-8 h-8 relative group-hover:rotate-12 transition-transform">
              <Image src="/images/logo/logotontine.svg" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-lg font-black text-[#272343] tracking-tighter">
              Tontine<span className="text-[#ffd803]">Pro</span>
            </span>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[#272343] hover:bg-[#f8fafc] rounded-xl transition-all">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 pt-20" onClick={() => setMobileOpen(false)}>
            <div className="absolute inset-0 bg-black/20" />
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

        {/* Page Content */}
        <main className="flex-1 pt-24 md:pt-10 pb-20 px-4 md:px-10">
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
    </div>
  );
}
