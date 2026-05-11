"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  Users,
  Wallet,
  Activity,
  Calendar,
} from "lucide-react";

interface AnalyticsResponse {
  // Format retourné par /api/organizer/analytics
  stats: {
    totalVolume: number;
    activeMembers: number;
    collectionRate: number | null;
    paymentsThisMonth: { confirmed: number; total: number };
  };
  cashflow: Array<{ month: string; total: number }>;
  nextPayout: {
    circleId: string;
    circleName: string;
    date: string;
    daysLeft: number;
  } | null;
  topMembers: Array<{ userId: string; name: string; paymentsCount: number }>;
  // Champs legacy (au cas où)
  volume?: number;
  activeMembers?: number;
  collectionRate?: number | null;
  paymentsThisMonth?: { confirmed: number; total: number };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchApi("/organizer/analytics")
      .then((response: AnalyticsResponse) => {
        if (!isMounted) return;
        setData(response);
      })
      .catch((err: Error) => {
        if (!isMounted) return;
        setError(err.message || "Erreur lors du chargement des statistiques");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      label: "Volume Géré",
      value: loading ? "—" : `${(data?.stats?.totalVolume ?? data?.volume ?? 0).toLocaleString("fr-FR")} FCFA`,
      icon: Wallet,
      bg: "bg-[#ffd803]/20",
    },
    {
      label: "Membres Actifs",
      value: loading ? "—" : String(data?.stats?.activeMembers ?? data?.activeMembers ?? 0),
      icon: Users,
      bg: "bg-[#bae8e8]",
    },
    {
      label: "Taux de Recouvrement",
      value: loading
        ? "—"
        : (data?.stats?.collectionRate ?? data?.collectionRate) != null
          ? `${data?.stats?.collectionRate ?? data?.collectionRate}%`
          : "N/A",
      icon: TrendingUp,
      bg: "bg-[#e3f6f5]",
    },
    {
      label: "Paiements ce Mois",
      value: loading
        ? "—"
        : (() => {
            const p = data?.stats?.paymentsThisMonth ?? data?.paymentsThisMonth;
            return p ? `${p.confirmed}/${p.total}` : "0/0";
          })(),
      icon: Activity,
      bg: "bg-[#f25f4c]/10",
    },
  ];

  const cashflowMax = useMemo(() => {
    if (!data?.cashflow?.length) return 0;
    return Math.max(...data.cashflow.map((entry) => entry.total));
  }, [data]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-4xl font-black text-[#272343] tracking-tight">
          Tableau de <span className="text-[#ffd803]">Bord</span>
        </h1>
        <p className="text-[#2d334a]/60 mt-2 font-medium italic">
          Suivez la santé financière de vos tontines et l'activité de vos membres.
        </p>
      </div>

      {error && (
        <div className="bg-[#f25f4c]/10 border border-[#f25f4c] text-[#f25f4c] px-4 py-3 rounded-2xl font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[24px] border border-[#dfe5f2] shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                <stat.icon size={22} className="text-[#272343]" />
              </div>
            </div>
            <p className="text-[#2d334a]/40 text-xs font-bold uppercase tracking-widest leading-none">
              {stat.label}
            </p>
            <h3 className="text-2xl font-black text-[#272343] mt-2 tracking-tight">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-[#dfe5f2] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-[#ffd803]" />
              <h2 className="text-xl font-black text-[#272343]">Flux de Trésorerie</h2>
            </div>
            <select className="bg-[#f8fafc] border border-[#dfe5f2] rounded-xl px-4 py-2 text-sm font-bold text-[#272343] outline-none active:scale-95 transition-all">
              <option>6 derniers mois</option>
              <option>Cette année</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full bg-[#f8fafc] rounded-2xl border-2 border-dashed border-[#dfe5f2] p-6">
            {!data?.cashflow?.length ? (
              <div className="h-full flex flex-col items-center justify-center text-[#2d334a]/30">
                <BarChart3 size={48} className="mb-2 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-[10px]">
                  {loading ? "Chargement des donnees..." : "Aucune donnee disponible"}
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-end gap-3">
                {data.cashflow.map((entry) => {
                  const width = cashflowMax ? Math.round((entry.total / cashflowMax) * 100) : 0;
                  return (
                    <div key={entry.month} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#2d334a]/40">
                        <span>{entry.month}</span>
                        <span>{entry.total.toLocaleString("fr-FR")} CFA</span>
                      </div>
                      <div className="h-2 rounded-full bg-white border border-[#dfe5f2] overflow-hidden">
                        <div
                          className="h-full bg-[#bae8e8]"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#272343] rounded-[32px] p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-lg font-black mb-2">Prochain Versement</h3>
              {data?.nextPayout ? (
                <>
                  <p className="text-white/60 text-sm mb-6 uppercase tracking-wider font-bold">
                    Cercle: {data.nextPayout.circleName}
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#ffd803]">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-black italic">
                        {new Date(data.nextPayout.date).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                        })}
                      </p>
                      <p className="text-xs text-[#ffd803] font-bold uppercase">
                        Dans {data.nextPayout.daysLeft} jours
                      </p>
                    </div>
                  </div>
                  <button className="w-full bg-[#ffd803] text-[#272343] py-4 rounded-2xl font-black text-sm hover:bg-white transition-all active:scale-95 shadow-lg shadow-[#ffd803]/10">
                    Gerer le Cercle
                  </button>
                </>
              ) : (
                <p className="text-white/60 text-sm font-bold uppercase tracking-wider">
                  {loading ? "Chargement..." : "Aucun versement planifie"}
                </p>
              )}
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#ffd803] rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-[#dfe5f2] shadow-sm">
            <h3 className="text-[#272343] font-black mb-4">Membres Actifs</h3>
            {!data?.topMembers?.length ? (
              <p className="text-[#2d334a]/40 text-xs font-bold uppercase tracking-widest">
                {loading ? "Chargement..." : "Aucune activite recente"}
              </p>
            ) : (
              <div className="space-y-4">
                {data.topMembers.map((member, index) => (
                  <div key={member.userId} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#bae8e8] flex items-center justify-center font-black text-[#272343] text-sm">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div>
                        <p className="font-black text-[#272343] text-sm italic">{member.name}</p>
                        <p className="text-[10px] text-[#2d334a]/40 font-bold uppercase tracking-widest">
                          {member.paymentsCount} cotisations
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#f8fafc] flex items-center justify-center group-hover:bg-[#42c88f]/10 transition-colors">
                      <TrendingUp size={14} className="text-[#42c88f]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
