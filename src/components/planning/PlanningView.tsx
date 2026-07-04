"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export type Evenement = {
  id: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  titre: string;
  statut: string;
  coachId?: string;
};

type Vue = "jour" | "semaine" | "mois" | "annee";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS_NOMS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function parseDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function startOfWeek(d: Date) {
  const r = new Date(d);
  const day = r.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  r.setDate(r.getDate() + diff);
  return r;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function statutStyle(statut: string): React.CSSProperties {
  if (statut === "confirmee") return { background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" };
  if (statut === "refusee")   return { background: "#fef2f2", color: "#991b1b", borderColor: "#fecaca" };
  return { background: "#fffbeb", color: "#92400e", borderColor: "#fde68a" };
}

function statutLabel(statut: string) {
  if (statut === "confirmee") return "Confirmée";
  if (statut === "refusee") return "Refusée";
  return "En attente";
}

export default function PlanningView({
  evenements,
  baseUrl,
}: {
  evenements: Evenement[];
  baseUrl: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const vue = (params.get("vue") ?? "mois") as Vue;
  const dateParam = params.get("date") ?? fmt(new Date());
  const dateRef = parseDate(dateParam);

  const navigate = (newVue: Vue, newDate: string) => {
    router.push(`${baseUrl}?vue=${newVue}&date=${newDate}`);
  };

  const evtDu = (dateStr: string) =>
    evenements.filter((e) => e.date === dateStr);

  // ── NAVIGATION ──────────────────────────────────────────────
  const navPrev = () => {
    if (vue === "jour") navigate("jour", fmt(addDays(dateRef, -1)));
    else if (vue === "semaine") navigate("semaine", fmt(addDays(startOfWeek(dateRef), -7)));
    else if (vue === "mois") {
      const d = new Date(dateRef.getFullYear(), dateRef.getMonth() - 1, 1);
      navigate("mois", fmt(d));
    } else navigate("annee", fmt(new Date(dateRef.getFullYear() - 1, 0, 1)));
  };

  const navNext = () => {
    if (vue === "jour") navigate("jour", fmt(addDays(dateRef, 1)));
    else if (vue === "semaine") navigate("semaine", fmt(addDays(startOfWeek(dateRef), 7)));
    else if (vue === "mois") {
      const d = new Date(dateRef.getFullYear(), dateRef.getMonth() + 1, 1);
      navigate("mois", fmt(d));
    } else navigate("annee", fmt(new Date(dateRef.getFullYear() + 1, 0, 1)));
  };

  const navLabel = () => {
    if (vue === "jour") return dateRef.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    if (vue === "semaine") {
      const lun = startOfWeek(dateRef);
      const dim = addDays(lun, 6);
      return `${lun.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} – ${dim.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
    }
    if (vue === "mois") return `${MOIS_NOMS[dateRef.getMonth()]} ${dateRef.getFullYear()}`;
    return String(dateRef.getFullYear());
  };

  // ── VUE JOUR ────────────────────────────────────────────────
  const VueJour = () => {
    const evts = evtDu(fmt(dateRef));
    return (
      <div className="mt-4">
        {evts.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune réservation ce jour.</p>
        ) : (
          <div className="space-y-3">
            {evts.map((e) => (
              <div key={e.id} className="rounded-lg border p-4" style={statutStyle(e.statut)}>
                <p className="font-medium">{e.titre}</p>
                <p className="text-sm">{e.heureDebut} – {e.heureFin} · <span className="font-medium">{statutLabel(e.statut)}</span></p>
                {e.coachId && (
                  <Link href={`/coachs/${e.coachId}`} className="mt-2 inline-block rounded-lg border border-current/30 bg-white/50 px-3 py-1 text-xs font-medium hover:bg-white/80 transition">
                    Voir le profil →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── VUE SEMAINE ─────────────────────────────────────────────
  const VueSemaine = () => {
    const lun = startOfWeek(dateRef);
    const jours = Array.from({ length: 7 }, (_, i) => addDays(lun, i));
    return (
      <div className="mt-4 grid grid-cols-7 gap-2">
        {jours.map((jour, i) => {
          const dateStr = fmt(jour);
          const evts = evtDu(dateStr);
          const isToday = dateStr === fmt(new Date());
          return (
            <div key={i} className="min-h-24">
              <div className="mb-1 rounded-lg px-1 py-0.5 text-center text-xs font-medium" style={isToday ? { background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#0B1120" } : { color: "#6b7280" }}>
                <p>{JOURS[i]}</p>
                <p className="text-base font-bold">{jour.getDate()}</p>
              </div>
              <div className="space-y-1">
                {evts.map((e) => (
                  <div key={e.id} className="rounded border px-1 py-0.5 text-xs" style={statutStyle(e.statut)}>
                    <p className="truncate font-medium">{e.heureDebut}</p>
                    <p className="truncate">{e.titre}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── VUE MOIS ────────────────────────────────────────────────
  const VueMois = () => {
    const premier = startOfMonth(dateRef);
    const jourDepart = premier.getDay() === 0 ? 6 : premier.getDay() - 1;
    const nbJours = new Date(dateRef.getFullYear(), dateRef.getMonth() + 1, 0).getDate();
    const cases = Array.from({ length: jourDepart + nbJours }, (_, i) =>
      i < jourDepart ? null : new Date(dateRef.getFullYear(), dateRef.getMonth(), i - jourDepart + 1)
    );
    // Pad to full rows
    while (cases.length % 7 !== 0) cases.push(null);
    const today = fmt(new Date());

    return (
      <div className="mt-4">
        <div className="mb-1 grid grid-cols-7 gap-1">
          {JOURS.map((j) => (
            <div key={j} className="py-1 text-center text-xs font-medium text-gray-400">{j}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cases.map((jour, i) => {
            if (!jour) return <div key={i} className="min-h-16 rounded-lg bg-gray-50" />;
            const dateStr = fmt(jour);
            const evts = evtDu(dateStr);
            const isToday = dateStr === today;
            return (
              <button
                key={i}
                onClick={() => navigate("jour", dateStr)}
                className="min-h-16 rounded-xl border p-1 text-left transition hover:shadow-sm"
                style={isToday ? { borderColor: "#C9A96E", background: "#C9A96E11" } : { borderColor: "#f3f4f6", background: "white" }}
              >
                <p className="text-xs font-semibold" style={isToday ? { color: "#C9A96E" } : { color: "#374151" }}>{jour.getDate()}</p>
                <div className="mt-0.5 space-y-0.5">
                  {evts.slice(0, 2).map((e) => (
                    <div key={e.id} className="truncate rounded px-1 text-xs" style={statutStyle(e.statut)}>
                      {e.heureDebut} {e.titre}
                    </div>
                  ))}
                  {evts.length > 2 && <p className="text-xs text-gray-400">+{evts.length - 2}</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ── VUE ANNEE ────────────────────────────────────────────────
  const VueAnnee = () => {
    return (
      <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4">
        {MOIS_NOMS.map((nomMois, moisIdx) => {
          const nbEvts = evenements.filter((e) => {
            const d = parseDate(e.date);
            return d.getFullYear() === dateRef.getFullYear() && d.getMonth() === moisIdx;
          }).length;
          const premier = new Date(dateRef.getFullYear(), moisIdx, 1);
          return (
            <button
              key={moisIdx}
              onClick={() => navigate("mois", fmt(premier))}
              className="rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:shadow-md hover:border-transparent"
            >
              <p className="text-sm font-semibold text-gray-800">{nomMois}</p>
              {nbEvts > 0 ? (
                <p className="mt-1 text-xs font-semibold" style={{ color: "#C9A96E" }}>{nbEvts} réservation{nbEvts > 1 ? "s" : ""}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-300">Aucune</p>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {/* Onglets */}
      <div className="mb-4 flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
        {(["jour", "semaine", "mois", "annee"] as Vue[]).map((v) => (
          <button
            key={v}
            onClick={() => navigate(v, dateParam)}
            className="flex-1 rounded-lg py-1.5 text-sm font-medium capitalize transition"
            style={vue === v ? { background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#0B1120", boxShadow: "0 1px 4px #C9A96E44" } : { color: "#6b7280" }}
          >
            {v === "annee" ? "Année" : v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={navPrev} className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm hover:border-gray-300 transition">← Préc.</button>
        <p className="text-sm font-semibold text-gray-800 capitalize">{navLabel()}</p>
        <button onClick={navNext} className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm hover:border-gray-300 transition">Suiv. →</button>
      </div>

      {vue === "jour" && <VueJour />}
      {vue === "semaine" && <VueSemaine />}
      {vue === "mois" && <VueMois />}
      {vue === "annee" && <VueAnnee />}
    </div>
  );
}
