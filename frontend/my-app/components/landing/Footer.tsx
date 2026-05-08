import Image from "next/image";
import Link from "next/link";
import { Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background pt-24 pb-12 border-t border-border">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
        <div className="lg:col-span-2">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <Image 
              src="/images/logo/tontineprologo-removebg-preview.svg" 
              alt="TontinePro Logo" 
              width={200} 
              height={60} 
              className="h-16 w-auto object-contain mb-8"
            />
          </Link>
          <p className="text-text-secondary text-sm leading-relaxed max-w-sm mb-8">
            Accéder à un large éventail de méthodes de paiement mobile en Afrique, avec une intégration unique.
          </p>
          <div className="flex gap-4 items-center">
            <Globe className="text-text-primary w-5 h-5" />
            <span className="text-text-primary font-medium text-sm">Français</span>
          </div>
        </div>
        
        <div>
          <h5 className="font-bold text-text-primary mb-6 text-base">Produits</h5>
          <ul className="space-y-3 text-text-secondary text-sm">
            <li><Link href="#" className="hover:text-accent transition-colors">Paiements</Link></li>
            <li><Link href="#" className="hover:text-accent transition-colors">Transferts</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-text-primary mb-6 text-base">Ressources</h5>
          <ul className="space-y-3 text-text-secondary text-sm">
            <li><Link href="#" className="hover:text-accent transition-colors">Tarifs</Link></li>
            <li><Link href="#" className="hover:text-accent transition-colors">Contactez-nous</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-text-primary mb-6 text-base">Légal</h5>
          <ul className="space-y-3 text-text-secondary text-sm">
            <li><Link href="#" className="hover:text-accent transition-colors">Confidentialité</Link></li>
            <li><Link href="#" className="hover:text-accent transition-colors">Termes</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-6 pt-8 border-t border-border/50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-secondary">
            Copyright © 2026 TontinePro
          </p>
          <div className="text-xs text-text-secondary">
            Conçu par <span className="font-bold text-text-primary">@pigeoncodeur</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
