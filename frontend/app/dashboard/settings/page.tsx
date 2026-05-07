"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { userApi } from "@/lib/api";
import {
  User, FileCheck, Loader2, CheckCircle,
  Clock, XCircle, Upload
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // KYC
  const [docUrl, setDocUrl] = useState("");
  const [kycLoading, setKycLoading] = useState(false);
  const [kycSuccess, setKycSuccess] = useState(false);
  const [kycError, setKycError] = useState("");

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.updateMe({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleKycSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!docUrl.trim()) return;
    setKycLoading(true);
    setKycError("");
    try {
      await userApi.submitKyc(docUrl.trim());
      setKycSuccess(true);
    } catch (err) {
      setKycError(err instanceof Error ? err.message : "Erreur lors de la soumission");
    } finally {
      setKycLoading(false);
    }
  };

  const kycStatus = user?.kycRequest?.status;

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="page-title">Paramètres</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Gérez votre profil et votre vérification d&apos;identité
        </p>
      </div>

      {/* ── Section profil ────────────────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <User size={18} style={{ color: "var(--text-secondary)" }} />
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Profil</h2>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          {/* Avatar + infos */}
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ background: "var(--surface-alt)", color: "var(--text-primary)" }}
            >
              {(user?.name ?? "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{user?.name}</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{user?.email}</p>
              <span className={`badge mt-1 ${
                user?.role === "SUPER_ADMIN" ? "badge-error" :
                user?.role === "ORGANISATEUR" ? "badge-info" : "badge-neutral"
              }`}>
                {user?.role === "SUPER_ADMIN" ? "Super Admin" :
                 user?.role === "ORGANISATEUR" ? "Organisateur" : "Membre"}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="profile-name" className="label">Nom complet</label>
            <input
              id="profile-name"
              type="text"
              className="input"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false); }}
            />
          </div>

          <div>
            <label className="label">Adresse email</label>
            <input
              type="email"
              className="input"
              value={user?.email ?? ""}
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              L&apos;email ne peut pas être modifié
            </p>
          </div>

          <button
            type="submit"
            id="save-profile"
            className="btn-primary"
            disabled={saving || name === user?.name}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : saved ? (
              <><CheckCircle size={16} /> Enregistré !</>
            ) : (
              "Sauvegarder"
            )}
          </button>
        </form>
      </div>

      {/* ── Section KYC ───────────────────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <FileCheck size={18} style={{ color: "var(--text-secondary)" }} />
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Vérification d&apos;identité (KYC)
          </h2>
        </div>

        {/* Statut actuel */}
        {kycStatus && (
          <div
            className="flex items-center gap-3 p-4 rounded-xl mb-5"
            style={{
              background:
                kycStatus === "APPROVED" ? "rgba(66,200,143,0.08)" :
                kycStatus === "REJECTED" ? "rgba(242,95,76,0.08)" :
                "rgba(255,216,3,0.08)",
            }}
          >
            {kycStatus === "APPROVED" ? (
              <CheckCircle size={20} style={{ color: "var(--success)" }} />
            ) : kycStatus === "REJECTED" ? (
              <XCircle size={20} style={{ color: "var(--error)" }} />
            ) : (
              <Clock size={20} style={{ color: "var(--warning)" }} />
            )}
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                {kycStatus === "APPROVED" ? "Identité vérifiée ✅" :
                 kycStatus === "REJECTED" ? "Demande rejetée" :
                 "Vérification en cours"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {kycStatus === "APPROVED"
                  ? "Vous pouvez créer et gérer des cercles"
                  : kycStatus === "REJECTED"
                  ? "Vous pouvez soumettre une nouvelle demande ci-dessous"
                  : "Notre équipe examine votre document. Patientez quelques heures."}
              </p>
            </div>
          </div>
        )}

        {/* Formulaire — visible si pas de KYC ou si rejeté */}
        {(!kycStatus || kycStatus === "REJECTED") && !kycSuccess && (
          <>
            <div
              className="p-4 rounded-xl mb-4"
              style={{ background: "var(--surface-alt)" }}
            >
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                Pourquoi la vérification ?
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Pour créer des cercles de tontine et gérer les fonds de vos membres, nous devons vérifier votre identité.
                Soumettez une photo de votre pièce d&apos;identité (CNI, passeport ou permis de conduire).
              </p>
            </div>

            <form onSubmit={handleKycSubmit} className="space-y-4">
              <div>
                <label htmlFor="kyc-doc" className="label">
                  <Upload size={14} className="inline mr-1" />
                  Lien vers votre document
                </label>
                <input
                  id="kyc-doc"
                  type="url"
                  className="input"
                  placeholder="https://drive.google.com/file/d/..."
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  required
                />
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  Partagez un lien Google Drive, Dropbox ou tout autre hébergement
                </p>
              </div>

              {kycError && (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl text-sm"
                  style={{ background: "rgba(242,95,76,0.08)", color: "var(--error)" }}
                >
                  ⚠️ {kycError}
                </div>
              )}

              <button
                type="submit"
                id="submit-kyc"
                className="btn-primary"
                disabled={kycLoading || !docUrl.trim()}
              >
                {kycLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>Soumettre ma demande</>
                )}
              </button>
            </form>
          </>
        )}

        {/* Succès soumission */}
        {kycSuccess && (
          <div className="text-center py-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(66,200,143,0.1)" }}
            >
              <CheckCircle size={24} style={{ color: "var(--success)" }} />
            </div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Demande soumise avec succès !
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Notre équipe examinera votre document sous 24h
            </p>
          </div>
        )}
      </div>

      {/* Infos compte */}
      <div
        className="text-center text-xs py-4"
        style={{ color: "var(--text-secondary)" }}
      >
        Membre depuis le {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—"}
      </div>
    </div>
  );
}
