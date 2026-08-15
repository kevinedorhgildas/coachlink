-- =========================================
-- CoachLink — Correctifs RGPD / confidentialité
-- Appliqués en production le 2026-08-15
-- (migrations `rgpd_masquer_email_coach_et_durcir_newsletter`
--  puis `rgpd_profiles_email_hors_portee_anon`)
-- =========================================

-- -----------------------------------------
-- 1. profiles : l'email hors de portée du public
--
-- La politique « lecture publique des coachs » reste nécessaire — le nom du
-- coach s'affiche sur sa fiche —, mais RLS filtre les lignes, pas les
-- colonnes. Le privilège colonne est donc le seul levier.
--
-- Attention : un `revoke select (email)` seul ne suffit pas. `anon` détient un
-- privilège SELECT au niveau de la table, qui couvre toutes les colonnes et
-- l'emporte sur la révocation d'une colonne isolée. Il faut retirer le
-- privilège global, puis le redonner colonne par colonne.
-- -----------------------------------------
revoke select on public.profiles from anon;
grant select (id, nom, role) on public.profiles to anon;

-- -----------------------------------------
-- 2. newsletter_abonnes : plus aucune écriture directe
--
-- Avant : INSERT `with check (true)` et UPDATE `using (true)` sans
-- `with check` — n'importe qui pouvait modifier n'importe quelle ligne, donc
-- désabonner tous les inscrits ou écraser un email d'un seul appel sans
-- filtre. Et aucune politique SELECT : personne, pas même l'admin, ne pouvait
-- relire la liste, ce qui cassait silencieusement l'envoi et la détection des
-- doublons.
--
-- Après : la lecture est réservée aux admins, et les deux seuls gestes
-- ouverts au public passent par des fonctions `security definer` qui ne
-- savent faire que ce pour quoi elles sont écrites.
-- -----------------------------------------
drop policy if exists "desabonnement par token" on public.newsletter_abonnes;
drop policy if exists "inscription publique" on public.newsletter_abonnes;

create policy "newsletter: lecture par un admin"
  on public.newsletter_abonnes for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Renvoie l'issue plutôt qu'une erreur, pour que l'appelant sache s'il doit
