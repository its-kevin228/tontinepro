"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isNetworkError =
    error.message?.toLowerCase().includes("fetch") ||
    error.message?.toLowerCase().includes("network") ||
    error.message?.toLowerCase().includes("failed");

  return (
    <div className="min-h-screen bg-[#fffffe] flex items-center justify-center p-6 font-sans">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-[#f25f4c]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-[#f25f4c]" />
        </div>

        <h1 className="text-2xl font-black text-[#272343] mb-3">
          {isNetworkError ? "Service indisponible" : "Une erreur est survenue"}
        </h1>

        <p className="text-[#2d334a]/60 font-medium mb-8 leading-relaxed">
          {isNetworkError
            ? "Impossible de contacter le serveur. Vérifiez votre connexion ou réessayez dans quelques instants."
            : "Quelque chose s'est mal passé. L'équipe a été notifiée."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#272343] text-[#ffd803] rounded-xl font-black hover:bg-[#1a1730] transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-[#f8fafc] border border-[#dfe5f2] text-[#272343] rounded-xl font-black hover:bg-[#e3f6f5] transition-all"
          >
            Retour au dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
