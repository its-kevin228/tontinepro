"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Clock,
  Wallet,
  Users,
  Trophy,
  Loader2,
  ChevronRight,
  CircleDot,
} from "lucide-react";

interface CircleMembership {
  id: string;
  role: string;
  order: number | null;
  circle: {
    id: string;
    name: string;
    amount: number;
    frequency: string;
    status: string;
    memberships: { id: string; order: number | null; user?: { id: string; name: string } }[];
    cycles: {
      id: string;
      number: number;
      status: string;
      startDate: string;
      endDate: string | null;
      beneficiary: string | null;
    }[];
  };
}

interface UserProfile {
  memberships: CircleMembership[];
}

export default function MemberOrderPage() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<CircleMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data: { user: UserProfile } = await fetchApi("/users/me");

        // Filtrer uniquement les cercles où l'utilisateur est MEMBRE
        const memberOnly = (data.user.memberships ?? []).filter(
          (m) => m.role === "MEMBRE"
        );

        // Charger les détails complets de chaque cercle (memberships + cycles)
        const enriched = await Promise.all(
          memberOnly.map(async (m) => {
            try {
              const circleData = await fetchApi(`/circles/${m.circle.id}`);
              return { ...m, circle: circleData.circle };
            } catch {
              return m; // garder tel quel si erreur
            }
          })
        );

        setMemberships(enriched);
        if (enriched.length > 0) setSelected(enriched[0].circle.id);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const selectedMembership = memberships.find((m) => m.circle.id === selected);
  const circle = selectedMembership?.circle;

  // Trier les membres par ordre de passage
  const sortedMembers = circle
    ? [...(circle.memberships ?? [])].sort((a, b) => {
        if (a.order === null && b.order === null) return 0;
        if (a.order === null) return 1;
        if (b.order === null) return -1;
        return a.order - b.order;
      })
    : [];

  // Cycle actif
  const activeCycle = circle?.cycles?.find((c: any) => c.status === "OPEN");
  const closedCycles = circle?.cycles?.filter((c: any) => c.status === "CLOSED") ?? [];

  const totalPot = circle ? circle.amount * ((circle.memberships ?? []).length) : 0;

  // Calculer la date estimée de passage de l'utilisateur
  const myOrder = selectedMembership?.order;
  const getEstimatedDate = (order: number | null) => {
    if (!order || !activeCycle?.startDate) return null;
    const start = new Date(activeCycle.startDate);
    const freq = circle?.frequency;
    const daysPerCycle = freq === "WEEKLY" ? 7 : freq === "BIWEEKLY" ? 14 : 30;
    const estimatedDate = new Date(start);
    estimatedDate.setDate(estimatedDate.getDate() + (order - 1) * daysPerCycle);
    return estimatedDate;
  };

  const myEstimatedDate = myOrder ? getEstimatedDate(myOrder) : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-[#272343] tracking-tight">
          Ordre de <span className="text-[#ffd803]">Passage</span>
        </h1>
        <p className="text-[#2d334a]/60 font-medium mt-1">
          Consultez quand vous recevrez la cagnotte dans chaque cercle.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-[#f25f4c]/10 border border-[#f25f4c]/20 text-[#f25f4c] rounded-2xl font-bold text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-[#ffd803]" />
        </div>
      ) : memberships.length === 0 ? (
        <div className="card-base text-center py-24">
          <Users className="h-12 w-12 text-[#2d334a]/20 mx-auto mb-4" />
          <p className="font-black text-[#272343] text-lg">Aucune participation</p>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Rejoignez un cercle via un lien d'invitation pour voir votre ordre de passage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sélecteur de cercle */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">
              Mes cercles
            </p>
            {memberships.map((m) => (
              <button
                key={m.circle.id}
                onClick={() => setSelected(m.circle.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                  selected === m.circle.id
                    ? "border-[#ffd803] bg-[#ffd803]/5"
                    : "border-[#dfe5f2] bg-white hover:border-[#ffd803]/40"
                }`}
              >
                <div>
                  <p className="font-black text-[#272343] text-sm">{m.circle.name}</p>
                  <p className="text-[10px] text-[#2d334a]/40 font-bold uppercase tracking-widest mt-0.5">
                    {m.circle.frequency} · {m.circle.amount.toLocaleString()} FCFA
                  </p>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-all ${
                    selected === m.circle.id
                      ? "text-[#ffd803] translate-x-1"
                      : "text-[#2d334a]/20 group-hover:translate-x-1"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Détail du cercle sélectionné */}
          {circle && (
            <div className="lg:col-span-2 space-y-6">
              {/* Ma position */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-base bg-[#272343] text-white border-none">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Mon passage
                  </p>
                  <p className="text-4xl font-black mt-2">
                    {myOrder !== null && myOrder !== undefined ? `#${myOrder}` : "—"}
                  </p>
                  <p className="text-xs text-white/60 font-medium mt-1">
                    sur {(circle.memberships ?? []).length} membres
                  </p>
                </div>

                <div className="card-base">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#2d334a]/40">
                    Date estimée
                  </p>
                  <p className="text-xl font-black text-[#272343] mt-2">
                    {myEstimatedDate
                      ? myEstimatedDate.toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "—"}
                  </p>
                  <p className="text-xs text-[#2d334a]/60 font-medium mt-1">
                    {myEstimatedDate
                      ? myEstimatedDate.toLocaleDateString("fr-FR", { year: "numeric" })
                      : "Ordre non défini"}
                  </p>
                </div>

                <div className="card-base bg-[#ffd803]/5 border-[#ffd803]/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#2d334a]/40">
                    Cagnotte à recevoir
                  </p>
                  <p className="text-xl font-black text-[#272343] mt-2">
                    {totalPot.toLocaleString()} FCFA
                  </p>
                  <p className="text-xs text-[#2d334a]/60 font-medium mt-1">
                    {(circle.memberships ?? []).length} × {circle.amount.toLocaleString()} FCFA
                  </p>
                </div>
              </div>

              {/* Cycle actif */}
              {activeCycle && (
                <div className="p-4 bg-[#42c88f]/5 border border-[#42c88f]/20 rounded-2xl flex items-center gap-3">
                  <CircleDot className="h-5 w-5 text-[#42c88f] shrink-0" />
                  <div>
                    <p className="font-black text-[#272343] text-sm">
                      Cycle #{activeCycle.number} en cours
                    </p>
                    <p className="text-xs text-[#2d334a]/60 font-medium">
                      Débuté le {new Date(activeCycle.startDate).toLocaleDateString("fr-FR")}
                      {activeCycle.endDate &&
                        ` · Fin le ${new Date(activeCycle.endDate).toLocaleDateString("fr-FR")}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Ordre de passage */}
              <div className="card-base">
                <h2 className="text-lg font-black text-[#272343] mb-5 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#ffd803]" />
                  Ordre de passage complet
                </h2>

                {sortedMembers.length === 0 ? (
                  <p className="text-sm text-[#2d334a]/60 font-medium text-center py-8">
                    L'ordre de passage n'a pas encore été défini par l'organisateur.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sortedMembers.map((member, idx) => {
                      const isMe = member.user?.id === user?.id;
                      const isBeneficiary = closedCycles.some(
                        (c) => c.beneficiary === member.user?.id
                      );
                      const estimatedDate = getEstimatedDate(member.order);

                      return (
                        <div
                          key={member.id}
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                            isMe
                              ? "border-[#ffd803] bg-[#ffd803]/5"
                              : "border-[#dfe5f2] bg-[#f8fafc]"
                          }`}
                        >
                          {/* Numéro */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                              isMe
                                ? "bg-[#ffd803] text-[#272343]"
                                : isBeneficiary
                                ? "bg-[#42c88f] text-white"
                                : "bg-white border border-[#dfe5f2] text-[#2d334a]/40"
                            }`}
                          >
                            {isBeneficiary ? (
                              <Trophy className="h-4 w-4" />
                            ) : (
                              member.order ?? idx + 1
                            )}
                          </div>

                          {/* Nom */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-black text-sm ${
                                isMe ? "text-[#272343]" : "text-[#272343]"
                              }`}
                            >
                              {member.user?.name ?? "Membre"}
                              {isMe && (
                                <span className="ml-2 text-[9px] font-black bg-[#ffd803] text-[#272343] px-1.5 py-0.5 rounded-md">
                                  MOI
                                </span>
                              )}
                            </p>
                            {estimatedDate && (
                              <p className="text-[10px] text-[#2d334a]/40 font-bold mt-0.5">
                                Estimé :{" "}
                                {estimatedDate.toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            )}
                          </div>

                          {/* Montant */}
                          <div className="text-right shrink-0">
                            <p className="font-black text-[#272343] text-sm">
                              {totalPot.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-[#2d334a]/40 font-bold">FCFA</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Historique des cycles */}
              {closedCycles.length > 0 && (
                <div className="card-base">
                  <h2 className="text-lg font-black text-[#272343] mb-5 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#ffd803]" />
                    Cycles passés
                  </h2>
                  <div className="space-y-3">
                    {closedCycles.map((cycle) => (
                      <div
                        key={cycle.id}
                        className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl border border-[#dfe5f2]"
                      >
                        <div>
                          <p className="font-black text-[#272343] text-sm">
                            Cycle #{cycle.number}
                          </p>
                          <p className="text-[10px] text-[#2d334a]/40 font-bold uppercase tracking-widest mt-0.5">
                            Clôturé le{" "}
                            {cycle.endDate
                              ? new Date(cycle.endDate).toLocaleDateString("fr-FR")
                              : "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black px-2 py-1 bg-[#42c88f]/10 text-[#42c88f] rounded-lg">
                            Terminé
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
