import { Wallet, HandCoins, LayoutDashboard, LineChart } from "lucide-react";

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-[#e3f6f5]/20">
      <div className="container mx-auto px-6 text-center mb-16">
        <h2 className="font-display text-[32px] md:text-[48px] font-bold text-[#272343] mb-6">
          Une tontine moderne, simple et efficace
        </h2>
        <div className="w-20 h-2 bg-[#ffd803] mx-auto rounded-full" />
      </div>
      
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-10 rounded-[24px] border border-[#dfe5f2] shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
          <div className="w-16 h-16 rounded-[18px] bg-[#ffd803] flex items-center justify-center mb-8 shadow-sm group-hover:rotate-6 transition-transform">
            <Wallet className="w-8 h-8 text-[#272343]" />
          </div>
          <h3 className="font-display text-[23px] font-bold text-[#272343] mb-4">Cotisations</h3>
          <p className="text-[#2d334a] text-[16px] leading-[1.6]">
            Permettez à vos membres de vous payer partout en Afrique par plusieurs moyens de paiements locaux grâce à une seule intégration.
          </p>
        </div>

        <div className="bg-white p-10 rounded-[24px] border border-[#dfe5f2] shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
          <div className="w-16 h-16 rounded-[18px] bg-[#e3f6f5] flex items-center justify-center mb-8 shadow-sm group-hover:rotate-6 transition-transform">
            <HandCoins className="w-8 h-8 text-[#272343]" />
          </div>
          <h3 className="font-display text-[23px] font-bold text-[#272343] mb-4">Gains</h3>
          <p className="text-[#2d334a] text-[16px] leading-[1.6]">
            Payez vos bénéficiaires partout en Afrique par plusieurs moyens de paiements locaux grâce à une seule intégration.
          </p>
        </div>

        <div className="bg-white p-10 rounded-[24px] border border-[#dfe5f2] shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
          <div className="w-16 h-16 rounded-[18px] bg-[#ffd803] flex items-center justify-center mb-8 shadow-sm group-hover:-rotate-6 transition-transform">
            <LayoutDashboard className="w-8 h-8 text-[#272343]" />
          </div>
          <h3 className="font-display text-[23px] font-bold text-[#272343] mb-4">Dashboard</h3>
          <p className="text-[#2d334a] text-[16px] leading-[1.6]">
            Offrez à vos membres une expérience de paiement fluide optimisée pour les conversions et le suivi.
          </p>
        </div>

        <div className="bg-white p-10 rounded-[24px] border border-[#dfe5f2] shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
          <div className="w-16 h-16 rounded-[18px] bg-[#bae8e8] flex items-center justify-center mb-8 shadow-sm group-hover:-rotate-6 transition-transform">
            <LineChart className="w-8 h-8 text-[#272343]" />
          </div>
          <h3 className="font-display text-[23px] font-bold text-[#272343] mb-4">Statistiques</h3>
          <p className="text-[#2d334a] text-[16px] leading-[1.6]">
            Suivez vos transactions en temps réel et obtenez des rapports détaillés pour une meilleure prise de décision.
          </p>
        </div>
      </div>
    </section>
  );
};
