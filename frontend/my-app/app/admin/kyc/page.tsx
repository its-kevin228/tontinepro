"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchApi } from "@/lib/api";
import { useToast } from "@/lib/toast";
import {
  ShieldCheck, ShieldX, Clock, ExternalLink,
  Loader2, RefreshCw, Search, X, Bot, Eye,
} from "lucide-react";

type KycStatus = "PENDING" | "APPROVED" | "REJECTED";

interface KycRequest {
  id: string;
  documentUrl: string;
  status: KycStatus;
  reviewedAt: string | null;
  reviewNote: string | null;
  ocrConfidence: number | null;
  ocrAutoApproved: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

const STATUS_CONFIG: Record<KycStatus, { label: string; color: string; icon: React.ElementType }> = {
  PENDING:  { label: "En attente", color: "bg-[#ffd803]/10 text-[#b38a00]",  icon: Clock },
  APPROVED: { label: "Approuvé",   color: "bg-[#42c88f]/10 text-[#42c88f]",  icon: ShieldCheck },
  REJECTED: { label: "Rejeté",     color: "bg-[#f25f4c]/10 text-[#f25f4c]",  icon: ShieldX },
};

export default function AdminKycPage() {
  const { success, error: toastError } = useToast();
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<KycStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; action: "approve" | "reject" } | null>(null);
  const [note, setNote] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      // Toujours charger tous les KYC — le filtre se fait côté client
      const data = await fetchApi("/admin/kyc");
      setRequests(data.requests);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // Filtrage combiné : statut + recherche
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.user.name.toLowerCase().includes(q) ||
        r.user.email.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [requests, statusFilter, search]);

  // Compteurs par statut
  const counts = useMemo(() => ({
    ALL:      requests.length,
    PENDING:  requests.filter((r) => r.status === "PENDING").length,
    APPROVED: requests.filter((r) => r.status === "APPROVED").length,
    REJECTED: requests.filter((r) => r.status === "REJECTED").length,
  }), [requests]);

  const handleReview = async () => {
    if (!noteModal) return;
    setActionLoading(noteModal.id);
    try {
      await fetchApi(`/admin/kyc/${noteModal.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: noteModal.action, note }),
      });
      setNoteModal(null);
      setNote("");
      fetchRequests();
      success(noteModal.action === "approve" ? "KYC approuvé" : "KYC rejeté");
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp)$/i.test(url);

  const statusTabs: { label: string; value: KycStatus | "ALL" }[] = [
    { label: "Tous",        value: "ALL" },
    { label: "En attente",  value: "PENDING" },
    { label: "Approuvés",   value: "APPROVED" },
    { label: "Rejetés",     value: "REJECTED" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#272343] tracking-tight">
            Validation <span className="text-[#ffd803]">KYC</span>
          </h1>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            {requests.length} demande{requests.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <button onClick={fetchRequests} disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-bold text-sm text-[#272343] hover:bg-[#e3f6f5] transition-all disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Barre de recherche + onglets statut */}
      <div className="space-y-3">
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2d334a]/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email…"
            className="w-full h-11 pl-11 pr-10 bg-white border border-[#dfe5f2] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd803] transition-all placeholder:text-[#2d334a]/30"
          />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#2d334a]/30 hover:text-[#272343]">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Onglets statut */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusTabs.map((t) => (
            <button key={t.value} onClick={() => setStatusFilter(t.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black transition-all ${
                statusFilter === t.value
                  ? "bg-[#272343] text-[#ffd803]"
                  : "bg-[#f8fafc] text-[#2d334a]/60 border border-[#dfe5f2] hover:border-[#272343]"
              }`}>
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                statusFilter === t.value ? "bg-[#ffd803]/20 text-[#ffd803]" : "bg-[#dfe5f2] text-[#2d334a]/60"
              }`}>
                {counts[t.value]}
              </span>
            </button>
          ))}
          {(search || statusFilter !== "ALL") && (
            <span className="text-xs text-[#2d334a]/40 font-medium ml-1">
              {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-[#f25f4c] font-bold">{error}</p>}

      {/* Tableau */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#ffd803]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-[#dfe5f2] rounded-2xl">
          <ShieldCheck className="h-10 w-10 text-[#2d334a]/20 mx-auto mb-3" />
          <p className="font-black text-[#272343]">Aucune demande</p>
          <p className="text-sm text-[#2d334a]/40 font-medium mt-1">
            {search ? "Aucun résultat pour cette recherche." : "Aucune demande KYC dans cette catégorie."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#dfe5f2] rounded-2xl overflow-hidden">
          {/* En-tête tableau */}
          <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-[#f8fafc] border-b border-[#dfe5f2] text-[10px] font-black uppercase tracking-widest text-[#2d334a]/40">
            <span>Utilisateur</span>
            <span>Note / OCR</span>
            <span>Statut</span>
            <span>Date</span>
            <span>Document</span>
            <span>Actions</span>
          </div>

          {/* Lignes */}
          <div className="divide-y divide-[#dfe5f2]">
            {filtered.map((req) => {
              const cfg = STATUS_CONFIG[req.status];
              const StatusIcon = cfg.icon;
              const isLocalImg = req.documentUrl.includes("/uploads/kyc/") && isImage(req.documentUrl);

              return (
                <div key={req.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 hover:bg-[#f8fafc] transition-colors items-center">

                  {/* Utilisateur */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#e3f6f5] rounded-xl flex items-center justify-center font-black text-[#272343] text-sm shrink-0">
                      {req.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-sm text-[#272343] truncate">{req.user.name}</p>
                      <p className="text-xs text-[#2d334a]/40 font-medium truncate">{req.user.email}</p>
                    </div>
                  </div>

                  {/* Note / OCR */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {req.ocrAutoApproved && (
                        <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-md bg-[#42c88f]/10 text-[#42c88f]">
                          <Bot className="h-3 w-3" /> Auto
                        </span>
                      )}
                      {req.ocrConfidence !== null && req.ocrConfidence >= 0 && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                          req.ocrConfidence >= 75 ? "bg-[#42c88f]/10 text-[#42c88f]"
                          : req.ocrConfidence >= 50 ? "bg-[#ffd803]/10 text-[#b38a00]"
                          : "bg-[#f25f4c]/10 text-[#f25f4c]"
                        }`}>
                          OCR {req.ocrConfidence}%
                        </span>
                      )}
                      {req.ocrConfidence === null && req.status === "PENDING" && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-[#dfe5f2] text-[#2d334a]/60">
                          Analyse…
                        </span>
                      )}
                    </div>
                    {req.reviewNote && (
                      <p className="text-[10px] text-[#2d334a]/50 italic line-clamp-2">{req.reviewNote}</p>
                    )}
                  </div>

                  {/* Statut */}
                  <span className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-lg w-fit ${cfg.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {cfg.label}
                  </span>

                  {/* Date */}
                  <p className="text-xs text-[#2d334a]/40 font-medium">
                    {new Date(req.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit", month: "short", year: "numeric"
                    })}
                  </p>

                  {/* Document */}
                  <div className="flex items-center gap-2">
                    {isLocalImg ? (
                      <button onClick={() => setPreviewUrl(req.documentUrl)}
                        className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 bg-[#f8fafc] border border-[#dfe5f2] rounded-lg hover:bg-[#e3f6f5] transition-all">
                        <Eye className="h-3 w-3" /> Aperçu
                      </button>
                    ) : (
                      <a href={req.documentUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 bg-[#f8fafc] border border-[#dfe5f2] rounded-lg hover:bg-[#e3f6f5] transition-all">
                        <ExternalLink className="h-3 w-3" /> Ouvrir
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {req.status === "PENDING" ? (
                      <>
                        <button onClick={() => setNoteModal({ id: req.id, action: "approve" })}
                          disabled={actionLoading === req.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#42c88f] text-white text-[10px] font-black rounded-lg hover:bg-[#38b07d] transition-all disabled:opacity-50">
                          {actionLoading === req.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
                          OK
                        </button>
                        <button onClick={() => setNoteModal({ id: req.id, action: "reject" })}
                          disabled={actionLoading === req.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#f25f4c] text-white text-[10px] font-black rounded-lg hover:bg-[#d94f3d] transition-all disabled:opacity-50">
                          <ShieldX className="h-3 w-3" /> ✕
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-[#2d334a]/30 font-medium">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal aperçu image */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewUrl(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white font-black text-sm flex items-center gap-1">
              <X className="h-5 w-5" /> Fermer
            </button>
            <img src={previewUrl} alt="Document KYC" className="w-full rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}

      {/* Modal approbation / rejet */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-[#272343] mb-2">
              {noteModal.action === "approve" ? "✅ Approuver la demande" : "❌ Rejeter la demande"}
            </h3>
            <p className="text-sm text-[#2d334a]/60 font-medium mb-6">
              {noteModal.action === "approve"
                ? "L'utilisateur sera promu au rôle Organisateur."
                : "Précisez la raison du rejet (optionnel)."}
            </p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Note optionnelle…" rows={3} className="input-base resize-none mb-6" />
            <div className="flex gap-3">
              <button onClick={() => { setNoteModal(null); setNote(""); }}
                className="flex-1 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-black text-[#272343] hover:bg-[#e3f6f5] transition-all">
                Annuler
              </button>
              <button onClick={handleReview} disabled={!!actionLoading}
                className={`flex-1 py-3 rounded-xl font-black text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  noteModal.action === "approve" ? "bg-[#42c88f] hover:bg-[#38b07d]" : "bg-[#f25f4c] hover:bg-[#d94f3d]"
                }`}>
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
