"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { circleApi, type CreateCircleDto } from "@/lib/api";
import {
  ArrowLeft, Loader2, Users, Coins, Calendar,
  Globe, Lock, FileText, CheckCircle
} from "lucide-react";

// ─── Étapes du formulaire ─────────────────────────────────────────────────────
const STEPS = ["Informations", "Paramètres", "Confirmation"];

// ─── Composant carte de choix radio ──────────────────────────────────────────
function ChoiceCard({
  id,
  label,
  description,
  icon: Icon,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      id={id}
      onClick={onChange}
      className="flex items-start gap-4 p-4 rounded-2xl border-2 w-full text-left transition-all duration-200"
      style={{
        borderColor: checked ? "var(--accent)" : "var(--border-input)",
        background: checked ? "rgba(255,216,3,0.06)" : "var(--surface)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: checked ? "var(--accent)" : "var(--surface-alt)",
          color: checked ? "var(--text-primary)" : "var(--text-secondary)",
        }}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      </div>
      <div
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center ml-auto flex-shrink-0 mt-0.5 transition-all"
        style={{
          borderColor: checked ? "var(--accent)" : "var(--border-input)",
          background: checked ? "var(--accent)" : "transparent",
        }}
      >
        {checked && <div className="w-2 h-2 rounded-full" style={{ background: "var(--text-primary)" }} />}
      </div>
    </button>
  );
}

