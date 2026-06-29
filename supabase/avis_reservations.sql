-- =========================================
-- CoachLink - Avis et réservations
-- =========================================

create table public.avis (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  note int not null check (note between 1 and 5),
  commentaire text,
  created_at timestamptz not null default now(),
  unique (coach_id, client_id)
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  disponibilite_id uuid references public.disponibilites(id) on delete set null,
  date_souhaitee date not null,
  message text,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'confirmee', 'refusee')),
  created_at timestamptz not null default now()
);

create index idx_avis_coach on public.avis(coach_id);
create index idx_reservations_coach on public.reservations(coach_id);
create index idx_reservations_client on public.reservations(client_id);

alter table public.avis enable row level security;
alter table public.reservations enable row level security;

-- avis : lecture publique (pour affichage sur le profil coach)
create policy "avis: lecture publique"
  on public.avis for select
  using (true);

-- un client ne peut créer un avis qu'en son propre nom
create policy "avis: création par le client propriétaire"
  on public.avis for insert
  with check (auth.uid() = client_id);

create policy "avis: modification par le client propriétaire"
  on public.avis for update
  using (auth.uid() = client_id);

create policy "avis: suppression par le client propriétaire"
  on public.avis for delete
  using (auth.uid() = client_id);

-- reservations : visibles uniquement par le coach concerné et le client qui a fait la demande
create policy "reservations: lecture par le coach concerné"
  on public.reservations for select
  using (auth.uid() = coach_id);

create policy "reservations: lecture par le client demandeur"
  on public.reservations for select
  using (auth.uid() = client_id);

-- un client ne peut créer une demande qu'en son propre nom
create policy "reservations: création par le client demandeur"
  on public.reservations for insert
  with check (auth.uid() = client_id);

-- seul le coach concerné peut changer le statut (confirmer/refuser)
create policy "reservations: mise à jour par le coach concerné"
  on public.reservations for update
  using (auth.uid() = coach_id);
