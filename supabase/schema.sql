-- =========================================
-- CoachLink - Schéma de base de données
-- =========================================

-- Table profiles : commune à tous les utilisateurs
-- Liée à auth.users (Supabase Auth) en 1-1
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('coach', 'client')),
  nom text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- Table coaches : infos spécifiques au rôle coach
create table public.coaches (
  id uuid primary key references public.profiles(id) on delete cascade,
  photo_url text,
  specialite text not null,
  tarif_horaire numeric not null check (tarif_horaire >= 0),
  ville text not null,
  description text,
  created_at timestamptz not null default now()
);

-- Table disponibilites : créneaux du coach
create table public.disponibilites (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  jour_semaine text not null check (jour_semaine in ('lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche')),
  heure_debut time not null,
  heure_fin time not null
);

-- Table clients : infos spécifiques au rôle client
create table public.clients (
  id uuid primary key references public.profiles(id) on delete cascade,
  ville text,
  created_at timestamptz not null default now()
);

-- Index utiles pour la recherche de coachs
create index idx_coaches_specialite on public.coaches(specialite);
create index idx_coaches_ville on public.coaches(ville);
create index idx_coaches_tarif on public.coaches(tarif_horaire);

-- =========================================
-- Row Level Security (RLS)
-- =========================================

alter table public.profiles enable row level security;
alter table public.coaches enable row level security;
alter table public.disponibilites enable row level security;
alter table public.clients enable row level security;

-- profiles : chacun voit/modifie uniquement son propre profil
create policy "profiles: lecture de son propre profil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: création de son propre profil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles: modification de son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

-- coaches : profils publics en lecture (pour la recherche client),
-- mais modifiables uniquement par le coach lui-même
create policy "coaches: lecture publique"
  on public.coaches for select
  using (true);

create policy "coaches: création de son propre profil coach"
  on public.coaches for insert
  with check (auth.uid() = id);

create policy "coaches: modification de son propre profil coach"
  on public.coaches for update
  using (auth.uid() = id);

create policy "coaches: suppression de son propre profil coach"
  on public.coaches for delete
  using (auth.uid() = id);

-- disponibilites : lecture publique, écriture par le coach propriétaire
create policy "disponibilites: lecture publique"
  on public.disponibilites for select
  using (true);

create policy "disponibilites: gestion par le coach propriétaire"
  on public.disponibilites for all
  using (auth.uid() = coach_id)
  with check (auth.uid() = coach_id);

-- clients : visibles/modifiables uniquement par le client lui-même
create policy "clients: lecture de son propre profil"
  on public.clients for select
  using (auth.uid() = id);

create policy "clients: création de son propre profil"
  on public.clients for insert
  with check (auth.uid() = id);

create policy "clients: modification de son propre profil"
  on public.clients for update
  using (auth.uid() = id);
