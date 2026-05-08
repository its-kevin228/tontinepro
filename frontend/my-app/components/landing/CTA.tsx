import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="bg-text-primary rounded-[48px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
          {/* Decorative Subtle Elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-accent rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-surface-tertiary rounded-full blur-[120px]"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-text-primary text-sm font-bold uppercase tracking-wider mb-8">
              Prêt à commencer ?
            </span>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
              Digitalisez votre épargne <br className="hidden md:block" /> collective dès aujourd'hui.
            </h2>
            <p className="text-lg md:text-2xl text-text-secondary opacity-70 mb-12 max-w-2xl mx-auto leading-relaxed">
              Rejoignez la nouvelle ère de la tontine. Sécurisée, transparente et accessible partout en Afrique.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                href="/register" 
                className="group h-16 px-10 rounded-full bg-accent text-text-primary font-bold text-lg flex items-center justify-center hover:bg-white transition-all duration-300 shadow-xl hover:-translate-y-1 active:scale-95 w-full sm:w-auto"
              >
                Ouvrir mon compte
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/contact" 
                className="h-16 px-10 rounded-full bg-transparent border-2 border-white/20 text-white font-bold text-lg flex items-center justify-center hover:bg-white/10 transition-all w-full sm:w-auto"
              >
                Parler à un expert
              </Link>
            </div>
            
            <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-50 grayscale contrast-200">
              <div className="flex items-center gap-2 text-white/60">
                <CheckCircle2 size={18} className="text-accent" />
                <span className="text-sm font-medium">Sans frais cachés</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <CheckCircle2 size={18} className="text-accent" />
                <span className="text-sm font-medium">Support 24/7</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <CheckCircle2 size={18} className="text-accent" />
                <span className="text-sm font-medium">Sécurité bancaire</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
