"use client";

import { useState } from "react";
import { requestReservation } from "./actions";

const GOLD = "#C9A96E";
const JOURS_FR = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];

type Disponibilite = { id: string; jour_semaine: string; heure_debut: string; heure_fin: string };
type Coach = { tarif_horaire: number | null; tarif_individuel?: number | null; tarif_groupe?: number | null; tarif_enligne?: number | null };

function prochainesOccurrences(jourSemaine: string, n = 4): string[] {
  const target = JOURS_FR.indexOf(jourSemaine);
  if (target === -1) return [];
  const dates: string[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  while (dates.length < n) {
    if (d.getDay() === target) dates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

const TYPES = [
  { key: "individuel", label: "Individuel", icon: "👤", desc: "Séance privée 1:1" },
  { key: "groupe",     label: "Groupe",     icon: "👥", desc: "Séance collective" },
  { key: "enligne",    label: "En ligne",   icon: "💻", desc: "Visio conférence" },
];

export default function ReservationForm({ coachId, disponibilites, coach }: { coachId: string; disponibilites: Disponibilite[]; coach: Coach }) {
  const [selectedDispo, setSelectedDispo] = useState<string | null>(null);
  const [selectedDate, setSelectedDate]   = useState<string | null>(null);
  const [selectedType, setSelectedType]   = useState<string>("individuel");
  const [message, setMessage]             = useState("");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [success, setSuccess]             = useState(false);

  if (disponibilites.length === 0) return null;

  const tarifMap: Record<string, number | null | undefined> = {
    individuel: coach.tarif_individuel ?? coach.tarif_horaire,
    groupe:     coach.tarif_groupe     ?? coach.tarif_horaire,
    enligne:    coach.tarif_enligne    ?? coach.tarif_horaire,
  };

  const dispoActive = disponibilites.find((d) => d.id === selectedDispo);
  const dates = selectedDispo ? prochainesOccurrences(dispoActive?.jour_semaine ?? "", 4) : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDispo || !selectedDate) { setError("Sélectionnez un créneau et une date."); return; }
    setLoading(true); setError(null);
    const fd = new FormData();
    fd.set("coachId", coachId);
    fd.set("disponibiliteId", selectedDispo);
    fd.set("date_souhaitee", selectedDate);
    fd.set("type_seance", selectedType);
    fd.set("message", message);
    const res = await requestReservation(fd);
    setLoading(false);
    if (res?.error) setError(res.error);
    else setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-2xl p-5 text-center" style={{ background: `${GOLD}11`, border: `1px solid ${GOLD}44` }}>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-2xl" style={{ background: `${GOLD}22` }}>✅</div>
        <p className="font-semibold text-gray-900">Demande envoyée !</p>
        <p className="mt-1 text-sm text-gray-500">Le coach vous répondra prochainement.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Étape 1 : Type de séance */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">1. Type de séance</p>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map((t) => {
            const tarif = tarifMap[t.key];
            const active = selectedType === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setSelectedType(t.key)}
                className="rounded-xl border p-3 text-left transition"
                style={active
                  ? { borderColor: GOLD, background: `${GOLD}11` }
                  : { borderColor: "#e5e7eb", background: "white" }}
              >
                <span className="block text-lg">{t.icon}</span>
                <span className="mt-1 block text-sm font-semibold text-gray-900">{t.label}</span>
                <span className="block text-xs text-gray-400">{t.desc}</span>
                {tarif != null && (
                  <span className="mt-1 block text-xs font-bold" style={{ color: "#9A7A2E" }}>{tarif} €/h</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Étape 2 : Créneau */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">2. Choisissez un créneau</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {disponibilites.map((d) => {
            const active = selectedDispo === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => { setSelectedDispo(d.id); setSelectedDate(null); }}
                className="rounded-xl border px-3 py-2.5 text-left transition"
                style={active
                  ? { borderColor: GOLD, background: `${GOLD}11` }
                  : { borderColor: "#e5e7eb", background: "white" }}
              >
                <p className="text-xs font-bold capitalize" style={{ color: active ? "#9A7A2E" : "#6b7280" }}>{d.jour_semaine}</p>
                <p className="text-sm font-semibold text-gray-900">{d.heure_debut.slice(0,5)} – {d.heure_fin.slice(0,5)}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Étape 3 : Date */}
      {selectedDispo && dates.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">3. Choisissez une date</p>
          <div className="flex flex-wrap gap-2">
            {dates.map((date) => {
              const active = selectedDate === date;
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className="rounded-full border px-4 py-1.5 text-sm font-medium transition"
                  style={active
                    ? { background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120", borderColor: "transparent" }
                    : { borderColor: "#e5e7eb", color: "#374151", background: "white" }}
                >
                  {formatDate(date)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Étape 4 : Message */}
      {selectedDate && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">4. Message (optionnel)</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Présentez vos objectifs, vos attentes..."
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A96E] transition"
          />
        </div>
      )}

      {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={!selectedDispo || !selectedDate || loading}
        className="w-full rounded-full py-3 text-sm font-bold shadow-sm transition hover:opacity-90 disabled:opacity-40"
        style={{ background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }}
      >
        {loading ? "Envoi en cours…" : "Demander cette réservation"}
      </button>
    </form>
  );
}
