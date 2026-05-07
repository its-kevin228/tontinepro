"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { AuthProvider } from "@/lib/auth-context";
import {
  LayoutDashboard, Users, FileCheck, Settings,
  ArrowLeft, Shield, Loader2
} from "lucide-react";

const adminNav = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users",     icon: Users,            label: "Utilisateurs" },
  { href: "/admin/kyc",       icon: FileCheck,        label: "KYC" },
  { href: "/admin/settings",  icon: Settings,         label: "Paramètres" },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && user && user.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-secondary)" }} />
      </div>
    );
  }

  if (!user || user.role !== "SUPER_ADMIN") return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Sidebar admin */}
      <aside
        className="hidden lg:flex flex-col w-60 h-screen sticky top-0 border-r"
        style={{ background: "var(--text-primary)", borderColor: "#2a2740" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "#2a2740" }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--accent)", color: "var(--text-primary)" }}
          >
            <Shield size={18} />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: "#fffffe" }}>TontinePro</p>
            <p className="text-xs" style={{ color: "#a7a9be" }}>Administration</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNav.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: isActive(href) ? "rgba(255,216,3,0.12)" : "transparent",
                color: isActive(href) ? "var(--accent)" : "#a7a9be",
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t space-y-2" style={{ borderColor: "#2a2740" }}>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
            style={{ color: "#a7a9be" }}
          >
            <ArrowLeft size={15} /> Interface membre
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-full transition-colors"
            style={{ color: "var(--error)" }}
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {/* Topbar admin */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
          style={{ background: "var(--background)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: "var(--accent-dark)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Super Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--surface-alt)", color: "var(--text-primary)" }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium hidden sm:block" style={{ color: "var(--text-primary)" }}>
              {user.name}
            </span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
