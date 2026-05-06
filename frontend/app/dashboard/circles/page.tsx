"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { circleApi, type Circle } from "@/lib/api";
import {
  Plus, Users, TrendingUp, Calendar, Lock, Globe,
  ArrowRight, Search, Filter
} from "lucide-react";

// ─── Badge statut ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Circle["status"] }) {
  const map = {
    ACTIVE:  { cls: "badge-success", label: "Actif" },
    PENDING: { cls: "badge-warning", label: "En attente" },
    CLOSED:  { cls: "badge-neutral", label: "Fermé" },
  };
  const { cls, label } = map[status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ─── Carte cercle ─────────────────────────────────────────────────────────────
function CircleCard({ circle }: { circle: Circle }) {
  const memberCount = circle.memberships?.length ?? 0;
  const isOrganisateur = circle.memberships?.some(
    (m) => m.role === "ORGANISATEUR"
  );

  return (
    <Link
      href={`/dashboard/circles/${circle.id}`}
      className="card group block hover:no-underline"
      style={{ cursor: "pointer" }}
    >
      {/* En-tête de la carte */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ background: "var(--surface-alt)", color: "var(--text-primary)" }}
        >
          {circle.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex items-center gap-2">
          {isOrganisateur && (
            <span className="badge badge-info text-xs">Organisateur</span>
          )}
          <StatusBadge status={circle.status} />
        </div>
      </div>

      {/* Nom & description */}
      <h3
        className="font-semibold text-base mb-1 group-hover:underline"
        style={{ color: "var(--text-primary)" }}
      >
        {circle.name}
      </h3>
      {circle.description && (
        <p
          className="text-sm mb-4 line-clamp-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {circle.description}
        </p>
      )}

      {/* Méta-données */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <TrendingUp size={13} />
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            {circle.amount.toLocaleString("fr-FR")} FCFA
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <Calendar size={13} />
          {circle.frequency === "MONTHLY" ? "Mensuel" : "Hebdomadaire"}
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
          <Users size={13} />
          {memberCount} / {circle.maxMembers} membres
        </div>
        <div className="flex items-center gap-1.5 text-xs ml-auto" style={{ color: "var(--text-secondary)" }}>
          {circle.isPublic ? <Globe size={13} /> : <Lock size={13} />}
          {circle.isPublic ? "Public" : "Privé"}
        </div>
      </div>

      {/* Barre de progression membres */}
      <div className="mt-3">
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--surface-alt)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (memberCount / circle.maxMembers) * 100)}%`,
              background:
                memberCount === circle.maxMembers
                  ? "var(--success)"
                  : "var(--accent)",
            }}
          />
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function CircleSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl" style={{ background: "var(--surface-alt)" }} />
        <div className="w-16 h-6 rounded-full" style={{ background: "var(--surface-alt)" }} />
      </div>
      <div className="h-5 w-2/3 rounded-lg mb-2" style={{ background: "var(--surface-alt)" }} />
      <div className="h-4 w-full rounded-lg mb-1" style={{ background: "var(--surface-alt)" }} />
      <div className="h-4 w-4/5 rounded-lg" style={{ background: "var(--surface-alt)" }} />
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function CirclesPage() {
  const { user } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [filtered, setFiltered] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    circleApi.getAll()
      .then((res) => {
        setCircles(res.circles);
        setFiltered(res.circles);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filtrage dynamique
  useEffect(() => {
    let result = circles;
    if (search) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter((c) => c.status === statusFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, circles]);

  const canCreate = user?.role === "ORGANISATEUR" || user?.role === "SUPER_ADMIN";

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Mes cercles</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {circles.length} cercle{circles.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        {canCreate && (
          <Link href="/dashboard/circles/new" className="btn-primary">
            <Plus size={16} /> Nouveau cercle
          </Link>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-secondary)" }}
          />
          <input
            type="text"
            className="input pl-10"
            placeholder="Rechercher un cercle…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filtre statut */}
        <div className="relative">
          <Filter
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-secondary)" }}
          />
          <select
            className="input pl-9 pr-8 appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: "160px", cursor: "pointer" }}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="PENDING">En attente</option>
            <option value="CLOSED">Fermés</option>
          </select>
        </div>
      </div>

      {/* Grille des cercles */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <CircleSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="card text-center py-16"
          style={{ border: "2px dashed var(--border)" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--surface-alt)" }}
          >
            <Users size={28} style={{ color: "var(--text-secondary)" }} />
          </div>
          <h3 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            {search || statusFilter !== "ALL"
              ? "Aucun résultat trouvé"
              : "Vous n'avez pas encore de cercle"}
          </h3>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            {search || statusFilter !== "ALL"
              ? "Essayez avec d'autres filtres"
              : canCreate
              ? "Créez votre premier cercle de tontine"
              : "Rejoignez un cercle via un lien d'invitation"}
          </p>
          {canCreate && !search && statusFilter === "ALL" && (
            <Link href="/dashboard/circles/new" className="btn-primary inline-flex">
              <Plus size={16} /> Créer un cercle
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((circle) => (
            <CircleCard key={circle.id} circle={circle} />
          ))}
        </div>
      )}

      {/* Bloc KYC pour les membres voulant devenir organisateurs */}
      {user?.role === "MEMBRE" && !user.kycRequest && (
        <div
          className="card flex items-center gap-4 mt-4"
          style={{ background: "var(--surface-alt)", border: "none" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{ background: "var(--accent)", color: "var(--text-primary)" }}
          >
            🏆
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              Devenez organisateur
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Vérifiez votre identité pour créer et gérer vos propres cercles
            </p>
          </div>
          <Link href="/dashboard/settings?tab=kyc" className="btn-secondary text-sm px-4 py-2">
            Vérifier mon identité <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
