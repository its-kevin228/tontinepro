"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  AlertTriangle, Clock, CheckCircle2, RefreshCw, Loader2, Filter, X,
} from "lucide-react";

type DisputeStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";

interface Dispute {
  id: string;
  subject: string;
  description: string;
  status: DisputeStatus;
  resolution: string | null;
  createdAt: string;
  circle: { id: string; name: string };
  reporter: { id: string; name: string; email: string };
}

const STATUS_CONFIG: Record<DisputeStatus, { label: string; color: string; icon: React.ElementType }> = {
  OPEN:      { label: "Ouvert",    color: "bg-[#f25f4c]/10 text-[#f25f4c]",  icon: AlertTriangle },
  IN_REVIEW: { label: "En cours",  color: "bg-[#ffd803]/10 text-[#b38a00]",  icon: Clock },
  RESOLVED:  { label: "Résolu",    color: "bg-[#42c88f]/10 text-[#42c88f]",  icon: CheckCircle2 },
  CLOSED:    { label: "Clôturé",   color: "bg-[#dfe5f2] text-[#2d334a]/60",  icon: CheckCircle2 },
};

import { useToast } from "@/lib/toast";

export default function AdminDisputesPage() {
  const { success, error: toastError } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DisputeStatus | "ALL">("OPEN");
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");
  const [newStatus, setNewStatus] = useState<DisputeStatus>("RESOLVED");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputes = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== "ALL" ? `?status=${filter}` : "";
      const data = await fetchApi(`/disputes${params}`);
      setDisputes(data.disputes);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDisputes(); }, [filter]);

  const handleResolve = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await fetchApi(`/disputes/${selected.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus, resolution: resolution || undefined }),
      });
      setSelected(null);
      setResolution("");
      fetchDisputes();
      success("Litige mis à jour");
    } catch (e: any) {
      toastError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const filters: { label: string; value: DisputeStatus | "ALL" }[] = [
    { label: "Ouverts", value: "OPEN" },
    { label: "En cours", value: "IN_REVIEW" },
    { label: "Résolus", value: "RESOLVED" },
    { label: "Tous", value: "ALL" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#272343] tracking-tight">
            Gestion <span className="text-[#ffd803]">Litiges</span>
          </h1>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Traitez les signalements des membres.
          </p>
        </div>
        <button onClick={fetchDisputes} disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-bold text-sm text-[#272343] hover:bg-[#e3f6f5] transition-all disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-[#2d334a]/40" />
        {filters.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
              filter === f.value ? "bg-[#272343] text-[#ffd803]" : "bg-[#f8fafc] text-[#2d334a]/60 border border-[#dfe5f2] hover:border-[#272343]"
            }`}>
            {f.label}
            {f.value !== "ALL" && (
              <span className="ml-1.5 opacity-60">
                {disputes.filter((d) => d.status === f.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-[#f25f4c] font-bold">{error}</p>}

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-base h-24 animate-pulse bg-[#f8fafc] border-[#f0f0f0]" />
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="card-base text-center py-20">
          <CheckCircle2 className="h-12 w-12 text-[#42c88f] mx-auto mb-4" />
          <p className="font-black text-[#272343] text-lg">Aucun litige</p>
          <p className="text-[#2d334a]/60 font-medium mt-1">Aucun signalement dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => {
            const cfg = STATUS_CONFIG[d.status];
            const Icon = cfg.icon;
            return (
              <div key={d.id}
                className="card-base hover:border-[#ffd803] transition-all cursor-pointer"
                onClick={() => { setSelected(d); setNewStatus(d.status === "OPEN" ? "IN_REVIEW" : "RESOLVED"); }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#e3f6f5] rounded-2xl flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5 text-[#272343]" />
                    </div>
                    <div>
                      <p className="font-black text-[#272343]">{d.subject}</p>
                      <p className="text-sm text-[#2d334a]/60 font-medium mt-0.5 line-clamp-1">{d.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-[#2d334a]/40 uppercase tracking-widest">
                          {d.circle.name}
                        </span>
                        <span className="text-[10px] text-[#2d334a]/40">·</span>
                        <span className="text-[10px] font-bold text-[#2d334a]/40">
                          {d.reporter.name}
                        </span>
                        <span className="text-[10px] text-[#2d334a]/40">·</span>
                        <span className="text-[10px] text-[#2d334a]/40">
                          {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shrink-0 ${cfg.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal traitement */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-[#272343]">Traiter le litige</h3>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-[#f8fafc] rounded-xl transition-all">
                <X className="h-5 w-5 text-[#2d334a]/60" />
              </button>
            </div>

            <div className="p-4 bg-[#f8fafc] rounded-2xl border border-[#dfe5f2] mb-6">
              <p className="font-black text-[#272343] text-sm">{selected.subject}</p>
              <p className="text-xs text-[#2d334a]/60 font-medium mt-1">{selected.description}</p>
              <p className="text-[10px] text-[#2d334a]/40 font-bold uppercase tracking-widest mt-2">
                {selected.reporter.name} · {selected.circle.name}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">Nouveau statut</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as DisputeStatus)}
                  className="input-base">
                  <option value="IN_REVIEW">En cours d&apos;examen</option>
                  <option value="RESOLVED">Résolu</option>
                  <option value="CLOSED">Clôturé</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">
                  Résolution / Note (optionnel)
                </label>
                <textarea value={resolution} onChange={(e) => setResolution(e.target.value)}
                  placeholder="Expliquez la décision prise…"
                  rows={3}
                  className="input-base resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelected(null)}
                className="flex-1 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-black text-[#272343] hover:bg-[#e3f6f5] transition-all">
                Annuler
              </button>
              <button onClick={handleResolve} disabled={saving}
                className="flex-1 py-3 bg-[#272343] text-[#ffd803] rounded-xl font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
