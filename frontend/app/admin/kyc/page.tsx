"use client";

import { useEffect, useState } from "react";
import { adminApi, type KycRequest } from "@/lib/api";
import {
  FileCheck, Loader2, CheckCircle, XCircle,
  ExternalLink, Filter, Clock
} from "lucide-react";

type KycStatus = "PENDING" | "APPROVED" | "REJECTED";

function KycStatusBadge({ status }: { status: KycStatus }) {
  const map = {
    PENDING:  { cls: "badge-warning", label: "En attente", icon: Clock },
    APPROVED: { cls: "badge-success", label: "Approuvé",   icon: CheckCircle },
    REJECTED: { cls: "badge-error",   label: "Rejeté",     icon: XCircle },
  };
  const { cls, label } = map[status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function AdminKycPage() {
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [filtered, setFiltered] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [actionLoading, setActionLoading] = useState("");
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getKyc()
      .then((res) => { setRequests(res.requests); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(
      statusFilter === "ALL"
        ? requests
        : requests.filter((r) => r.status === statusFilter)
    );
  }, [statusFilter, requests]);

  const handleReview = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id + action);
    try {
      await adminApi.reviewKyc(id, action, noteMap[id]);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: action === "approve" ? "APPROVED" : "REJECTED", reviewNote: noteMap[id] }
            : r
        )
      );
      setExpandedId(null);
    } finally {
      setActionLoading("");
    }
  };

  const counts = {
    PENDING:  requests.filter((r) => r.status === "PENDING").length,
    APPROVED: requests.filter((r) => r.status === "APPROVED").length,
    REJECTED: requests.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* En-tête */}
      <div>
        <h1 className="page-title">Vérification KYC</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Validez l&apos;identité des organisateurs pour sécuriser la plateforme
        </p>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-3 gap-4">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="card text-center transition-all"
            style={{
              border: statusFilter === s ? "2px solid var(--accent)" : undefined,
              cursor: "pointer",
            }}
          >
            <p
              className="text-2xl font-bold mb-1"
              style={{
                color:
                  s === "PENDING"  ? "var(--warning)" :
                  s === "APPROVED" ? "var(--success)" : "var(--error)",
              }}
            >
              {counts[s]}
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {s === "PENDING" ? "En attente" : s === "APPROVED" ? "Approuvés" : "Rejetés"}
            </p>
          </button>
        ))}
      </div>

      {/* Filtre */}
      <div className="flex items-center gap-3">
        <Filter size={15} style={{ color: "var(--text-secondary)" }} />
        <div className="flex gap-2">
          {[
            { val: "PENDING",  label: "En attente" },
            { val: "APPROVED", label: "Approuvés" },
            { val: "REJECTED", label: "Rejetés" },
            { val: "ALL",      label: "Tous" },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className="text-sm px-3 py-1.5 rounded-full font-medium transition-all"
              style={{
                background: statusFilter === val ? "var(--text-primary)" : "var(--surface-alt)",
                color: statusFilter === val ? "#fffffe" : "var(--text-secondary)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des demandes */}
      {loading ? (
        <div className="card p-8 text-center">
          <Loader2 size={24} className="animate-spin mx-auto" style={{ color: "var(--text-secondary)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FileCheck size={32} className="mx-auto mb-3 opacity-30" />
          <p style={{ color: "var(--text-secondary)" }}>Aucune demande dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <div key={req.id} className="card space-y-4">
              {/* Infos utilisateur */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: "var(--surface-alt)", color: "var(--text-primary)" }}
                  >
                    {req.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {req.user?.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {req.user?.email}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      Soumis le {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <KycStatusBadge status={req.status as KycStatus} />
                </div>
              </div>

              {/* Document */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "var(--surface-alt)" }}
              >
                <FileCheck size={16} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
                <p className="text-sm flex-1 truncate" style={{ color: "var(--text-primary)" }}>
                  {req.documentUrl}
                </p>
                <a
                  href={req.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Voir <ExternalLink size={12} />
                </a>
              </div>

              {/* Note de révision si déjà traité */}
              {req.reviewNote && req.status !== "PENDING" && (
                <div
                  className="text-sm p-3 rounded-xl"
                  style={{
                    background: req.status === "APPROVED" ? "rgba(66,200,143,0.08)" : "rgba(242,95,76,0.08)",
                    color: req.status === "APPROVED" ? "var(--success)" : "var(--error)",
                  }}
                >
                  Note : {req.reviewNote}
                </div>
              )}

              {/* Actions — uniquement pour PENDING */}
              {req.status === "PENDING" && (
                <div className="space-y-3 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  {/* Zone de note optionnelle */}
                  <button
                    className="text-xs font-medium"
                    style={{ color: "var(--text-secondary)" }}
                    onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                  >
                    {expandedId === req.id ? "▲ Masquer la note" : "▼ Ajouter une note (optionnel)"}
                  </button>

                  {expandedId === req.id && (
                    <textarea
                      className="input text-sm"
                      placeholder="Motif de la décision (visible par l'utilisateur)…"
                      rows={2}
                      style={{ resize: "none" }}
                      value={noteMap[req.id] ?? ""}
                      onChange={(e) =>
                        setNoteMap((prev) => ({ ...prev, [req.id]: e.target.value }))
                      }
                    />
                  )}

                  <div className="flex gap-3">
                    <button
                      id={`approve-kyc-${req.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
                      style={{ background: "rgba(66,200,143,0.12)", color: "var(--success)" }}
                      onClick={() => handleReview(req.id, "approve")}
                      disabled={!!actionLoading}
                    >
                      {actionLoading === req.id + "approve" ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <CheckCircle size={15} />
                      )}
                      Approuver
                    </button>
                    <button
                      id={`reject-kyc-${req.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
                      style={{ background: "rgba(242,95,76,0.1)", color: "var(--error)" }}
                      onClick={() => handleReview(req.id, "reject")}
                      disabled={!!actionLoading}
                    >
                      {actionLoading === req.id + "reject" ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <XCircle size={15} />
                      )}
                      Rejeter
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
