"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import {
  Users,
  Plus,
  ArrowUpRight,
  Wallet,
  ShieldCheck,
  TrendingUp,
  LayoutGrid,
  Activity,
  Calendar,
  AlertTriangle,
  Clock,
  FileCheck,
} from "lucide-react";
import Link from "next/link";

export default function OrganizerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [circles, setCircles] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  // Rediriger les membres purs vers leur espace
  useEffect(() => {
    if (user && user.role === "MEMBRE") {
      router.replace("/dashboard/member");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [circlesData, profileData] = await Promise.all([
          fetchApi("/circles"),
          fetchApi("/users/me"),
        ]);
        setCircles(circlesData.circles || []);
        setKycStatus(profileData.user?.kycRequest?.status ?? null);

        // Analytics uniquement pour les organisateurs et super admins
        if (user.role === "ORGANISATEUR" || user.role === "SUPER_ADMIN") {
          const analyticsData = await fetchApi("/organizer/analytics");
          setAnalytics(analyticsData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const stats = [
    {
      label: "Cercles créés",
      value: loading ? "—" : circles.length,
      icon: ShieldCheck,
      color: "bg-[#ffd803]/20",
    },
    {
      label: "Membres actifs",
      value: loading ? "—" : (analytics?.stats?.activeMembers ?? 0),
      icon: Users,
      color: "bg-[#bae8e8]",
    },
    {
      label: "Volume géré",
      value: loading
        ? "—"
        : `${(analytics?.stats?.totalVolume ?? 0).toLocaleString("fr-FR")} FCFA`,
      icon: Wallet,
      color: "bg-[#e3f6f5]",
    },
    {
      label: "Taux de recouvrement",
      value: loading
        ? "—"
        : analytics?.stats?.collectionRate != null
        ? `${analytics.stats.collectionRate}%`
        : "N/A",
      icon: Activity,
      color: "bg-[#272343]/5",
    },
  ];

  // KYC bloque la création de cercle si pas approuvé (sauf Super Admin)
  const kycApproved = user?.role === "SUPER_ADMIN" || kycStatus === "APPROVED";
  const needsKyc = user?.role === "ORGANISATEUR" && !kycApproved;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-[#272343] tracking-tight">
            Espace <span className="text-[#ffd803]">Organisateur</span> 💼
          </h1>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Gérez vos cercles, validez les paiements et suivez les cycles.
          </p>
        </div>
        {kycApproved ? (
          <Link
            href="/dashboard/circles/new"
            className="btn-primary flex items-center justify-center gap-2 px-6 py-4 shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Plus className="h-5 w-5" /> Nouveau Cercle
          </Link>
        ) : (
          <Link
            href="/dashboard/profile"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#ffd803]/10 border-2 border-[#ffd803]/30 text-[#b38a00] font-black rounded-2xl hover:bg-[#ffd803]/20 transition-all"
          >
            <AlertTriangle className="h-5 w-5" />
            Compléter mon KYC
          </Link>
        )}
      </div>

      {/* Bannière KYC */}
      {needsKyc && (
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border-2 ${
          kycStatus === "PENDING"
            ? "bg-[#ffd803]/5 border-[#ffd803]/30"
            : kycStatus === "REJECTED"
            ? "bg-[#f25f4c]/5 border-[#f25f4c]/20"
            : "bg-[#bae8e8]/10 border-[#bae8e8]"
        }`}>
          <div className="flex items-start gap-3">
            {kycStatus === "PENDING" ? (
              <Clock className="h-5 w-5 text-[#b38a00] shrink-0 mt-0.5" />
            ) : kycStatus === "REJECTED" ? (
              <AlertTriangle className="h-5 w-5 text-[#f25f4c] shrink-0 mt-0.5" />
            ) : (
              <FileCheck className="h-5 w-5 text-[#272343] shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-black text-sm text-[#272343]">
                {kycStatus === "PENDING"
                  ? "Vérification d'identité en cours"
                  : kycStatus === "REJECTED"
                  ? "Vérification d'identité rejetée"
                  : "Vérification d'identité requise"}
              </p>
              <p className="text-xs text-[#2d334a]/60 font-medium mt-0.5">
                {kycStatus === "PENDING"
                  ? "Votre demande est en cours d'examen. Vous serez notifié dès qu'elle sera traitée."
                  : kycStatus === "REJECTED"
                  ? "Votre demande a été rejetée. Soumettez de nouveaux documents pour créer des cercles."
                  : "Soumettez votre pièce d'identité pour pouvoir créer des cercles de tontine."}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/profile"
            className="shrink-0 px-4 py-2 bg-[#272343] text-[#ffd803] text-xs font-black rounded-xl hover:bg-[#1a1730] transition-all"
          >
            {kycStatus === "REJECTED" ? "Resoumettre" : kycStatus === "PENDING" ? "Voir le statut" : "Soumettre mon KYC"}
          </Link>
        </div>
      )}

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

      {/* Prochain versement */}
      {analytics?.nextPayout && (
        <div className="card-base bg-[#272343] border-none text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#ffd803]/10 rounded-2xl">
              <Calendar className="h-6 w-6 text-[#ffd803]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Prochain versement
              </p>
              <p className="font-black text-white text-lg">
                {analytics.nextPayout.circleName}
              </p>
              <p className="text-sm text-white/60 font-medium">
                {new Date(analytics.nextPayout.date).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · dans{" "}
                <span className="text-[#ffd803] font-black">
                  {analytics.nextPayout.daysLeft}j
                </span>
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/circles/${analytics.nextPayout.circleId}`}
            className="px-5 py-3 bg-[#ffd803] text-[#272343] rounded-xl font-black text-sm hover:bg-white transition-all shrink-0"
          >
            Gérer le cercle
          </Link>
        </div>
      )}

      {/* Mes cercles */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#272343] flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-[#ffd803]" />
            Cercles sous ma gestion
          </h2>
          <Link
            href="/dashboard/circles"
            className="text-xs font-black text-[#2d334a]/60 hover:text-[#272343] transition-colors"
          >
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card-base h-48 animate-pulse bg-gray-50 border-gray-100"
              />
            ))}
          </div>
        ) : circles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {circles.slice(0, 6).map((circle) => (
              <Link
                key={circle.id}
                href={`/dashboard/circles/${circle.id}`}
                className="card-base group hover:border-[#ffd803] transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 bg-[#272343] text-[#fffffe] text-[9px] font-black rounded-md uppercase tracking-wider">
                    {circle.frequency}
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-[#2d334a]/20 group-hover:text-[#ffd803] transition-all" />
                </div>
                <h3 className="text-lg font-black text-[#272343] mb-1">{circle.name}</h3>
                <p className="text-sm text-[#2d334a]/60 font-medium mb-4">
                  {circle.amount.toLocaleString("fr-FR")} FCFA / cycle
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-[#dfe5f2]">
                  <div className="flex items-center gap-1 text-[10px] font-black text-[#2d334a]/40 uppercase">
                    <Users className="h-3 w-3" />
                    {circle.memberships?.length || 0} / {circle.maxMembers} membres
                  </div>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      circle.status === "CLOSED"
                        ? "bg-[#dfe5f2] text-[#2d334a]/60"
                        : "bg-[#42c88f]/10 text-[#42c88f]"
                    }`}
                  >
                    {circle.status === "CLOSED" ? "Terminé" : "En cours"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-[#dfe5f2]">
            <div className="bg-[#f8fafc] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Plus className="h-10 w-10 text-[#2d334a]/20" />
            </div>
            <h3 className="text-xl font-black text-[#272343] mb-2">
              Prêt à lancer votre tontine ?
            </h3>
            <p className="text-[#2d334a]/60 font-medium mb-8 max-w-xs mx-auto">
              Créez votre premier cercle et invitez vos membres.
            </p>
            <Link href="/dashboard/circles/new" className="btn-primary px-8 inline-block">
              Créer un cercle
            </Link>
          </div>
        )}
      </div>

      {/* Top membres */}
      {analytics?.topMembers?.length > 0 && (
        <div className="card-base">
          <h2 className="text-lg font-black text-[#272343] mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#ffd803]" />
            Membres les plus actifs
          </h2>
          <div className="space-y-3">
            {analytics.topMembers.map((m: any, i: number) => (
              <div
                key={m.userId}
                className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-2xl border border-[#dfe5f2]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#bae8e8] rounded-xl flex items-center justify-center font-black text-sm text-[#272343]">
                    {i + 1}
                  </div>
                  <p className="font-black text-[#272343] text-sm">{m.name}</p>
                </div>
                <span className="text-xs font-black text-[#2d334a]/60">
                  {m.paymentsCount} cotisation{m.paymentsCount > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
