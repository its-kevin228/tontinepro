import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="pt-44 pb-24 md:pt-56 md:pb-32 bg-[#fffffe] relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#e3f6f5] rounded-full blur-[100px] opacity-50 -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#bae8e8] rounded-full blur-[100px] opacity-30 -z-10" />
      
      <div className="container mx-auto px-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#bae8e8]/30 text-[#272343] font-semibold mb-8 border border-[#bae8e8]/50">
          Tontine pour l&apos;Afrique
        </div>
        
        <h1 className="font-display text-[48px] md:text-[69px] leading-[1.1] md:leading-[80px] font-bold text-[#272343] max-w-4xl tracking-tight mb-10">
          Cotisez ensemble, <span className="bg-[#ffd803] px-4 rounded-lg inline-block transform -rotate-1">évoluez</span> à l&apos;infini
        </h1>
        
        <p className="max-w-2xl text-[18px] md:text-[23px] text-[#2d334a] leading-relaxed md:leading-[32px] mb-12">
          TontinePro vous permet de connecter vos cercles financiers, collecter les fonds et distribuer les gains via une expérience fluide, sécurisée et transparente.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md justify-center">
          <Link 
            href="/register" 
            className="flex items-center justify-center h-16 px-10 rounded-full bg-[#ffd803] text-[#272343] font-bold text-[18px] shadow-sm transition-all hover:bg-[#e0c700] hover:shadow-lg hover:-translate-y-1 active:scale-95 sm:w-[220px]"
          >
            Créer un compte
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link 
            href="/demo" 
            className="flex items-center justify-center h-16 px-10 rounded-full bg-[#e3f6f5] font-bold text-[18px] border border-[#bae8e8] hover:bg-[#bae8e8]/20 transition-all active:scale-95 sm:w-[220px]"
          >
            Voir une démo
          </Link>
        </div>

        <div className="mt-32 w-full">
          <p className="text-[14px] font-semibold text-[#2d334a] uppercase tracking-widest mb-10">
            Des entreprises de toutes tailles font confiance à TontinePro
          </p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 grayscale opacity-70 hover:grayscale-0 transition-all items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#272343] rounded-lg flex items-center justify-center text-[#ffd803] font-bold text-xl">B</div>
              <span className="text-2xl font-bold font-display tracking-tight">BleMama</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#bae8e8] rounded-full flex items-center justify-center text-[#272343] font-bold text-xl italic">Z</div>
              <span className="text-2xl font-bold font-display tracking-tight">Zeyow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 border-2 border-[#2d334a] rounded-md flex items-center justify-center text-[#2d334a] font-black text-xl">C</div>
              <span className="text-2xl font-bold font-display tracking-tight">Crilix</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-8 bg-[#ffd803] rounded-sm flex items-center justify-center text-[#272343] font-bold text-lg">RP</div>
              <span className="text-2xl font-bold font-display tracking-tight">ReventPro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#e3f6f5] rotate-45 flex items-center justify-center border border-[#bae8e8]">
                <span className="text-xl font-bold text-[#272343] -rotate-45">T</span>
              </div>
              <span className="text-2xl font-bold font-display tracking-tight">Tama</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
