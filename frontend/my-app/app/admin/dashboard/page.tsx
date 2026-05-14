"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  Users,
  CircleDot,
  CreditCard,
  ShieldAlert,
  Wallet,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  activeCircles: number;
  totalPayments: number;
  pendingKyc: number;
  totalVolume: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await fetchApi("/admin/dashboard");
      setStats(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetchApi("/admin/dashboard");
        setStats(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const cards = stats
    ? [
        {
          label: "Utilisateurs inscrits",
          value: stats.totalUsers.toLocaleString("fr-FR"),
          icon: Users,
          color: "bg-[#bae8e8]",
          trend: null,
        },
        {
          label: "Cercles actifs",
          value: stats.activeCircles.toLocaleString("fr-FR"),
          icon: CircleDot,
          color: "bg-[#ffd803]/20",
          trend: null,
        },
        {
          label: "Paiements enregistrés",
          value: stats.totalPayments.toLocaleString("fr-FR"),
          icon: CreditCard,
          color: "bg-[#e3f6f5]",
          trend: null,
        },
        {
          label: "KYC en attente",
          value: stats.pendingKyc.toLocaleString("fr-FR"),
          icon: ShieldAlert,
          color: stats.pendingKyc > 0 ? "bg-[#f25f4c]/10" : "bg-[#42c88f]/10",
          trend: stats.pendingKyc > 0 ? "warning" : "ok",
        },
        {
          label: "Volume total confirmé",
          value: `${stats.totalVolume.toLocaleString("fr-FR")} FCFA`,
          icon: Wallet,
          color: "bg-[#272343]/5",
          trend: null,
        },
      ]
    : [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#272343] tracking-tight">
            Dashboard <span className="text-[#ffd803]">Global</span>
          </h1>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Vue d&apos;ensemble de la plateforme TontinePro.
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-bold text-sm text-[#272343] hover:bg-[#e3f6f5] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[#f25f4c]/10 border border-[#f25f4c]/20 text-[#f25f4c] rounded-2xl font-bold text-sm">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card-base h-32 animate-pulse bg-[#f8fafc] border-[#f0f0f0]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div
              key={i}
              className="card-base flex items-center gap-5 group hover:border-[#ffd803] transition-all"
            >
              <div
                className={`p-4 ${card.color} rounded-2xl group-hover:scale-110 transition-transform shrink-0`}
              >
                <card.icon
                  className={`h-6 w-6 ${
                    card.trend === "warning" ? "text-[#f25f4c]" : "text-[#272343]"
                  }`}
                />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-[#2d334a]/40">
                  {card.label}
                </p>
                <p
                  className={`text-2xl font-black mt-0.5 ${
                    card.trend === "warning" ? "text-[#f25f4c]" : "text-[#272343]"
                  }`}
                >
                  {card.value}
                </p>
                {card.trend === "warning" && (
                  <p className="text-[10px] text-[#f25f4c] font-bold mt-0.5">
                    Action requise
                  </p>
                )}
                {card.trend === "ok" && (
                  <p className="text-[10px] text-[#42c88f] font-bold mt-0.5">
                    Tout est à jour
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Indicateurs de santé */}
      <div className="card-base">
        <h2 className="text-xl font-black text-[#272343] mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#ffd803]" />
          Indicateurs de santé
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* KYC */}
          <div className="p-5 bg-[#f8fafc] rounded-2xl border border-[#dfe5f2]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">
                KYC
              </p>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  (stats?.pendingKyc ?? 0) > 0
                    ? "bg-[#f25f4c]/10 text-[#f25f4c]"
                    : "bg-[#42c88f]/10 text-[#42c88f]"
                }`}
              >
                {(stats?.pendingKyc ?? 0) > 0 ? "En attente" : "OK"}
              </span>
            </div>
            <p className="text-3xl font-black text-[#272343]">
              {loading ? "—" : stats?.pendingKyc}
            </p>
            <p className="text-xs text-[#2d334a]/60 font-medium mt-1">
              demandes à traiter
            </p>
          </div>

          {/* Cercles */}
          <div className="p-5 bg-[#f8fafc] rounded-2xl border border-[#dfe5f2]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">
                Cercles
              </p>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#42c88f]/10 text-[#42c88f]">
                Actifs
              </span>
            </div>
            <p className="text-3xl font-black text-[#272343]">
              {loading ? "—" : stats?.activeCircles}
            </p>
            <p className="text-xs text-[#2d334a]/60 font-medium mt-1">
              cercles en cours
            </p>
          </div>

          {/* Volume */}
          <div className="p-5 bg-[#272343] rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black uppercase tracking-widest text-white/40">
                Volume
              </p>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#ffd803]/20 text-[#ffd803]">
                Confirmé
              </span>
            </div>
            <p className="text-2xl font-black text-white">
              {loading ? "—" : `${(stats?.totalVolume ?? 0).toLocaleString("fr-FR")}`}
            </p>
            <p className="text-xs text-white/40 font-medium mt-1">FCFA gérés</p>
          </div>
        </div>
      </div>

      {/* Raccourcis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            href: "/admin/kyc",
            label: "Gérer les KYC",
            desc: "Approuver ou rejeter les demandes",
            color: "border-[#ffd803] hover:bg-[#ffd803]/5",
          },
          {
            href: "/admin/users",
            label: "Gérer les utilisateurs",
            desc: "Voir, bannir ou débannir",
            color: "border-[#bae8e8] hover:bg-[#bae8e8]/20",
          },
          {
            href: "/admin/settings",
            label: "Paramètres plateforme",
            desc: "Configurer les frais de service",
            color: "border-[#dfe5f2] hover:bg-[#f8fafc]",
          },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`card-base border-2 ${item.color} transition-all group`}
          >
            <p className="font-black text-[#272343] group-hover:text-[#272343]">
              {item.label}
            </p>
            <p className="text-sm text-[#2d334a]/60 font-medium mt-1">{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
