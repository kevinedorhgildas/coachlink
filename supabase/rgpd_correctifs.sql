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
