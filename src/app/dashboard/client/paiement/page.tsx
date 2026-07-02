export default function PaiementClientPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Méthodes de paiement</h1>
        <p className="mt-1 text-sm text-gray-500">Gérez vos moyens de paiement enregistrés.</p>
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
          💳
        </div>
        <h2 className="mb-2 text-base font-semibold text-gray-800">Paiement en ligne bientôt disponible</h2>
        <p className="mx-auto max-w-sm text-sm text-gray-500">
          La gestion des méthodes de paiement sera disponible prochainement. Pour l'instant, les modalités de paiement se règlent directement avec le coach.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
        <h3 className="mb-1 text-sm font-semibold text-blue-800">Comment payer actuellement ?</h3>
        <p className="text-sm text-blue-700">
          Après confirmation d'une réservation par votre coach, contactez-le directement pour convenir des modalités de paiement (virement, espèces, chèque, etc.).
        </p>
      </div>
    </div>
  );
}
