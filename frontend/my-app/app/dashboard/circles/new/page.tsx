"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Diamond, Calendar, Users, Info, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

interface FormErrors {
  name?: string;
  amount?: string;
  maxMembers?: string;
}

// ── Défini EN DEHORS du composant pour éviter le re-mount à chaque frappe ──
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-[#2d334a]/60">
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-[#f25f4c] font-bold">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

export default function NewCirclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [maxMembers, setMaxMembers] = useState("");

  const clearError = (field: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const validate = (): boolean => {
    const e: FormErrors = {};

    if (!name.trim()) {
      e.name = "Le nom du cercle est requis";
    } else if (name.trim().length < 3) {
      e.name = "Le nom doit faire au moins 3 caractères";
    }

    if (!amount) {
      e.amount = "Le montant de la cotisation est requis";
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      e.amount = "Le montant doit être un nombre positif";
    } else if (Number(amount) < 100) {
      e.amount = "Le montant minimum est de 100 FCFA";
    }

    if (!maxMembers) {
      e.maxMembers = "Le nombre de membres est requis";
    } else if (isNaN(Number(maxMembers)) || Number(maxMembers) < 2) {
      e.maxMembers = "Il faut au moins 2 membres";
    } else if (Number(maxMembers) > 50) {
      e.maxMembers = "Maximum 50 membres par cercle";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await fetchApi("/circles", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          amount: Number(amount),
          frequency,
          maxMembers: Number(maxMembers),
        }),
      });
      router.push(`/dashboard/circles/${data.circle.id}`);
    } catch (error: any) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError?: string) =>
    `input-base ${hasError ? "border-[#f25f4c] focus:ring-[#f25f4c]" : ""}`;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#2d334a]/40 hover:text-[#272343] mb-4 text-sm font-bold transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </Link>
        <h1 className="text-3xl font-black text-[#272343] tracking-tight">
          Nouveau <span className="text-[#ffd803]">Cercle</span>
        </h1>
        <p className="text-sm text-[#2d334a]/40 font-medium mt-0.5">
          Définissez les règles de votre tontine.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="card-base space-y-8">

        {serverError && (
          <div className="flex items-center gap-3 p-4 bg-[#f25f4c]/10 border border-[#f25f4c]/20 rounded-2xl">
            <AlertCircle className="h-5 w-5 text-[#f25f4c] shrink-0" />
            <p className="text-sm text-[#f25f4c] font-bold">{serverError}</p>
          </div>
        )}

        {/* Section 1 — Identité */}
        <div className="space-y-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#ffd803]">
            1. Identité du cercle
          </h2>

          <Field label="Nom du cercle *" error={errors.name}>
            <input
              type="text"
              placeholder="Ex: Tontine des Entrepreneurs"
              className={inputClass(errors.name)}
              value={name}
              onChange={(e) => { setName(e.target.value); clearError("name"); }}
            />
          </Field>

          <Field label="Description (optionnel)">
            <textarea
              placeholder="Expliquez l'objectif de ce cercle…"
              className="input-base h-24 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </div>

        {/* Section 2 — Financier */}
        <div className="space-y-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#ffd803]">
            2. Configuration financière
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Montant de la cotisation (FCFA) *" error={errors.amount}>
              <div className="relative">
                <Diamond className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2d334a]/30" />
                <input
                  type="number"
                  placeholder="Ex: 25000"
                  min="100"
                  className={`${inputClass(errors.amount)} pl-11`}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); clearError("amount"); }}
                />
              </div>
            </Field>

            <Field label="Fréquence des tours">
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2d334a]/30" />
                <select
                  className="input-base pl-11 appearance-none"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="WEEKLY">Hebdomadaire</option>
                  <option value="BIWEEKLY">Bimensuelle</option>
                  <option value="MONTHLY">Mensuelle</option>
                </select>
              </div>
            </Field>
          </div>
        </div>

        {/* Section 3 — Membres */}
        <div className="space-y-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#ffd803]">
            3. Membres
          </h2>

          <Field label="Nombre maximum de membres *" error={errors.maxMembers}>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2d334a]/30" />
              <input
                type="number"
                placeholder="Ex: 10"
                min="2"
                max="50"
                className={`${inputClass(errors.maxMembers)} pl-11`}
                value={maxMembers}
                onChange={(e) => { setMaxMembers(e.target.value); clearError("maxMembers"); }}
              />
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#dfe5f2] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-2 text-xs text-[#2d334a]/40 font-medium">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Une fois créé, certains paramètres ne pourront plus être modifiés.</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-8 py-4 disabled:opacity-50 shrink-0"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {loading ? "Création…" : "Créer le cercle"}
          </button>
        </div>
      </form>
    </div>
  );
}
