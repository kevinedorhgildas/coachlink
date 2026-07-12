import Link from "next/link";
import ConnexionForm from "./ConnexionForm";

export default function ConnexionPage() {
  return (
    <main className="flex min-h-screen">

      {/* ── Panneau gauche (déco) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: "linear-gradient(135deg, #060C18 0%, #0B1120 60%, #111827 100%)" }}>
        {/* Glow */}
        <div className="pointer-events-none absolute left-0 top-1/3 h-96 w-96 -translate-y-1/2 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #C9A96E 0%, transparent 70%)" }} />

        <Link href="/" className="text-2xl font-bold tracking-tight text-white">
          Coach<span style={{ color: "#C9A96E" }}>Link</span>
        </Link>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest" style={{ color: "#C9A96E" }}>
            ✦ Bienvenue
          </p>
          <h2 className="text-4xl font-bold leading-tight text-white">
            Reprenez là<br />où vous en étiez.
          </h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: "#ffffff60" }}>
            Connectez-vous pour accéder à votre espace et continuer votre progression.
          </p>
        </div>

        <p className="text-xs" style={{ color: "#ffffff30" }}>© {new Date().getFullYear()} CoachLink</p>
      </div>

      {/* ── Panneau droit (formulaire) ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12" style={{ background: "#FAF8F5" }}>
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <Link href="/" className="mb-8 block text-center text-xl font-bold tracking-tight text-gray-900 lg:hidden">
            Coach<span style={{ color: "#C9A96E" }}>Link</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
            <p className="mt-1 text-sm text-gray-500">Connectez-vous à votre compte CoachLink.</p>
          </div>

          <ConnexionForm />

          <p className="mt-6 text-center text-sm text-gray-500">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="font-semibold hover:underline" style={{ color: "#C9A96E" }}>
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>

    </main>
  );
}
