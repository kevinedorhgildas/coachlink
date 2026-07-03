const cardStyle = { background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)" };

export default function PaiementClientPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Méthodes de paiement</h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Gérez vos moyens de paiement enregistrés.</p>
      </div>

      <div className="rounded-2xl p-10 text-center shadow-sm" style={cardStyle}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl" style={{ background: "linear-gradient(135deg, #667eea22, #764ba222)" }}>💳</div>
        <h2 className="mb-2 text-base font-semibold text-gray-800">Paiement en ligne bientôt disponible</h2>
        <p className="mx-auto max-w-sm text-sm text-gray-500">
          Les modalités de paiement se règlent directement avec le coach pour l'instant.
        </p>
      </div>
    </div>
  );
}
