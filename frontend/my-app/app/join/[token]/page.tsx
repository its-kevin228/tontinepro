"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Loader2,
  Users,
  Wallet,
} from "lucide-react";
import { fetchApi, API_BASE_URL } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type InvitationPayload = {
  invitation: {
    token: string;
    status: string;
    expiresAt: string;
    circleId: string;
    circle: {
      id: string;
      name: string;
      description?: string | null;
      amount: number;
      frequency: string;
      memberships?: Array<{ id: string }>;
    };
  };
};

export default function JoinCirclePage({ params }: { params: { token: string } }) {
  const { token } = params;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [invitation, setInvitation] = useState<InvitationPayload["invitation"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/invitations/${token}`);
        const data = (await response.json()) as InvitationPayload;
        if (response.ok) {
          setInvitation(data.invitation);
        } else {
          setError((data as any).error || "Invitation invalide ou expiree.");
        }
      } catch {
        setError("Impossible de charger l'invitation.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitationDetails();
  }, [token]);

  const handleJoin = async () => {
    if (!user) {
      router.push(`/login?callback=/join/${token}`);
      return;
    }

    setJoining(true);
    try {
      const data = await fetchApi(`/invitations/${token}/accept`, {
        method: "POST",
      });

      if (data?.circleId) {
        router.push(`/dashboard/circles/${data.circleId}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'adhesion.");
    } finally {
      setJoining(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#fffffe] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 text-[#ffd803] animate-spin mb-4" />
        <p className="text-[#272343] font-bold animate-pulse">Verification de l'invitation...</p>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-[#fffffe] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-[#faeee7] p-6 rounded-[32px] border-2 border-[#ff8e3c]/20 max-w-md">
          <AlertCircle className="h-16 w-16 text-[#ff8e3c] mx-auto mb-4" />
          <h1 className="text-2xl font-black text-[#272343] mb-2">Oups !</h1>
          <p className="text-[#2d334a]/70 font-medium mb-8">{error || "Invitation invalide"}</p>
          <Link href="/dashboard" className="btn-primary inline-block">
            Retour au Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const circle = invitation.circle;

  return (
    <div className="min-h-screen bg-[#fffffe] flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#bae8e8] px-4 py-2 rounded-full mb-6">
            <CheckCircle2 className="h-4 w-4 text-[#272343]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#272343]">Invitation Officielle</span>
          </div>
          <h1 className="text-4xl font-black text-[#272343] leading-tight">
            Vous avez ete invite a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#272343] to-[#ffd803]">
              {circle.name}
            </span>
          </h1>
        </div>

        <div className="card-base bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] mb-8 border-t-8 border-t-[#ffd803]">
          <p className="text-[#2d334a]/60 font-medium text-center mb-8 italic">
            "{circle.description || "Rejoignez notre cercle pour epargner ensemble !"}"
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-[#f8fafc] rounded-2xl border border-[#dfe5f2]">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Wallet className="h-6 w-6 text-[#ffd803]" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#2d334a]/40 tracking-wider">Montant / Periode</p>
                <p className="font-black text-[#272343]">{circle.amount.toLocaleString()} FCFA</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#f8fafc] rounded-2xl border border-[#dfe5f2]">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Calendar className="h-6 w-6 text-[#bae8e8]" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#2d334a]/40 tracking-wider">Frequence</p>
                <p className="font-black text-[#272343] capitalize">{circle.frequency}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[#dfe5f2] flex items-center justify-between">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-4 border-white bg-[#bae8e8] flex items-center justify-center font-bold text-[#272343] text-xs"
                >
                  {i}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-4 border-white bg-[#e3f6f5] flex items-center justify-center font-bold text-[#272343] text-xs">
                +
              </div>
            </div>
            <p className="text-sm font-bold text-[#2d334a]/40 uppercase tracking-tighter">
              {circle.memberships?.length || 0} membres deja inscrits
            </p>
          </div>
        </div>

        <button
          onClick={handleJoin}
          disabled={joining}
          className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {joining ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              {user ? "Accepter l'invitation et rejoindre" : "Se connecter pour rejoindre"}
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        <p className="mt-6 text-center text-[10px] font-bold text-[#2d334a]/30 uppercase tracking-[0.2em]">
          Securise par TontinePro - 2026
        </p>
      </div>
    </div>
  );
}
