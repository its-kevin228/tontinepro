"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { circleApi, cycleApi, paymentApi, invitationApi, type Circle, type Cycle, type Payment, type Invitation } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowLeft, Users, CreditCard, RefreshCw, Copy, CheckCheck,
  Play, Square, Plus, Loader2, ExternalLink, Clock, CheckCircle, XCircle
} from "lucide-react";

// ─── Badge statut générique ───────────────────────────────────────────────────
function Badge({ status, type }: { status: string; type: "circle" | "cycle" | "payment" }) {
  const maps: Record<string, Record<string, { cls: string; label: string }>> = {
    circle:  { ACTIVE: { cls: "badge-success", label: "Actif" }, PENDING: { cls: "badge-warning", label: "En attente" }, CLOSED: { cls: "badge-neutral", label: "Fermé" } },
    cycle:   { OPEN: { cls: "badge-info", label: "En cours" }, CLOSED: { cls: "badge-neutral", label: "Clôturé" }, ARCHIVED: { cls: "badge-neutral", label: "Archivé" } },
    payment: { CONFIRMED: { cls: "badge-success", label: "Confirmé" }, PENDING: { cls: "badge-warning", label: "En attente" }, REJECTED: { cls: "badge-error", label: "Rejeté" } },
  };
  const { cls, label } = maps[type][status] ?? { cls: "badge-neutral", label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ─── Onglets ──────────────────────────────────────────────────────────────────
const TABS = ["Membres", "Cycles", "Paiements"];

export default function CircleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();

  const [circle, setCircle] = useState<Circle | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [copied, setCopied] = useState(false);

  const isOrganisateur = circle?.memberships?.some(
    (m) => m.user?.id === user?.id && m.role === "ORGANISATEUR"
  );
  const openCycle = cycles.find((c) => c.status === "OPEN");

  // Chargement initial
  useEffect(() => {
    Promise.allSettled([
      circleApi.getById(id),
      cycleApi.getByCircle(id),
      paymentApi.getAll({ circleId: id }),
    ]).then(([circleRes, cyclesRes, paymentsRes]) => {
      if (circleRes.status === "fulfilled") setCircle(circleRes.value.circle);
      if (cyclesRes.status === "fulfilled") setCycles(cyclesRes.value.cycles);
      if (paymentsRes.status === "fulfilled") setPayments(paymentsRes.value.payments);
    }).finally(() => setLoading(false));
  }, [id]);

  // Génération d'invitation
  const handleInvite = async () => {
    setActionLoading("invite");
    try {
      const res = await invitationApi.create(id);
      setInvitation(res.invitation);
    } finally {
      setActionLoading("");
    }
  };

  // Copier le lien
  const handleCopy = () => {
    const link = `${window.location.origin}/join/${invitation?.token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Activer le cercle
  const handleActivate = async () => {
    setActionLoading("activate");
    try {
      const res = await circleApi.activate(id);
      setCircle(res.circle);
    } finally {
      setActionLoading("");
    }
  };

  // Démarrer un cycle
  const handleStartCycle = async () => {
    setActionLoading("cycle");
    try {
      const res = await cycleApi.create(id);
      setCycles((prev) => [res.cycle, ...prev]);
    } finally {
      setActionLoading("");
    }
  };

  // Clôturer un cycle
  const handleCloseCycle = async (cycleId: string) => {
    setActionLoading("close-" + cycleId);
    try {
      const res = await cycleApi.close(cycleId);
      setCycles((prev) => prev.map((c) => (c.id === cycleId ? res.cycle : c)));
    } finally {
      setActionLoading("");
    }
  };

  // Confirmer/Rejeter un paiement
  const handlePaymentAction = async (paymentId: string, action: "confirm" | "reject") => {
    setActionLoading(action + "-" + paymentId);
    try {
      const fn = action === "confirm" ? paymentApi.confirm : paymentApi.reject;
      const res = await fn(paymentId);
      setPayments((prev) => prev.map((p) => (p.id === paymentId ? res.payment : p)));
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded-xl" style={{ background: "var(--surface-alt)" }} />
        <div className="h-32 rounded-2xl" style={{ background: "var(--surface-alt)" }} />
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="p-8 text-center">
        <p style={{ color: "var(--text-secondary)" }}>Cercle introuvable</p>
        <Link href="/dashboard/circles" className="btn-primary mt-4 inline-flex">Retour</Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">

      {/* Retour */}
      <Link href="/dashboard/circles" className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        <ArrowLeft size={16} /> Mes cercles
      </Link>

      {/* En-tête du cercle */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: "var(--surface-alt)", color: "var(--text-primary)" }}
            >
              {circle.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{circle.name}</h1>
                <Badge status={circle.status} type="circle" />
              </div>
              {circle.description && (
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{circle.description}</p>
              )}
            </div>
          </div>

          {/* Actions organisateur */}
          {isOrganisateur && (
            <div className="flex gap-2 flex-wrap">
              {circle.status === "PENDING" && (
                <button
                  id="activate-circle"
                  className="btn-primary text-sm px-4 py-2"
                  onClick={handleActivate}
                  disabled={!!actionLoading}
                >
                  {actionLoading === "activate" ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  Activer
                </button>
              )}
              {circle.status === "ACTIVE" && !openCycle && (
                <button
                  id="start-cycle"
                  className="btn-primary text-sm px-4 py-2"
                  onClick={handleStartCycle}
                  disabled={!!actionLoading}
                >
                  {actionLoading === "cycle" ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Démarrer un cycle
                </button>
              )}
              <button
                id="generate-invite"
                className="btn-secondary text-sm px-4 py-2"
                onClick={handleInvite}
                disabled={!!actionLoading}
              >
                {actionLoading === "invite" ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Inviter
              </button>
            </div>
          )}
        </div>

        {/* Méta-infos */}
        <div className="flex flex-wrap gap-6 mt-5 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
          {[
            { label: "Cotisation", value: `${circle.amount.toLocaleString("fr-FR")} FCFA` },
            { label: "Fréquence", value: circle.frequency === "MONTHLY" ? "Mensuelle" : "Hebdomadaire" },
            { label: "Membres", value: `${circle.memberships?.length ?? 0} / ${circle.maxMembers}` },
            { label: "Cagnotte/tour", value: `${(circle.amount * circle.maxMembers).toLocaleString("fr-FR")} FCFA` },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs mb-0.5" style={{ color: "var(--text-secondary)" }}>{label}</p>
              <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lien d'invitation généré */}
      {invitation && (
        <div
          className="card flex items-center gap-3"
          style={{ background: "var(--surface-alt)", border: "none" }}
        >
          <ExternalLink size={18} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
          <p className="text-sm font-mono flex-1 truncate" style={{ color: "var(--text-primary)" }}>
            {window.location.origin}/join/{invitation.token}
          </p>
          <button
            id="copy-invite-link"
            className="btn-secondary text-sm px-3 py-1.5"
            onClick={handleCopy}
          >
            {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
            {copied ? "Copié !" : "Copier"}
          </button>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "var(--surface-alt)" }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            id={`tab-${t.toLowerCase()}`}
            onClick={() => setTab(i)}
            className="flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: tab === i ? "var(--surface)" : "transparent",
              color: tab === i ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: tab === i ? "0 2px 8px var(--shadow)" : "none",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Onglet Membres ───────────────────────────────────────────────────── */}
      {tab === 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} style={{ color: "var(--text-secondary)" }} />
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Membres ({circle.memberships?.length ?? 0})
            </h2>
          </div>
          {(circle.memberships?.length ?? 0) === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "var(--text-secondary)" }}>
              Aucun membre pour le moment
            </p>
          ) : (
            <div className="space-y-2">
              {circle.memberships?.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "var(--surface-alt)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm"
                      style={{ background: "var(--surface-tertiary)", color: "var(--text-primary)" }}
                    >
                      {m.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {m.user?.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {m.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.order != null && (
                      <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                        #{m.order}
                      </span>
                    )}
                    <span className={`badge ${m.role === "ORGANISATEUR" ? "badge-info" : "badge-neutral"}`}>
                      {m.role === "ORGANISATEUR" ? "Organisateur" : "Membre"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Onglet Cycles ─────────────────────────────────────────────────────── */}
      {tab === 1 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw size={18} style={{ color: "var(--text-secondary)" }} />
              <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Cycles ({cycles.length})
              </h2>
            </div>
          </div>
          {cycles.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "var(--text-secondary)" }}>
              Aucun cycle démarré
            </p>
          ) : (
            <div className="space-y-3">
              {cycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: "var(--surface-alt)" }}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        Cycle #{cycle.number}
                      </p>
                      <Badge status={cycle.status} type="cycle" />
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Démarré le {new Date(cycle.startDate).toLocaleDateString("fr-FR")}
                      {cycle.endDate && ` · Clôturé le ${new Date(cycle.endDate).toLocaleDateString("fr-FR")}`}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {cycle.payments?.filter((p) => p.status === "CONFIRMED").length ?? 0} paiements confirmés
                    </p>
                  </div>
                  {isOrganisateur && cycle.status === "OPEN" && (
                    <button
                      id={`close-cycle-${cycle.id}`}
                      className="btn-ghost text-sm px-3 py-1.5"
                      onClick={() => handleCloseCycle(cycle.id)}
                      disabled={!!actionLoading}
                      style={{ color: "var(--error)" }}
                    >
                      {actionLoading === "close-" + cycle.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Square size={14} />
                      )}
                      Clôturer
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Onglet Paiements ──────────────────────────────────────────────────── */}
      {tab === 2 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} style={{ color: "var(--text-secondary)" }} />
            <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Paiements ({payments.length})
            </h2>
          </div>
          {payments.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "var(--text-secondary)" }}>
              Aucun paiement enregistré
            </p>
          ) : (
            <div className="space-y-2">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "var(--surface-alt)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "var(--surface)" }}
                    >
                      {p.status === "CONFIRMED" ? (
                        <CheckCircle size={16} style={{ color: "var(--success)" }} />
                      ) : p.status === "REJECTED" ? (
                        <XCircle size={16} style={{ color: "var(--error)" }} />
                      ) : (
                        <Clock size={16} style={{ color: "var(--warning)" }} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {p.user?.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {p.amount.toLocaleString("fr-FR")} FCFA · {p.method} · Cycle #{p.cycle?.number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={p.status} type="payment" />
                    {isOrganisateur && p.status === "PENDING" && (
                      <div className="flex gap-1 ml-1">
                        <button
                          id={`confirm-payment-${p.id}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: "rgba(66,200,143,0.12)", color: "var(--success)" }}
                          onClick={() => handlePaymentAction(p.id, "confirm")}
                          disabled={!!actionLoading}
                          title="Confirmer"
                        >
                          {actionLoading === "confirm-" + p.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                        </button>
                        <button
                          id={`reject-payment-${p.id}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: "rgba(242,95,76,0.12)", color: "var(--error)" }}
                          onClick={() => handlePaymentAction(p.id, "reject")}
                          disabled={!!actionLoading}
                          title="Rejeter"
                        >
                          {actionLoading === "reject-" + p.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
