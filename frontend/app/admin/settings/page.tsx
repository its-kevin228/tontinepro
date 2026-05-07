"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Settings, Loader2, Save, Plus, Trash2 } from "lucide-react";

interface SettingEntry {
  key: string;
  value: string;
  saved: boolean;
}

const DEFAULT_KEYS = [
  { key: "service_fee_percent", label: "Frais de service (%)", desc: "Pourcentage prélevé sur chaque cycle" },
  { key: "max_circles_per_user", label: "Cercles max par utilisateur", desc: "Nombre maximum de cercles qu'un organisateur peut créer" },
  { key: "invitation_expiry_days", label: "Expiration invitation (jours)", desc: "Durée de validité des liens d'invitation" },
  { key: "kyc_required", label: "KYC obligatoire", desc: "Exiger la vérification KYC pour créer un cercle (true/false)" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    adminApi.getSettings()
      .then((res) => {
        const entries = Object.entries(res.settings).map(([key, value]) => ({
          key, value, saved: true,
        }));
        // Ajouter les clés par défaut manquantes
        DEFAULT_KEYS.forEach((dk) => {
          if (!entries.find((e) => e.key === dk.key)) {
            entries.push({ key: dk.key, value: "", saved: false });
          }
        });
        setSettings(entries);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (key: string, value: string) => {
    setSaving(key);
    try {
      await adminApi.updateSetting(key, value);
      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, value, saved: true } : s))
      );
    } finally {
      setSaving("");
    }
  };

  const handleAddCustom = async () => {
    if (!newKey.trim() || !newValue.trim()) return;
    setSaving("custom");
    try {
      await adminApi.updateSetting(newKey.trim(), newValue.trim());
      setSettings((prev) => [...prev, { key: newKey.trim(), value: newValue.trim(), saved: true }]);
      setNewKey("");
      setNewValue("");
    } finally {
      setSaving("");
    }
  };

  const getLabel = (key: string) => DEFAULT_KEYS.find((dk) => dk.key === key)?.label ?? key;
  const getDesc = (key: string) => DEFAULT_KEYS.find((dk) => dk.key === key)?.desc ?? "";

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* En-tête */}
      <div>
        <h1 className="page-title">Paramètres plateforme</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Configurez les paramètres globaux de TontinePro
        </p>
      </div>

      {loading ? (
        <div className="card p-8 text-center">
          <Loader2 size={24} className="animate-spin mx-auto" style={{ color: "var(--text-secondary)" }} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Paramètres existants */}
          {settings.map((setting) => (
            <div key={setting.key} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Settings size={14} style={{ color: "var(--text-secondary)" }} />
                    <label className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {getLabel(setting.key)}
                    </label>
                  </div>
                  {getDesc(setting.key) && (
                    <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                      {getDesc(setting.key)}
                    </p>
                  )}
                  <code className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--surface-alt)", color: "var(--text-secondary)" }}>
                    {setting.key}
                  </code>
                </div>
                <div className="flex items-center gap-2 sm:w-64">
                  <input
                    type="text"
                    className="input text-sm"
                    value={setting.value}
                    placeholder="Valeur…"
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev.map((s) =>
                          s.key === setting.key ? { ...s, value: e.target.value, saved: false } : s
                        )
                      )
                    }
                  />
                  <button
                    id={`save-${setting.key}`}
                    className="btn-primary text-sm px-3 py-2 flex-shrink-0"
                    onClick={() => handleSave(setting.key, setting.value)}
                    disabled={saving === setting.key || setting.saved}
                    style={{
                      opacity: setting.saved ? 0.5 : 1,
                    }}
                  >
                    {saving === setting.key ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Ajouter un paramètre personnalisé */}
          <div className="card" style={{ border: "2px dashed var(--border)" }}>
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--text-primary)" }}>
              <Plus size={14} className="inline mr-1" />
              Ajouter un paramètre
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                className="input text-sm flex-1"
                placeholder="Clé (ex: min_cycle_amount)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
              />
              <input
                type="text"
                className="input text-sm flex-1"
                placeholder="Valeur"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
              <button
                id="add-custom-setting"
                className="btn-primary text-sm px-4 py-2"
                onClick={handleAddCustom}
                disabled={!newKey.trim() || !newValue.trim() || saving === "custom"}
              >
                {saving === "custom" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>Ajouter</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
