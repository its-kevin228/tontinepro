"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { circleApi, cycleApi, paymentApi, notificationApi, type Circle, type Notification } from "@/lib/api";
import {
  Users, CreditCard, Bell, TrendingUp, Plus, ArrowRight,
  CheckCircle, Clock, AlertCircle
} from "lucide-react";

// ─── Carte statistique ───────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="card flex items-start gap-4"
      style={accent ? { background: "var(--text-primary)", border: "none" } : {}}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: accent ? "rgba(255,216,3,0.15)" : "var(--surface-alt)",
        }}
      >
        <Icon size={20} style={{ color: accent ? "var(--accent)" : "var(--text-primary)" }} />
      </div>
      <div>
        <p className="text-sm mb-1" style={{ color: accent ? "#a7a9be" : "var(--text-secondary)" }}>
          {label}
        </p>
        <p className="text-2xl font-bold" style={{ color: accent ? "#fffffe" : "var(--text-primary)" }}>
          {value}
        </p>
        {sub && <p className="text-xs mt-0.5" style={{ color: accent ? "#a7a9be" : "var(--text-secondary)" }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Badge statut cercle ─────────────────────────────────────────────────────
function CircleStatusBadge({ status }: { status: Circle["status"] }) {
  const map = {
    ACTIVE:  { cls: "badge-success", label: "Actif" },
    PENDING: { cls: "badge-warning", label: "En attente" },
    CLOSED:  { cls: "badge-neutral", label: "Fermé" },
  };
  const { cls, label } = map[status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ─── Page principale ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({ confirmed: 0, pending: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [circlesRes, notifRes, paymentsRes] = await Promise.allSettled([
          circleApi.getAll(),
          notificationApi.getAll(),
          paymentApi.getAll(),
        ]);

        if (circlesRes.status === "fulfilled") setCircles(circlesRes.value.circles.slice(0, 4));
        if (notifRes.status === "fulfilled") setNotifications(notifRes.value.notifications.slice(0, 4));
        if (paymentsRes.status === "fulfilled") {
          const p = paymentsRes.value.payments;
          setStats({
            confirmed: p.filter((x) => x.status === "CONFIRMED").length,
            pending:   p.filter((x) => x.status === "PENDING").length,
            total:     p.reduce((s, x) => (x.status === "CONFIRMED" ? s + x.amount : s), 0),
          });
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded-xl" style={{ background: "var(--surface-alt)" }} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="h-28 rounded-2xl" style={{ background: "var(--surface-alt)" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        {user?.role !== "MEMBRE" && (
          <Link href="/dashboard/circles/new" className="btn-primary">
            <Plus size={16} /> Nouveau cercle
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Mes cercles"
          value={circles.length}
          sub="groupes actifs"
          accent
        />
        <StatCard
          icon={CreditCard}
          label="Paiements confirmés"
          value={stats.confirmed}
          sub="transactions"
        />
        <StatCard
          icon={Clock}
          label="En attente"
          value={stats.pending}
          sub="à valider"
        />
        <StatCard
          icon={TrendingUp}
          label="Volume total"
          value={`${stats.total.toLocaleString("fr-FR")} FCFA`}
          sub="cotisations confirmées"
        />
      </div>

      {/* Cercles + Notifications */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Mes cercles */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Mes cercles
            </h2>
            <Link
              href="/dashboard/circles"
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>

          {circles.length === 0 ? (
            <div className="text-center py-8">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Aucun cercle pour le moment
              </p>
              {user?.role !== "MEMBRE" && (
                <Link href="/dashboard/circles/new" className="btn-primary mt-4 inline-flex text-sm px-4 py-2">
                  Créer un cercle
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {circles.map((circle) => (
                <Link
                  key={circle.id}
                  href={`/dashboard/circles/${circle.id}`}
                  className="flex items-center justify-between p-3 rounded-xl transition-colors"
                  style={{ background: "var(--surface-alt)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-tertiary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-alt)")}
                >
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {circle.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {circle.amount.toLocaleString("fr-FR")} FCFA · {circle.frequency === "MONTHLY" ? "Mensuel" : "Hebdo"}
                    </p>
                  </div>
                  <CircleStatusBadge status={circle.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Notifications récentes */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Notifications
            </h2>
            <Link
              href="/dashboard/notifications"
              className="flex items-center gap-1 text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Aucune notification
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{
                    background: notif.read ? "transparent" : "var(--surface-alt)",
                    opacity: notif.read ? 0.7 : 1,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                    style={{ background: "var(--surface-tertiary)" }}
                  >
                    {notif.title.includes("✅") ? (
                      <CheckCircle size={14} style={{ color: "var(--success)" }} />
                    ) : notif.title.includes("❌") ? (
                      <AlertCircle size={14} style={{ color: "var(--error)" }} />
                    ) : (
                      <Bell size={14} style={{ color: "var(--text-secondary)" }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight" style={{ color: "var(--text-primary)" }}>
                      {notif.title}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
                      {notif.body}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                      {new Date(notif.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  {!notif.read && (
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: "var(--accent)" }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
