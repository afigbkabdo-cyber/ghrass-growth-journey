DROP POLICY "message photos parent upload" ON storage.objects;
CREATE POLICY "message photos admin upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
 bucket_id='message-photos' AND (storage.foldername(name))[2]=auth.uid()::text AND public.is_admin(auth.uid()) AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp') AND EXISTS (SELECT 1 FROM public.message_threads t WHERE t.id::text=(storage.foldername(name))[1])
);
CREATE OR REPLACE FUNCTION public.validate_message_photo() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.photo_path IS NOT NULL THEN
 IF NOT (public.is_admin(auth.uid()) AND NEW.sender_id=auth.uid() AND NEW.sender_role='admin' AND EXISTS(SELECT 1 FROM public.message_threads t WHERE t.id=NEW.thread_id)) THEN RAISE EXCEPTION 'Forbidden image'; END IF;
 IF split_part(NEW.photo_path,'/',1)<>NEW.thread_id::text OR split_part(NEW.photo_path,'/',2)<>auth.uid()::text OR NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='message-photos' AND name=NEW.photo_path AND lower(metadata->>'mimetype') IN ('image/jpeg','image/png','image/webp')) THEN RAISE EXCEPTION 'Invalid image'; END IF;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.validate_message_photo() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validate_message_photo() TO authenticated;