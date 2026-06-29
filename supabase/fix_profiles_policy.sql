-- =========================================
-- CoachLink - Correction policy profiles
-- Permet la lecture publique du nom/email des coachs uniquement
-- (les profils clients restent privés à leur propriétaire)
-- =========================================

create policy "profiles: lecture publique des coachs"
  on public.profiles for select
  using (role = 'coach');
