"use client";

import { useEffect, useState } from "react";
import { adminApi, type AdminDashboard } from "@/lib/api";
import {
  Users, Circle, CreditCard, FileCheck, TrendingUp,
  AlertTriangle, Activity
} from "lucide-react";

// ─── Carte stat ───────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
  alert = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  alert?: boolean;
}) {
  const bg = accent
    ? "var(--text-primary)"
    : alert && Number(value) > 0
    ? "rgba(242,95,76,0.06)"
    : "var(--surface)";
  const iconBg = accent
    ? "rgba(255,216,3,0.15)"
    : alert && Number(value) > 0
    ? "rgba(242,95,76,0.12)"
    : "var(--surface-alt)";
  const iconColor = accent
    ? "var(--accent)"
    : alert && Number(value) > 0
    ? "var(--error)"
    : "var(--text-secondary)";
  const textColor = accent ? "#fffffe" : "var(--text-primary)";
  const subColor = accent ? "#a7a9be" : "var(--text-secondary)";

  return (
    <div className="card flex items-start gap-4" style={{ background: bg, border: accent ? "none" : undefined }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <Icon size={20} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-sm mb-1" style={{ color: subColor }}>{label}</p>
        <p className="text-2xl font-bold" style={{ color: textColor }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: subColor }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl" style={{ background: "var(--surface-alt)" }} />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-24 rounded" style={{ background: "var(--surface-alt)" }} />
          <div className="h-7 w-16 rounded" style={{ background: "var(--surface-alt)" }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">

      {/* En-tête */}
      <div>
        <h1 className="page-title">Dashboard Admin</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Vue globale de la plateforme TontinePro
        </p>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} />)
        ) : data ? (
          <>
            <StatCard
              icon={TrendingUp}
              label="Volume total confirmé"
              value={`${data.totalVolume.toLocaleString("fr-FR")} FCFA`}
              sub="paiements confirmés"
              accent
            />
            <StatCard
              icon={Users}
              label="Utilisateurs inscrits"
              value={data.totalUsers}
              sub="comptes actifs"
            />
            <StatCard
              icon={Circle}
              label="Cercles actifs"
              value={data.activeCircles}
              sub="tontines en cours"
            />
            <StatCard
              icon={CreditCard}
              label="Paiements total"
              value={data.totalPayments}
              sub="toutes transactions"
            />
            <StatCard
              icon={FileCheck}
              label="KYC en attente"
              value={data.pendingKyc}
              sub="demandes à traiter"
              alert
            />
            <StatCard
              icon={Activity}
              label="Taux de complétion"
              value={`${data.totalUsers > 0 ? Math.round((data.activeCircles / data.totalUsers) * 100) : 0}%`}
              sub="utilisateurs avec cercle"
            />
          </>
        ) : (
          <p style={{ color: "var(--error)" }}>Erreur de chargement</p>
        )}
      </div>

      {/* Alertes */}
      {!loading && data && data.pendingKyc > 0 && (
        <div
          className="card flex items-center gap-4"
          style={{ background: "rgba(242,95,76,0.05)", border: "1px solid rgba(242,95,76,0.2)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(242,95,76,0.12)" }}
          >
            <AlertTriangle size={18} style={{ color: "var(--error)" }} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              {data.pendingKyc} demande{data.pendingKyc > 1 ? "s" : ""} KYC en attente
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Des utilisateurs attendent votre validation pour devenir organisateurs
            </p>
          </div>
          <a href="/admin/kyc" className="btn-primary text-sm px-4 py-2 flex-shrink-0">
            Traiter →
          </a>
        </div>
      )}

      {/* Accès rapides */}
      <div>
        <h2 className="section-title text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Accès rapides
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { href: "/admin/users",    icon: Users,     label: "Gérer les utilisateurs", desc: "Voir, bannir, débannir" },
            { href: "/admin/kyc",      icon: FileCheck, label: "Valider les KYC",         desc: "Approuver ou rejeter" },
            { href: "/admin/settings", icon: TrendingUp,label: "Frais de service",         desc: "Modifier les paramètres" },
          ].map(({ href, icon: Icon, label, desc }) => (
            <a
              key={href}
              href={href}
              className="card flex items-center gap-4 hover:no-underline transition-transform hover:-translate-y-1"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--surface-alt)" }}
              >
                <Icon size={20} style={{ color: "var(--text-primary)" }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
