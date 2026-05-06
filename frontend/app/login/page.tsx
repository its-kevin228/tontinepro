"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token } = await authApi.login({ email, password });
      localStorage.setItem("token", token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      {/* Panneau gauche — Illustration */}
      <div
        className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden"
        style={{ background: "var(--text-primary)" }}
      >
        {/* Pattern décoratif */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, var(--accent) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, var(--surface-tertiary) 0%, transparent 40%)`,
          }}
        />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
              style={{ background: "var(--accent)", color: "var(--text-primary)" }}
            >
              T
            </div>
            <span className="text-xl font-bold" style={{ color: "#fffffe" }}>
              TontinePro
            </span>
          </div>

          <h1
            className="text-4xl font-bold leading-tight mb-6"
            style={{ color: "#fffffe" }}
          >
            Gérez votre tontine en toute confiance
          </h1>
          <p className="text-lg" style={{ color: "#a7a9be" }}>
            Transparence totale sur chaque cotisation, chaque cycle et chaque versement.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            { label: "Cercles actifs", value: "2 400+" },
            { label: "Volume géré", value: "480M FCFA" },
            { label: "Membres", value: "18 000+" },
            { label: "Pays", value: "8" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-2xl"
              style={{ background: "rgba(255,255,254,0.06)" }}
            >
              <div className="text-2xl font-bold mb-1" style={{ color: "var(--accent)" }}>
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: "#a7a9be" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panneau droit — Formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
              style={{ background: "var(--accent)", color: "var(--text-primary)" }}
            >
              T
            </div>
            <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              TontinePro
            </span>
          </div>

          <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Bon retour 👋
          </h2>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
            Connectez-vous à votre espace
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Adresse email</label>
              <input
                id="email"
                type="email"
                className={`input ${error ? "error" : ""}`}
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label mb-0">Mot de passe</label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  className={`input pr-12 ${error ? "error" : ""}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-secondary)" }}
                  aria-label="Afficher le mot de passe"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ background: "rgba(242,95,76,0.08)", color: "var(--error)" }}
              >
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Bouton */}
            <button
              type="submit"
              id="login-submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>Se connecter <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Lien inscription */}
          <p className="mt-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
