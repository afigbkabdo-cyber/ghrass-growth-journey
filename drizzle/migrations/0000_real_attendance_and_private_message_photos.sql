CREATE TABLE public.child_attendance (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), child_id uuid NOT NULL REFERENCES public.children(id), class_id uuid REFERENCES public.classes(id), log_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'Asia/Riyadh')::date), status text NOT NULL, check_in timestamptz, check_out timestamptz, recorded_by uuid NOT NULL, UNIQUE(child_id,log_date), CONSTRAINT child_attendance_status CHECK (status IN ('present','late','absent'))
);
GRANT SELECT ON public.child_attendance TO authenticated;
GRANT ALL ON public.child_attendance TO service_role;
ALTER TABLE public.child_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance child read scoped" ON public.child_attendance FOR SELECT TO authenticated USING (public.is_admin(auth.uid()) OR public.teaches_class(class_id,auth.uid()));
CREATE TABLE public.teacher_attendance (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), teacher_id uuid NOT NULL REFERENCES public.profiles(id), log_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'Asia/Riyadh')::date), check_in timestamptz NOT NULL DEFAULT now(), check_out timestamptz, UNIQUE(teacher_id,log_date)
);
GRANT SELECT ON public.teacher_attendance TO authenticated;
GRANT ALL ON public.teacher_attendance TO service_role;
ALTER TABLE public.teacher_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attendance teacher read scoped" ON public.teacher_attendance FOR SELECT TO authenticated USING (public.is_admin(auth.uid()) OR teacher_id=auth.uid());
CREATE FUNCTION public.record_child_attendance(_entries jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE e jsonb; c public.children; r public.child_attendance; today date := (now() AT TIME ZONE 'Asia/Riyadh')::date; action text;
BEGIN
 IF auth.uid() IS NULL OR NOT (public.is_admin(auth.uid()) OR public.has_role(auth.uid(),'teacher')) THEN RAISE EXCEPTION 'Forbidden'; END IF;
 IF jsonb_typeof(_entries) <> 'array' OR jsonb_array_length(_entries)>200 THEN RAISE EXCEPTION 'Invalid entries'; END IF;
 FOR e IN SELECT * FROM jsonb_array_elements(_entries) LOOP
 SELECT * INTO c FROM public.children WHERE id=(e->>'childId')::uuid;
 IF NOT FOUND OR NOT (public.is_admin(auth.uid()) OR public.teaches_class(c.class_id,auth.uid())) THEN RAISE EXCEPTION 'Forbidden'; END IF;
 action := e->>'action';
 IF action NOT IN ('present','late','absent','out') OR action IS NULL THEN RAISE EXCEPTION 'Invalid action'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(c.id::text||today::text,0));
 SELECT * INTO r FROM public.child_attendance WHERE child_id=c.id AND log_date=today FOR UPDATE;
 IF action='out' THEN
 IF r.check_in IS NULL THEN RAISE EXCEPTION 'Check in first'; END IF;
 UPDATE public.child_attendance SET check_out=coalesce(check_out,now()), recorded_by=auth.uid() WHERE id=r.id;
 ELSE
 IF r.check_in IS NOT NULL AND action='absent' THEN RAISE EXCEPTION 'Attendance already recorded'; END IF;
 INSERT INTO public.child_attendance(child_id,class_id,log_date,status,check_in,recorded_by)
 VALUES(c.id,c.class_id,today,action,CASE WHEN action IN ('present','late') THEN now() ELSE NULL END,auth.uid())
 ON CONFLICT(child_id,log_date) DO UPDATE SET status=excluded.status,check_in=coalesce(child_attendance.check_in,excluded.check_in),recorded_by=auth.uid();
 END IF;
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.record_child_attendance(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.record_child_attendance(jsonb) TO authenticated;
CREATE FUNCTION public.record_teacher_attendance(_action text) RETURNS public.teacher_attendance LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.teacher_attendance; today date := (now() AT TIME ZONE 'Asia/Riyadh')::date;
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'teacher') THEN RAISE EXCEPTION 'Forbidden'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text||today::text,0));
 IF _action='in' THEN
 INSERT INTO public.teacher_attendance(teacher_id,log_date) VALUES(auth.uid(),today) ON CONFLICT(teacher_id,log_date) DO NOTHING;
 ELSIF _action='out' THEN
 UPDATE public.teacher_attendance SET check_out=coalesce(check_out,now()) WHERE teacher_id=auth.uid() AND log_date=today;
 IF NOT FOUND THEN RAISE EXCEPTION 'Check in first'; END IF;
 ELSE RAISE EXCEPTION 'Invalid action'; END IF;
 SELECT * INTO r FROM public.teacher_attendance WHERE teacher_id=auth.uid() AND log_date=today;
 RETURN r;
END $$;
REVOKE ALL ON FUNCTION public.record_teacher_attendance(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.record_teacher_attendance(text) TO authenticated;
ALTER TABLE public.messages ADD COLUMN photo_path text;
CREATE POLICY "message photos parent upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
 bucket_id='message-photos' AND (storage.foldername(name))[2]=auth.uid()::text AND public.has_role(auth.uid(),'parent') AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp') AND EXISTS (SELECT 1 FROM public.message_threads t WHERE t.id::text=(storage.foldername(name))[1] AND t.parent_id=auth.uid())
);
CREATE POLICY "message photos participant read" ON storage.objects FOR SELECT TO authenticated USING (
 bucket_id='message-photos' AND EXISTS (SELECT 1 FROM public.messages m JOIN public.message_threads t ON t.id=m.thread_id WHERE m.photo_path=name AND (public.is_admin(auth.uid()) OR t.parent_id=auth.uid()))
);
CREATE FUNCTION public.validate_message_photo() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.photo_path IS NOT NULL THEN
 IF NOT (public.has_role(auth.uid(),'parent') AND NEW.sender_id=auth.uid() AND NEW.sender_role='parent' AND EXISTS(SELECT 1 FROM public.message_threads t WHERE t.id=NEW.thread_id AND t.parent_id=auth.uid())) THEN RAISE EXCEPTION 'Forbidden image'; END IF;
 IF split_part(NEW.photo_path,'/',1)<>NEW.thread_id::text OR split_part(NEW.photo_path,'/',2)<>auth.uid()::text OR NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='message-photos' AND name=NEW.photo_path AND lower(metadata->>'mimetype') IN ('image/jpeg','image/png','image/webp')) THEN RAISE EXCEPTION 'Invalid image'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER messages_validate_photo BEFORE INSERT OR UPDATE OF photo_path ON public.messages FOR EACH ROW EXECUTE FUNCTION public.validate_message_photo();