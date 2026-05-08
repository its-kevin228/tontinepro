import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md transition-all duration-300 border-b border-border/40">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <div className="flex items-center -ml-4">
          <Link href="/" className="transition-transform hover:scale-105">
            <Image 
              src="/images/logo/tontineprologo-removebg-preview.svg" 
              alt="TontinePro Logo" 
              width={200} 
              height={60} 
              className="h-12 md:h-14 w-auto object-contain"
              priority
            />
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-10 font-medium text-text-secondary">
          <Link href="#how-it-works" className="hover:text-text-primary transition-colors text-[16px]">Fonctionnement</Link>
          <Link href="#security" className="hover:text-text-primary transition-colors text-[16px]">Sécurité</Link>
          <Link href="#solutions" className="hover:text-text-primary transition-colors text-[16px]">Solutions</Link>
          <Link href="#help" className="hover:text-text-primary transition-colors text-[16px]">Aide</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="px-6 py-2 rounded-full font-semibold border border-transparent transition-all hover:bg-surface-alt active:scale-95 text-[16px]"
          >
            Connexion
          </Link>
          <Link 
            href="/register" 
            className="px-8 py-3 rounded-full bg-accent text-text-primary font-bold shadow-sm transition-all hover:bg-accent-hover hover:shadow-md active:scale-95 text-[16px]"
          >
            Démarrer
          </Link>
        </div>
      </div>
    </header>
  );
}
