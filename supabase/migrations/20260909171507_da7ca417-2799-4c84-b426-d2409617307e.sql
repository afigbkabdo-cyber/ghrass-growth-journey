CREATE POLICY "activity photos read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'activity-photos');
CREATE POLICY "activity photos upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'activity-photos'
    AND (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'teacher')));
CREATE POLICY "activity photos delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'activity-photos'
    AND (public.is_admin(auth.uid()) OR public.has_role(auth.uid(), 'teacher')));