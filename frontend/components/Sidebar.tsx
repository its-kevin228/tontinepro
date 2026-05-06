"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Tableau de bord", exact: true },
  { href: "/dashboard/circles", icon: Users, label: "Mes cercles" },
  { href: "/dashboard/payments", icon: CreditCard, label: "Paiements" },
  { href: "/dashboard/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
];

interface SidebarProps {
  userName: string;
  userRole: "SUPER_ADMIN" | "ORGANISATEUR" | "MEMBRE";
  onLogout: () => void;
}

export function Sidebar({ userName, userRole, onLogout }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
          style={{ background: "var(--accent)", color: "var(--text-primary)" }}
        >
          T
        </div>
        <span className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
          TontinePro
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label, exact }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: isActive(href, exact) ? "var(--surface-alt)" : "transparent",
              color: isActive(href, exact) ? "var(--text-primary)" : "var(--text-secondary)",
              borderLeft: isActive(href, exact) ? "3px solid var(--accent)" : "3px solid transparent",
            }}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}

        {/* Lien admin */}
        {userRole === "SUPER_ADMIN" && (
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mt-2"
            style={{
              background: pathname.startsWith("/admin") ? "rgba(255,137,6,0.1)" : "transparent",
              color: pathname.startsWith("/admin") ? "var(--accent-dark)" : "var(--text-secondary)",
              borderLeft: pathname.startsWith("/admin") ? "3px solid var(--accent-dark)" : "3px solid transparent",
            }}
          >
            <Shield size={18} />
            Administration
          </Link>
        )}
      </nav>

      {/* Profil utilisateur */}
      <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "var(--surface-alt)", color: "var(--text-primary)" }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {userName}
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {userRole === "SUPER_ADMIN" ? "Super Admin" : userRole === "ORGANISATEUR" ? "Organisateur" : "Membre"}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-colors"
          style={{ color: "var(--error)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(242,95,76,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
