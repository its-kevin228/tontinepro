"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Plus, Users, TrendingUp, LayoutDashboard, Loader2 } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "ORGANISATEUR") {
      fetchCircles();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCircles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/circles`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCircles(data.circles || []);
      }
    } catch (error) {
      console.error("Failed to fetch circles", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Bonjour, {user.name} 👋</h1>
        <p className="text-[#2d334a]/60 font-medium">Voici l'état de vos tontines aujourd'hui.</p>
      </header>

      {user.role === "ORGANISATEUR" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="card-base">
              <div className="bg-[#bae8e8] p-3 rounded-2xl w-fit mb-4"><Users className="h-6 w-6 text-[#272343]" /></div>
              <p className="text-[#2d334a]/60 text-sm font-bold uppercase tracking-wider">Total Membres</p>
              <p className="text-3xl font-extrabold mt-1">0</p>
            </div>
            <div className="card-base">
              <div className="bg-[#ffd803] p-3 rounded-2xl w-fit mb-4"><LayoutDashboard className="h-6 w-6 text-[#272343]" /></div>
              <p className="text-[#2d334a]/60 text-sm font-bold uppercase tracking-wider">Cercles Actifs</p>
              <p className="text-3xl font-extrabold mt-1">{circles.length}</p>
            </div>
            <div className="card-base">
              <div className="bg-[#e3f6f5] p-3 rounded-2xl w-fit mb-4"><TrendingUp className="h-6 w-6 text-[#272343]" /></div>
              <p className="text-[#2d334a]/60 text-sm font-bold uppercase tracking-wider">Total Collecté</p>
              <p className="text-3xl font-extrabold mt-1">0 <span className="text-sm font-bold">FCFA</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#272343] text-white p-8 rounded-[32px] shadow-[0_16px_40px_rgba(39,35,67,0.12)] relative overflow-hidden group">
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-2">Lancez un nouveau cercle</h2>
                  <p className="text-white/70 mb-6 text-sm font-medium max-w-md">Prêt pour une nouvelle tontine ? Configurez les tours et invitez vos membres dès maintenant.</p>
                  <Link href="/dashboard/circles/new" className="btn-primary inline-flex items-center gap-2 px-8">
                    Créer un cercle <Plus className="h-5 w-5" />
                  </Link>
                </div>
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#ffd803]/10 rounded-full blur-3xl group-hover:bg-[#ffd803]/20 transition-colors"></div>
              </div>

              <div className="card-base">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">Vos cercles récents</h3>
                  <Link href="/dashboard/circles" className="text-sm font-bold text-[#ffd803] hover:underline">Voir tout</Link>
                </div>
                {loading ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin text-[#ffd803]" /></div>
                ) : circles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {circles.map((c: any) => (
                          <div key={c.id} className="p-5 border border-[#dfe5f2] rounded-2xl hover:border-[#ffd803] transition-all cursor-pointer bg-white group">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-bold text-[#272343] group-hover:text-[#ffd803] transition-colors">{c.name}</p>
                              <span className="text-[10px] px-2 py-1 bg-[#e3f6f5] rounded-md font-bold text-[#272343] uppercase tracking-tighter">Actif</span>
                            </div>
                            <p className="text-sm text-[#2d334a]/60 font-medium">{c.amount.toLocaleString()} FCFA • {c.frequency}</p>
                          </div>
                      ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-[#f8fafc] rounded-2xl border-2 border-dashed border-[#dfe5f2]">
                      <p className="text-[#2d334a]/40 italic font-medium">Aucun cercle créé pour le moment.</p>
                    </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#e3f6f5] p-8 rounded-[32px] border border-[#bae8e8] h-fit">
                <h3 className="text-lg font-bold mb-4 text-[#272343]">Prochaines Collectes</h3>
                <div className="space-y-4">
                  <p className="text-sm text-[#2d334a]/60 italic font-medium">Aucune collecte prévue.</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="card-base flex flex-col items-center text-center py-12">
             <div className="w-16 h-16 bg-[#e3f6f5] rounded-full flex items-center justify-center mb-6">
               <Users className="h-8 w-8 text-[#272343]" />
             </div>
             <h3 className="text-xl font-bold mb-2 text-[#272343]">Pas encore de cercle ?</h3>
             <p className="text-[#2d334a]/60 text-sm mb-8 max-w-xs">Rejoignez un cercle via un lien d'invitation ou contactez un organisateur.</p>
             <button className="btn-secondary w-full">Saisir un code d'invitation</button>
           </div>
           <div className="bg-[#ffd803]/10 border-2 border-dashed border-[#ffd803]/30 rounded-[32px] p-8 flex flex-col justify-center">
              <h3 className="text-lg font-bold mb-2">Aide & Support</h3>
              <p className="text-sm text-[#2d334a]/70 mb-4">Besoin d'aide pour comprendre le fonctionnement des tontines ?</p>
              <Link href="#" className="text-[#272343] font-bold underline">Consulter le guide</Link>
           </div>
        </div>
      )}
    </>
  );
}
