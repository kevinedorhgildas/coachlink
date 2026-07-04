import Link from "next/link";
import { seDesabonner } from "../actions";

const GOLD = "#C9A96E";

export default async function DesabonnementPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  if (!searchParams.token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: "#FAF8F5" }}>
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-4xl mb-4">❌</p>
          <h1 className="text-lg font-bold text-gray-900">Lien invalide</h1>
          <p className="mt-2 text-sm text-gray-500">Ce lien de désabonnement est incorrect ou expiré.</p>
          <Link href="/" className="mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
            Retour à l'accueil
          </Link>
        </div>
      </main>
    );
  }

  const result = await seDesabonner(searchParams.token);

  return (
    <main className="flex min-h-screen items-center justify-center px-6" style={{ background: "#FAF8F5" }}>
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        {result.success ? (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: `${GOLD}22` }}>
              <span className="text-3xl">👋</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Vous êtes désabonné(e)</h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Vous ne recevrez plus nos newsletters. Vous pouvez vous réinscrire à tout moment depuis notre site.
            </p>
            <Link href="/" className="mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
              Retour à l'accueil
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Lien invalide</h1>
            <p className="mt-3 text-sm text-gray-500">{result.error}</p>
            <Link href="/" className="mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold transition hover:opacity-90" style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
              Retour à l'accueil
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
