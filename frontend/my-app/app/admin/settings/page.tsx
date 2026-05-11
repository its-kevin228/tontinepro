"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  Settings,
  Save,
  Loader2,
  RefreshCw,
  Info,
  Percent,
  CreditCard,
} from "lucide-react";

interface SettingField {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  suffix?: string;
  type?: "number" | "text";
}

const SETTING_FIELDS: SettingField[] = [
  {
    key: "service_fee",
    label: "Frais de service",
    description: "Pourcentage prélevé sur chaque cycle de tontine.",
    icon: Percent,
    suffix: "%",
    type: "number",
  },
  {
    key: "transaction_fee",
    label: "Frais de transaction",
    description: "Frais fixes appliqués à chaque paiement Mobile Money.",
    icon: CreditCard,
    suffix: "FCFA",
    type: "number",
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi("/admin/settings");
      setSettings(data.settings);
      setForm(data.settings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (key: string) => {
    setSaving(key);
    setError(null);
    try {
      await fetchApi("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ key, value: form[key] }),
      });
      setSettings((prev) => ({ ...prev, [key]: form[key] }));
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  };

  const hasChanged = (key: string) => form[key] !== settings[key];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#272343] tracking-tight">
            Paramètres <span className="text-[#ffd803]">Plateforme</span>
          </h1>
          <p className="text-[#2d334a]/60 font-medium mt-1">
            Configurez les frais et règles globales de TontinePro.
          </p>
        </div>
        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-[#f8fafc] border border-[#dfe5f2] rounded-xl font-bold text-sm text-[#272343] hover:bg-[#e3f6f5] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-[#bae8e8]/20 border border-[#bae8e8] rounded-2xl">
        <Info className="h-5 w-5 text-[#272343] shrink-0 mt-0.5" />
        <p className="text-sm text-[#272343] font-medium">
          Les modifications sont appliquées immédiatement. Les frais seront pris en compte lors des
          prochains cycles et paiements.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-[#f25f4c]/10 border border-[#f25f4c]/20 text-[#f25f4c] rounded-2xl font-bold text-sm">
          {error}
        </div>
      )}

      {/* Champs de paramètres */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="card-base h-32 animate-pulse bg-[#f8fafc] border-[#f0f0f0]" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {SETTING_FIELDS.map((field) => {
            const FieldIcon = field.icon;
            const isSaving = saving === field.key;
            const isSaved = saved === field.key;
            const changed = hasChanged(field.key);

            return (
              <div key={field.key} className="card-base hover:border-[#ffd803] transition-all">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-[#ffd803]/10 rounded-2xl shrink-0">
                    <FieldIcon className="h-5 w-5 text-[#272343]" />
                  </div>
                  <div>
                    <p className="font-black text-[#272343]">{field.label}</p>
                    <p className="text-sm text-[#2d334a]/60 font-medium mt-0.5">
                      {field.description}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#2d334a]/30 mt-1">
                      Clé : {field.key}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <input
                      type={field.type ?? "text"}
                      value={form[field.key] ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      className="input-base pr-16"
                      placeholder="0"
                      step={field.type === "number" ? "0.01" : undefined}
                      min={field.type === "number" ? "0" : undefined}
                    />
                    {field.suffix && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#2d334a]/40">
                        {field.suffix}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleSave(field.key)}
                    disabled={isSaving || !changed}
                    className={`flex items-center gap-2 px-5 py-4 rounded-xl font-black text-sm transition-all disabled:opacity-40 ${
                      isSaved
                        ? "bg-[#42c88f] text-white"
                        : "bg-[#272343] text-[#ffd803] hover:bg-[#1a1730]"
                    }`}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isSaved ? (
                      <>✓ Sauvegardé</>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Sauvegarder
                      </>
                    )}
                  </button>
                </div>

                {/* Valeur actuelle */}
                {settings[field.key] !== undefined && (
                  <p className="text-xs text-[#2d334a]/40 font-medium mt-3">
                    Valeur actuelle :{" "}
                    <span className="font-black text-[#272343]">
                      {settings[field.key]} {field.suffix}
                    </span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Paramètres bruts */}
      {!loading && Object.keys(settings).length > 0 && (
        <div className="card-base">
          <h2 className="text-lg font-black text-[#272343] mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#ffd803]" />
            Tous les paramètres
          </h2>
          <div className="space-y-2">
            {Object.entries(settings).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-xl border border-[#dfe5f2]"
              >
                <span className="text-xs font-black text-[#2d334a]/60 uppercase tracking-widest">
                  {key}
                </span>
                <span className="text-sm font-black text-[#272343]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
