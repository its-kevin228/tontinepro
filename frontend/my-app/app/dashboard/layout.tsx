"use client";

import { useAuth } from "@/lib/auth-context";
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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Rediriger vers /login si non authentifié
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const isMemberView = pathname?.startsWith("/dashboard/member");
  const showSwitch = user?.role === "SUPER_ADMIN" || user?.role === "ORGANISATEUR";

  const navItems = isMemberView
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

  // Spinner pendant la vérification du token
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
                href={isMemberView ? "/dashboard" : "/dashboard/member"}
                className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-[#bae8e8] rounded-xl text-xs font-black uppercase tracking-widest text-[#272343] hover:bg-[#bae8e8] transition-all"
              >
                {isMemberView ? "Vue Organisateur" : "Vue Membre"}
              </Link>
            )}

            <div className="h-8 w-[1px] bg-[#dfe5f2] mx-2 hidden sm:block" />

            <Link
              href="/dashboard/notifications"
              className="p-2 text-[#2d334a]/40 hover:text-[#272343] hover:bg-[#f8fafc] rounded-xl transition-all relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#f25f4c] rounded-full border-2 border-white" />
            </Link>

            <div className="flex items-center gap-3 pl-2">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-black text-[#272343]">{user.name}</p>
                <p className="text-[10px] font-bold text-[#2d334a]/40 uppercase tracking-widest">
                  {isMemberView
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
    </div>
  );
}
