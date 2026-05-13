"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  ShieldCheck,
  ShieldX,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  Filter,
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
  PENDING: { label: "En attente", color: "bg-[#ffd803]/10 text-[#b38a00]", icon: Clock },
  APPROVED: { label: "Approuvé", color: "bg-[#42c88f]/10 text-[#42c88f]", icon: ShieldCheck },
  REJECTED: { label: "Rejeté", color: "bg-[#f25f4c]/10 text-[#f25f4c]", icon: ShieldX },
};

import { useToast } from "@/lib/toast";

export default function AdminKycPage() {
  const { success, error: toastError } = useToast();
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<KycStatus | "ALL">("PENDING");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{ id: string; action: "approve" | "reject" } | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== "ALL" ? `?status=${filter}` : "";
      const data = await fetchApi(`/admin/kyc${params}`);
      setRequests(data.requests);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

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

  const filters: { label: string; value: KycStatus | "ALL" }[] = [
    { label: "En attente", value: "PENDING" },
    { label: "Approuvés", value: "APPROVED" },
    { label: "Rejetés", value: "REJECTED" },
    { label: "Tous", value: "ALL" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#272343] tracking-tight">
            Validation <span className="text-[#ffd803]">KYC</span>
          </h1>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Vérifiez l'identité des organisateurs avant activation.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-bold text-sm text-[#272343] hover:bg-[#e3f6f5] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-[#2d334a]/40" />
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${
              filter === f.value
                ? "bg-[#272343] text-[#ffd803]"
                : "bg-[#f8fafc] text-[#2d334a]/60 border border-[#dfe5f2] hover:border-[#272343]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-[#f25f4c]/10 border border-[#f25f4c]/20 text-[#f25f4c] rounded-2xl font-bold text-sm">
          {error}
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-base h-24 animate-pulse bg-[#f8fafc] border-[#f0f0f0]" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="card-base text-center py-20">
          <ShieldCheck className="h-12 w-12 text-[#42c88f] mx-auto mb-4" />
          <p className="font-black text-[#272343] text-lg">Aucune demande</p>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Aucune demande KYC dans cette catégorie.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const cfg = STATUS_CONFIG[req.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={req.id}
                className="card-base flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#ffd803] transition-all"
              >
                {/* Infos utilisateur */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#e3f6f5] rounded-2xl flex items-center justify-center font-black text-[#272343] text-lg shrink-0">
                    {req.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-[#272343]">{req.user.name}</p>
                    <p className="text-sm text-[#2d334a]/60 font-medium">{req.user.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <p className="text-[10px] text-[#2d334a]/40 font-bold uppercase tracking-widest">
                        Soumis le {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                      {/* Badge auto-validé */}
                      {req.ocrAutoApproved && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-[#42c88f]/10 text-[#42c88f]">
                          ✓ Auto-validé
                        </span>
                      )}
                      {/* Score OCR */}
                      {req.ocrConfidence !== null && req.ocrConfidence >= 0 && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                          req.ocrConfidence >= 75
                            ? "bg-[#42c88f]/10 text-[#42c88f]"
                            : req.ocrConfidence >= 50
                            ? "bg-[#ffd803]/10 text-[#b38a00]"
                            : "bg-[#f25f4c]/10 text-[#f25f4c]"
                        }`}>
                          OCR {req.ocrConfidence}%
                        </span>
                      )}
                      {req.ocrConfidence === null && req.status === "PENDING" && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-[#dfe5f2] text-[#2d334a]/60">
                          Analyse en cours…
                        </span>
                      )}
                    </div>
                    {req.reviewNote && (
                      <p className="text-xs text-[#2d334a]/50 italic mt-1 max-w-xs">
                        {req.reviewNote}
                      </p>
                    )}
                  </div>
                </div>

                {/* Statut + actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black ${cfg.color}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </span>

                  {/* Lien/aperçu document */}
                  {req.documentUrl.startsWith("http://localhost") || req.documentUrl.startsWith("http://") || req.documentUrl.startsWith("https://") ? (
                    req.documentUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                      <a href={req.documentUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-black text-[#272343] bg-[#f8fafc] border border-[#dfe5f2] px-3 py-1.5 rounded-xl hover:bg-[#e3f6f5] transition-all">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Voir l'image
                      </a>
                    ) : (
                      <a href={req.documentUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-black text-[#272343] bg-[#f8fafc] border border-[#dfe5f2] px-3 py-1.5 rounded-xl hover:bg-[#e3f6f5] transition-all">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Voir document
                      </a>
                    )
                  ) : (
                    <a href={req.documentUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-black text-[#272343] bg-[#f8fafc] border border-[#dfe5f2] px-3 py-1.5 rounded-xl hover:bg-[#e3f6f5] transition-all">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Voir document
                    </a>
                  )}

                  {/* Actions si PENDING */}
                  {req.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNoteModal({ id: req.id, action: "approve" })}
                        disabled={actionLoading === req.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#42c88f] text-white text-xs font-black rounded-xl hover:bg-[#38b07d] transition-all disabled:opacity-50"
                      >
                        {actionLoading === req.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        )}
                        Approuver
                      </button>
                      <button
                        onClick={() => setNoteModal({ id: req.id, action: "reject" })}
                        disabled={actionLoading === req.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#f25f4c] text-white text-xs font-black rounded-xl hover:bg-[#d94f3d] transition-all disabled:opacity-50"
                      >
                        <ShieldX className="h-3.5 w-3.5" />
                        Rejeter
                      </button>
                    </div>
                  )}

                {/* Aperçu document si image locale */}
                  {req.documentUrl.includes("/uploads/kyc/") && /\.(jpg|jpeg|png|webp)$/i.test(req.documentUrl) && (
                    <div className="mt-3">
                      <a href={req.documentUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={req.documentUrl}
                          alt="Document KYC"
                          className="h-20 w-auto rounded-xl border border-[#dfe5f2] object-cover hover:opacity-80 transition-opacity"
                        />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal note */}
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
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note optionnelle..."
              rows={3}
              className="input-base resize-none mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setNoteModal(null); setNote(""); }}
                className="flex-1 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-black text-[#272343] hover:bg-[#e3f6f5] transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleReview}
                disabled={!!actionLoading}
                className={`flex-1 py-3 rounded-xl font-black text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  noteModal.action === "approve"
                    ? "bg-[#42c88f] hover:bg-[#38b07d]"
                    : "bg-[#f25f4c] hover:bg-[#d94f3d]"
                }`}
              >
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
