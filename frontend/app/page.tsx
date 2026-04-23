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
      <header className="fixed top-0 w-full z-50 bg-[#fffffe]/80 backdrop-blur-md border-b border-[#dfe5f2] transition-all duration-300">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image 
                src="/images/logo/tontineprologo-removebg-preview.svg" 
                alt="TontinePro Logo" 
                width={180} 
                height={50} 
                className="h-14 w-auto object-contain"
                priority
              />
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-10 font-medium text-[#2d334a]">
            <Link href="#features" className="hover:text-[#272343] transition-colors text-[16px]">Produits</Link>
            <Link href="#pricing" className="hover:text-[#272343] transition-colors text-[16px]">Tarifs</Link>
            <Link href="#integrations" className="hover:text-[#272343] transition-colors text-[16px]">Intégrations</Link>
            <Link href="#contact" className="hover:text-[#272343] transition-colors text-[16px]">Contacts</Link>
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
              <span className="flex h-2 w-2 rounded-full bg-[#ffd803] animate-pulse" />
              Tontine 2.0 pour l'Afrique
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
              <div className="flex flex-wrap justify-center gap-10 md:gap-20 grayscale opacity-70 hover:grayscale-0 transition-all">
                <span className="text-2xl font-bold font-display italic">BleMama</span>
                <span className="text-2xl font-bold font-display italic">Zeyow</span>
                <span className="text-2xl font-bold font-display italic">Crilix</span>
                <span className="text-2xl font-bold font-display italic">ReventPro</span>
                <span className="text-2xl font-bold font-display italic">Tama</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section id="features" className="py-24 md:py-32 bg-[#e3f6f5]/20">
          <div className="container mx-auto px-6 text-center mb-16">
            <h2 className="font-display text-[32px] md:text-[48px] font-bold text-[#272343] mb-6">
              Tout ce qu'il vous faut pour développer votre cercle
            </h2>
            <div className="w-20 h-2 bg-[#ffd803] mx-auto rounded-full" />
          </div>
          
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#fffffe] p-10 rounded-[24px] border border-[#dfe5f2] shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
              <div className="w-16 h-16 rounded-[18px] bg-[#ffd803] flex items-center justify-center mb-8 shadow-sm group-hover:rotate-6 transition-transform">
                <Wallet className="w-8 h-8 text-[#272343]" />
              </div>
              <h3 className="font-display text-[23px] font-bold text-[#272343] mb-4">Cotisations</h3>
              <p className="text-[#2d334a] text-[16px] leading-[1.6]">
                Permettez à vos membres de vous payer partout en Afrique par plusieurs moyens de paiements locaux grâce à une seule intégration.
              </p>
            </div>

            <div className="bg-[#fffffe] p-10 rounded-[24px] border border-[#dfe5f2] shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
              <div className="w-16 h-16 rounded-[18px] bg-[#bae8e8] flex items-center justify-center mb-8 shadow-sm group-hover:rotate-6 transition-transform">
                <HandCoins className="w-8 h-8 text-[#272343]" />
              </div>
              <h3 className="font-display text-[23px] font-bold text-[#272343] mb-4">Gains</h3>
              <p className="text-[#2d334a] text-[16px] leading-[1.6]">
                Payez vos bénéficiaires partout en Afrique par plusieurs moyens de paiements locaux grâce à une seule intégration.
              </p>
            </div>

            <div className="bg-[#fffffe] p-10 rounded-[24px] border border-[#dfe5f2] shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
              <div className="w-16 h-16 rounded-[18px] bg-[#ffd803] flex items-center justify-center mb-8 shadow-sm group-hover:-rotate-6 transition-transform">
                <LayoutDashboard className="w-8 h-8 text-[#272343]" />
              </div>
              <h3 className="font-display text-[23px] font-bold text-[#272343] mb-4">Dashboard</h3>
              <p className="text-[#2d334a] text-[16px] leading-[1.6]">
                Offrez à vos membres une expérience de paiement fluide optimisée pour les conversions et le suivi.
              </p>
            </div>

            <div className="bg-[#fffffe] p-10 rounded-[24px] border border-[#dfe5f2] shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-2">
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

        {/* --- SECURITY SECTION --- */}
        <section className="py-24 md:py-32 bg-[#272343] text-[#fffffe]">
          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="font-display text-[48px] font-bold mb-10">Sécurité et vie privée intégrées</h2>
              
              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ffd803] flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-[#272343]" />
                  </div>
                  <div>
                    <h4 className="text-[23px] font-bold mb-3">Normes de sécurité élevées</h4>
                    <p className="text-[#a7a9be] text-[18px] leading-relaxed">
                      Fiabilité et sécurité garanties par le respect strict des normes de sécurité pour la protection de vos fonds.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ffd803] flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-[#272343]" />
                  </div>
                  <div>
                    <h4 className="text-[23px] font-bold mb-3">Protection des données</h4>
                    <p className="text-[#a7a9be] text-[18px] leading-relaxed">
                      La sécurité de vos données et celles de vos membres est notre priorité absolue.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ffd803] flex items-center justify-center">
                    <Globe className="w-6 h-6 text-[#272343]" />
                  </div>
                  <div>
                    <h4 className="text-[23px] font-bold mb-3">Couverture globale</h4>
                    <p className="text-[#a7a9be] text-[18px] leading-relaxed">
                      Étendez-vous à de nouveaux pays en quelques clics et offrez une expérience locale sécurisée.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#fffffe]/5 rounded-[40px] p-8 md:p-12 text-center border border-[#fffffe]/10">
               <div className="grid grid-cols-2 gap-8">
                  <div className="p-8">
                    <div className="text-[48px] font-bold text-[#ffd803] mb-2">+12</div>
                    <p className="text-[14px] text-[#a7a9be] uppercase">Pays</p>
                  </div>
                  <div className="p-8">
                    <div className="text-[48px] font-bold text-[#ffd803] mb-2">+60</div>
                    <p className="text-[14px] text-[#a7a9be] uppercase">Méthodes</p>
                  </div>
                  <div className="p-8">
                    <div className="text-[48px] font-bold text-[#ffd803] mb-2">+50</div>
                    <p className="text-[14px] text-[#a7a9be] uppercase">Devises</p>
                  </div>
                  <div className="p-8">
                    <div className="text-[48px] font-bold text-[#ffd803] mb-2">99.9%</div>
                    <p className="text-[14px] text-[#a7a9be] uppercase">Uptime</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- CTA SECTION --- */}
        <section className="py-24 md:py-32 bg-[#ffd803]">
           <div className="container mx-auto px-6 text-center">
             <h2 className="font-display text-[48px] font-bold text-[#272343] mb-8 max-w-3xl mx-auto">
               Prêt à développer votre cercle ?
             </h2>
             <p className="text-[23px] text-[#2d334a] mb-12 max-w-2xl mx-auto">
               Créez un compte gratuitement dès aujourd'hui et commencez à digitaliser vos tontines dans plus de 10 pays.
             </p>
             <Link 
              href="/register" 
              className="inline-flex h-20 px-12 rounded-full bg-[#272343] text-[#fffffe] font-bold text-[20px] items-center justify-center shadow-xl hover:bg-black transition-all"
             >
               Créer un compte gratuitement
             </Link>
           </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-[#fffffe] pt-24 pb-12 border-t border-[#dfe5f2]">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
          <div className="lg:col-span-2">
            <Link href="/">
              <Image 
                src="/images/logo/tontineprologo-removebg-preview.svg" 
                alt="TontinePro Logo" 
                width={200} 
                height={60} 
                className="h-16 w-auto object-contain mb-8"
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
              Copyright © 2026 TontinePro - Axazara LLC.
            </p>
            <div className="flex items-center gap-2 text-[14px] text-[#2d334a]">
              <span>Conçu par</span>
              <span className="font-bold">Axazara</span>
            </div>
          </div>
          <div className="mt-8 text-[11px] text-[#2d334a]/60 leading-relaxed text-center">
            TontinePro n’est pas un FSP (Fournisseur de Services de Paiement), ni un service d’acquisition. Notre service se limite strictement à faciliter les transactions via les API officiellement fournies par les partenaires.
          </div>
        </div>
      </footer>
    </div>
  );
}

