export default function PaiementCoachPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Méthodes de paiement</h1>
        <p className="mt-1 text-sm text-gray-500">Gérez vos coordonnées bancaires pour recevoir vos paiements.</p>
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-2xl">
          💳
        </div>
        <h2 className="mb-2 text-base font-semibold text-gray-800">Paiement en ligne bientôt disponible</h2>
        <p className="mx-auto max-w-sm text-sm text-gray-500">
          La gestion des virements et méthodes de paiement sera disponible prochainement. Pour l'instant, les modalités se règlent directement avec vos clients.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-teal-100 bg-teal-50 px-5 py-4">
        <h3 className="mb-1 text-sm font-semibold text-teal-800">En attendant</h3>
        <p className="text-sm text-teal-700">
          Communiquez vos coordonnées bancaires (RIB, PayPal, Lydia…) directement à vos clients après confirmation d'une réservation.
        </p>
      </div>
    </div>
  );
}
