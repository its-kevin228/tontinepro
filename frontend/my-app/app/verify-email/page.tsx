"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, Mail, Loader2, RefreshCcw } from "lucide-react";

function VerifyEmailContent() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { login } = useAuth();

  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Veuillez entrer le code complet.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await fetchApi("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });

      // Stocker le token et l&apos;utilisateur
      login(data.token, data.user);
      router.push("/dashboard?welcome=true");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !email) return;
    setResending(true);
    try {
      await fetchApi("/auth/resend-otp", { 
        method: "POST",
        body: JSON.stringify({ email })
      });
      setTimer(60);
    } catch (err: any) {
      setError("Erreur lors de l&apos;envoi du code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffffe] font-sans text-[#272343] p-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mb-10 flex justify-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image src="/images/logo/logotontine.svg" alt="Logo" fill className="object-contain" />
              </div>
              <span className="text-2xl font-bold tracking-tighter">Tontine<span className="text-[#ffd803]">Pro</span></span>
            </Link>
          </div>
          <div className="w-20 h-20 bg-[#e3f6f5] rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Mail className="h-10 w-10 text-[#272343]" />
          </div>
          <h1 className="text-[32px] font-bold mb-3">Vérifiez votre mail</h1>
          <p className="text-[#2d334a] max-w-xs mx-auto">
            Nous avons envoyé un code de vérification à 6 chiffres sur <span className="font-bold">{email}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-[#f25f4c]/10 border border-[#f25f4c]/20 text-[#f25f4c] rounded-2xl text-[14px] font-medium text-center animate-in fade-in slide-in-from-top-4">
              {error}
            </div>
          )}

          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-16 md:w-14 md:h-20 text-center text-2xl font-bold bg-[#e3f6f5]/20 border-2 border-[#dfe5f2] rounded-2xl focus:border-[#ffd803] focus:ring-4 focus:ring-[#ffd803]/10 outline-none transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || otp.some(d => d === "")}
            className="w-full h-16 bg-[#ffd803] text-[#272343] font-bold text-[18px] rounded-2xl shadow-lg hover:bg-[#e0c700] hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                Vérifier mon compte <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[#2d334a] mb-2">Vous n&apos;avez rien reçu ?</p>
          <button
            onClick={handleResend}
            disabled={timer > 0 || resending}
            className="flex items-center gap-2 mx-auto text-[#272343] font-bold hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {resending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className={`h-4 w-4 ${timer > 0 ? '' : 'animate-spin-slow'}`} />
            )}
            {timer > 0 ? `Renvoyer le code (${timer}s)` : "Renvoyer le code maintenant"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#ffd803]" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

