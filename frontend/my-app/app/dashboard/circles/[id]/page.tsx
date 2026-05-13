"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/lib/auth-context";
import { 
  Users, Wallet, Link as LinkIcon, Copy, Check, Loader2, ArrowLeft, Plus,
  X, ChevronUp, ChevronDown, GripVertical, XCircle, CheckCircle2, CreditCard
} from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

import { useToast } from "@/lib/toast";

export default function CircleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [circle, setCircle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  
  // Modal clôture cycle
  const [closeModal, setCloseModal] = useState(false);
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [closingCycle, setClosingCycle] = useState(false);
  
  // Gestion ordre de passage
  const [orderMode, setOrderMode] = useState(false);
  const [tempOrder, setTempOrder] = useState<any[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    fetchCircleDetails();
  }, [id]);

  const fetchCircleDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/circles/${id}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCircle(data.circle);
        setTempOrder(data.circle.memberships || []);
      }
    } catch (error) {
      console.error("Failed to fetch circle details", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualPayment = async (memberId: string, cycleId: string, amount: number) => {
    setPaymentLoading(memberId);
    try {
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ cycleId, memberId, amount, method: "CASH" })
      });
      if (response.ok) {
        await fetchCircleDetails();
        success("Paiement validé avec succès");
      } else {
        const error = await response.json();
        toastError(error.error || "Erreur lors de la validation");
      }
    } catch (e) {
      console.error(e);
      toastError("Erreur réseau");
    } finally {
      setPaymentLoading(null);
    }
  };

  const generateInvite = async () => {
    setInviteLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/circles/${id}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (response.ok) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setInviteLink(`${origin}/join/${data.invitation.token}`);
        setInviteToken(data.invitation.token);
      }
    } catch (error) {
      console.error("Failed to generate invite", error);
    } finally {
      setInviteLoading(false);
    }
  };

  const revokeInvite = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/invitations/${inviteToken}/revoke`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.ok) {
        setInviteLink("");
        setInviteToken("");
        success("Invitation révoquée");
      }
    } catch (error) {
      console.error("Failed to revoke invite", error);
    }
  };

  const handleStartCycle = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/circles/${id}/cycles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (response.ok) {
        success("Cycle démarré avec succès");
        fetchCircleDetails();
      } else {
        const err = await response.json();
        toastError(err.error || "Erreur lors du démarrage du cycle");
      }
    } catch (e) {
      console.error(e);
      toastError("Erreur réseau");
    }
  };

  const handleCloseCycle = async () => {
    if (!beneficiaryId) {
      toastError("Veuillez sélectionner un bénéficiaire");
      return;
    }
    setClosingCycle(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cycles/${activeCycle.id}/close`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ beneficiaryId })
      });
      if (response.ok) {
        success("Cycle clôturé avec succès");
        setCloseModal(false);
        setBeneficiaryId("");
        fetchCircleDetails();
      } else {
        const err = await response.json();
        toastError(err.error || "Erreur lors de la clôture");
      }
    } catch (e) {
      console.error(e);
      toastError("Erreur réseau");
    } finally {
      setClosingCycle(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...tempOrder];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setTempOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === tempOrder.length - 1) return;
    const newOrder = [...tempOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setTempOrder(newOrder);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const orders = tempOrder.map((m, idx) => ({
        userId: m.user.id,
        order: idx + 1
      }));
      const response = await fetch(`${API_BASE_URL}/circles/${id}/order`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ orders })
      });
      if (response.ok) {
        success("Ordre de passage sauvegardé");
        setOrderMode(false);
        fetchCircleDetails();
      } else {
        const err = await response.json();
        toastError(err.error || "Erreur lors de la sauvegarde");
      }
    } catch (e) {
      console.error(e);
      toastError("Erreur réseau");
    } finally {
      setSavingOrder(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#ffd803] h-10 w-10" /></div>;
  if (!circle) return <div className="text-center p-20 font-bold text-[#272343]">Cercle non trouvé.</div>;

  const activeCycle = circle.cycles?.find((c: any) => c.status === "OPEN");
  const isOrganizer = user?.id === circle.creator?.id;
  const isOrganizerFallback = user?.id === circle.creatorId;
  const isOrganizerFinal = isOrganizer || isOrganizerFallback;
  const isMember = !isOrganizerFinal && circle.memberships?.some(
    (m: any) => m.user?.id === user?.id || m.userId === user?.id
  );

  // Vérifier si le membre connecté a déjà payé ce cycle
  const myPayment = activeCycle?.payments?.find(
    (p: any) => p.userId === user?.id && (p.status === "CONFIRMED" || p.status === "PENDING")
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link href="/dashboard/circles" className="inline-flex items-center gap-2 text-[#2d334a]/60 hover:text-[#272343] font-bold transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Retour aux cercles
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne Gauche */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-base bg-white overflow-hidden relative ">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <span className="px-3 py-1 bg-[#e3f6f5] text-[#272343] text-[10px] font-bold rounded-full uppercase tracking-widest mb-4 inline-block">
                  {{ WEEKLY: "Hebdomadaire", BIWEEKLY: "Bimensuel", MONTHLY: "Mensuel" }[circle.frequency as string] ?? circle.frequency}
                </span>
                <h1 className="text-3xl font-extrabold mb-2 text-[#272343]">{circle.name}</h1>
                <p className="text-[#2d334a]/60 font-medium mb-6">{circle.description || "Pas de description."}</p>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 bg-[#f8fafc] px-5 py-3 rounded-2xl border border-[#dfe5f2] shadow-sm">
                    <div className="p-2 bg-[#ffd803]/20 rounded-lg">
                      <Wallet className="h-5 w-5 text-[#272343]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#2d334a]/40 tracking-wider">Montant</p>
                      <p className="font-extrabold text-[#272343]">{circle.amount.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[#f8fafc] px-5 py-3 rounded-2xl border border-[#dfe5f2] shadow-sm">
                    <div className="p-2 bg-[#bae8e8]/30 rounded-lg">
                      <Users className="h-5 w-5 text-[#272343]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#2d334a]/40 tracking-wider">Capacité</p>
                      <p className="font-extrabold text-[#272343]">{circle.memberships?.length || 0} / {circle.maxMembers}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Cycle Actif */}
            {circle.status === "CLOSED" ? (
              <div className="mt-8 p-5 bg-[#f8fafc] border border-[#dfe5f2] rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#2d334a]/30 shrink-0" />
                <div>
                  <p className="font-black text-[#272343] text-sm">Tontine terminée</p>
                  <p className="text-xs text-[#2d334a]/60 font-medium mt-0.5">
                    Ce cercle a été clôturé. Tous les membres ont reçu leur tour.
                  </p>
                </div>
              </div>
            ) : activeCycle ? (
              <div className="mt-8 space-y-3">
                <div className="bg-[#fffffe] border-l-4 p-5 rounded-r-2xl shadow-sm border-t border-r border-b border-[#dfe5f2]">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-[#272343] font-bold text-sm flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                         Cycle Actif #{activeCycle.number}
                      </h4>
                      <p className="text-[11px] text-[#2d334a]/60 font-medium mt-1">
                        Débuté le {new Date(activeCycle.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-[#2d334a]/40 tracking-wider">Cagnotte</p>
                        <p className="font-extrabold text-[#272343]">{(circle.memberships?.length || 0) * circle.amount} FCFA</p>
                      </div>
                      {isOrganizerFinal && (
                        <button
                          onClick={() => setCloseModal(true)}
                          className="px-4 py-2 bg-[#272343] text-[#ffd803] text-xs font-black rounded-xl hover:bg-[#1a1730] transition-all"
                        >
                          Clôturer
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bouton paiement membre */}
                {isMember && (
                  myPayment ? (
                    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
                      myPayment.status === "CONFIRMED"
                        ? "bg-[#42c88f]/5 border-[#42c88f]/20"
                        : "bg-[#ffd803]/5 border-[#ffd803]/30"
                    }`}>
                      <CheckCircle2 className={`h-5 w-5 shrink-0 ${
                        myPayment.status === "CONFIRMED" ? "text-[#42c88f]" : "text-[#b38a00]"
                      }`} />
                      <p className="text-sm font-black text-[#272343]">
                        {myPayment.status === "CONFIRMED"
                          ? `Cotisation payée ✓ — ${circle.amount.toLocaleString()} FCFA`
                          : "Paiement en cours de validation…"}
                      </p>
                    </div>
                  ) : (
                    <Link
                      href={`/dashboard/member/pay?cycleId=${activeCycle.id}&circleId=${id}`}
                      className="flex items-center justify-center gap-2 w-full py-4 bg-[#ffd803] text-[#272343] font-black rounded-2xl hover:bg-[#e0c700] transition-all shadow-lg shadow-[#ffd803]/20"
                    >
                      <CreditCard className="h-5 w-5" />
                      Payer ma cotisation — {circle.amount.toLocaleString()} FCFA
                    </Link>
                  )
                )}
              </div>
            ) : (
              isOrganizerFinal && (
                <div className="mt-8 space-y-3">
                  <button
                    onClick={handleStartCycle}
                    className="w-full sm:w-auto px-6 py-3 bg-[#ffd803] text-[#272343] font-bold rounded-xl hover:bg-[#ffd803]/80 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="h-4 w-4" /> Démarrer un nouveau cycle
                  </button>

                  {/* Fermer le cercle — visible seulement si au moins un cycle a été clôturé */}
                  {circle.cycles?.some((c: any) => c.status === "CLOSED") && (
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(`${API_BASE_URL}/circles/${id}`, {
                            method: "PATCH",
                            headers: {
                              "Content-Type": "application/json",
                              "Authorization": `Bearer ${localStorage.getItem("token")}`
                            },
                            body: JSON.stringify({ status: "CLOSED" })
                          });
                          if (response.ok) {
                            success("Cercle fermé. La tontine est terminée.");
                            fetchCircleDetails();
                          } else {
                            const err = await response.json();
                            toastError(err.error || "Erreur");
                          }
                        } catch {
                          toastError("Erreur réseau");
                        }
                      }}
                      className="w-full sm:w-auto px-6 py-3 bg-[#f8fafc] border border-[#dfe5f2] text-[#2d334a]/60 font-bold rounded-xl hover:bg-[#f25f4c]/5 hover:border-[#f25f4c]/20 hover:text-[#f25f4c] transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      Fermer définitivement ce cercle
                    </button>
                  )}
                </div>
              )
            )}
          </div>

          {/* Membres */}
          <div className="card-base">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-[#272343]">
                <Users className="h-5 w-5 text-[#ffd803]" /> Membres ({circle.memberships?.length || 0})
              </h3>
              {isOrganizerFinal && !orderMode && (
                <button
                  onClick={() => { setOrderMode(true); setTempOrder(circle.memberships || []); }}
                  className="text-xs font-black px-4 py-2 bg-[#e3f6f5] text-[#272343] rounded-xl hover:bg-[#bae8e8] transition-all"
                >
                  Définir l'ordre
                </button>
              )}
              {orderMode && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setOrderMode(false); setTempOrder(circle.memberships || []); }}
                    className="text-xs font-black px-4 py-2 bg-[#f8fafc] border border-[#dfe5f2] text-[#272343] rounded-xl hover:bg-[#e3f6f5] transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveOrder}
                    disabled={savingOrder}
                    className="text-xs font-black px-4 py-2 bg-[#42c88f] text-white rounded-xl hover:bg-[#38b07d] transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    {savingOrder ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                    Sauvegarder
                  </button>
                </div>
              )}
            </div>

            {circle.memberships?.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {(orderMode ? tempOrder : circle.memberships).map((m: any, idx: number) => {
                  const hasPaidThisCycle = activeCycle?.payments?.some((p: any) => p.userId === m.user.id && p.status === "CONFIRMED");
                  
                  return (
                    <div key={m.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#f8fafc] rounded-2xl border border-[#dfe5f2] hover:border-[#bae8e8] transition-colors gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        {orderMode && (
                          <div className="flex flex-col gap-1">
                            <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 hover:bg-[#e3f6f5] rounded disabled:opacity-30">
                              <ChevronUp className="h-3 w-3 text-[#272343]" />
                            </button>
                            <GripVertical className="h-4 w-4 text-[#2d334a]/40" />
                            <button onClick={() => moveDown(idx)} disabled={idx === tempOrder.length - 1} className="p-1 hover:bg-[#e3f6f5] rounded disabled:opacity-30">
                              <ChevronDown className="h-3 w-3 text-[#272343]" />
                            </button>
                          </div>
                        )}
                        <div className="w-10 h-10 bg-[#bae8e8] rounded-full flex items-center justify-center font-bold text-sm text-[#272343] border-2 border-white shadow-sm shrink-0">
                          {orderMode ? idx + 1 : (m.order || idx + 1)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#272343]">{m.user.name}</p>
                          <p className="text-[10px] text-[#2d334a]/40 font-bold uppercase">{m.role}</p>
                        </div>
                      </div>
                      
                      {!orderMode && (
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                          {m.user.id === circle.creator.id && (
                            <span className="px-2 py-1 bg-[#ffd803]/10 text-[#272343] text-[9px] font-bold rounded-md">ORG</span>
                          )}
                          
                          {activeCycle && isOrganizerFinal && m.user.id !== user?.id && (
                            hasPaidThisCycle ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                <Check className="h-3 w-3" /> Payé
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleManualPayment(m.user.id, activeCycle.id, circle.amount)}
                                disabled={paymentLoading === m.user.id}
                                className="text-[10px] font-bold bg-[#bae8e8] hover:bg-[#bae8e8]/80 text-[#272343] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                              >
                                {paymentLoading === m.user.id ? <Loader2 className="h-3 w-3 animate-spin"/> : <Wallet className="h-3 w-3" />}
                                Valider
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#f8fafc] rounded-[32px] border-2 border-dashed border-[#dfe5f2]">
                <Users className="h-10 w-10 text-[#2d334a]/20 mx-auto mb-4" />
                <p className="text-[#2d334a]/40 font-bold mb-6">Aucun membre pour le moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Colonne Droite */}
        <div className="space-y-6">
          <div className="card-base bg-[#272343] text-white border-none shadow-[0_20px_50px_rgba(39,35,67,0.15)] relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-[#ffd803]" /> Recrutement
              </h3>
              <p className="text-white/60 text-sm mb-6 font-medium leading-relaxed">
                Partagez ce lien sécurisé pour recruter des membres.
              </p>
              
              {inviteLink ? (
                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      readOnly 
                      value={inviteLink}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-xs font-mono text-white/90 focus:outline-none"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className="absolute right-2 top-2 p-2 bg-[#ffd803] text-[#272343] rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  {copied && <p className="text-[10px] text-[#ffd803] font-bold text-center animate-pulse">Copié !</p>}
                  <button
                    onClick={revokeInvite}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#f25f4c] text-white text-xs font-black rounded-xl hover:bg-[#d94f3d] transition-all"
                  >
                    <XCircle className="h-4 w-4" />
                    Révoquer cette invitation
                  </button>
                </div>
              ) : (
                <button 
                  onClick={generateInvite} 
                  disabled={inviteLoading} 
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 shadow-xl"
                >
                  {inviteLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  Générer le lien
                </button>
              )}
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-[#e3f6f5] p-8 rounded-[32px] border border-[#bae8e8]">
            <h4 className="font-bold text-sm mb-4 text-[#272343]">Statistiques</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#2d334a]/60">Places restantes</span>
                <span className="font-extrabold text-[#272343]">{circle.maxMembers - (circle.memberships?.length || 0)}</span>
              </div>
              <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#ffd803] h-full transition-all duration-1000" 
                  style={{ width: `${((circle.memberships?.length || 0) / circle.maxMembers) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Clôture Cycle */}
      {closeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-[#272343]">Clôturer le cycle #{activeCycle?.number}</h3>
              <button onClick={() => setCloseModal(false)} className="p-2 hover:bg-[#f8fafc] rounded-xl transition-all">
                <X className="h-5 w-5 text-[#2d334a]/60" />
              </button>
            </div>
            <p className="text-sm text-[#2d334a]/60 font-medium mb-6">
              Sélectionnez le membre qui recevra la cagnotte de ce cycle.
            </p>
            <select
              value={beneficiaryId}
              onChange={(e) => setBeneficiaryId(e.target.value)}
              className="input-base mb-6"
            >
              <option value="">-- Choisir un bénéficiaire --</option>
              {circle.memberships?.map((m: any) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name} {m.order ? `(#${m.order})` : ""}
                </option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setCloseModal(false)}
                className="flex-1 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-black text-[#272343] hover:bg-[#e3f6f5] transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleCloseCycle}
                disabled={closingCycle || !beneficiaryId}
                className="flex-1 py-3 bg-[#272343] text-[#ffd803] rounded-xl font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {closingCycle ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
