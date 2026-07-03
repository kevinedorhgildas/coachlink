import { seDesabonner } from "../actions";

export default async function DesabonnementPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  if (!searchParams.token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl mb-2">❌</p>
          <p className="text-gray-700 font-medium">Lien invalide.</p>
        </div>
      </main>
    );
  }

  const result = await seDesabonner(searchParams.token);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        {result.success ? (
          <>
            <p className="text-4xl mb-4">👋</p>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Vous êtes désabonné(e)</h1>
            <p className="text-sm text-gray-500">Vous ne recevrez plus nos newsletters. Vous pouvez vous réinscrire à tout moment depuis notre site.</p>
          </>
        ) : (
          <>
            <p className="text-4xl mb-4">⚠️</p>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Lien invalide</h1>
            <p className="text-sm text-gray-500">{result.error}</p>
          </>
        )}
      </div>
    </main>
  );
}
