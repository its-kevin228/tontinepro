"use client";

import { useAuth } from "@/lib/auth-context";
import { Plus, Users, TrendingUp, Calendar, LayoutDashboard, Settings, Bell } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "ORGANISATEUR") {
    return (
      <div className="min-h-screen bg-[#fffffe] font-sans text-[#272343]">
        <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#dfe5f2] p-6 hidden lg:block">
          <div className="mb-10 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ffd803] rounded-lg"></div>
            <span className="text-xl font-bold tracking-tighter">Tontine<span className="text-[#ffd803]">Pro</span></span>
          </div>
          <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 p-3 bg-[#ffd803]/10 text-[#272343] rounded-xl font-bold">
              <LayoutDashboard className="h-5 w-5" /> Tableau de bord
            </Link>
            <Link href="/dashboard/circles" className="flex items-center gap-3 p-3 text-[#2d334a]/60 hover:bg-[#e3f6f5] rounded-xl transition-colors">
              <Users className="h-5 w-5" /> Mes Cercles
            </Link>
          </nav>
        </aside>

        <main className="lg:ml-64 p-8">
          <header className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Organisateur</h1>
              <p className="text-[#2d334a]/60">Gérez vos cercles et vos membres en toute simplicité.</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-3 bg-white border border-[#dfe5f2] rounded-xl relative">
                <Bell className="h-5 w-5 text-[#272343]" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-[#dfe5f2]">
                <div className="text-right">
                  <p className="text-sm font-bold">{user.name}</p>
                  <p className="text-[10px] text-[#2d334a]/60 uppercase tracking-widest">Organisateur</p>
                </div>
                <div className="w-10 h-10 bg-[#bae8e8] rounded-full flex items-center justify-center font-bold text-[#272343]">
                  {user.name.charAt(0)}
                </div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-[24px] border border-[#dfe5f2] shadow-sm">
              <div className="bg-[#bae8e8]/30 p-3 rounded-2xl w-fit mb-4">
                <Users className="h-6 w-6 text-[#272343]" />
              </div>
              <p className="text-[#2d334a]/60 text-sm font-medium">Total Membres</p>
              <p className="text-3xl font-bold mt-1">0</p>
            </div>
            <div className="bg-white p-6 rounded-[24px] border border-[#dfe5f2] shadow-sm">
              <div className="bg-[#ffd803]/10 p-3 rounded-2xl w-fit mb-4">
                <LayoutDashboard className="h-6 w-6 text-[#272343]" />
              </div>
              <p className="text-[#2d334a]/60 text-sm font-medium">Cercles Actifs</p>
              <p className="text-3xl font-bold mt-1">0</p>
            </div>
            <div className="bg-white p-6 rounded-[24px] border border-[#dfe5f2] shadow-sm">
              <div className="bg-[#e3f6f5] p-3 rounded-2xl w-fit mb-4">
                <TrendingUp className="h-6 w-6 text-[#272343]" />
              </div>
              <p className="text-[#2d334a]/60 text-sm font-medium">Total Collecté</p>
              <p className="text-3xl font-bold mt-1">0 FCFA</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#272343] text-white p-8 rounded-[32px] relative overflow-hidden">
              <h2 className="text-2xl font-bold mb-2">Lancez un nouveau cercle</h2>
              <p className="text-white/70 mb-6 text-sm">Configurez le montant et invitez vos membres.</p>
              <Link href="/dashboard/circles/new" className="inline-flex items-center gap-2 bg-[#ffd803] text-[#272343] px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform">
                Créer un cercle <Plus className="h-5 w-5" />
              </Link>
            </div>
            <div className="bg-white rounded-[32px] border border-[#dfe5f2] p-8 shadow-sm flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-bold mb-2">Inscriptions récentes</h3>
              <p className="text-[#2d334a]/40 italic">Aucune inscription pour le moment.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e2e8f0] text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">Bienvenue, {user.name} !</h1>
        <p className="text-[#2d334a]/60">Interface Membre en cours de configuration.</p>
      </div>
    </div>
  );
}
