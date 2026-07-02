import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoachLink",
  description: "Mise en relation entre coachs et clients, tous domaines confondus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div className="flex justify-end px-4 py-2 border-b border-gray-100 bg-white">
          <LanguageSwitcher />
        </div>
        {children}
        <footer className="mt-auto border-t border-gray-100 bg-white px-4 py-6">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-400">
            <span>© {new Date().getFullYear()} CoachLink</span>
            <Link href="/cgu" className="hover:underline">CGU</Link>
            <Link href="/confidentialite" className="hover:underline">Confidentialité</Link>
            <Link href="/faq" className="hover:underline">FAQ</Link>
            <Link href="/support" className="hover:underline">Service client</Link>
            <a href="mailto:contact@coachlink.fr" className="hover:underline">contact@coachlink.fr</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
