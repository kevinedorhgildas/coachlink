import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const DOMAINES = [
  { label: "Coach sportif", icon: "🏋️" },
  { label: "Coach mental", icon: "🧠" },
  { label: "Coach en développement personnel", icon: "🌱" },
  { label: "Coach en finance", icon: "💰" },
  { label: "Coach en développement business", icon: "🚀" },
  { label: "Coach marketing", icon: "📣" },
  { label: "Coach en bien être et santé", icon: "🧘" },
  { label: "Coach en séduction", icon: "💫" },
  { label: "Coach en langue", icon: "🌍" },
];

export default async function Home() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("coaches")
    .select("id", { count: "exact", head: true });

  return (
    <main className="flex min-h-screen flex-col">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-32 text-center"
        style={{ background: "linear-gradient(135deg, #060C18 0%, #0B1120 50%, #111827 100%)" }}
      >
        {/* Glow orbs */}
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #C9A96E 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-64 w-64 translate-x-1/2 translate-y-1/2 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #C9A96E 0%, transparent 70%)" }} />

        {/* Nav */}
        <nav className="absolute left-0 right-0 top-0 flex items-center justify-between px-8 py-5">
          <span className="text-xl font-bold tracking-tight text-white">Coach<span style={{ color: "#C9A96E" }}>Link</span></span>
          <div className="flex items-center gap-4">
            <Link href="/coachs" className="text-sm font-medium text-white/70 hover:text-white transition">Nos coachs</Link>
            <Link href="/connexion" className="text-sm font-medium text-white/70 hover:text-white transition">Se connecter</Link>
            <Link href="/inscription" className="rounded-full px-5 py-2 text-sm font-semibold text-navy-900 transition hover:opacity-90" style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)" }}>
              Commencer
            </Link>
          </div>
        </nav>

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium" style={{ borderColor: "#C9A96E44", background: "#C9A96E11", color: "#C9A96E" }}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Plateforme de coaching d'excellence
        </div>

        {/* Heading */}
        <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
          Trouvez le coach{" "}
          <span style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            qui vous élève
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-white/60 leading-relaxed">
          Connectez-vous avec les meilleurs coachs dans tous les domaines — sport, business, bien-être et bien plus encore.
        </p>

        {count !== null && count > 0 && (
          <p className="mt-3 text-sm font-medium" style={{ color: "#C9A96E" }}>
            ✦ {count} coach{count > 1 ? "s" : ""} d'exception disponible{count > 1 ? "s" : ""}
          </p>
        )}

        {/* CTA */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/inscription"
            className="rounded-full px-8 py-3.5 text-base font-semibold text-navy-900 shadow-lg transition hover:opacity-90 hover:shadow-xl"
            style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)" }}
          >
            Je cherche un coach
          </Link>
          <Link
            href="/inscription"
            className="rounded-full border px-8 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
            style={{ borderColor: "#C9A96E66" }}
          >
            Je suis coach →
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 border-t pt-10" style={{ borderColor: "#ffffff14" }}>
          {[
            { value: "100%", label: "Satisfaction client" },
            { value: "9", label: "Domaines d'expertise" },
            { value: "24h", label: "Réponse garantie" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="mt-0.5 text-sm text-white/40">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOMAINES ──────────────────────────────────────── */}
      <section className="bg-cream px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: "#C9A96E" }}>Nos expertises</p>
            <h2 className="text-3xl font-bold text-navy-900 sm:text-4xl">Tous les domaines de coaching</h2>
            <p className="mt-3 text-gray-500">Choisissez votre domaine et découvrez les experts qui vous correspondent.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {DOMAINES.map(({ label, icon }) => (
              <Link
                key={label}
                href={`/coachs?domaine=${encodeURIComponent(label)}`}
                className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-transparent hover:shadow-lg"
                style={{ ["--tw-shadow-color" as string]: "#C9A96E22" }}
              >
                <span className="text-2xl transition-transform duration-200 group-hover:scale-110">{icon}</span>
                <span className="leading-snug">{label}</span>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/coachs" className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-400 hover:shadow">
              Voir tous nos coachs →
            </Link>
          </div>
        </div>
      </section>

      {/* ── POURQUOI COACHLINK ─────────────────────────────── */}
      <section className="px-6 py-20" style={{ background: "#0B1120" }}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: "#C9A96E" }}>Pourquoi nous</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">L'excellence à chaque étape</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: "🎯", title: "Coachs vérifiés", desc: "Chaque coach est sélectionné pour son expertise et son sérieux." },
              { icon: "⚡", title: "Réservation simple", desc: "Trouvez un créneau et réservez en quelques clics, sans friction." },
              { icon: "🔒", title: "Paiement sécurisé", desc: "Transactions 100% sécurisées, remboursement garanti si insatisfait." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-6" style={{ background: "#ffffff08", border: "1px solid #ffffff0f" }}>
                <div className="mb-4 text-3xl">{icon}</div>
                <h3 className="mb-2 font-bold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────── */}
      <section className="bg-cream px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-navy-900 sm:text-4xl">Prêt à transformer votre vie ?</h2>
          <p className="mt-4 text-gray-500">Rejoignez des centaines de personnes qui ont déjà franchi le cap.</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/inscription"
              className="rounded-full px-8 py-3.5 text-base font-semibold text-navy-900 shadow-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)" }}
            >
              Commencer maintenant
            </Link>
            <Link href="/connexion" className="text-sm font-medium text-gray-500 hover:text-gray-800 transition">
              Déjà inscrit ? Se connecter →
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
