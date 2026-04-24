import Image from "next/image";
import Link from "next/link";
import { 
  Users, 
  HandCoins, 
  ShieldCheck, 
  LineChart, 
  Wallet, 
  LayoutDashboard, 
  Globe, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fffffe] font-sans text-[#272343] overflow-x-hidden">
      {/* --- HEADER --- */}
      <header className="fixed top-0 w-full z-50 bg-[#fffffe]/80 backdrop-blur-md transition-all duration-300">
        <div className="container mx-auto flex h-32 items-center justify-between px-6">
          <div className="flex items-center -ml-4">
            <Link href="/" className="transition-transform hover:scale-105">
              <Image 
                src="/images/logo/tontineprologo-removebg-preview.svg" 
                alt="TontinePro Logo" 
                width={350} 
                height={120} 
                className="h-24 md:h-28 w-auto object-contain"
                priority
              />
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-10 font-medium text-[#2d334a]">
            <Link href="#how-it-works" className="hover:text-[#272343] transition-colors text-[16px]">Fonctionnement</Link>
            <Link href="#security" className="hover:text-[#272343] transition-colors text-[16px]">Sécurité</Link>
            <Link href="#solutions" className="hover:text-[#272343] transition-colors text-[16px]">Solutions</Link>
            <Link href="#help" className="hover:text-[#272343] transition-colors text-[16px]">Aide</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-6 py-2 rounded-full font-semibold border border-transparent transition-all hover:bg-[#e3f6f5] active:scale-95 text-[16px]"
            >
              Connexion
            </Link>
            <Link 
              href="/register" 
              className="px-8 py-3 rounded-full bg-[#ffd803] text-[#272343] font-bold shadow-sm transition-all hover:bg-[#e0c700] hover:shadow-md active:scale-95 text-[16px]"
            >
              Démarrer
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* --- HERO SECTION --- */}
        <section className="pt-44 pb-24 md:pt-56 md:pb-32 bg-[#fffffe] relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#e3f6f5] rounded-full blur-[100px] opacity-50 -z-10" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#bae8e8] rounded-full blur-[100px] opacity-30 -z-10" />
          
          <div className="container mx-auto px-6 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#bae8e8]/30 text-[#272343] font-semibold mb-8 border border-[#bae8e8]/50">
              
              Tontine pour l'Afrique
            </div>
            
            <h1 className="font-display text-[48px] md:text-[69px] leading-[1.1] md:leading-[80px] font-bold text-[#272343] max-w-4xl tracking-tight mb-10">
              Cotisez ensemble, <span className="bg-[#ffd803] px-4 rounded-lg inline-block transform -rotate-1">évoluez</span> à l'infini
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

        {/* --- HOW IT WORKS SECTION --- */}
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
              <div className="w-16 h-16 rounded-[18px] bg-wh flex items-center justify-center mb-8 shadow-sm group-hover:rotate-6 transition-transform">
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

        {/* --- SECURITY SECTION (MINIMALIST & MODERN) --- */}
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

        {/* --- SOLUTIONS SECTION --- */}
        <section id="solutions" className="py-24 md:py-32 bg-[#e3f6f5]/20 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="font-display text-[32px] md:text-[48px] font-bold text-[#272343] mb-6">Des tontines pour chaque projet</h2>
              <div className="w-20 h-2 bg-[#ffd803] mx-auto rounded-full mb-8" />
              <p className="text-[#2d334a] text-[18px] leading-relaxed">
                Quelle que soit la taille ou l'objectif de votre groupe, nous avons une solution adaptée.
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
                <p className="text-[#a7a9be] leading-relaxed">Pour les collègues et entrepreneurs souhaitant investir dans des projets d'envergure.</p>
              </div>
              <div className="bg-[#fffffe] p-8 rounded-[32px] border border-[#dfe5f2] shadow-sm">
                <LayoutDashboard className="w-10 h-10 text-[#272343] mb-6" />
                <h3 className="text-[22px] font-bold mb-4">Immobilière</h3>
                <p className="text-[#2d334a] leading-relaxed">Des tontines à long terme conçues spécifiquement pour l'acquisition de terrains ou de logements.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- CTA SECTION (MODERN & BOLD) --- */}
        <section className="py-24 md:py-32 bg-[#fffffe]">
           <div className="container mx-auto px-6">
             <div className="bg-[#272343] rounded-[48px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
                {/* Decorative Subtle Elements - No more ugly gradients */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#ffd803] rounded-full blur-[120px]"></div>
                  <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#bae8e8] rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-[#ffd803] text-[#272343] text-sm font-bold uppercase tracking-wider mb-8">
                    Prêt à commencer ?
                  </span>
                  <h2 className="font-display text-[40px] md:text-[64px] font-bold text-[#fffffe] mb-8 leading-[1.05] tracking-tight">
                    Digitalisez votre épargne <br className="hidden md:block" /> collective dès aujourd'hui.
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
                  
                  <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-50 grayscale contrast-200">
                    <div className="flex items-center gap-2 text-[#fffffe]/60">
                      <CheckCircle2 size={18} className="text-[#ffd803]" />
                      <span className="text-sm font-medium">Sans frais cachés</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#fffffe]/60">
                      <CheckCircle2 size={18} className="text-[#ffd803]" />
                      <span className="text-sm font-medium">Support 24/7</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#fffffe]/60">
                      <CheckCircle2 size={18} className="text-[#ffd803]" />
                      <span className="text-sm font-medium">Sécurité bancaire</span>
                    </div>
                  </div>
                </div>
             </div>
           </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-[#fffffe] pt-24 pb-12 border-t border-[#dfe5f2]">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Image 
                src="/images/logo/tontineprologo-removebg-preview.svg" 
                alt="TontinePro Logo" 
                width={280} 
                height={80} 
                className="h-20 md:h-24 w-auto object-contain mb-8"
              />
            </Link>
            <p className="text-[#2d334a] text-[16px] leading-relaxed max-w-sm mb-8">
              Accéder à un large éventail de méthodes de paiement mobile en Afrique, avec une intégration unique.
            </p>
            <div className="flex gap-4">
              <Globe className="text-[#272343]" size={20}/>
              <span className="text-[#272343] font-medium">Français</span>
            </div>
          </div>
          
          <div>
            <h5 className="font-bold text-[#272343] mb-8 text-[18px]">Produits</h5>
            <ul className="space-y-4 text-[#2d334a]">
              <li><Link href="#" className="hover:text-[#ffd803]">Paiements</Link></li>
              <li><Link href="#" className="hover:text-[#ffd803]">Transferts</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[#272343] mb-8 text-[18px]">Ressources</h5>
            <ul className="space-y-4 text-[#2d334a]">
              <li><Link href="#" className="hover:text-[#ffd803]">Tarifs</Link></li>
              <li><Link href="#" className="hover:text-[#ffd803]">Contactez-nous</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[#272343] mb-8 text-[18px]">Légal</h5>
            <ul className="space-y-4 text-[#2d334a]">
              <li><Link href="#" className="hover:text-[#ffd803]">Confidentialité</Link></li>
              <li><Link href="#" className="hover:text-[#ffd803]">Termes</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="container mx-auto px-6 pt-12 border-t border-[#dfe5f2]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[14px] text-[#2d334a]">
              Copyright © 2026 TontinePro
            </p>
            <div className="flex items-center gap-2 text-[14px] text-[#2d334a]">
              <span>Conçu par</span>
              <span className="font-bold">@pigeoncodeur</span>
            </div>
          </div>
         
        </div>
      </footer>
    </div>
  );
}

