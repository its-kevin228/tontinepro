import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fffffe] flex items-center justify-center p-6 font-sans">
      <div className="text-center max-w-md">
        {/* Numéro 404 stylisé */}
        <div className="relative mb-8">
          <p className="text-[160px] font-black text-[#dfe5f2] leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[#ffd803] text-[#272343] px-6 py-2 rounded-2xl font-black text-lg shadow-lg">
              Page introuvable
            </div>
          </div>
        </div>

        <p className="text-[#2d334a]/60 font-medium mb-8 leading-relaxed">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-[#272343] text-[#ffd803] rounded-xl font-black hover:bg-[#1a1730] transition-all"
          >
            Retour au dashboard
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-[#f8fafc] border border-[#dfe5f2] text-[#272343] rounded-xl font-black hover:bg-[#e3f6f5] transition-all"
          >
            Page d&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
