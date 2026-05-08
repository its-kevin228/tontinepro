import { Wallet, HandCoins, LayoutDashboard, LineChart } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Cotisations",
    description: "Permettez à vos membres de vous payer partout en Afrique par plusieurs moyens de paiements locaux.",
    color: "bg-accent"
  },
  {
    icon: HandCoins,
    title: "Gains",
    description: "Payez vos bénéficiaires partout en Afrique par plusieurs moyens de paiements locaux.",
    color: "bg-surface-alt"
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Offrez à vos membres une expérience de paiement fluide optimisée pour les conversions.",
    color: "bg-accent"
  },
  {
    icon: LineChart,
    title: "Statistiques",
    description: "Suivez vos transactions en temps réel et obtenez des rapports détaillés.",
    color: "bg-surface-tertiary"
  }
];

export default function Features() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-surface-alt/10">
      <div className="container mx-auto px-6 text-center mb-16">
        <h2 className="font-display text-3xl md:text-5xl font-bold text-text-primary mb-6">
          Une tontine moderne, simple et efficace
        </h2>
        <div className="w-20 h-2 bg-accent mx-auto rounded-full" />
      </div>
      
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, i) => (
          <div key={i} className="bg-background p-8 rounded-3xl border border-border shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
            <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-sm group-hover:rotate-6 transition-transform`}>
              <feature.icon className="w-7 h-7 text-text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold text-text-primary mb-3">{feature.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
