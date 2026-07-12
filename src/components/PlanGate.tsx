import Link from "next/link";

const GOLD = "#C9A96E";

export default function PlanGate({ feature, plan }: { feature: string; plan: string }) {
  const PLAN_LABELS: Record<string, string> = {
    starter: "Starter (17€/mois)",
    pro: "Pro (47€/mois)",
    elite: "Elite (97€/mois)",
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center px-8">
      <div className="mb-4 text-5xl">🔒</div>
      <h2 className="text-lg font-bold text-gray-900">Fonctionnalité verrouillée</h2>
      <p className="mt-2 text-sm text-gray-500">
        <span className="font-semibold">{feature}</span> est disponible à partir du plan{" "}
        <span style={{ color: GOLD }} className="font-semibold">{PLAN_LABELS[plan] ?? plan}</span>.
      </p>
      <Link href="/tarifs"
        className="mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold transition hover:opacity-90"
        style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}>
        Voir les formules
      </Link>
    </div>
  );
}
