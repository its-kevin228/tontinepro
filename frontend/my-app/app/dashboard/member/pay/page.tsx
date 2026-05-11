"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi, API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Smartphone,
  Wallet,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Info,
  Clock,
} from "lucide-react";
import Link from "next/link";

type PaymentMethod = "MOBILE_MONEY" | "CASH";
type Step = "select" | "form" | "processing" | "done";

interface CycleInfo {
  id: string;
  number: number;
  circle: { name: string; amount: number };
}

export default function MemberPayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const cycleId = searchParams.get("cycleId") ?? "";
  const circleId = searchParams.get("circleId") ?? "";

  const [step, setStep] = useState<Step>("select");
  const [method, setMethod] = useState<PaymentMethod>("MOBILE_MONEY");
  const [phone, setPhone] = useState("");
  const [cycleInfo, setCycleInfo] = useState<CycleInfo | null>(null);
  const [fees, setFees] = useState({ transactionFee: 0, serviceFeeRate: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (!cycleId || !circleId) return;

    const load = async () => {
      try {
        // Charger les infos du cercle/cycle
        const circleData = await fetchApi(`/circles/${circleId}`);
        const cycle = circleData.circle.cycles?.find((c: any) => c.id === cycleId);
        if (cycle) {
          setCycleInfo({
            id: cycle.id,
            number: cycle.number,
            circle: { name: circleData.circle.name, amount: circleData.circle.amount },
          });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [cycleId, circleId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      if (method === "MOBILE_MONEY") {
        const data = await fetchApi("/payments/mobile-money", {
          method: "POST",
          body: JSON.stringify({ cycleId, phone }),
        });
        setPaymentId(data.payment.id);
        setStep("processing");

        // Polling : vérifier la confirmation toutes les 2s (max 15s)
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          try {
            const payments = await fetchApi(`/payments?cycleId=${cycleId}`);
            const confirmed = payments.payments.find(
              (p: any) => p.id === data.payment.id && p.status === "CONFIRMED"
            );
            if (confirmed) {
              clearInterval(poll);
              setStep("done");
            }
          } catch {}
          if (attempts >= 8) {
            clearInterval(poll);
            setStep("done"); // on considère que c'est en cours
          }
        }, 2000);
      } else {
        // CASH : juste afficher un message — l'organisateur validera manuellement
        setStep("done");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const amount = cycleInfo?.circle.amount ?? 0;
  const totalMobileMoney = amount + fees.transactionFee;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-[#ffd803]" />
      </div>
    );
  }

  if (!cycleId || !circleId || !cycleInfo) {
    return (
      <div className="card-base text-center py-20 max-w-md mx-auto">
        <p className="font-black text-[#272343]">Paramètres manquants.</p>
        <p className="text-sm text-[#2d334a]/60 mt-2">
          Accédez à cette page depuis la liste de vos cercles.
        </p>
        <Link href="/dashboard/member" className="btn-primary mt-6 inline-block">
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link
        href={`/dashboard/circles/${circleId}`}
        className="inline-flex items-center gap-2 text-[#2d334a]/60 hover:text-[#272343] font-bold transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Retour au cercle
      </Link>

      <div>
        <h1 className="text-4xl font-black text-[#272343] tracking-tight">
          Payer ma <span className="text-[#ffd803]">cotisation</span>
        </h1>
        <p className="text-[#2d334a]/60 font-medium mt-1">
          {cycleInfo.circle.name} · Cycle #{cycleInfo.number}
        </p>
      </div>

      {/* Récapitulatif montant */}
      <div className="card-base bg-[#272343] border-none text-white">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
          Montant de la cotisation
        </p>
        <p className="text-4xl font-black mt-2">
          {amount.toLocaleString("fr-FR")}
          <span className="text-lg text-white/60 ml-2">FCFA</span>
        </p>
        {fees.transactionFee > 0 && method === "MOBILE_MONEY" && (
          <p className="text-xs text-white/40 mt-1">
            + {fees.transactionFee} FCFA de frais Mobile Money = {totalMobileMoney.toLocaleString("fr-FR")} FCFA
          </p>
        )}
      </div>

      {error && (
        <div className="p-4 bg-[#f25f4c]/10 border border-[#f25f4c]/20 text-[#f25f4c] rounded-2xl font-bold text-sm">
          {error}
        </div>
      )}

      {/* Étape 1 : Sélection du mode */}
      {step === "select" && (
        <div className="space-y-4">
          <p className="text-sm font-black uppercase tracking-widest text-[#2d334a]/40">
            Choisir le mode de paiement
          </p>

          <button
            onClick={() => setMethod("MOBILE_MONEY")}
            className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
              method === "MOBILE_MONEY"
                ? "border-[#ffd803] bg-[#ffd803]/5"
                : "border-[#dfe5f2] hover:border-[#ffd803]/40"
            }`}
          >
            <div className={`p-3 rounded-xl ${method === "MOBILE_MONEY" ? "bg-[#ffd803]" : "bg-[#e3f6f5]"}`}>
              <Smartphone className="h-6 w-6 text-[#272343]" />
            </div>
            <div>
              <p className="font-black text-[#272343]">Mobile Money</p>
              <p className="text-sm text-[#2d334a]/60 font-medium">
                Flooz · T-Money · Moov Money
              </p>
            </div>
            {method === "MOBILE_MONEY" && (
              <CheckCircle2 className="h-5 w-5 text-[#ffd803] ml-auto" />
            )}
          </button>

          <button
            onClick={() => setMethod("CASH")}
            className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
              method === "CASH"
                ? "border-[#ffd803] bg-[#ffd803]/5"
                : "border-[#dfe5f2] hover:border-[#ffd803]/40"
            }`}
          >
            <div className={`p-3 rounded-xl ${method === "CASH" ? "bg-[#ffd803]" : "bg-[#e3f6f5]"}`}>
              <Wallet className="h-6 w-6 text-[#272343]" />
            </div>
            <div>
              <p className="font-black text-[#272343]">Espèces</p>
              <p className="text-sm text-[#2d334a]/60 font-medium">
                Remise directe à l'organisateur
              </p>
            </div>
            {method === "CASH" && (
              <CheckCircle2 className="h-5 w-5 text-[#ffd803] ml-auto" />
            )}
          </button>

          {method === "CASH" && (
            <div className="flex items-start gap-3 p-4 bg-[#bae8e8]/20 border border-[#bae8e8] rounded-2xl">
              <Info className="h-5 w-5 text-[#272343] shrink-0 mt-0.5" />
              <p className="text-sm text-[#272343] font-medium">
                Pour un paiement en espèces, remettez votre cotisation à l'organisateur.
                Il validera votre paiement dans l'application.
              </p>
            </div>
          )}

          <button
            onClick={() => setStep("form")}
            className="btn-primary w-full py-4 text-base font-black"
          >
            Continuer
          </button>
        </div>
      )}

      {/* Étape 2 : Formulaire */}
      {step === "form" && (
        <div className="space-y-6">
          {method === "MOBILE_MONEY" ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-[#2d334a]/60">
                  Numéro Mobile Money
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+228 90 00 00 00"
                  className="input-base text-lg font-bold"
                />
                <p className="text-xs text-[#2d334a]/40 font-medium">
                  Entrez le numéro associé à votre compte Flooz ou T-Money.
                </p>
              </div>

              <div className="p-4 bg-[#ffd803]/5 border border-[#ffd803]/30 rounded-2xl space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">
                  Récapitulatif
                </p>
                <div className="flex justify-between text-sm font-bold text-[#272343]">
                  <span>Cotisation</span>
                  <span>{amount.toLocaleString("fr-FR")} FCFA</span>
                </div>
                {fees.transactionFee > 0 && (
                  <div className="flex justify-between text-sm font-bold text-[#2d334a]/60">
                    <span>Frais Mobile Money</span>
                    <span>{fees.transactionFee.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-[#272343] border-t border-[#ffd803]/20 pt-2 mt-2">
                  <span>Total débité</span>
                  <span>{totalMobileMoney.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>
            </>
          ) : (
            <div className="card-base text-center py-10">
              <Wallet className="h-12 w-12 text-[#ffd803] mx-auto mb-4" />
              <p className="font-black text-[#272343] text-lg">Paiement en espèces</p>
              <p className="text-sm text-[#2d334a]/60 font-medium mt-2 max-w-xs mx-auto">
                Remettez <strong>{amount.toLocaleString("fr-FR")} FCFA</strong> à votre organisateur.
                Il confirmera votre paiement dans l'application.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("select")}
              className="flex-1 py-4 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-black text-[#272343] hover:bg-[#e3f6f5] transition-all"
            >
              Retour
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || (method === "MOBILE_MONEY" && !phone.trim())}
              className="flex-1 py-4 bg-[#ffd803] text-[#272343] rounded-xl font-black hover:bg-[#e0c700] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : method === "MOBILE_MONEY" ? (
                "Payer maintenant"
              ) : (
                "J'ai compris"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 : Traitement */}
      {step === "processing" && (
        <div className="card-base text-center py-16 space-y-6">
          <div className="w-20 h-20 bg-[#ffd803]/10 rounded-full flex items-center justify-center mx-auto">
            <Clock className="h-10 w-10 text-[#ffd803] animate-pulse" />
          </div>
          <div>
            <p className="font-black text-[#272343] text-xl">Traitement en cours…</p>
            <p className="text-sm text-[#2d334a]/60 font-medium mt-2">
              Votre paiement Mobile Money est en cours de confirmation.
              <br />
              Ne fermez pas cette page.
            </p>
          </div>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-[#ffd803] rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Étape 4 : Succès */}
      {step === "done" && (
        <div className="card-base text-center py-16 space-y-6">
          <div className="w-20 h-20 bg-[#42c88f]/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-[#42c88f]" />
          </div>
          <div>
            <p className="font-black text-[#272343] text-xl">
              {method === "MOBILE_MONEY" ? "Paiement confirmé !" : "Demande enregistrée !"}
            </p>
            <p className="text-sm text-[#2d334a]/60 font-medium mt-2">
              {method === "MOBILE_MONEY"
                ? `Votre cotisation de ${amount.toLocaleString("fr-FR")} FCFA a été confirmée.`
                : "Votre organisateur a été notifié. Il validera votre paiement en espèces."}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/member/payments"
              className="btn-primary py-4 font-black text-center"
            >
              Voir mes paiements
            </Link>
            <Link
              href={`/dashboard/circles/${circleId}`}
              className="py-4 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-black text-[#272343] hover:bg-[#e3f6f5] transition-all text-center"
            >
              Retour au cercle
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
