import { Users, Globe, LayoutDashboard } from "lucide-react";

export const Solutions = () => {
  return (
    <section id="solutions" className="py-24 md:py-32 bg-[#e3f6f5]/20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="font-display text-[32px] md:text-[48px] font-bold text-[#272343] mb-6">Des tontines pour chaque projet</h2>
          <div className="w-20 h-2 bg-[#ffd803] mx-auto rounded-full mb-8" />
          <p className="text-[#2d334a] text-[18px] leading-relaxed">
            Quelle que soit la taille ou l&apos;objectif de votre groupe, nous avons une solution adaptée.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#fffffe] p-8 rounded-[32px] border border-[#dfe5f2] shadow-sm">
            <Users className="w-10 h-10 text-[#272343] mb-6" />
            <h3 className="text-[22px] font-bold mb-4">Familiale & Amis</h3>
            <p className="text-[#2d334a] leading-relaxed">Idéal pour les petits cercles de confiance, les vacances ou les événements familiaux.</p>
          </div>
          <div className="bg-[#272343] p-8 rounded-[32px] shadow-xl transform md:-translate-y-4">
            <Globe className="w-10 h-10 text-[#ffd803] mb-6" />
            <h3 className="text-[22px] font-bold mb-4 text-[#fffffe]">Professionnelle</h3>
            <p className="text-[#a7a9be] leading-relaxed">Pour les collègues et entrepreneurs souhaitant investir dans des projets d&apos;envergure.</p>
          </div>
          <div className="bg-[#fffffe] p-8 rounded-[32px] border border-[#dfe5f2] shadow-sm">
            <LayoutDashboard className="w-10 h-10 text-[#272343] mb-6" />
            <h3 className="text-[22px] font-bold mb-4">Immobilière</h3>
            <p className="text-[#2d334a] leading-relaxed">Des tontines à long terme conçues spécifiquement pour l&apos;acquisition de terrains ou de logements.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
