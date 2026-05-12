"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  AlertTriangle, Plus, X, Loader2, RefreshCw, Clock, CheckCircle2, Search,
} from "lucide-react";

interface Dispute {
  id: string;
  subject: string;
  description: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";
  resolution: string | null;
  createdAt: string;
  circle: { id: string; name: string };
}

interface Circle { id: string; name: string }

const STATUS_CONFIG = {
  OPEN:      { label: "Ouvert",      color: "bg-[#f25f4c]/10 text-[#f25f4c]",   icon: AlertTriangle },
  IN_REVIEW: { label: "En cours",    color: "bg-[#ffd803]/10 text-[#b38a00]",   icon: Clock },
  RESOLVED:  { label: "Résolu",      color: "bg-[#42c88f]/10 text-[#42c88f]",   icon: CheckCircle2 },
  CLOSED:    { label: "Clôturé",     color: "bg-[#dfe5f2] text-[#2d334a]/60",   icon: CheckCircle2 },
};

export default function DisputesPage() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({ circleId: "", subject: "", description: "" });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [disputesData, circlesData] = await Promise.all([
        fetchApi("/disputes/me"),
        fetchApi("/circles/joined"),
      ]);
      setDisputes(disputesData.disputes);
      setCircles(circlesData.circles || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.circleId) { setFormError("Sélectionnez un cercle"); return; }
    if (!form.subject.trim()) { setFormError("Le sujet est requis"); return; }
    if (form.description.trim().length < 20) { setFormError("La description doit faire au moins 20 caractères"); return; }

    setSubmitting(true);
    try {
      await fetchApi("/disputes", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShowForm(false);
      setForm({ circleId: "", subject: "", description: "" });
      fetchData();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#272343] tracking-tight">
            Mes <span className="text-[#ffd803]">Litiges</span>
          </h1>
          <p className="text-sm text-[#2d334a]/40 font-medium mt-0.5">
            Signalez un problème dans un cercle.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} disabled={loading} className="p-2 text-[#2d334a]/40 hover:text-[#272343] hover:bg-[#f8fafc] rounded-xl transition-all">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Plus className="h-4 w-4" /> Signaler
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-[#f25f4c] font-bold">{error}</p>}

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#ffd803]" /></div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-[#dfe5f2] rounded-[32px]">
          <AlertTriangle className="h-10 w-10 text-[#2d334a]/20 mx-auto mb-3" />
          <p className="font-black text-[#272343]">Aucun litige</p>
          <p className="text-sm text-[#2d334a]/40 font-medium mt-1">
            Vous n'avez signalé aucun problème pour le moment.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#dfe5f2] border border-[#dfe5f2] rounded-2xl overflow-hidden bg-white">
          {disputes.map((d) => {
            const cfg = STATUS_CONFIG[d.status];
            const Icon = cfg.icon;
            return (
              <div key={d.id} className="p-5 hover:bg-[#f8fafc] transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="font-black text-[#272343] text-sm">{d.subject}</p>
                  <span className={`flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-lg shrink-0 ${cfg.color}`}>
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-[#2d334a]/60 font-medium line-clamp-2 mb-2">{d.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#2d334a]/40 font-bold uppercase tracking-widest">
                    {d.circle.name}
                  </span>
                  <span className="text-[10px] text-[#2d334a]/40 font-medium">
                    {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                {d.resolution && (
                  <div className="mt-3 p-3 bg-[#42c88f]/5 border border-[#42c88f]/20 rounded-xl">
                    <p className="text-xs font-black text-[#42c88f] mb-1">Résolution</p>
                    <p className="text-xs text-[#272343] font-medium">{d.resolution}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-[#272343]">Signaler un litige</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-[#f8fafc] rounded-xl transition-all">
                <X className="h-5 w-5 text-[#2d334a]/60" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">Cercle concerné *</label>
                <select
                  value={form.circleId}
                  onChange={(e) => setForm({ ...form, circleId: e.target.value })}
                  className="input-base"
                >
                  <option value="">-- Sélectionner un cercle --</option>
                  {circles.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">Sujet *</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Ex: Paiement non enregistré"
                  className="input-base"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Décrivez le problème en détail (min. 20 caractères)…"
                  rows={4}
                  className="input-base resize-none"
                />
                <p className="text-[10px] text-[#2d334a]/40 font-medium text-right">
                  {form.description.length} / 20 min
                </p>
              </div>

              {formError && (
                <p className="text-sm text-[#f25f4c] font-bold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />{formError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-black text-[#272343] hover:bg-[#e3f6f5] transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 bg-[#272343] text-[#ffd803] rounded-xl font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                  Signaler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
