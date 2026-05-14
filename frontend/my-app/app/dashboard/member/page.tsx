"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import {
  Users, ArrowUpRight, Wallet, Clock, TrendingUp, LayoutGrid,
  CreditCard, CheckCircle2, Calendar, LogIn, X, Loader2, AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function MemberDashboardPage() {
  const router = useRouter();
  const [joinedCircles, setJoinedCircles] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal rejoindre avec code
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [circlesData, paymentsData] = await Promise.all([
          fetchApi("/circles/joined"),
          fetchApi("/payments"),
        ]);
        setJoinedCircles(circlesData.circles || []);
        setPayments(paymentsData.payments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleJoin = async () => {
    const token = joinCode.trim();
    if (!token) { setJoinError("Entrez un code d&apos;invitation"); return; }
    setJoinLoading(true);
    setJoinError("");
    try {
      // Vérifier d&apos;abord que l&apos;invitation est valide
      const check = await fetchApi(`/invitations/${token}`);
      if (check.invitation.status !== "PENDING") {
        setJoinError("Ce code d&apos;invitation n&apos;est plus valide ou a déjà été utilisé.");
        return;
      }
      // Accepter l&apos;invitation
      const data = await fetchApi(`/invitations/${token}/accept`, { method: "POST" });
      setShowJoinModal(false);
      setJoinCode("");
      router.push(`/dashboard/circles/${data.circleId}`);
    } catch (err: any) {
      setJoinError(err.message || "Code invalide ou expiré");
    } finally {
      setJoinLoading(false);
    }
  };

  const confirmedPayments = payments.filter((p) => p.status === "CONFIRMED");
  const totalPaid = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter((p) => p.status === "PENDING").length;

  // Prochain cycle actif parmi les cercles rejoints
  const nextCycle = joinedCircles
    .flatMap((c) => (c.cycles || []).filter((cy: any) => cy.status === "OPEN").map((cy: any) => ({ ...cy, circleName: c.name, circleId: c.id, amount: c.amount })))
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())[0];

  const stats = [
    {
      label: "Mes participations",
      value: loading ? "—" : joinedCircles.length,
      icon: Users,
      color: "bg-[#bae8e8]",
    },
    {
      label: "Total cotisé",
      value: loading ? "—" : `${totalPaid.toLocaleString("fr-FR")} FCFA`,
      icon: Wallet,
      color: "bg-[#e3f6f5]",
    },
    {
      label: "Paiements confirmés",
      value: loading ? "—" : confirmedPayments.length,
      icon: CheckCircle2,
      color: "bg-[#42c88f]/10",
    },
    {
      label: "En attente",
      value: loading ? "—" : pendingCount,
      icon: Clock,
      color: pendingCount > 0 ? "bg-[#ffd803]/20" : "bg-[#f8fafc]",
    },
  ];

  return (
    <>
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#272343] tracking-tight">
            Espace <span className="text-[#ffd803]">Membre</span> 👋
          </h1>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Suivez vos cotisations et vos passages dans les cercles.
          </p>
        </div>
        <Link
          href="/dashboard/member/payments"
          className="btn-secondary flex items-center justify-center gap-2 px-6 py-4 shadow-sm hover:-translate-y-0.5 transition-all"
        >
          <CreditCard className="h-5 w-5" /> Mes paiements
        </Link>
        <button
          onClick={() => { setShowJoinModal(true); setJoinError(""); setJoinCode(""); }}
          className="btn-primary flex items-center justify-center gap-2 px-6 py-4 shadow-sm hover:-translate-y-0.5 transition-all"
        >
          <LogIn className="h-5 w-5" /> Rejoindre une tontine
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="card-base flex items-center gap-5 group hover:border-[#ffd803] transition-colors"
          >
            <div
              className={`p-4 ${stat.color} rounded-2xl group-hover:scale-110 transition-transform shrink-0`}
            >
              <stat.icon className="h-6 w-6 text-[#272343]" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-[#2d334a]/40">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-[#272343]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Prochain cycle à payer */}
      {nextCycle && (
        <div className="card-base bg-[#272343] border-none text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#ffd803]/10 rounded-2xl">
              <Calendar className="h-6 w-6 text-[#ffd803]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Cotisation à payer
              </p>
              <p className="font-black text-white text-lg">{nextCycle.circleName}</p>
              <p className="text-sm text-white/60 font-medium">
                Cycle #{nextCycle.number} · échéance{" "}
                {nextCycle.endDate
                  ? new Date(nextCycle.endDate).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                    })
                  : "—"}
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/member/pay?cycleId=${nextCycle.id}&circleId=${nextCycle.circleId}`}
            className="px-5 py-3 bg-[#ffd803] text-[#272343] rounded-xl font-black text-sm hover:bg-white transition-all shrink-0"
          >
            Payer {nextCycle.amount.toLocaleString("fr-FR")} FCFA
          </Link>
        </div>
      )}

      {/* Cercles rejoints */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#272343] flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-[#ffd803]" />
            Mes participations actives
          </h2>
          <Link
            href="/dashboard/member/order"
            className="text-xs font-black text-[#2d334a]/60 hover:text-[#272343] transition-colors"
          >
            Ordre de passage →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="card-base h-48 animate-pulse bg-gray-50 border-gray-100"
              />
            ))}
          </div>
        ) : joinedCircles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {joinedCircles.map((circle) => {
              const hasActiveCycle = circle.cycles?.some((c: any) => c.status === "OPEN");
              return (
                <Link
                  key={circle.id}
                  href={`/dashboard/circles/${circle.id}`}
                  className="card-base group hover:border-[#ffd803] transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2 py-1 bg-[#bae8e8] text-[#272343] text-[9px] font-black rounded-md uppercase tracking-wider">
                      {circle.frequency}
                    </span>
                    <div className="flex items-center gap-2">
                      {hasActiveCycle && (
                        <span className="w-2 h-2 rounded-full bg-[#42c88f] animate-pulse" />
                      )}
                      <ArrowUpRight className="h-5 w-5 text-[#2d334a]/20 group-hover:text-[#ffd803] transition-all" />
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-[#272343] mb-1">{circle.name}</h3>
                  <div className="flex items-center gap-2 text-sm font-bold text-[#2d334a]/60 mb-4">
                    <Wallet className="h-4 w-4 text-[#ffd803]" />
                    {circle.amount.toLocaleString("fr-FR")} FCFA / cycle
                  </div>
                  <div className="pt-4 border-t border-[#dfe5f2] flex items-center justify-between">
                    <span className="text-[10px] font-black text-[#2d334a]/40 uppercase">
                      {circle.memberships?.length || 0} membres
                    </span>
                    {hasActiveCycle ? (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#42c88f]/10 text-[#42c88f]">
                        Cycle en cours
                      </span>
                    ) : (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#dfe5f2] text-[#2d334a]/60">
                        En attente
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-[#dfe5f2]">
            <div className="bg-[#f8fafc] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-10 w-10 text-[#2d334a]/20" />
            </div>
            <h3 className="text-xl font-black text-[#272343] mb-2">
              Aucune tontine en cours
            </h3>
            <p className="text-[#2d334a]/60 font-medium mb-8 max-w-xs mx-auto">
              Utilisez un lien d&apos;invitation pour rejoindre votre premier cercle.
            </p>
          </div>
        )}
      </div>

      {/* Derniers paiements */}
      {confirmedPayments.length > 0 && (
        <div className="card-base">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-[#272343] flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#ffd803]" />
              Dernières cotisations
            </h2>
            <Link
              href="/dashboard/member/payments"
              className="text-xs font-black text-[#2d334a]/60 hover:text-[#272343] transition-colors"
            >
              Voir tout →
            </Link>
          </div>
          <div className="space-y-3">
            {confirmedPayments.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-2xl border border-[#dfe5f2]"
              >
                <div>
                  <p className="font-black text-[#272343] text-sm">
                    {p.amount.toLocaleString("fr-FR")} FCFA
                  </p>
                  <p className="text-[10px] text-[#2d334a]/40 font-bold uppercase tracking-widest">
                    Cycle #{p.cycle?.number} ·{" "}
                    {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-[#42c88f]/10 text-[#42c88f]">
                  Confirmé
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* ── Modal rejoindre avec code ── */}
    {showJoinModal && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-[#272343]">Rejoindre une tontine</h3>
              <p className="text-sm text-[#2d334a]/60 font-medium mt-0.5">
                Entrez le code d&apos;invitation reçu de l&apos;organisateur.
              </p>
            </div>
            <button
              onClick={() => setShowJoinModal(false)}
              className="p-2 hover:bg-[#f8fafc] rounded-xl transition-all"
            >
              <X className="h-5 w-5 text-[#2d334a]/60" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">
                Code d&apos;invitation
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => { setJoinCode(e.target.value); setJoinError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                placeholder="Ex: cm9abc123xyz..."
                className="input-base font-mono text-sm"
                autoFocus
              />
              <p className="text-xs text-[#2d334a]/40 font-medium">
                Le code se trouve à la fin du lien d&apos;invitation partagé par l&apos;organisateur.
              </p>
            </div>

            {joinError && (
              <div className="flex items-center gap-2 p-3 bg-[#f25f4c]/10 border border-[#f25f4c]/20 rounded-xl">
                <AlertCircle className="h-4 w-4 text-[#f25f4c] shrink-0" />
                <p className="text-sm text-[#f25f4c] font-bold">{joinError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-black text-[#272343] hover:bg-[#e3f6f5] transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleJoin}
                disabled={joinLoading || !joinCode.trim()}
                className="flex-1 py-3 bg-[#ffd803] text-[#272343] rounded-xl font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[#e0c700]"
              >
                {joinLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                Rejoindre
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
