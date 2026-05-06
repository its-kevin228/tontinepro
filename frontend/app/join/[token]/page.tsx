"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { invitationApi, type Circle, type Invitation } from "@/lib/api";
import {
  Users, TrendingUp, Calendar, Lock, Globe,
  Loader2, CheckCircle, XCircle, ArrowRight, LogIn
} from "lucide-react";

type PageState = "loading" | "valid" | "invalid" | "already-member" | "joining" | "joined" | "expired";

export default function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [state, setState] = useState<PageState>("loading");
  const [circle, setCircle] = useState<Circle | null>(null);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState("");

  // Vérification du token
  useEffect(() => {
    invitationApi.verify(token)
      .then((res) => {
        setCircle(res.circle);
        setInvitation(res.invitation);

        if (res.invitation.status === "EXPIRED") { setState("expired"); return; }
        if (res.invitation.status === "REVOKED") { setState("invalid"); return; }
        if (res.invitation.status === "ACCEPTED") { setState("already-member"); return; }
        setState("valid");
      })
      .catch(() => setState("invalid"));
  }, [token]);

  const handleJoin = async () => {
    // Vérifier si l'utilisateur est connecté
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      // Rediriger vers login avec retour après connexion
      router.push(`/login?redirect=/join/${token}`);
      return;
    }

    setState("joining");
    setError("");
    try {
      await invitationApi.accept(token);
      setState("joined");
      // Redirection automatique après 2.5s
      setTimeout(() => router.push("/dashboard/circles"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'adhésion");
      setState("valid");
    }
  };

  // ── États d'erreur / succès ──────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <PageShell>
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-soft"
            style={{ background: "var(--accent)", color: "var(--text-primary)" }}
          >
            <Users size={28} />
          </div>
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
            Vérification de l&apos;invitation…
          </p>
        </div>
      </PageShell>
    );
  }

  if (state === "invalid") {
    return (
      <PageShell>
        <StatusCard
          icon={XCircle}
          iconColor="var(--error)"
          iconBg="rgba(242,95,76,0.1)"
          title="Lien invalide"
          description="Ce lien d'invitation n'existe pas ou a été révoqué par l'organisateur."
          action={<Link href="/dashboard" className="btn-primary">Aller au tableau de bord</Link>}
        />
      </PageShell>
    );
  }

  if (state === "expired") {
    return (
      <PageShell>
        <StatusCard
          icon={XCircle}
          iconColor="var(--warning)"
          iconBg="rgba(255,216,3,0.1)"
          title="Invitation expirée"
          description="Ce lien d'invitation a expiré. Demandez un nouveau lien à l'organisateur du cercle."
          action={<Link href="/dashboard" className="btn-secondary">Retour</Link>}
        />
      </PageShell>
    );
  }

  if (state === "already-member") {
    return (
      <PageShell>
        <StatusCard
          icon={CheckCircle}
          iconColor="var(--success)"
          iconBg="rgba(66,200,143,0.1)"
          title="Déjà membre"
          description="Vous faites déjà partie de ce cercle. Rendez-vous sur votre tableau de bord."
          action={
            <Link href="/dashboard/circles" className="btn-primary">
              Voir mes cercles <ArrowRight size={16} />
            </Link>
          }
        />
      </PageShell>
    );
  }

  if (state === "joined") {
    return (
      <PageShell>
        <StatusCard
          icon={CheckCircle}
          iconColor="var(--success)"
          iconBg="rgba(66,200,143,0.1)"
          title="Bienvenue dans le cercle ! 🎉"
          description={`Vous avez rejoint "${circle?.name}" avec succès. Redirection en cours…`}
          action={
            <Link href="/dashboard/circles" className="btn-primary">
              Voir mes cercles <ArrowRight size={16} />
            </Link>
          }
        />
      </PageShell>
    );
  }

  // ── État principal : invitation valide ────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md animate-fade-in space-y-6">

        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
            style={{ background: "var(--accent)", color: "var(--text-primary)" }}
          >
            T
          </div>
          <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            TontinePro
          </span>
        </div>

        {/* Titre */}
        <div className="text-center">
          <p className="text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Vous avez été invité à rejoindre
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {circle?.name}
          </h1>
          {circle?.description && (
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              {circle.description}
            </p>
          )}
        </div>

        {/* Carte infos cercle */}
        <div className="card">
          {/* Avatar du cercle */}
          <div className="flex justify-center mb-5">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl font-bold"
              style={{ background: "var(--surface-alt)", color: "var(--text-primary)" }}
            >
              {circle?.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Méta-données */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: TrendingUp,
                label: "Cotisation",
                value: `${circle?.amount.toLocaleString("fr-FR")} FCFA`,
              },
              {
                icon: Calendar,
                label: "Fréquence",
                value: circle?.frequency === "MONTHLY" ? "Mensuelle" : "Hebdomadaire",
              },
              {
                icon: Users,
                label: "Membres",
                value: `${circle?.memberships?.length ?? 0} / ${circle?.maxMembers}`,
              },
              {
                icon: TrendingUp,
                label: "Cagnotte/tour",
                value: `${((circle?.amount ?? 0) * (circle?.maxMembers ?? 0)).toLocaleString("fr-FR")} FCFA`,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "var(--surface-alt)" }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--surface)", color: "var(--text-secondary)" }}
                >
                  <Icon size={15} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Visibilité */}
          <div
            className="flex items-center gap-2 mt-4 pt-4"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {circle?.isPublic ? (
              <Globe size={14} style={{ color: "var(--text-secondary)" }} />
            ) : (
              <Lock size={14} style={{ color: "var(--text-secondary)" }} />
            )}
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Cercle {circle?.isPublic ? "public" : "privé"} — invitation valide jusqu&apos;au{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {invitation ? new Date(invitation.expiresAt).toLocaleDateString("fr-FR") : "—"}
              </strong>
            </span>
          </div>
        </div>

        {/* Mise en avant du gain */}
        <div
          className="p-5 rounded-2xl flex items-center gap-4"
          style={{ background: "var(--text-primary)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: "var(--accent)" }}
          >
            🏆
          </div>
          <div>
            <p className="text-sm" style={{ color: "#a7a9be" }}>
              En rejoignant ce cercle, vous recevrez
            </p>
            <p className="text-2xl font-bold" style={{ color: "#fffffe" }}>
              {((circle?.amount ?? 0) * (circle?.maxMembers ?? 0)).toLocaleString("fr-FR")} FCFA
            </p>
            <p className="text-xs mt-0.5" style={{ color: "#a7a9be" }}>
              lors de votre tour de passage
            </p>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl text-sm"
            style={{ background: "rgba(242,95,76,0.08)", color: "var(--error)" }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* CTA */}
        <div className="space-y-3">
          <button
            id="join-circle-btn"
            className="btn-primary w-full"
            onClick={handleJoin}
            disabled={state === "joining"}
          >
            {state === "joining" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Rejoindre le cercle <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Lien connexion si non connecté */}
          <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Pas encore de compte ?{" "}
            <Link
              href={`/register?redirect=/join/${token}`}
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Créer un compte <LogIn size={13} className="inline" />
            </Link>
          </p>
        </div>

        {/* Note de sécurité */}
        <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
          🔒 Vos données sont protégées. Vous pouvez quitter le cercle à tout moment
          avant le démarrage d&apos;un cycle.
        </p>
      </div>
    </div>
  );
}

// ─── Composants utilitaires ────────────────────────────────────────────────────
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
            style={{ background: "var(--accent)", color: "var(--text-primary)" }}
          >
            T
          </div>
          <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            TontinePro
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="card text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: iconBg }}
      >
        <Icon size={28} style={{ color: iconColor }} />
      </div>
      <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
        {title}
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        {description}
      </p>
      <div className="flex justify-center">{action}</div>
    </div>
  );
}
