"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { fetchApi } from "@/lib/api";
import { ArrowRight, Lock, Mail, User, Phone, Loader2, Users, Briefcase, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "MEMBRE",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      // Rediriger vers la page de vérification avec l'email en query param
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffffe] font-sans text-[#272343] p-6">
      <div className="w-full max-w-md">
        <div className="mb-12 text-center">
          <div className="mb-12 flex justify-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image src="/images/logo/logotontine.svg" alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tighter">Tontine<span className="text-[#ffd803]">Pro</span></span>
            </Link>
          </div>
          <h1 className="text-[32px] font-bold mb-3">Créer un compte</h1>
          <p className="text-[#2d334a]">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="text-[#272343] font-bold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-[#f25f4c]/10 border border-[#f25f4c]/20 text-[#f25f4c] rounded-2xl text-[14px] font-medium animate-in fade-in slide-in-from-top-4">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[14px] font-bold uppercase tracking-wider text-[#2d334a]/60 ml-1">
              Nom complet
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-[#2d334a]/30 group-focus-within:text-[#272343] transition-colors" />
              </div>
              <input
                name="name"
                type="text"
                required
                placeholder="Nom prénom"
                className="block w-full h-14 pl-12 pr-4 bg-[#e3f6f5]/20 border border-[#dfe5f2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffd803] focus:border-transparent transition-all placeholder:text-[#2d334a]/20"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-bold uppercase tracking-wider text-[#2d334a]/60 ml-1">
              Adresse Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-[#2d334a]/30 group-focus-within:text-[#272343] transition-colors" />
              </div>
              <input
                name="email"
                type="email"
                required
                placeholder="nom@exemple.com"
                className="block w-full h-14 pl-12 pr-4 bg-[#e3f6f5]/20 border border-[#dfe5f2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffd803] focus:border-transparent transition-all placeholder:text-[#2d334a]/20"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-bold uppercase tracking-wider text-[#2d334a]/60 ml-1">
              Téléphone
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-[#2d334a]/30 group-focus-within:text-[#272343] transition-colors" />
              </div>
              <input
                name="phone"
                type="tel"
                placeholder="+228 90 00 00 00"
                className="block w-full h-14 pl-12 pr-4 bg-[#e3f6f5]/20 border border-[#dfe5f2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffd803] focus:border-transparent transition-all placeholder:text-[#2d334a]/20"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-bold uppercase tracking-wider text-[#2d334a]/60 ml-1">
              Mot de passe
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#2d334a]/30 group-focus-within:text-[#272343] transition-colors" />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="block w-full h-14 pl-12 pr-12 bg-[#e3f6f5]/20 border border-[#dfe5f2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffd803] focus:border-transparent transition-all placeholder:text-[#2d334a]/20"
                value={formData.password}
                onChange={handleChange}
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

          <div className="space-y-4 pt-2">
            <label className="text-[14px] font-bold uppercase tracking-wider text-[#2d334a]/60 ml-1">
              Je souhaite être...
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "MEMBRE" })}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                  formData.role === "MEMBRE"
                    ? "border-[#ffd803] bg-[#ffd803]/10"
                    : "border-[#dfe5f2] bg-transparent hover:border-[#ffd803]/40"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.role === 'MEMBRE' ? 'bg-[#ffd803] text-[#272343]' : 'bg-[#e3f6f5] text-[#2d334a]/60'}`}>
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-[15px]">Membre</p>
                  <p className="text-[11px] text-[#2d334a]/60 leading-tight">Je rejoins des tontines existantes</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "ORGANISATEUR" })}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                  formData.role === "ORGANISATEUR"
                    ? "border-[#ffd803] bg-[#ffd803]/10"
                    : "border-[#dfe5f2] bg-transparent hover:border-[#ffd803]/40"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.role === 'ORGANISATEUR' ? 'bg-[#ffd803] text-[#272343]' : 'bg-[#e3f6f5] text-[#2d334a]/60'}`}>
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-[15px]">Organisateur</p>
                  <p className="text-[11px] text-[#2d334a]/60 leading-tight">Je crée et gère mes propres cercles</p>
                </div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-[#ffd803] text-[#272343] font-bold text-[18px] rounded-2xl shadow-lg hover:bg-[#e0c700] hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                Créer mon compte <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
