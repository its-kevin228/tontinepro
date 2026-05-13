"use client";

import { useEffect, useState } from "react";
import { fetchApi, API_BASE_URL } from "@/lib/api";
import {
  CreditCard,
  Download,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  confirmedAt: string | null;
  createdAt: string;
  cycle: { id: string; number: number; circleId: string };
  user: { id: string; name: string; email: string };
}

const STATUS_CONFIG = {
  CONFIRMED: {
    label: "Confirmé",
    color: "bg-[#42c88f]/10 text-[#42c88f]",
    icon: CheckCircle2,
  },
  PENDING: {
    label: "En attente",
    color: "bg-[#ffd803]/10 text-[#b38a00]",
    icon: Clock,
  },
  REJECTED: {
    label: "Rejeté",
    color: "bg-[#f25f4c]/10 text-[#f25f4c]",
    icon: XCircle,
  },
};

const METHOD_LABELS: Record<string, string> = {
  CASH: "Espèces",
  VIREMENT: "Virement",
  MOBILE_MONEY: "Mobile Money",
};

import { useToast } from "@/lib/toast";

export default function MemberPaymentsPage() {
  const { error: toastError } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi("/payments");
      setPayments(data.payments);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const downloadReceipt = async (paymentId: string) => {
    setDownloading(paymentId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/receipt`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const err = await response.json();
        toastError(err.error || "Erreur lors du téléchargement");
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recu-tontinepro-${paymentId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toastError("Erreur lors du téléchargement du reçu");
    } finally {
      setDownloading(null);
    }
  };

  const totalConfirmed = payments
    .filter((p) => p.status === "CONFIRMED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#272343] tracking-tight">
            Mes <span className="text-[#ffd803]">Paiements</span>
          </h1>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Historique de vos cotisations et téléchargement des reçus.
          </p>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-bold text-sm text-[#272343] hover:bg-[#e3f6f5] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-base bg-[#272343] border-none text-white">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
            Total payé
          </p>
          <p className="text-3xl font-black mt-2">
            {totalConfirmed.toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-white/40 font-medium mt-0.5">FCFA confirmés</p>
        </div>
        <div className="card-base">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#2d334a]/40">
            Paiements confirmés
          </p>
          <p className="text-3xl font-black text-[#42c88f] mt-2">
            {payments.filter((p) => p.status === "CONFIRMED").length}
          </p>
        </div>
        <div className="card-base">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#2d334a]/40">
            En attente
          </p>
          <p className="text-3xl font-black text-[#b38a00] mt-2">
            {payments.filter((p) => p.status === "PENDING").length}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#f25f4c]/10 border border-[#f25f4c]/20 text-[#f25f4c] rounded-2xl font-bold text-sm">
          {error}
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-base h-20 animate-pulse bg-[#f8fafc] border-[#f0f0f0]" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="card-base text-center py-24">
          <CreditCard className="h-12 w-12 text-[#2d334a]/20 mx-auto mb-4" />
          <p className="font-black text-[#272343] text-lg">Aucun paiement</p>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Vos cotisations apparaîtront ici une fois enregistrées.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => {
            const cfg = STATUS_CONFIG[payment.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={payment.id}
                className="card-base flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#ffd803] transition-all"
              >
                {/* Infos */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#e3f6f5] rounded-2xl flex items-center justify-center shrink-0">
                    <CreditCard className="h-5 w-5 text-[#272343]" />
                  </div>
                  <div>
                    <p className="font-black text-[#272343]">
                      {payment.amount.toLocaleString("fr-FR")} FCFA
                    </p>
                    <p className="text-sm text-[#2d334a]/60 font-medium">
                      Cycle #{payment.cycle.number} · {METHOD_LABELS[payment.method] ?? payment.method}
                    </p>
                    <p className="text-[10px] text-[#2d334a]/40 font-bold uppercase tracking-widest mt-0.5">
                      {new Date(payment.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Statut + reçu */}
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black ${cfg.color}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </span>

                  {payment.status === "CONFIRMED" && (
                    <button
                      onClick={() => downloadReceipt(payment.id)}
                      disabled={downloading === payment.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#272343] text-[#ffd803] text-xs font-black rounded-xl hover:bg-[#1a1730] transition-all disabled:opacity-50"
                    >
                      {downloading === payment.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Reçu PDF
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
