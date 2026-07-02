export default function PaiementClientPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Méthodes de paiement</h1>
        <p className="mt-1 text-sm text-gray-500">Gérez vos moyens de paiement enregistrés.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">💳</div>
        <h2 className="mb-2 text-sm font-semibold text-gray-800">Paiement en ligne bientôt disponible</h2>
        <p className="mx-auto max-w-sm text-sm text-gray-500">
          Les modalités de paiement se règlent directement avec le coach pour l'instant.
        </p>
      </div>
    </div>
  );
}
