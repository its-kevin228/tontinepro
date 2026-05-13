"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import {
  Plus,
  LayoutGrid,
  List,
  ArrowLeft,
  Loader2,
  Search,
  Users,
  Wallet,
  ArrowUpRight,
  X,
} from "lucide-react";
import Link from "next/link";

type ViewMode = "grid" | "list";
type StatusFilter = "ALL" | "ACTIVE" | "PENDING" | "CLOSED";

const FREQ_LABELS: Record<string, string> = {
  WEEKLY: "Hebdo",
  BIWEEKLY: "Bimensuel",
  MONTHLY: "Mensuel",
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE:  { label: "En cours",  color: "bg-[#42c88f]/10 text-[#42c88f]" },
  PENDING: { label: "En cours",  color: "bg-[#42c88f]/10 text-[#42c88f]" }, // legacy
  CLOSED:  { label: "Terminé",   color: "bg-[#dfe5f2] text-[#2d334a]/60" },
};

export default function MyCirclesPage() {
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    fetchApi("/circles")
      .then((data) => setCircles(data.circles || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Filtrage combiné : recherche + statut
  const filtered = useMemo(() => {
    return circles.filter((c) => {
      const matchSearch =
        search.trim() === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description ?? "").toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" || c.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [circles, search, statusFilter]);

  const statusFilters: { label: string; value: StatusFilter }[] = [
    { label: "Tous", value: "ALL" },
    { label: "Actifs", value: "ACTIVE" },
    { label: "En attente", value: "PENDING" },
    { label: "Clôturés", value: "CLOSED" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#2d334a]/40 hover:text-[#272343] mb-3 text-sm font-bold transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Dashboard
          </Link>
          <h1 className="text-3xl font-black text-[#272343] tracking-tight">
            Mes <span className="text-[#ffd803]">Cercles</span>
          </h1>
          <p className="text-sm text-[#2d334a]/40 font-medium mt-0.5">
            {circles.length} cercle{circles.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <Link
          href="/dashboard/circles/new"
          className="btn-primary flex items-center gap-2 px-6 py-3 shadow-sm hover:-translate-y-0.5 transition-all"
        >
          <Plus className="h-5 w-5" /> Nouveau cercle
        </Link>
      </div>

      {/* Barre de recherche + filtres + toggle vue */}
      <div className="flex flex-col gap-3">
        {/* Ligne 1 : recherche + toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2d334a]/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un cercle…"
              className="w-full h-11 pl-11 pr-10 bg-white border border-[#dfe5f2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd803] transition-all placeholder:text-[#2d334a]/30"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#2d334a]/30 hover:text-[#272343] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Toggle grid / liste */}
          <div className="flex items-center bg-[#f8fafc] border border-[#dfe5f2] rounded-xl p-1 gap-1 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-[#272343]"
                  : "text-[#2d334a]/30 hover:text-[#272343]"
              }`}
              title="Vue grille"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-[#272343]"
                  : "text-[#2d334a]/30 hover:text-[#272343]"
              }`}
              title="Vue liste"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Ligne 2 : filtres statut */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                statusFilter === f.value
                  ? "bg-[#272343] text-[#ffd803]"
                  : "bg-[#f8fafc] text-[#2d334a]/60 border border-[#dfe5f2] hover:border-[#272343]"
              }`}
            >
              {f.label}
              {f.value !== "ALL" && (
                <span className="ml-1.5 opacity-60">
                  {circles.filter((c) => c.status === f.value).length}
                </span>
              )}
            </button>
          ))}

          {/* Résultat de la recherche */}
          {(search || statusFilter !== "ALL") && (
            <span className="text-xs text-[#2d334a]/40 font-medium ml-1">
              {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#ffd803]" />
          <p className="text-sm text-[#2d334a]/40 font-medium">Chargement…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-[#dfe5f2] rounded-[32px]">
          <Users className="h-10 w-10 text-[#2d334a]/20 mx-auto mb-4" />
          <p className="font-black text-[#272343]">
            {search || statusFilter !== "ALL"
              ? "Aucun cercle ne correspond à votre recherche"
              : "Aucun cercle pour le moment"}
          </p>
          <p className="text-sm text-[#2d334a]/40 font-medium mt-1 mb-6">
            {search || statusFilter !== "ALL"
              ? "Essayez de modifier vos filtres."
              : "Créez votre premier cercle pour commencer."}
          </p>
          {!search && statusFilter === "ALL" && (
            <Link href="/dashboard/circles/new" className="btn-primary px-6 inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Créer un cercle
            </Link>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* ── Vue Grille ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((circle) => {
            const statusCfg = STATUS_CONFIG[circle.status] ?? STATUS_CONFIG.PENDING;
            return (
              <Link
                key={circle.id}
                href={`/dashboard/circles/${circle.id}`}
                className="card-base group hover:border-[#ffd803] transition-all flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#2d334a]/20 group-hover:text-[#ffd803] transition-all" />
                </div>

                <h3 className="font-black text-[#272343] text-lg leading-tight mb-1">
                  {circle.name}
                </h3>
                <p className="text-sm text-[#2d334a]/50 font-medium line-clamp-2 mb-4 flex-1">
                  {circle.description || "Aucune description."}
                </p>

                <div className="pt-4 border-t border-[#dfe5f2] grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[9px] uppercase font-black tracking-widest text-[#2d334a]/30">
                      Cotisation
                    </p>
                    <p className="text-sm font-black text-[#272343] mt-0.5">
                      {circle.amount.toLocaleString("fr-FR")}
                      <span className="text-[9px] font-normal ml-0.5">FCFA</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-black tracking-widest text-[#2d334a]/30">
                      Fréquence
                    </p>
                    <p className="text-sm font-black text-[#272343] mt-0.5">
                      {FREQ_LABELS[circle.frequency] ?? circle.frequency}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-black tracking-widest text-[#2d334a]/30">
                      Membres
                    </p>
                    <p className="text-sm font-black text-[#272343] mt-0.5">
                      {circle.memberships?.length ?? 0}/{circle.maxMembers}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* ── Vue Liste ── */
        <div className="divide-y divide-[#dfe5f2] border border-[#dfe5f2] rounded-2xl overflow-hidden bg-white">
          {filtered.map((circle) => {
            const statusCfg = STATUS_CONFIG[circle.status] ?? STATUS_CONFIG.PENDING;
            return (
              <Link
                key={circle.id}
                href={`/dashboard/circles/${circle.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#f8fafc] transition-colors group"
              >
                {/* Icône */}
                <div className="w-10 h-10 bg-[#e3f6f5] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#ffd803]/10 transition-colors">
                  <Users className="h-5 w-5 text-[#272343]" />
                </div>

                {/* Nom + description */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[#272343] text-sm truncate">{circle.name}</p>
                  <p className="text-xs text-[#2d334a]/40 font-medium truncate">
                    {circle.description || "Aucune description"}
                  </p>
                </div>

                {/* Infos */}
                <div className="hidden md:flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-black tracking-widest text-[#2d334a]/30">
                      Cotisation
                    </p>
                    <p className="text-sm font-black text-[#272343]">
                      {circle.amount.toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-black tracking-widest text-[#2d334a]/30">
                      Membres
                    </p>
                    <p className="text-sm font-black text-[#272343]">
                      {circle.memberships?.length ?? 0}/{circle.maxMembers}
                    </p>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>

                <ArrowUpRight className="h-4 w-4 text-[#2d334a]/20 group-hover:text-[#ffd803] transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
