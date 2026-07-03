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
    <main className="flex min-h-screen flex-col items-center bg-gray-50 px-4">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">CoachLink</h1>
        <p className="mt-4 max-w-xl text-lg text-gray-600">
          La plateforme qui met en relation coachs et clients,<br />
          tous domaines confondus.
        </p>
        {count !== null && count > 0 && (
          <p className="mt-2 text-sm text-blue-600 font-medium">{count} coach{count > 1 ? "s" : ""} disponible{count > 1 ? "s" : ""}</p>
        )}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link href="/inscription" className="rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700">
            Je suis coach
          </Link>
          <Link href="/inscription" className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-900 transition hover:border-gray-400">
            Je cherche un coach
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="font-medium text-blue-600 hover:underline">Se connecter</Link>
        </p>
      </section>

      {/* Domaines */}
      <section className="w-full max-w-3xl pb-16">
        <h2 className="mb-6 text-center text-xl font-bold text-gray-900">Nos domaines de coaching</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {DOMAINES.map(({ label, icon }) => (
            <Link
              key={label}
              href={`/connexion`}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 hover:shadow-md"
            >
              <span className="text-2xl">{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </section>

      <p className="pb-8 flex gap-4 text-sm text-gray-400">
        <Link href="/faq" className="hover:underline">Foire aux questions</Link>
        <Link href="/support" className="hover:underline">Service client</Link>
      </p>
    </main>
  );
}
