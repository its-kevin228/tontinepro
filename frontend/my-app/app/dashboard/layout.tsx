"use client";

import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notification-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Users,
  LayoutDashboard,
  Bell,
  LogOut,
  CreditCard,
  PieChart,
  User,
  Clock,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { unreadCount, toast, dismissToast, resetUnread } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const isMemberView = pathname?.startsWith("/dashboard/member");
  const isNotifPage = pathname === "/dashboard/notifications";
  const showSwitch = user?.role === "SUPER_ADMIN" || user?.role === "ORGANISATEUR";

  // Pages communes (notifications, cercles) : afficher la nav selon le rôle de l'utilisateur
  // Un MEMBRE qui est sur /dashboard/notifications doit voir la nav membre
  const effectiveMemberView =
    isMemberView || (user?.role === "MEMBRE" && !pathname?.startsWith("/dashboard/circles/new"));

  // Quand l'utilisateur est sur la page notifications, on remet le compteur à 0 visuellement
  useEffect(() => {
    if (isNotifPage) resetUnread();
  }, [isNotifPage, resetUnread]);

  const navItems = effectiveMemberView
    ? [
        { label: "Vue Membre", href: "/dashboard/member", icon: User },
        { label: "Mes Paiements", href: "/dashboard/member/payments", icon: CreditCard },
        { label: "Ordre de passage", href: "/dashboard/member/order", icon: Clock },
      ]
    : [
        { label: "Vue Organisateur", href: "/dashboard", icon: LayoutDashboard },
        { label: "Gestion Cercles", href: "/dashboard/circles", icon: Users },
        { label: "Statistiques", href: "/dashboard/analytics", icon: PieChart },
      ];

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#fffffe] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#ffd803] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-[#2d334a]/40 uppercase tracking-widest">
            Chargement…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffffe]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-[#dfe5f2] z-50 px-6">
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 relative group-hover:rotate-12 transition-transform">
                <Image
                  src="/images/logo/logotontine.svg"
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-black text-[#272343] tracking-tighter">
                Tontine<span className="text-[#ffd803]">Pro</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
                      isActive
                        ? "bg-[#bae8e8] text-[#272343]"
                        : "text-[#2d334a]/40 hover:text-[#272343] hover:bg-[#f8fafc]"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {showSwitch && (
              <Link
                href={effectiveMemberView ? "/dashboard" : "/dashboard/member"}
                className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-[#bae8e8] rounded-xl text-xs font-black uppercase tracking-widest text-[#272343] hover:bg-[#bae8e8] transition-all"
              >
                {effectiveMemberView ? "Vue Organisateur" : "Vue Membre"}
              </Link>
            )}

            <div className="h-8 w-[1px] bg-[#dfe5f2] mx-2 hidden sm:block" />

            {/* Cloche avec badge dynamique */}
            <Link
              href="/dashboard/notifications"
              className="relative p-2 text-[#2d334a]/40 hover:text-[#272343] hover:bg-[#f8fafc] rounded-xl transition-all"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#f25f4c] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <div className="flex items-center gap-3 pl-2">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-black text-[#272343]">{user.name}</p>
                <p className="text-[10px] font-bold text-[#2d334a]/40 uppercase tracking-widest">
                  {effectiveMemberView
                    ? "Membre"
                    : user.role === "SUPER_ADMIN"
                    ? "Super Admin"
                    : "Organisateur"}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-3 bg-[#f8fafc] text-[#f25f4c] rounded-2xl hover:bg-[#f25f4c]/10 transition-all border border-[#dfe5f2]"
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">{children}</div>
      </main>

      {/* Toast de notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-[#272343] text-white rounded-2xl shadow-2xl p-4 pr-10 max-w-sm w-full relative">
            {/* Barre de progression */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-[#ffd803] rounded-full animate-[shrink_5s_linear_forwards]"
              style={{ width: "100%" }}
            />

            <button
              onClick={dismissToast}
              className="absolute top-3 right-3 p-1 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#ffd803]/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="h-4 w-4 text-[#ffd803]" />
              </div>
              <div className="min-w-0">
                <p className="font-black text-sm text-white leading-tight">{toast.title}</p>
                <p className="text-xs text-white/60 font-medium mt-1 leading-relaxed line-clamp-2">
                  {toast.body}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
