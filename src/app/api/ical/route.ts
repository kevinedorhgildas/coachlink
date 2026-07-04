import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function pad(n: number) { return String(n).padStart(2, "0"); }
function toIcalDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
}
function toIcalDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00Z`;
}
function uid(id: string) { return `${id}@coachlink.fr`; }

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).single();
  const isCoach = profile?.role === "coach";

  const query = supabase
    .from("reservations")
    .select("id, date_souhaitee, statut, lien_visio, type_seance, disponibilites(heure_debut, heure_fin), coaches(id, profiles(nom)), profiles!reservations_client_id_fkey(nom)")
    .eq("statut", "confirmee");

  const { data: reservations } = isCoach
    ? await query.eq("coach_id", userData.user.id)
    : await query.eq("client_id", userData.user.id);

  const now = toIcalDateTime(new Date().toISOString());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CoachLink//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:CoachLink – Mes séances",
    "X-WR-TIMEZONE:Europe/Paris",
  ];

  for (const r of reservations ?? []) {
    const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { heure_debut: string; heure_fin: string } | null;
    const coachData = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches as { id: string; profiles: { nom: string } | { nom: string }[] | null } | null;
    const coachProfile = Array.isArray(coachData?.profiles) ? coachData?.profiles[0] : coachData?.profiles as { nom: string } | null;
    const clientProfile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles as { nom: string } | null;

    const dateStr = toIcalDate(r.date_souhaitee);
    const heureDebut = dispo?.heure_debut?.slice(0, 5).replace(":", "") ?? "0900";
    const heureFin   = dispo?.heure_fin?.slice(0, 5).replace(":", "") ?? "1000";
    const dtStart = `${dateStr}T${heureDebut}00`;
    const dtEnd   = `${dateStr}T${heureFin}00`;
    const summary = isCoach
      ? `Séance avec ${clientProfile?.nom ?? "Client"}`
      : `Séance avec ${coachProfile?.nom ?? "Coach"}`;
    const desc = r.lien_visio ? `Lien visio : ${r.lien_visio}` : "";

    const event = [
      "BEGIN:VEVENT",
      `UID:${uid(r.id)}`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=Europe/Paris:${dtStart}`,
      `DTEND;TZID=Europe/Paris:${dtEnd}`,
      `SUMMARY:${summary}`,
      desc ? `DESCRIPTION:${desc}` : "",
      r.lien_visio ? `URL:${r.lien_visio}` : "",
      "END:VEVENT",
    ].filter(Boolean);
    lines.push(...event);
  }

  lines.push("END:VCALENDAR");

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="coachlink-seances.ics"`,
    },
  });
}
