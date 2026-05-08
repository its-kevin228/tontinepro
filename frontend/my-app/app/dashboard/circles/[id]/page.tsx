"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/lib/auth-context";
import { Users, Calendar, Wallet, Link as LinkIcon, Copy, Check, Loader2, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

export default function CircleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [circle, setCircle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCircleDetails();
  }, [id]);

  const fetchCircleDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/circles/${id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCircle(data.circle);
      }
    } catch (error) {
      console.error("Failed to fetch circle details", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvite = async () => {
    setInviteLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/invitations/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ circleId: id })
      });
      const data = await response.json();
      if (response.ok) {
        setInviteLink(data.url);
      }
    } catch (error) {
      console.error("Failed to generate invite", error);
    } finally {
      setInviteLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#ffd803] h-10 w-10" /></div>;
  if (!circle) return <div className="text-center p-20 font-bold text-[#272343]">Cercle non trouvé.</div>;

  return (
    <div className="space-y-8">
      <Link href="/dashboard/circles" className="inline-flex items-center gap-2 text-[#2d334a]/60 hover:text-[#272343] font-bold transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Retour aux cercles
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne Gauche: Infos Cercle */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-base bg-white overflow-hidden relative border-l-4 border-l-[#ffd803]">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <span className="px-3 py-1 bg-[#e3f6f5] text-[#272343] text-[10px] font-bold rounded-full uppercase tracking-widest mb-4 inline-block">
                  {circle.frequency}
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
                      <p className="font-extrabold text-[#272343]">{circle.members?.length || 0} / {circle.maxMembers}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-base">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#272343]">
              <Users className="h-5 w-5 text-[#ffd803]" /> Membres Actuels
            </h3>
            {circle.members?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {circle.members.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-2xl border border-[#dfe5f2] hover:border-[#bae8e8] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#bae8e8] rounded-full flex items-center justify-center font-bold text-sm text-[#272343] border-2 border-white shadow-sm">
                        {m.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#272343]">{m.user.name}</p>
                        <p className="text-[10px] text-[#2d334a]/40 font-bold uppercase">{m.role}</p>
                      </div>
                    </div>
                    {m.user.id === circle.creatorId && (
                      <span className="px-2 py-1 bg-[#ffd803]/10 text-[#272343] text-[9px] font-bold rounded-md">ORG</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#f8fafc] rounded-[32px] border-2 border-dashed border-[#dfe5f2]">
                <Users className="h-10 w-10 text-[#2d334a]/20 mx-auto mb-4" />
                <p className="text-[#2d334a]/40 font-bold mb-6">Aucun membre pour le moment.</p>
                {!inviteLink && (
                  <button onClick={generateInvite} disabled={inviteLoading} className="btn-primary flex items-center gap-2 mx-auto">
                    {inviteLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                    Générer un lien d'invitation
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Colonne Droite: Invitation & Actions */}
        <div className="space-y-6">
          <div className="card-base bg-[#272343] text-white border-none shadow-[0_20px_50px_rgba(39,35,67,0.15)] relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-[#ffd803]" /> Recrutement
              </h3>
              <p className="text-white/60 text-sm mb-6 font-medium leading-relaxed">
                Partagez ce lien sécurisé pour permettre à vos membres de rejoindre ce cercle.
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
                  {copied && <p className="text-[10px] text-[#ffd803] font-bold text-center animate-pulse">Lien copié dans le presse-papier !</p>}
                </div>
              ) : (
                <button 
                  onClick={generateInvite} 
                  disabled={inviteLoading} 
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 shadow-xl"
                >
                  {inviteLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  Générer le lien d'invitation
                </button>
              )}
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-[#e3f6f5] p-8 rounded-[32px] border border-[#bae8e8] relative overflow-hidden">
            <h4 className="font-bold text-sm mb-4 text-[#272343]">Statistiques rapides</h4>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#2d334a]/60">Places restantes</span>
                <span className="font-extrabold text-[#272343]">{circle.maxMembers - (circle.members?.length || 0)}</span>
              </div>
              <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#ffd803] h-full transition-all duration-1000" 
                  style={{ width: `${((circle.members?.length || 0) / circle.maxMembers) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-[#2d334a]/50 font-medium italic">
                * Les invitations expirent automatiquement après 7 jours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
