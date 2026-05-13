import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth-context";
import { NotificationProvider } from "@/lib/notification-context";
import { ToastProvider } from "@/lib/toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "TontinePro - Gérez vos tontines en toute sécurité",
  description: "La plateforme moderne de gestion de tontines en ligne.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={cn("h-full", "antialiased", poppins.variable, "font-sans")}
      suppressHydrationWarning
    >
      <body className={cn("min-h-full flex flex-col bg-background text-text-primary")}>
        <AuthProvider>
          <NotificationProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
