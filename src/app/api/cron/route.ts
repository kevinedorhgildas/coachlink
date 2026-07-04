import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data: reservations } = await supabase
    .from("reservations")
    .select("id, date_souhaitee, lien_visio, disponibilites(heure_debut, heure_fin), coaches(id, profiles(nom, email)), profiles!reservations_client_id_fkey(nom, email)")
    .eq("statut", "confirmee")
    .eq("date_souhaitee", tomorrowStr);

  let sent = 0;
  for (const r of reservations ?? []) {
    const dispo = Array.isArray(r.disponibilites) ? r.disponibilites[0] : r.disponibilites as { heure_debut: string; heure_fin: string } | null;
    const coachData = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches as { profiles: { nom: string; email: string } | { nom: string; email: string }[] | null } | null;
    const coachProfile = Array.isArray(coachData?.profiles) ? coachData?.profiles[0] : coachData?.profiles as { nom: string; email: string } | null;
    const clientProfile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles as { nom: string; email: string } | null;

    const date = new Date(r.date_souhaitee).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    const heure = dispo ? `${dispo.heure_debut.slice(0,5)} – ${dispo.heure_fin.slice(0,5)}` : "";
    const visioLine = r.lien_visio ? `\n\nLien visioconférence : ${r.lien_visio}` : "";

    const promises = [];

    if (clientProfile?.email) {
      promises.push(resend.emails.send({
        from: "CoachLink <onboarding@resend.dev>",
        to: clientProfile.email,
        subject: `Rappel : votre séance demain avec ${coachProfile?.nom ?? "votre coach"}`,
        text: `Bonjour ${clientProfile.nom},\n\nRappel : vous avez une séance demain ${date} de ${heure} avec ${coachProfile?.nom ?? "votre coach"}.${visioLine}\n\nÀ bientôt,\nL'équipe CoachLink`,
      }));
    }

    if (coachProfile?.email) {
      promises.push(resend.emails.send({
        from: "CoachLink <onboarding@resend.dev>",
        to: coachProfile.email,
        subject: `Rappel : séance demain avec ${clientProfile?.nom ?? "un client"}`,
        text: `Bonjour ${coachProfile.nom},\n\nRappel : vous avez une séance demain ${date} de ${heure} avec ${clientProfile?.nom ?? "un client"}.${visioLine}\n\nÀ bientôt,\nL'équipe CoachLink`,
      }));
    }

    await Promise.all(promises);
    sent++;
  }

  return NextResponse.json({ ok: true, rappels_envoyes: sent });
}