// ─── Page création ─────────────────────────────────────────────────────────────
export default function NewCirclePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Données du formulaire
  const [form, setForm] = useState<CreateCircleDto>({
    name: "",
    description: "",
    amount: 0,
    frequency: "MONTHLY",
    maxMembers: 5,
    isPublic: false,
  });

  const update = (key: keyof CreateCircleDto, val: CreateCircleDto[keyof CreateCircleDto]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  // Validation par étape
  const canProceed = () => {
    if (step === 0) return form.name.trim().length >= 3;
    if (step === 1) return form.amount > 0 && form.maxMembers >= 2;
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < 2) { setStep((s) => s + 1); return; }
    setLoading(true);
    setError("");
    try {
      const res = await circleApi.create(form);
      router.push(`/dashboard/circles/${res.circle.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Retour */}
      <Link
        href="/dashboard/circles"
        className="inline-flex items-center gap-2 text-sm mb-8"
        style={{ color: "var(--text-secondary)" }}
      >
        <ArrowLeft size={16} /> Retour aux cercles
      </Link>

      <div className="max-w-2xl mx-auto">
        {/* Titre */}
        <h1 className="page-title mb-2">Créer un cercle</h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
          Configurez votre groupe de tontine en quelques étapes
        </p>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-300"
                  style={{
                    background: i < step ? "var(--success)" : i === step ? "var(--accent)" : "var(--surface-alt)",
                    color: i < step ? "#fff" : "var(--text-primary)",
                  }}
                >
                  {i < step ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span
                  className="text-sm hidden sm:block font-medium"
                  style={{ color: i === step ? "var(--text-primary)" : "var(--text-secondary)" }}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="h-0.5 flex-1 rounded-full transition-all duration-500"
                  style={{ background: i < step ? "var(--success)" : "var(--border)" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div className="card space-y-6">

            {/* ── Étape 0 : Informations générales ─────────────────────────── */}
            {step === 0 && (
              <>
                <div>
                  <label htmlFor="circle-name" className="label">
                    <FileText size={14} className="inline mr-1.5" />
                    Nom du cercle *
                  </label>
                  <input
                    id="circle-name"
                    type="text"
                    className="input"
                    placeholder="Ex: Tontine Famille Diallo"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    maxLength={80}
                    required
                  />
                  <p className="text-xs mt-1.5" style={{ color: "var(--text-secondary)" }}>
                    {form.name.length}/80 caractères — minimum 3
                  </p>
                </div>

                <div>
                  <label htmlFor="circle-desc" className="label">Description (optionnel)</label>
                  <textarea
                    id="circle-desc"
                    className="input"
                    placeholder="Décrivez l'objectif de votre cercle…"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={3}
                    maxLength={300}
                    style={{ resize: "none" }}
                  />
                  <p className="text-xs mt-1.5" style={{ color: "var(--text-secondary)" }}>
                    {(form.description as string).length}/300 caractères
                  </p>
                </div>

                {/* Visibilité */}
                <div>
                  <label className="label mb-3">Visibilité du cercle</label>
                  <div className="space-y-3">
                    <ChoiceCard
                      id="visibility-private"
                      icon={Lock}
                      label="Privé (recommandé)"
                      description="Seuls les membres invités peuvent rejoindre"
                      checked={!form.isPublic}
                      onChange={() => update("isPublic", false)}
                    />
                    <ChoiceCard
                      id="visibility-public"
                      icon={Globe}
                      label="Public"
                      description="Visible dans la liste des cercles de la plateforme"
                      checked={form.isPublic as boolean}
                      onChange={() => update("isPublic", true)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ── Étape 1 : Paramètres financiers ──────────────────────────── */}
            {step === 1 && (
              <>
                <div>
                  <label htmlFor="amount" className="label">
                    <Coins size={14} className="inline mr-1.5" />
                    Montant de la cotisation (FCFA) *
                  </label>
                  <input
                    id="amount"
                    type="number"
                    className="input"
                    placeholder="Ex: 25000"
                    value={form.amount || ""}
                    onChange={(e) => update("amount", parseFloat(e.target.value) || 0)}
                    min={500}
                    step={500}
                    required
                  />
                  <p className="text-xs mt-1.5" style={{ color: "var(--text-secondary)" }}>
                    Montant payé par chaque membre à chaque cycle
                  </p>
                </div>

                {/* Fréquence */}
                <div>
                  <label className="label">
                    <Calendar size={14} className="inline mr-1.5" />
                    Fréquence de cotisation *
                  </label>
                  <div className="space-y-3">
                    <ChoiceCard
                      id="freq-monthly"
                      icon={Calendar}
                      label="Mensuelle"
                      description="Un cycle par mois — idéal pour les salariés"
                      checked={form.frequency === "MONTHLY"}
                      onChange={() => update("frequency", "MONTHLY")}
                    />
                    <ChoiceCard
                      id="freq-weekly"
                      icon={Calendar}
                      label="Hebdomadaire"
                      description="Un cycle par semaine — rotation plus rapide"
                      checked={form.frequency === "WEEKLY"}
                      onChange={() => update("frequency", "WEEKLY")}
                    />
                  </div>
                </div>

                {/* Nombre de membres */}
                <div>
                  <label htmlFor="max-members" className="label">
                    <Users size={14} className="inline mr-1.5" />
                    Nombre maximum de membres *
                  </label>
                  <input
                    id="max-members"
                    type="number"
                    className="input"
                    value={form.maxMembers}
                    onChange={(e) => update("maxMembers", parseInt(e.target.value) || 2)}
                    min={2}
                    max={50}
                    required
                  />
                  <p className="text-xs mt-1.5" style={{ color: "var(--text-secondary)" }}>
                    Entre 2 et 50 membres — chaque membre recevra{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {((form.amount as number) * form.maxMembers).toLocaleString("fr-FR")} FCFA
                    </strong>{" "}
                    lors de son passage
                  </p>
                </div>
              </>
            )}

            {/* ── Étape 2 : Confirmation ────────────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
                  Récapitulatif
                </h3>

                {[
                  { label: "Nom du cercle", value: form.name },
                  { label: "Description", value: (form.description as string) || "—" },
                  { label: "Cotisation", value: `${(form.amount as number).toLocaleString("fr-FR")} FCFA` },
                  { label: "Fréquence", value: form.frequency === "MONTHLY" ? "Mensuelle" : "Hebdomadaire" },
                  { label: "Membres max", value: `${form.maxMembers} personnes` },
                  { label: "Cagnotte par tour", value: `${((form.amount as number) * form.maxMembers).toLocaleString("fr-FR")} FCFA` },
                  { label: "Visibilité", value: form.isPublic ? "Public" : "Privé" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</span>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</span>
                  </div>
                ))}

                {/* Highlight montant */}
                <div
                  className="p-4 rounded-2xl flex items-center gap-4 mt-2"
                  style={{ background: "var(--text-primary)" }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold"
                    style={{ background: "var(--accent)", color: "var(--text-primary)" }}
                  >
                    T
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: "#a7a9be" }}>
                      Chaque membre recevra
                    </p>
                    <p className="text-xl font-bold" style={{ color: "#fffffe" }}>
                      {((form.amount as number) * form.maxMembers).toLocaleString("fr-FR")} FCFA
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ background: "rgba(242,95,76,0.08)", color: "var(--error)" }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <button
                  type="button"
                  id="prev-step"
                  className="btn-ghost flex-1"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={loading}
                >
                  Précédent
                </button>
              )}
              <button
                type="submit"
                id={step === 2 ? "create-circle-submit" : "next-step"}
                className="btn-primary flex-1"
                disabled={!canProceed() || loading}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : step === 2 ? (
                  "Créer le cercle 🎉"
                ) : (
                  "Continuer"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
