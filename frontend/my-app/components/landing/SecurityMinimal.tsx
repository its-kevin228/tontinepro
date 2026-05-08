import { ShieldCheck, CheckCircle2, Globe } from "lucide-react";

export const Security = () => {
  return (
    <section id="security" className="py-24 md:py-32 bg-[#fffffe]">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="font-display text-[32px] md:text-[48px] font-bold text-[#272343] mb-6">Sécurité et vie privée au cœur du système</h2>
          <p className="text-[#2d334a] text-[18px] md:text-[20px] leading-relaxed">
            Nous utilisons des protocoles de chiffrement bancaire pour garantir la sécurité de vos fonds et la confidentialité de vos échanges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-[#e3f6f5] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-8 h-8 text-[#272343]" />
            </div>
            <h4 className="text-[20px] font-bold mb-3 text-[#272343]">Normes PCI-DSS</h4>
            <p className="text-[#2d334a] text-[15px] leading-relaxed">
              Fiabilité et sécurité garanties par le respect strict des plus hauts standards de sécurité bancaire.
            </p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-[#ffd803]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="w-8 h-8 text-[#272343]" />
            </div>
            <h4 className="text-[20px] font-bold mb-3 text-[#272343]">Protection active</h4>
            <p className="text-[#2d334a] text-[15px] leading-relaxed">
              Surveillance en temps réel des flux financiers pour prévenir toute activité suspecte ou fraude.
            </p>
          </div>

          <div className="flex flex-col items-center text-center group">
            <div className="w-16 h-16 rounded-2xl bg-[#bae8e8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Globe className="w-8 h-8 text-[#272343]" />
            </div>
            <h4 className="text-[20px] font-bold mb-3 text-[#272343]">Conformité locale</h4>
            <p className="text-[#2d334a] text-[15px] leading-relaxed">
              Solution adaptée aux cadres réglementaires des pays d'Afrique pour une épargne sereine.
            </p>
          </div>
        </div>
        
        <div className="bg-[#e3f6f5] rounded-[32px] p-10 md:p-16 relative overflow-hidden shadow-sm">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffd803] opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              <div className="text-center md:border-r border-[#272343]/10 last:border-0">
                <div className="text-[40px] md:text-[48px] font-bold text-[#272343] mb-1">+12</div>
                <p className="text-[12px] text-[#2d334a] uppercase tracking-wider font-semibold">Pays couverts</p>
              </div>
              <div className="text-center md:border-r border-[#272343]/10 last:border-0">
                <div className="text-[40px] md:text-[48px] font-bold text-[#272343] mb-1">+60</div>
                <p className="text-[12px] text-[#2d334a] uppercase tracking-wider font-semibold">Méthodes mobiles</p>
              </div>
              <div className="text-center md:border-r border-[#272343]/10 last:border-0">
                <div className="text-[40px] md:text-[48px] font-bold text-[#272343] mb-1">0 FCFA</div>
                <p className="text-[12px] text-[#2d334a] uppercase tracking-wider font-semibold">Frais d'adhésion</p>
              </div>
              <div className="text-center">
                <div className="text-[40px] md:text-[48px] font-bold text-[#272343] mb-1">99.9%</div>
                <p className="text-[12px] text-[#2d334a] uppercase tracking-wider font-semibold">Disponibilité</p>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};
