"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { fetchApi } from "@/lib/api";
import { ArrowRight, Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, rememberMe }),
      });

      login(data.token, data.user);

      // Rediriger vers le callback si présent (ex: lien d'invitation)
      const callback = searchParams.get("callback");
      if (callback) {
        router.push(callback);
      } else if (data.user.role === "SUPER_ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffffe] font-sans text-[#272343] p-6">
      <div className="w-full max-w-md">
        <div className="mb-12">
          <div className="mb-12 flex justify-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image src="/images/logo/logotontine.svg" alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tighter">Tontine<span className="text-[#ffd803]">Pro</span></span>
            </Link>
          </div>
          <h1 className="text-[32px] font-bold mb-3">Se connecter</h1>
          <p className="text-[#2d334a]">
            Vous n'avez pas encore de compte ?{" "}
            <Link href="/register" className="text-[#272343] font-bold hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-[#f25f4c]/10 border border-[#f25f4c]/20 text-[#f25f4c] rounded-2xl text-[14px] font-medium animate-in fade-in slide-in-from-top-4">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[14px] font-bold uppercase tracking-wider text-[#2d334a]/60 ml-1">
              Adresse Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-[#2d334a]/30 group-focus-within:text-[#272343] transition-colors" />
              </div>
              <input
                type="email"
                required
                placeholder="nom@exemple.com"
                className="block w-full h-14 pl-12 pr-4 bg-[#e3f6f5]/20 border border-[#dfe5f2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffd803] focus:border-transparent transition-all placeholder:text-[#2d334a]/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[14px] font-bold uppercase tracking-wider text-[#2d334a]/60">
                Mot de passe
              </label>
              <Link href="/forgot" className="text-[14px] font-medium text-[#2d334a]/60 hover:text-[#272343]">
                Oublié ?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#2d334a]/30 group-focus-within:text-[#272343] transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="block w-full h-14 pl-12 pr-12 bg-[#e3f6f5]/20 border border-[#dfe5f2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffd803] focus:border-transparent transition-all placeholder:text-[#2d334a]/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#2d334a]/30 hover:text-[#272343] transition-colors"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between ml-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <div className="w-6 h-6 bg-[#e3f6f5]/40 border-2 border-[#dfe5f2] rounded-lg peer-checked:bg-[#ffd803] peer-checked:border-[#ffd803] transition-all"></div>
                <svg
                  className="absolute top-1 left-1 w-4 h-4 text-[#272343] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[14px] font-bold text-[#2d334a]/60 group-hover:text-[#272343] transition-colors">
                Se souvenir de moi
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-[#ffd803] text-[#272343] font-bold text-[18px] rounded-2xl shadow-lg hover:bg-[#e0c700] hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                Connexion <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
