ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public.validate_message_photo()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE a jsonb; p text; k text; mt text; sz bigint;
BEGIN
 IF NEW.photo_path IS NOT NULL THEN
  IF NOT (public.is_admin(auth.uid()) AND NEW.sender_id=auth.uid() AND NEW.sender_role='admin' AND EXISTS(SELECT 1 FROM public.message_threads t WHERE t.id=NEW.thread_id)) THEN RAISE EXCEPTION 'Forbidden image'; END IF;
  IF split_part(NEW.photo_path,'/',1)<>NEW.thread_id::text OR split_part(NEW.photo_path,'/',2)<>auth.uid()::text OR NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='message-photos' AND name=NEW.photo_path AND lower(metadata->>'mimetype') IN ('image/jpeg','image/png','image/webp')) THEN RAISE EXCEPTION 'Invalid image'; END IF;
 END IF;
 IF TG_OP='UPDATE' AND NEW.attachments IS NOT DISTINCT FROM OLD.attachments THEN RETURN NEW; END IF;
 IF jsonb_typeof(NEW.attachments)<>'array' OR jsonb_array_length(NEW.attachments)>10 THEN RAISE EXCEPTION 'Invalid attachments'; END IF;
 IF jsonb_array_length(NEW.attachments)>0 AND NOT (public.is_admin(auth.uid()) AND NEW.sender_id=auth.uid() AND NEW.sender_role='admin') THEN RAISE EXCEPTION 'Forbidden media'; END IF;
 FOR a IN SELECT * FROM jsonb_array_elements(NEW.attachments) LOOP
  p := a->>'path'; k := a->>'kind';
  IF p IS NULL OR k NOT IN ('image','video') OR split_part(p,'/',1)<>NEW.thread_id::text OR split_part(p,'/',2)<>auth.uid()::text THEN RAISE EXCEPTION 'Invalid media'; END IF;
  SELECT lower(metadata->>'mimetype'), (metadata->>'size')::bigint INTO mt, sz FROM storage.objects WHERE bucket_id='message-photos' AND name=p;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid media'; END IF;
  IF k='image' AND (mt NOT IN ('image/jpeg','image/png','image/webp') OR coalesce(sz,0)>10485760) THEN RAISE EXCEPTION 'Invalid image'; END IF;
  IF k='video' AND (mt NOT IN ('video/mp4','video/quicktime','video/webm') OR coalesce(sz,0)>52428800) THEN RAISE EXCEPTION 'Invalid video'; END IF;
 END LOOP;
 RETURN NEW;
END $function$;

DROP POLICY IF EXISTS "message photos participant read" ON storage.objects;
CREATE POLICY "message photos participant read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id='message-photos' AND EXISTS (SELECT 1 FROM public.messages m JOIN public.message_threads t ON t.id=m.thread_id
 WHERE (m.photo_path=objects.name OR m.attachments @> jsonb_build_array(jsonb_build_object('path',objects.name)))
 AND (public.is_admin(auth.uid()) OR t.parent_id=auth.uid())));

DROP POLICY IF EXISTS "message photos admin upload" ON storage.objects;
CREATE POLICY "message photos admin upload" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id='message-photos' AND (storage.foldername(name))[2]=(auth.uid())::text AND public.is_admin(auth.uid())
 AND lower(storage.extension(name)) = ANY (ARRAY['jpg','jpeg','png','webp','mp4','mov','webm'])
 AND EXISTS (SELECT 1 FROM public.message_threads t WHERE (t.id)::text=(storage.foldername(objects.name))[1]));