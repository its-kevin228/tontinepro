import { Users, Globe, LayoutDashboard } from "lucide-react";

export default function Solutions() {
  return (
    <section id="solutions" className="py-24 md:py-32 bg-surface-alt/20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-text-primary mb-6">Des tontines pour chaque projet</h2>
          <div className="w-20 h-2 bg-accent mx-auto rounded-full mb-8" />
          <p className="text-text-secondary text-lg leading-relaxed">
            Quelle que soit la taille ou l'objectif de votre groupe, nous avons une solution adaptée.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-background p-8 rounded-[32px] border border-border shadow-sm group hover:shadow-md transition-shadow">
            <Users className="w-10 h-10 text-text-primary mb-6" />
            <h3 className="text-2xl font-bold mb-4">Familiale & Amis</h3>
            <p className="text-text-secondary leading-relaxed text-base">Idéal pour les petits cercles de confiance, les vacances ou les événements familiaux.</p>
          </div>
          <div className="bg-text-primary p-8 rounded-[32px] shadow-xl transform md:-translate-y-4">
            <Globe className="w-10 h-10 text-accent mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-white">Professionnelle</h3>
            <p className="text-text-secondary opacity-70 leading-relaxed text-base">Pour les collègues et entrepreneurs souhaitant investir dans des projets d'envergure.</p>
          </div>
          <div className="bg-background p-8 rounded-[32px] border border-border shadow-sm group hover:shadow-md transition-shadow">
            <LayoutDashboard className="w-10 h-10 text-text-primary mb-6" />
            <h3 className="text-2xl font-bold mb-4">Immobilière</h3>
            <p className="text-text-secondary leading-relaxed text-base">Des tontines à long terme conçues spécifiquement pour l'acquisition de terrains ou de logements.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