-- envoyer l'email de bienvenue.
create or replace function public.newsletter_inscrire(p_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_actif boolean;
begin
  if v_email is null or v_email = '' or position('@' in v_email) = 0 then
    return 'email_invalide';
  end if;

  select actif into v_actif from newsletter_abonnes where email = v_email;

  if found then
    if v_actif then
      return 'deja_inscrit';
    end if;
    update newsletter_abonnes set actif = true where email = v_email;
    return 'reactive';
  end if;

  insert into newsletter_abonnes (email) values (v_email);
  return 'inscrit';
end;
$$;

-- Ne touche que la ligne portant ce jeton, et ne peut que désactiver.
create or replace function public.newsletter_desabonner(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lignes int;
begin
  update newsletter_abonnes
     set actif = false
   where token = p_token and actif = true;
  get diagnostics v_lignes = row_count;
  return v_lignes > 0;
end;
$$;

revoke all on function public.newsletter_inscrire(text) from public;
revoke all on function public.newsletter_desabonner(uuid) from public;
grant execute on function public.newsletter_inscrire(text) to anon, authenticated;
grant execute on function public.newsletter_desabonner(uuid) to anon, authenticated;

-- -----------------------------------------
-- Reste à faire (non couvert ici)
--
-- Un utilisateur connecté peut toujours lire l'email des coachs : le rôle
-- `authenticated` garde le privilège sur toute la table, parce qu'il en a
-- besoin pour son propre profil. Le fermer demande de remplacer la politique
-- « lecture publique des coachs » par une vue ne portant que `id` et `nom` —
-- ce qui casse l'imbrication PostgREST `profiles(nom)` et suppose de reprendre
-- les requêtes des pages publiques.
-- -----------------------------------------

-- =========================================
-- Droit à l'effacement (art. 17) et droit à la portabilité (art. 20)
-- Appliqués en production le 2026-08-15
-- (migrations `rgpd_effacement_et_portabilite`
--  puis `rgpd_effacement_correction_stockage`)
-- =========================================

-- Les deux droits passent par des fonctions `security definer` plutôt que par
-- une clé `service_role` dans l'application : une telle clé, si elle fuite,
-- ouvre toute la base en contournant RLS, alors que ces fonctions ne savent
-- faire que leur geste, et seulement sur le compte appelant.

-- -----------------------------------------
-- Effacement
--
-- Toutes les clés étrangères des 23 tables publiques remontent à `auth.users`
-- en CASCADE : supprimer la ligne d'authentification vide la base.
--
-- Attention : les fichiers ne peuvent PAS être supprimés ici. Supabase pose un
-- déclencheur `storage.protect_delete()` qui refuse toute suppression directe
-- dans `storage.objects`, même en `security definer`, pour éviter les objets
-- orphelins. Le nettoyage se fait donc par l'API Storage, dans
-- `src/app/dashboard/actions-rgpd.ts`, avant l'appel à cette fonction.
-- -----------------------------------------
create or replace function public.supprimer_mon_compte()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
begin
  if v_uid is null then
    raise exception 'Non authentifié';
  end if;

  select email into v_email from public.profiles where id = v_uid;

  -- L'inscription à la newsletter est liée à l'email, pas au compte : elle
  -- survivrait à la cascade.
  if v_email is not null then
    delete from public.newsletter_abonnes where email = v_email;
  end if;

  delete from auth.users where id = v_uid;
end;
$$;

-- Les buckets `documents` et `media` n'avaient aucune politique : leur
-- propriétaire ne pouvait ni lister ni supprimer ses propres fichiers, ce qui
-- rendait le nettoyage impossible. Même convention que `avatars` — un dossier
-- par utilisateur.
create policy "documents: lecture par le propriétaire"
  on storage.objects for select
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "documents: suppression par le propriétaire"
  on storage.objects for delete
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "media: lecture par le propriétaire"
  on storage.objects for select
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "media: suppression par le propriétaire"
  on storage.objects for delete
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

-- -----------------------------------------
-- Portabilité
--
-- Rend en JSON l'intégralité des données rattachées au compte, réparties en
-- 23 rubriques. En `security definer` pour que l'export soit complet quelles
-- que soient les politiques de lecture : plusieurs tables ne sont pas lisibles
-- par leur propre sujet à travers RLS, et un export incomplet ne vaut rien.
--
-- Le corps de la fonction est celui appliqué par la migration
-- `rgpd_effacement_et_portabilite` ; se référer à la base pour sa version
-- courante.
-- -----------------------------------------

revoke all on function public.supprimer_mon_compte() from public;
revoke all on function public.exporter_mes_donnees() from public;
grant execute on function public.supprimer_mon_compte() to authenticated;
grant execute on function public.exporter_mes_donnees() to authenticated;

-- =========================================
-- Preuve du consentement (art. 7.1) et information des prospects (art. 14)
-- Appliqués en production le 2026-08-15
-- (migration `rgpd_preuve_consentement_et_information_prospects`)
-- =========================================

-- La case CGU était obligatoire côté HTML uniquement : le formulaire pouvait
-- être soumis sans elle, et rien n'était conservé. La version acceptée est
-- enregistrée en plus de la date — les CGU évoluant, la date seule ne dit pas
-- *ce qui* a été accepté.
alter table public.profiles
  add column if not exists cgu_acceptees_le timestamptz,
  add column if not exists cgu_version      text;

-- Les données des prospects ne viennent pas d'eux : l'article 14 impose de les
-- informer, dans le mois ou dès la première communication. Encore faut-il
-- pouvoir montrer que ça a été fait, et pour qui.
alter table public.prospects
  add column if not exists informe_le timestamptz;

-- Les prospects sans suite ne se conservent pas indéfiniment : la CNIL retient
-- trois ans à compter du dernier contact.
create or replace view public.prospects_a_purger as
  select id, nom, contact, canal, statut, updated_at,
         age(now(), updated_at) as anciennete
    from public.prospects
   where statut <> 'converti'
     and updated_at < now() - interval '3 years';
