import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import NewsletterForm from "@/components/NewsletterForm";
import AuthRecoveryRedirect from "@/components/AuthRecoveryRedirect";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CoachLink — Coaching d'excellence",
  description: "La plateforme premium qui met en relation les meilleurs coachs et leurs clients.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream">
        <AuthRecoveryRedirect />
        {children}
        {/* Footer */}
        <footer className="mt-auto bg-navy-900 text-white">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <div className="mb-8 flex flex-col items-center gap-2 text-center">
              <span className="text-2xl font-bold tracking-tight text-white">Coach<span className="text-gold-500">Link</span></span>
              <p className="text-sm text-white/50">La plateforme premium de coaching.</p>
            </div>
            <NewsletterForm />
            <div className="mt-10 border-t border-white/10 pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/40">
              <span>© {new Date().getFullYear()} CoachLink</span>
              <Link href="/cgu" className="hover:text-gold-500 transition">CGU</Link>
              <Link href="/confidentialite" className="hover:text-gold-500 transition">Confidentialité</Link>
              <Link href="/faq" className="hover:text-gold-500 transition">FAQ</Link>
              <Link href="/support" className="hover:text-gold-500 transition">Service client</Link>
              <a href="mailto:contact@coachlink.fr" className="hover:text-gold-500 transition">contact@coachlink.fr</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
