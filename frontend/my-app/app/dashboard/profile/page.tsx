"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  User, Mail, Phone, Lock, Bell, Shield, Save, Loader2, CheckCircle2, Eye, EyeOff,
} from "lucide-react";

interface NotifPrefs {
  emailReminders: boolean;
  emailPayment: boolean;
  emailKyc: boolean;
  inAppAll: boolean;
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
    fetchApi("/users/me/notification-preferences")
      .then((d) => setPrefs(d.preferences))
      .catch(() => {});
  }, []);

  const saveProfile = async () => {
    if (!name.trim()) { setProfileMsg({ type: "err", text: "Le nom ne peut pas être vide" }); return; }
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const data = await fetchApi("/users/me", { method: "PATCH", body: JSON.stringify({ name }) });
      // Mettre à jour le contexte auth
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

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-[#272343]" : "bg-[#dfe5f2]"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );

  const Msg = ({ msg }: { msg: { type: "ok" | "err"; text: string } | null }) =>
    msg ? (
      <p className={`text-sm font-bold mt-2 ${msg.type === "ok" ? "text-[#42c88f]" : "text-[#f25f4c]"}`}>
        {msg.type === "ok" ? "✓ " : "✗ "}{msg.text}
      </p>
    ) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-[#272343] tracking-tight">Mon <span className="text-[#ffd803]">Profil</span></h1>
        <p className="text-sm text-[#2d334a]/40 font-medium mt-0.5">Gérez vos informations personnelles et préférences.</p>
      </div>

      {/* ── Informations personnelles ── */}
      <div className="card-base space-y-5">
        <h2 className="font-black text-[#272343] flex items-center gap-2">
          <User className="h-5 w-5 text-[#ffd803]" /> Informations personnelles
        </h2>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">Nom complet</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2d334a]/30" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base pl-11"
              placeholder="Votre nom"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-[#2d334a]/40">Adresse email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2d334a]/30" />
            <input
              value={user?.email ?? ""}
              disabled
              className="input-base pl-11 opacity-50 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-[#2d334a]/40 font-medium">L'email ne peut pas être modifié.</p>
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
              <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => set(e.target.value)}
                className="input-base pl-11 pr-11"
                placeholder="••••••••"
              />
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
          { key: "inAppAll" as const, label: "Notifications in-app", desc: "Toutes les alertes dans l'application" },
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
