import { ArrowRight, CheckCircle2, Shield, Users, Globe, Smartphone, Lock } from "lucide-react"

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#fffffe] font-['Poppins']">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#fffffe]/80 backdrop-blur-md border-b border-[#dfe5f2]">
        <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#ffd803] rounded-xl flex items-center justify-center font-bold text-[#272343]">TP</div>
            <span className="text-2xl font-bold text-[#272343]">TontinePro</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[#2d334a] hover:text-[#272343] transition-colors">Fonctionnalités</a>
            <a href="#solutions" className="text-[#2d334a] hover:text-[#272343] transition-colors">Solutions</a>
            <a href="#security" className="text-[#2d334a] hover:text-[#272343] transition-colors">Sécurité</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="px-6 py-2 rounded-xl text-[#272343] font-semibold hover:bg-[#e3f6f5] transition-colors">Connexion</a>
            <a href="/register" className="px-6 py-2 rounded-xl bg-[#ffd803] text-[#272343] font-bold hover:bg-[#e0c700] transition-all shadow-[0_16px_40px_rgba(39,35,67,0.08)]">Rejoindre</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e3f6f5] text-[#272343] text-sm font-semibold mb-6 border border-[#bae8e8]">
              <span className="flex h-2 w-2 rounded-full bg-[#42c88f]"></span>
              L'avenir de l'épargne collective
            </div>
            <h1 className="text-[57px] leading-[65px] font-bold text-[#272343] mb-8 tracking-[0.1px]">
              Cotisez ensemble, <span className="bg-[#ffd803] px-2 rounded-lg">évoluez</span> sans limites
            </h1>
            <p className="text-lg text-[#2d334a] leading-[28px] mb-12 max-w-lg">
              Une plateforme moderne pour gérer vos cercles de tontine en toute transparence, sécurité et flexibilité.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-[#ffd803] text-[#272343] rounded-[20px] font-bold text-lg hover:bg-[#e0c700] transition-all shadow-[0_16px_40px_rgba(39,35,67,0.08)] flex items-center justify-center gap-2">
                Démarrer une tontine <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-[#e3f6f5] text-[#272343] rounded-[20px] font-bold text-lg border border-[#bae8e8] hover:bg-[#d0ecea] transition-all">
                Voir la démo
              </button>
            </div>
            <div className="mt-12 flex items-center gap-4 text-[#2d334a]">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#fffffe] bg-gray-200" />
                ))}
              </div>
              <p className="text-sm font-medium">Rejoint par <span className="font-bold text-[#272343]">5000+</span> utilisateurs</p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-[#bae8e8]/30 blur-[100px] -z-10 rounded-full" />
            <div className="bg-[#fffffe] border border-[#dfe5f2] rounded-[24px] overflow-hidden shadow-[0_16px_40px_rgba(39,35,67,0.08)]">
              {/* Mockup Dashboard */}
              <div className="p-8 bg-[#272343]/5 border-b border-[#dfe5f2]">
                <div className="flex justify-between items-center mb-8">
                  <div className="h-4 w-32 bg-[#272343]/20 rounded-full" />
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#ffd803]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-[#fffffe] rounded-[20px] p-4 shadow-sm">
                    <div className="h-2 w-16 bg-[#272343]/10 rounded-full mb-3" />
                    <div className="h-4 w-24 bg-[#272343]/20 rounded-full" />
                  </div>
                  <div className="h-24 bg-[#fffffe] rounded-[20px] p-4 shadow-sm">
                    <div className="h-2 w-16 bg-[#272343]/10 rounded-full mb-3" />
                    <div className="h-4 w-24 bg-[#42c88f]/40 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#e3f6f5]/30 rounded-[16px]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#bae8e8]" />
                        <div className="h-3 w-24 bg-[#272343]/20 rounded-full" />
                      </div>
                      <div className="h-3 w-16 bg-[#42c88f]/60 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-[#e3f6f5]/50">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[48px] font-bold text-[#272343] mb-4">Fonctionnalités Robustes</h2>
            <p className="text-[#2d334a] max-w-2xl mx-auto">Tout ce dont vous avez besoin pour gérer vos finances collectives en toute simplicité.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Gestion Automatisée", desc: "Suivez les cotisations et les versements sans effort avec nos rapports automatisés.", icon: <Globe className="text-[#272343]" /> },
              { title: "Notifications Temps Réel", desc: "Restez informé de chaque mouvement : rappels, paiements et nouveaux gains.", icon: <Smartphone className="text-[#272343]" /> },
              { title: "Sécurité Bancaire", desc: "Vos données et fonds sont protégés par un cryptage de bout en bout.", icon: <Lock className="text-[#272343]" /> }
            ].map((f, i) => (
              <div key={i} className="bg-[#fffffe] p-8 rounded-[20px] shadow-[0_16px_40px_rgba(39,35,67,0.08)] border border-[#dfe5f2] hover:-translate-y-2 transition-transform">
                <div className="w-14 h-14 bg-[#bae8e8] rounded-[16px] flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-[23px] font-bold text-[#272343] mb-4">{f.title}</h3>
                <p className="text-[#2d334a] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto bg-[#272343] rounded-[32px] p-12 md:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ffd803]/10 blur-[100px] -z-0" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-[48px] font-bold text-white mb-8">Sécurité Maximale sans compromise</h2>
              <div className="space-y-6">
                {[
                  "Double Authentification (2FA)",
                  "Données cryptées AES-256",
                  "Vérification d'identité (KYC)",
                  "Audit régulier des contrats intelligents"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#42c88f] flex items-center justify-center">
                      <CheckCircle2 size={16} className="text-[#272343]" />
                    </div>
                    <span className="text-white text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-64 bg-[#ffd803] rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(255,216,3,0.3)]">
                <Shield size={120} className="text-[#272343]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-[#fffffe] border-t border-[#dfe5f2] px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-[#ffd803] rounded-xl flex items-center justify-center font-bold text-[#272343]">TP</div>
              <span className="text-2xl font-bold text-[#272343]">TontinePro</span>
            </div>
            <p className="text-[#2d334a] leading-relaxed max-w-sm">
              Révolutionner la tontine traditionnelle pour l'ère du numérique, en privilégiant la confiance et la transparence.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-[#272343] mb-6">Liens rapides</h4>
            <ul className="space-y-4 text-[#2d334a]">
              <li><a href="#" className="hover:text-[#ffd803] transition-colors">Accueil</a></li>
              <li><a href="#" className="hover:text-[#ffd803] transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-[#ffd803] transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#272343] mb-6">Légal</h4>
            <ul className="space-y-4 text-[#2d334a]">
              <li><a href="#" className="hover:text-[#ffd803] transition-colors">CGU</a></li>
              <li><a href="#" className="hover:text-[#ffd803] transition-colors">Confidentialité</a></li>
              <li><a href="#" className="hover:text-[#ffd803] transition-colors">Mentions légales</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-24 pt-8 border-t border-[#dfe5f2] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#a7a9be]">
          <p>© 2026 TontinePro. Tous droits réservés.</p>
          <div className="flex gap-6">
            <span className="hover:text-[#272343] cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-[#272343] cursor-pointer transition-colors">LinkedIn</span>
            <span className="hover:text-[#272343] cursor-pointer transition-colors">Instagram</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
