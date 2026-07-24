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
        <footer className="mt-auto" style={{ background: "linear-gradient(180deg, #060C18 0%, #0B1120 100%)" }}>
          {/* Ligne dorée décorative */}
          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #C9A96E55, #C9A96E, #C9A96E55, transparent)" }} />

          <div className="mx-auto max-w-6xl px-6 py-16">
            {/* Grille principale */}
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">

              {/* Colonne marque */}
              <div className="lg:col-span-1">
                <Link href="/" className="inline-block text-2xl font-bold tracking-tight text-white">
                  Coach<span style={{ color: "#C9A96E" }}>Link</span>
                </Link>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "#ffffff55" }}>
                  La plateforme premium qui connecte les meilleurs coachs à leurs clients.
                </p>
                <div className="mt-6 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#C9A96E" }} />
                  <span className="h-1.5 w-8 rounded-full" style={{ background: "#C9A96E55" }} />
                  <span className="h-1.5 w-3 rounded-full" style={{ background: "#C9A96E33" }} />
                </div>
              </div>

              {/* Colonne plateforme */}
              <div>
                <p className="mb-5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#C9A96E" }}>Plateforme</p>
                <ul className="space-y-3">
                  {[
                    { href: "/coachs", label: "Trouver un coach" },
                    { href: "/tarifs", label: "Nos tarifs" },
                    { href: "/inscription", label: "Devenir coach" },
                    { href: "/connexion", label: "Se connecter" },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="text-sm transition-colors duration-150 hover:text-white" style={{ color: "#ffffff55" }}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Colonne légal */}
              <div>
                <p className="mb-5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#C9A96E" }}>Informations</p>
                <ul className="space-y-3">
                  {[
                    { href: "/faq", label: "FAQ" },
                    { href: "/support", label: "Service client" },
                    { href: "/cgu", label: "Conditions générales" },
                    { href: "/confidentialite", label: "Confidentialité" },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href} className="text-sm transition-colors duration-150 hover:text-white" style={{ color: "#ffffff55" }}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Colonne newsletter */}
              <div>
                <p className="mb-5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#C9A96E" }}>Newsletter</p>
                <p className="mb-4 text-sm leading-relaxed" style={{ color: "#ffffff55" }}>
                  Conseils exclusifs et nouveautés réservés à nos membres.
                </p>
                <NewsletterForm compact />
              </div>
            </div>

            {/* Séparateur */}
            <div className="my-12 h-px" style={{ background: "#ffffff0f" }} />

            {/* Barre de bas */}
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-xs" style={{ color: "#ffffff30" }}>
                © {new Date().getFullYear()} CoachLink — Tous droits réservés
              </p>
              <a
                href="mailto:contact@coachlink.fr"
                className="text-xs transition-colors hover:text-white"
                style={{ color: "#ffffff40" }}
              >
                contact@coachlink.fr
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
