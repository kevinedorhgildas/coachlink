import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
      </body>
    </html>
  );
}
