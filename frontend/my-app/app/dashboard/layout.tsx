"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, Users, Bell, Menu, X, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mes Cercles", href: "/dashboard/circles", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#fffffe] font-sans text-[#272343]">
      {/* Navigation Horizontale Partagée */}
      <nav className="sticky top-0 z-50 bg-white border-b border-[#dfe5f2] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/images/logo/logotontine.svg" alt="TontinePro Logo" width={45} height={45} />
              <span className="text-xl font-bold tracking-tighter">Tontine<span className="text-[#ffd803]">Pro</span></span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all ${
                      isActive 
                        ? "bg-[#ffd803]/10 text-[#272343]" 
                        : "text-[#2d334a]/60 hover:bg-[#e3f6f5]"
                    }`}
                  >
                    <link.icon className="h-4 w-4" /> {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-[#2d334a]/60 hover:bg-[#e3f6f5] rounded-full transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#f25f4c] rounded-full border-2 border-white"></span>
            </button>
            
            {/* User Menu Dropdown */}
            <div className="relative border-l border-[#dfe5f2] pl-4">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 p-1 rounded-xl hover:bg-[#f8fafc] transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold leading-tight">{user.name}</p>
                  <p className="text-[10px] text-[#2d334a]/60 uppercase tracking-widest font-bold">{user.role}</p>
                </div>
                <div className="w-10 h-10 bg-[#bae8e8] rounded-full flex items-center justify-center font-bold text-[#272343] border-2 border-white shadow-sm relative overflow-hidden">
                  {user.name.charAt(0)}
                </div>
                <ChevronDown className={`h-4 w-4 text-[#2d334a]/40 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#dfe5f2] rounded-2xl shadow-[0_10px_25px_rgba(39,35,67,0.1)] py-2 z-50">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#f25f4c] hover:bg-[#f25f4c]/5 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Déconnexion
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`block px-4 py-3 rounded-xl font-bold ${
                  pathname === link.href ? "bg-[#ffd803]/10 text-[#272343]" : "text-[#2d334a]/60"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
