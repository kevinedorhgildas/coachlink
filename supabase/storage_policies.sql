-- =========================================
-- CoachLink - Policies du bucket 'avatars'
-- À exécuter après avoir créé le bucket "avatars" (public) dans
-- Dashboard Supabase → Storage → New bucket
-- =========================================

-- Lecture publique des photos (nécessaire pour les profils coachs visibles par les clients)
create policy "avatars: lecture publique"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Le coach ne peut uploader que dans un dossier nommé avec son propre user id
-- (convention : avatars/<coach_id>/photo.jpg)
create policy "avatars: upload par le coach propriétaire"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: modification par le coach propriétaire"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: suppression par le coach propriétaire"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
