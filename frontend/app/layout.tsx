import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TontinePro — Gérez votre tontine en ligne",
  description:
    "Plateforme digitale de gestion de tontines pour l'Afrique. Créez, gérez et suivez vos cercles d'épargne collective en toute transparence.",
  keywords: ["tontine", "épargne", "Afrique", "njangi", "likelembé", "susu", "cotisation"],
  openGraph: {
    title: "TontinePro",
    description: "La tontine digitale, transparente et fiable.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
