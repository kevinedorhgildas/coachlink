import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Export des données personnelles — droit à la portabilité (art. 20 RGPD),
 * qui impose un format « structuré, couramment utilisé et lisible par
 * machine » : d'où du JSON, servi en pièce jointe.
 *
 * Une route plutôt qu'une action serveur : c'est ce qui permet de déclencher
 * un vrai téléchargement, avec un nom de fichier, sans passer par un blob
 * fabriqué côté client.
 *
 * Le rassemblement est fait par `exporter_mes_donnees()`, en `security
 * definer` : plusieurs tables ne sont pas lisibles par leur propre sujet à
 * travers RLS, et un export incomplet ne vaudrait rien.
 */
export async function GET() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { data, error } = await supabase.rpc("exporter_mes_donnees");
  if (error) {
    return NextResponse.json({ error: "Export impossible." }, { status: 500 });
  }

  const horodatage = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="coachlink-mes-donnees-${horodatage}.json"`,
      // L'export contient des données personnelles : il ne doit être gardé ni
      // par le navigateur ni par un intermédiaire.
      "Cache-Control": "no-store, private",
    },
  });
}
