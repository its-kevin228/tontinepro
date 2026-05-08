import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-32 pb-24 md:pt-40 md:pb-32 bg-background relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-surface-alt rounded-full blur-[100px] opacity-50 -z-10" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-surface-tertiary rounded-full blur-[100px] opacity-30 -z-10" />
      
      <div className="container mx-auto px-6 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-surface-tertiary/30 text-text-primary font-semibold mb-8 border border-surface-tertiary/50">
          Tontine pour l'Afrique
        </div>
        
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight font-bold text-text-primary max-w-4xl tracking-tight mb-10">
          Cotisez ensemble, <span className="bg-accent px-4 rounded-lg inline-block transform -rotate-1">évoluez</span> à l'infini
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl text-text-secondary leading-relaxed mb-12">
          TontinePro vous permet de connecter vos cercles financiers, collecter les fonds et distribuer les gains via une expérience fluide, sécurisée et transparente.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md justify-center">
          <Link 
            href="/register" 
            className="flex items-center justify-center h-14 px-8 rounded-full bg-accent text-text-primary font-bold text-base shadow-sm transition-all hover:bg-accent-hover hover:shadow-lg hover:-translate-y-1 active:scale-95"
          >
            Créer un compte
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link 
            href="/demo" 
            className="flex items-center justify-center h-14 px-8 rounded-full bg-surface-alt font-bold text-base border border-surface-tertiary hover:bg-surface-tertiary/20 transition-all active:scale-95"
          >
            Voir une démo
          </Link>
        </div>

        <div className="mt-24 w-full">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-8">
            Des entreprises de toutes tailles font confiance à TontinePro
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 items-center">
            {/* Logos simplifiés pour l'exemple */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-text-primary rounded-lg flex items-center justify-center text-accent font-bold text-lg">B</div>
              <span className="text-xl font-bold font-display tracking-tight">BleMama</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-surface-tertiary rounded-full flex items-center justify-center text-text-primary font-bold text-lg italic">Z</div>
              <span className="text-xl font-bold font-display tracking-tight">Zeyow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-text-secondary rounded-md flex items-center justify-center text-text-secondary font-black text-lg">C</div>
              <span className="text-xl font-bold font-display tracking-tight">Crilix</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
