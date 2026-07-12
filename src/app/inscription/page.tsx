import Link from "next/link";
import InscriptionForm from "./InscriptionForm";
import Logo from "@/components/Logo";

export default function InscriptionPage() {
  return (
    <main className="flex min-h-screen">

      {/* ── Panneau gauche (déco) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: "linear-gradient(135deg, #060C18 0%, #0B1120 60%, #111827 100%)" }}>
        <div className="pointer-events-none absolute left-0 top-1/3 h-96 w-96 -translate-y-1/2 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #C9A96E 0%, transparent 70%)" }} />

        <Link href="/"><Logo size="md" theme="dark" /></Link>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: "#C9A96E" }}>
            ✦ Rejoignez-nous
          </p>
          <h2 className="text-4xl font-bold leading-tight text-white">
            Votre transformation<br />commence ici.
          </h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: "#ffffff60" }}>
            Créez votre compte et accédez aux meilleurs coachs dans tous les domaines.
          </p>
          <div className="mt-8 space-y-3">
            {["Coachs vérifiés et experts", "Réservation en quelques clics", "Paiement sécurisé"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "#C9A96E22", color: "#C9A96E" }}>
                  <span className="text-xs">✓</span>
                </div>
                <p className="text-sm" style={{ color: "#ffffff80" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "#ffffff30" }}>© {new Date().getFullYear()} CoachLink</p>
      </div>

      {/* ── Panneau droit (formulaire) ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12" style={{ background: "#FAF8F5" }}>
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <Link href="/" className="mb-8 flex justify-center lg:hidden"><Logo size="sm" theme="light" /></Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
            <p className="mt-1 text-sm text-gray-500">Rejoignez CoachLink en tant que coach ou client.</p>
          </div>

          <InscriptionForm />

          <p className="mt-6 text-center text-sm text-gray-500">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="font-semibold hover:underline" style={{ color: "#C9A96E" }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>

    </main>
  );
}
