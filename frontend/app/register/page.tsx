"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight, Check } from "lucide-react";
import { authApi } from "@/lib/api";

const passwordRules = [
  { label: "Au moins 8 caractères", test: (p: string) => p.length >= 8 },
  { label: "Une lettre majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Un chiffre", test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pwdStrength = passwordRules.filter((r) => r.test(password)).length;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (pwdStrength < 3) {
      setError("Veuillez respecter les règles du mot de passe");
      return;
    }
    setLoading(true);
    try {
      const { token } = await authApi.register({ name, email, password });
      localStorage.setItem("token", token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
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

        {/* En-tête */}
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Créer un compte
        </h1>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          Rejoignez des milliers de membres qui gèrent leur tontine en ligne
        </p>

        {/* Carte formulaire */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nom */}
            <div>
              <label htmlFor="name" className="label">Nom complet</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Adresse email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="label">Mot de passe</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  className="input pr-12"
                  placeholder="Minimum 8 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Barre de force */}
              {password.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background:
                            i < pwdStrength
                              ? pwdStrength === 1
                                ? "var(--error)"
                                : pwdStrength === 2
                                ? "var(--warning)"
                                : "var(--success)"
                              : "var(--border)",
                        }}
                      />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {passwordRules.map((rule) => (
                      <div
                        key={rule.label}
                        className="flex items-center gap-2 text-xs"
                        style={{
                          color: rule.test(password) ? "var(--success)" : "var(--text-secondary)",
                        }}
                      >
                        <Check size={12} />
                        {rule.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Erreur */}
            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ background: "rgba(242,95,76,0.08)", color: "var(--error)" }}
              >
                <span>⚠️</span> {error}
              </div>
            )}

            {/* CGU */}
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              En créant un compte, vous acceptez nos{" "}
              <Link href="/terms" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                Conditions d&apos;utilisation
              </Link>{" "}
              et notre{" "}
              <Link href="/privacy" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                Politique de confidentialité
              </Link>.
            </p>

            {/* Bouton */}
            <button
              type="submit"
              id="register-submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>Créer mon compte <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>

        {/* Lien connexion */}
        <p className="mt-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          Déjà un compte ?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
