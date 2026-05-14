"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  User, Mail, Lock, Bell, Shield, Save, Loader2, CheckCircle2,
  Eye, EyeOff, FileCheck, Clock, XCircle, Upload, AlertTriangle,
} from "lucide-react";

interface NotifPrefs {
  emailReminders: boolean;
  emailPayment: boolean;
  emailKyc: boolean;
  inAppAll: boolean;
}

interface KycInfo {
  status: "PENDING" | "APPROVED" | "REJECTED" | null;
  createdAt: string | null;
  reviewNote: string | null;
}

// ── Composants définis EN DEHORS pour éviter le re-mount ──────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-[#272343]" : "bg-[#dfe5f2]"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

function Msg({ msg }: { msg: { type: "ok" | "err"; text: string } | null }) {
  if (!msg) return null;
  return (
    <p className={`text-sm font-bold mt-2 ${msg.type === "ok" ? "text-[#42c88f]" : "text-[#f25f4c]"}`}>
      {msg.type === "ok" ? "✓ " : "✗ "}{msg.text}
    </p>
  );
}

export default function ProfilePage() {
  const { user, login } = useAuth();

  // Profil
  const [name, setName] = useState(user?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // KYC
  const [kyc, setKyc] = useState<KycInfo>({ status: null, createdAt: null, reviewNote: null });
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [kycMsg, setKycMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Préférences notif
  const [prefs, setPrefs] = useState<NotifPrefs>({
    emailReminders: true,
    emailPayment: true,
    emailKyc: true,
    inAppAll: true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsMsg, setPrefsMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetchApi("/users/me"),
      fetchApi("/users/me/notification-preferences"),
    ]).then(([userData, prefsData]) => {
      if (userData.user?.kycRequest) {
        setKyc({
          status: userData.user.kycRequest.status,
          createdAt: userData.user.kycRequest.createdAt,
          reviewNote: userData.user.kycRequest.reviewNote,
        });
      }
      setPrefs(prefsData.preferences);
    }).catch((err) => {
      console.error("Erreur chargement profil:", err);
      // Ne pas réinitialiser le KYC en cas d&apos;erreur réseau
    });
  }, []);

  const saveProfile = async () => {
    if (!name.trim()) { setProfileMsg({ type: "err", text: "Le nom ne peut pas être vide" }); return; }
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const data = await fetchApi("/users/me", { method: "PATCH", body: JSON.stringify({ name }) });
      const token = localStorage.getItem("token")!;
      login(token, { ...user!, name: data.user.name });
      setProfileMsg({ type: "ok", text: "Profil mis à jour" });
    } catch (e: any) {
      setProfileMsg({ type: "err", text: e.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (!currentPassword || !newPassword) { setPwdMsg({ type: "err", text: "Tous les champs sont requis" }); return; }
    if (newPassword.length < 8) { setPwdMsg({ type: "err", text: "Minimum 8 caractères" }); return; }
    if (newPassword !== confirmPassword) { setPwdMsg({ type: "err", text: "Les mots de passe ne correspondent pas" }); return; }
    setSavingPwd(true);
    setPwdMsg(null);
    try {
      await fetchApi("/users/me", { method: "PATCH", body: JSON.stringify({ currentPassword, newPassword }) });
      setPwdMsg({ type: "ok", text: "Mot de passe modifié" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e: any) {
      setPwdMsg({ type: "err", text: e.message });
    } finally {
      setSavingPwd(false);
    }
  };

  const submitKyc = async () => {
    if (!documentFile && !documentUrl.trim()) {
      setKycMsg({ type: "err", text: "Sélectionnez un document à envoyer" });
      return;
    }
    setSubmittingKyc(true);
    setKycMsg(null);
    try {
      if (documentFile) {
        // Upload multipart
        const formData = new FormData();
        formData.append("document", documentFile);
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/users/kyc`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Erreur lors de l&apos;upload");
        }
      } else {
        // URL externe (fallback)
        await fetchApi("/users/kyc", { method: "POST", body: JSON.stringify({ documentUrl }) });
      }
      setKyc({ status: "PENDING", createdAt: new Date().toISOString(), reviewNote: null });
      setDocumentFile(null);
      setDocumentPreview(null);
      setDocumentUrl("");
      setKycMsg({ type: "ok", text: "Demande soumise. Vous serez notifié dès qu&apos;elle sera traitée." });
    } catch (e: any) {
      setKycMsg({ type: "err", text: e.message });
    } finally {
      setSubmittingKyc(false);
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setKycMsg({ type: "err", text: "Format non supporté. Utilisez JPG, PNG, WEBP ou PDF." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setKycMsg({ type: "err", text: "Fichier trop lourd. Maximum 10 MB." });
      return;
    }
    setDocumentFile(file);
    setKycMsg(null);
    // Preview pour les images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setDocumentPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setDocumentPreview(null); // PDF — pas de preview image
    }
  }, []);

  const savePrefs = async () => {
    setSavingPrefs(true);
    setPrefsMsg(null);
    try {
      await fetchApi("/users/me/notification-preferences", { method: "PATCH", body: JSON.stringify(prefs) });
      setPrefsMsg({ type: "ok", text: "Préférences sauvegardées" });
    } catch (e: any) {
      setPrefsMsg({ type: "err", text: e.message });
    } finally {
      setSavingPrefs(false);
    }
  };

  // Afficher la section KYC si : utilisateur est organisateur OU a déjà soumis un KYC
  const showKyc = user?.role === "ORGANISATEUR" || kyc.status !== null;

  const kycStatusConfig = {
    PENDING:  { label: "En cours de vérification", color: "bg-[#ffd803]/10 text-[#b38a00] border-[#ffd803]/30", icon: Clock },
    APPROVED: { label: "Identité vérifiée ✓",      color: "bg-[#42c88f]/10 text-[#42c88f] border-[#42c88f]/30", icon: FileCheck },
    REJECTED: { label: "Demande rejetée",           color: "bg-[#f25f4c]/10 text-[#f25f4c] border-[#f25f4c]/30", icon: XCircle },
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-[#272343] tracking-tight">Mon <span className="text-[#ffd803]">Profil</span></h1>
        <p className="text-sm text-[#2d334a]/40 font-medium mt-0.5">Gérez vos informations personnelles et préférences.</p>
      </div>

      {/* ── KYC — affiché en premier si en attente ── */}
      {showKyc && (
        <div className="card-base space-y-5">
          <h2 className="font-black text-[#272343] flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-[#ffd803]" /> Vérification d&apos;identité (KYC)
          </h2>

          {kyc.status === null ? (
            <div className="space-y-5">
              {/* Consignes */}
              <div className="flex items-start gap-3 p-4 bg-[#ffd803]/5 border border-[#ffd803]/20 rounded-2xl">
                <AlertTriangle className="h-5 w-5 text-[#b38a00] shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-sm text-[#272343]">Vérification requise pour créer des cercles</p>
                  <ul className="text-xs text-[#2d334a]/60 font-medium mt-1.5 space-y-1">
                    <li>✓ Document lisible et non coupé (CNI recto/verso, passeport)</li>
                    <li>✓ Photo bien éclairée, sans reflet ni flou</li>
                    <li>✓ Formats acceptés : JPG, PNG, WEBP, PDF — max 10 MB</li>
                  </ul>
                </div>
              </div>

              {/* Input fichier caché */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                capture="environment"
              />

              {documentFile ? (
                /* Fichier sélectionné — preview */
                <div className="border-2 border-[#42c88f] bg-[#42c88f]/5 rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    {documentPreview ? (
                      <img
                        src={documentPreview}
                        alt="Aperçu"
                        className="w-20 h-20 object-cover rounded-xl border border-[#dfe5f2] shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-[#f8fafc] rounded-xl border border-[#dfe5f2] flex items-center justify-center shrink-0">
                        <FileCheck className="h-8 w-8 text-[#2d334a]/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-[#272343] truncate">{documentFile.name}</p>
                      <p className="text-xs text-[#2d334a]/40 font-medium mt-0.5">
                        {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={() => { setDocumentFile(null); setDocumentPreview(null); setKycMsg(null); }}
                        className="text-xs text-[#f25f4c] font-black mt-2 hover:underline"
                      >
                        Changer de fichier
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Zone drag & drop */
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-[#ffd803] bg-[#ffd803]/5 scale-[1.01]"
                      : "border-[#dfe5f2] hover:border-[#ffd803]/50 hover:bg-[#f8fafc]"
                  }`}
                >
                  <div className="w-14 h-14 bg-[#e3f6f5] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-7 w-7 text-[#272343]" />
                  </div>
                  <p className="font-black text-[#272343] text-sm">
                    Glissez votre document ici
                  </p>
                  <p className="text-xs text-[#2d334a]/40 font-medium mt-1">
                    ou <span className="text-[#272343] font-black underline">cliquez pour sélectionner</span>
                  </p>
                  <p className="text-[10px] text-[#2d334a]/30 font-medium mt-3 uppercase tracking-widest">
                    JPG · PNG · WEBP · PDF · max 10 MB
                  </p>
                  <p className="text-[10px] text-[#2d334a]/30 font-medium mt-1">
                    📱 Sur mobile : prendre une photo directement
                  </p>
                </div>
              )}

              <Msg msg={kycMsg} />
              <button
                onClick={submitKyc}
                disabled={submittingKyc || !documentFile}
                className="btn-primary w-full flex items-center justify-center gap-2 py-4 disabled:opacity-50"
              >
                {submittingKyc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {submittingKyc ? "Envoi en cours…" : "Soumettre ma demande KYC"}
              </button>
            </div>
          ) : (
            // Statut existant
            <div className="space-y-4">
              {(() => {
                const cfg = kycStatusConfig[kyc.status!];
                const Icon = cfg.icon;
                return (
                  <div className={`flex items-center gap-3 p-4 rounded-2xl border ${cfg.color}`}>
                    <Icon className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-black text-sm">{cfg.label}</p>
                      {kyc.createdAt && (
                        <p className="text-xs font-medium mt-0.5 opacity-70">
                          Soumis le {new Date(kyc.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                      {kyc.reviewNote && (
                        <p className="text-xs font-medium mt-1 opacity-80">
                          Note : {kyc.reviewNote}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {kyc.status === "REJECTED" && (
                <div className="space-y-3">
                  <p className="text-sm text-[#2d334a]/60 font-medium">
                    Soumettez de nouveaux documents pour relancer la vérification.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    capture="environment"
                  />
                  {documentFile ? (
                    <div className="border-2 border-[#42c88f] bg-[#42c88f]/5 rounded-2xl p-4 flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-[#42c88f] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-[#272343] truncate">{documentFile.name}</p>
                        <p className="text-xs text-[#2d334a]/40">{(documentFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button onClick={() => { setDocumentFile(null); setDocumentPreview(null); }} className="text-xs text-[#f25f4c] font-black">
                        Changer
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#dfe5f2] rounded-2xl p-6 text-center cursor-pointer hover:border-[#ffd803]/50 hover:bg-[#f8fafc] transition-all"
                    >
                      <Upload className="h-6 w-6 text-[#2d334a]/30 mx-auto mb-2" />
                      <p className="text-sm font-black text-[#272343]">Sélectionner un nouveau document</p>
                      <p className="text-xs text-[#2d334a]/40 mt-1">JPG · PNG · WEBP · PDF · max 10 MB</p>
                    </div>
                  )}
                  <Msg msg={kycMsg} />
                  <button
                    onClick={submitKyc}
                    disabled={submittingKyc || !documentFile}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingKyc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Resoumettre
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Informations personnelles ── */}
      <div className="card-base space-y-5">
        <h2 className="font-black text-[#272343] flex items-center gap-2">
          <User className="h-5 w-5 text-[#ffd803]" /> Informations personnelles
        </h2>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">Nom complet</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2d334a]/30" />
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-base pl-11" placeholder="Votre nom" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">Adresse email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2d334a]/30" />
            <input value={user?.email ?? ""} disabled className="input-base pl-11 opacity-50 cursor-not-allowed" />
          </div>
          <p className="text-xs text-[#2d334a]/40 font-medium">L&apos;email ne peut pas être modifié.</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">Rôle</label>
          <div className="px-4 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-2xl text-sm font-black text-[#272343]">
            {user?.role === "SUPER_ADMIN" ? "Super Administrateur" : user?.role === "ORGANISATEUR" ? "Organisateur" : "Membre"}
          </div>
        </div>

        <Msg msg={profileMsg} />
        <button onClick={saveProfile} disabled={savingProfile} className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Sauvegarder
        </button>
      </div>

      {/* ── Mot de passe ── */}
      <div className="card-base space-y-5">
        <h2 className="font-black text-[#272343] flex items-center gap-2">
          <Lock className="h-5 w-5 text-[#ffd803]" /> Changer le mot de passe
        </h2>

        {[
          { label: "Mot de passe actuel", value: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
          { label: "Nouveau mot de passe", value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(!showNew) },
          { label: "Confirmer le nouveau mot de passe", value: confirmPassword, set: setConfirmPassword, show: showNew, toggle: () => {} },
        ].map(({ label, value, set, show, toggle }) => (
          <div key={label} className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">{label}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2d334a]/30" />
              <input type={show ? "text" : "password"} value={value} onChange={(e) => set(e.target.value)} className="input-base pl-11 pr-11" placeholder="••••••••" />
              <button type="button" onClick={toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2d334a]/30 hover:text-[#272343]">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ))}

        <Msg msg={pwdMsg} />
        <button onClick={savePassword} disabled={savingPwd} className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {savingPwd ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
          Modifier le mot de passe
        </button>
      </div>

      {/* ── Préférences de notification ── */}
      <div className="card-base space-y-5">
        <h2 className="font-black text-[#272343] flex items-center gap-2">
          <Bell className="h-5 w-5 text-[#ffd803]" /> Préférences de notification
        </h2>

        {[
          { key: "emailReminders" as const, label: "Rappels de cotisation par email", desc: "Reçois un email 24h avant l'échéance" },
          { key: "emailPayment" as const, label: "Confirmation de paiement par email", desc: "Email quand ton paiement est confirmé" },
          { key: "emailKyc" as const, label: "Décisions KYC par email", desc: "Email quand ton KYC est approuvé ou rejeté" },
          { key: "inAppAll" as const, label: "Notifications in-app", desc: "Toutes les alertes dans l&apos;application" },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between gap-4 py-3 border-b border-[#dfe5f2] last:border-0">
            <div>
              <p className="font-black text-sm text-[#272343]">{label}</p>
              <p className="text-xs text-[#2d334a]/40 font-medium mt-0.5">{desc}</p>
            </div>
            <Toggle checked={prefs[key]} onChange={(v) => setPrefs({ ...prefs, [key]: v })} />
          </div>
        ))}

        <Msg msg={prefsMsg} />
        <button onClick={savePrefs} disabled={savingPrefs} className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Sauvegarder les préférences
        </button>
      </div>
    </div>
  );
}
