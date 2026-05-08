import Link from "next/link";
import Image from "next/image";

export const Header = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#fffffe]/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto flex h-24 md:h-32 items-center justify-between px-6">
        <div className="flex items-center -ml-4">
          <Link href="/" className="transition-transform hover:scale-105">
            <div className="h-24 md:h-32 flex items-center px-4 gap-4">
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <Image 
                  src="/images/logo/logotontine.svg" 
                  alt="TontinePro Logo" 
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-3xl md:text-4xl font-bold tracking-tighter text-[#272343]">
                Tontine<span className="text-[#ffd803]">Pro</span>
              </span>
            </div>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-10 font-medium text-[#2d334a]">
          <Link href="#how-it-works" className="hover:text-[#272343] transition-colors text-[16px]">Fonctionnement</Link>
          <Link href="#security" className="hover:text-[#272343] transition-colors text-[16px]">Sécurité</Link>
          <Link href="#solutions" className="hover:text-[#272343] transition-colors text-[16px]">Solutions</Link>
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
  );
};
