"use client";

import { useEffect, useState } from "react";
import { paymentApi, type Payment } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  CreditCard, Clock, CheckCircle, XCircle,
  Search, Filter, Download
} from "lucide-react";

function PaymentStatusIcon({ status }: { status: Payment["status"] }) {
  if (status === "CONFIRMED") return <CheckCircle size={16} style={{ color: "var(--success)" }} />;
  if (status === "REJECTED")  return <XCircle size={16} style={{ color: "var(--error)" }} />;
  return <Clock size={16} style={{ color: "var(--warning)" }} />;
}

function PaymentBadge({ status }: { status: Payment["status"] }) {
  const map = {
    CONFIRMED: { cls: "badge-success", label: "Confirmé" },
    PENDING:   { cls: "badge-warning", label: "En attente" },
    REJECTED:  { cls: "badge-error",   label: "Rejeté" },
  };
  const { cls, label } = map[status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filtered, setFiltered] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    paymentApi.getAll()
      .then((res) => { setPayments(res.payments); setFiltered(res.payments); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = payments;
    if (statusFilter !== "ALL") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.user?.name?.toLowerCase().includes(q) ||
          p.user?.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, payments]);

  // Calculs
  const totalConfirmed = payments
    .filter((p) => p.status === "CONFIRMED")
    .reduce((s, p) => s + p.amount, 0);
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* En-tête */}
      <div>
        <h1 className="page-title">Paiements</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Historique complet de vos transactions
        </p>
      </div>

      {/* Stats compactes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-alt)" }}>
            <CreditCard size={16} style={{ color: "var(--text-secondary)" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Total</p>
            <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{payments.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(66,200,143,0.1)" }}>
            <CheckCircle size={16} style={{ color: "var(--success)" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Confirmés</p>
            <p className="font-bold text-sm" style={{ color: "var(--success)" }}>
              {payments.filter((p) => p.status === "CONFIRMED").length}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,216,3,0.1)" }}>
            <Clock size={16} style={{ color: "var(--warning)" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>En attente</p>
            <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{pendingCount}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3" style={{ background: "var(--text-primary)", border: "none" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,216,3,0.15)" }}>
            <CreditCard size={16} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "#a7a9be" }}>Volume</p>
            <p className="font-bold text-sm" style={{ color: "#fffffe" }}>
              {totalConfirmed.toLocaleString("fr-FR")} F
            </p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
          <input
            type="text"
            className="input pl-10"
            placeholder="Rechercher par nom…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
          <select
            className="input pl-9 pr-8 appearance-none"
            style={{ minWidth: "160px", cursor: "pointer" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="CONFIRMED">Confirmés</option>
            <option value="PENDING">En attente</option>
            <option value="REJECTED">Rejetés</option>
          </select>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="card animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl" style={{ background: "var(--surface-alt)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <CreditCard size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>Aucun paiement</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {search || statusFilter !== "ALL" ? "Modifiez vos filtres" : "Vos paiements apparaîtront ici"}
          </p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="space-y-0 divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 hover:bg-opacity-50 transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-alt)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: "var(--surface-alt)" }}
                  >
                    <PaymentStatusIcon status={p.status} />
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                      {p.user?.name ?? "Utilisateur"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Cycle #{p.cycle?.number} · {p.method} · {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    {p.amount.toLocaleString("fr-FR")} FCFA
                  </p>
                  <PaymentBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
