import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-[#fffffe] pt-24 pb-12 border-t border-[#dfe5f2]">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
        <div className="lg:col-span-2">
          <div className="h-20 flex items-center mb-8">
             <span className="text-2xl font-bold tracking-tighter text-[#272343]">
              Tontine<span className="text-[#ffd803]">Pro</span>
            </span>
          </div>
          <p className="text-[#2d334a] text-[16px] leading-relaxed max-w-sm mb-8">
            Accéder à un large éventail de méthodes de paiement mobile en Afrique, avec une intégration unique.
          </p>
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
  );
};
