import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">CoachLink</h1>
      <p className="mt-4 max-w-xl text-lg text-gray-600">
        La plateforme qui met en relation coachs et clients,
        tous domaines confondus.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/inscription"
          className="rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700"
        >
          Je suis coach
        </Link>
        <Link
          href="/inscription"
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-900 transition hover:border-gray-400"
        >
          Je cherche un coach
        </Link>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="font-medium text-blue-600 hover:underline">
          Se connecter
        </Link>
      </p>

      <p className="mt-4 text-sm text-gray-400">
        <Link href="/faq" className="hover:underline">
          Foire aux questions
        </Link>
      </p>
    </main>
  );
}
