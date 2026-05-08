"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Plus, LayoutGrid, List, ArrowLeft, Loader2, Search, Users } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export default function MyCirclesPage() {
  const { user } = useAuth();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCircles();
  }, []);

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
      console.error("Erreur lors de la récupération des cercles", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-[#272343]">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-[#2d334a]/60 hover:text-[#272343] mb-4 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Retour au dashboard
            </Link>
            <h1 className="text-3xl font-bold">Mes Cercles de Tontine</h1>
            <p className="text-[#2d334a]/60">Gérez et suivez l'évolution de vos groupes.</p>
          </div>
          
          <Link 
            href="/dashboard/circles/new"
            className="inline-flex items-center gap-2 bg-[#ffd803] text-[#272343] px-6 py-3 rounded-xl font-bold hover:bg-[#e0c700] transition-all active:scale-95 shadow-sm"
          >
            Nouveau cercle <Plus className="h-5 w-5" />
          </Link>
        </div>

        {/* Barre de recherche et filtres (UI Only pour l'instant) */}
        <div className="bg-white p-4 rounded-2xl border border-[#dfe5f2] mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#2d334a]/30" />
            <input 
              type="text" 
              placeholder="Rechercher un cercle..." 
              className="w-full pl-12 pr-4 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffd803] transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-[#f8fafc] p-1 rounded-xl border border-[#dfe5f2]">
            <button className="p-2 bg-white shadow-sm rounded-lg text-[#272343]"><LayoutGrid className="h-5 w-5" /></button>
            <button className="p-2 text-[#2d334a]/40 hover:text-[#272343]"><List className="h-5 w-5" /></button>
          </div>
        </div>

        {/* Liste des cercles */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#ffd803] mb-4" />
            <p className="text-[#2d334a]/60 animate-pulse">Chargement de vos cercles...</p>
          </div>
        ) : circles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circles.map((circle: any) => (
              <div 
                key={circle.id} 
                className="group bg-white rounded-[32px] border border-[#dfe5f2] p-6 shadow-sm hover:shadow-md hover:border-[#ffd803]/50 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-[#e3f6f5] p-3 rounded-2xl group-hover:bg-[#ffd803]/10 transition-colors">
                    <Users className="h-6 w-6 text-[#272343]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-green-100 text-green-700 rounded-full">
                    {circle.status || 'Actif'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#ffd803] transition-colors">{circle.name}</h3>
                <p className="text-[#2d334a]/60 text-sm mb-6 line-clamp-2">
                  {circle.description || "Aucune description fournie pour ce cercle."}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#dfe5f2]">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#2d334a]/40 tracking-wider">Cotisation</p>
                    <p className="font-bold">{circle.amount.toLocaleString()} <span className="text-xs font-normal">FCFA</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#2d334a]/40 tracking-wider">Fréquence</p>
                    <p className="font-bold text-sm capitalize">{circle.frequency.toLowerCase()}</p>
                  </div>
                </div>

                <button className="w-full mt-6 py-3 bg-[#f8fafc] group-hover:bg-[#272343] group-hover:text-white text-[#272343] rounded-xl font-bold transition-all text-sm">
                  Voir les détails
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] border border-[#dfe5f2] border-dashed p-20 text-center">
            <div className="bg-[#f8fafc] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-[#2d334a]/20" />
            </div>
            <h3 className="text-xl font-bold mb-2">Aucun cercle trouvé</h3>
            <p className="text-[#2d334a]/60 max-w-sm mx-auto mb-8">
              Il semble que vous n'ayez pas encore créé de cercle de tontine. Commencez par en créer un !
            </p>
            <Link 
              href="/dashboard/circles/new"
              className="inline-flex items-center gap-2 bg-[#272343] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#322d52] transition-all"
            >
              Créer mon premier cercle <Plus className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
