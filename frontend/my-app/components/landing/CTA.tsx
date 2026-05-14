import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-24 md:py-32 bg-[#fffffe]">
      <div className="container mx-auto px-6">
        <div className="bg-[#272343] rounded-[48px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#ffd803] rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#bae8e8] rounded-full blur-[120px]"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#ffd803] text-[#272343] text-sm font-bold uppercase tracking-wider mb-8">
              Prêt à commencer ?
            </span>
            <h2 className="font-display text-[40px] md:text-[64px] font-bold text-[#fffffe] mb-8 leading-[1.05] tracking-tight">
              Digitalisez votre épargne <br className="hidden md:block" /> collective dès aujourd&apos;hui.
            </h2>
            <p className="text-[18px] md:text-[22px] text-[#a7a9be] mb-12 max-w-2xl mx-auto leading-relaxed">
              Rejoignez la nouvelle ère de la tontine. Sécurisée, transparente et accessible partout en Afrique.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                href="/register" 
                className="group h-16 px-10 rounded-full bg-[#ffd803] text-[#272343] font-bold text-[18px] flex items-center justify-center hover:bg-[#fffffe] transition-all duration-300 shadow-xl hover:-translate-y-1 active:scale-95 w-full sm:w-auto"
              >
                Ouvrir mon compte
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/contact" 
                className="h-16 px-10 rounded-full bg-transparent border-2 border-white/20 text-[#fffffe] font-bold text-[18px] flex items-center justify-center hover:bg-white/10 transition-all w-full sm:w-auto"
              >
                Parler à un expert
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
