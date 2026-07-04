const GOLD = "#C9A96E";

export default function PaiementCoachPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Méthodes de paiement</h1>
        <p className="mt-1 text-sm text-gray-500">Gérez vos coordonnées bancaires pour recevoir vos paiements.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ background: `${GOLD}22` }}>
          💳
        </div>
        <h2 className="mb-2 text-base font-semibold text-gray-900">Paiement en ligne bientôt disponible</h2>
        <p className="mx-auto max-w-sm text-sm text-gray-500">
          La gestion des virements et méthodes de paiement sera disponible prochainement.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border p-5" style={{ borderColor: `${GOLD}44`, background: `${GOLD}0a` }}>
        <h3 className="mb-1 text-sm font-semibold" style={{ color: "#9A7A2E" }}>En attendant</h3>
        <p className="text-sm" style={{ color: "#9A7A2E99" }}>
          Communiquez vos coordonnées bancaires (RIB, PayPal, Lydia…) directement à vos clients après confirmation d'une réservation.
        </p>
      </div>
    </div>
  );
}
