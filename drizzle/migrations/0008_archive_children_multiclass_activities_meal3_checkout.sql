-- 1) Safe child archiving (keeps attendance, logs, notes, guardians)
ALTER TABLE public.children ADD COLUMN archived_at timestamptz;

-- 4) Optional third meal
ALTER TABLE public.daily_logs ADD COLUMN meal3_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.daily_logs ADD COLUMN meal3_status text;
ALTER TABLE public.daily_logs ADD COLUMN meal3_time time;
ALTER TABLE public.daily_logs ADD COLUMN meal3_notes text;

-- 3) Activities targeting several classes
CREATE TABLE public.activity_classes (
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  PRIMARY KEY (activity_id, class_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_classes TO authenticated;
GRANT ALL ON public.activity_classes TO service_role;
ALTER TABLE public.activity_classes ENABLE ROW LEVEL SECURITY;
INSERT INTO public.activity_classes(activity_id, class_id)
  SELECT id, class_id FROM public.activities WHERE class_id IS NOT NULL ON CONFLICT DO NOTHING;

CREATE POLICY "activity classes read scoped" ON public.activity_classes FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.teaches_class(class_id, auth.uid()) OR public.has_child_in_class(class_id, auth.uid()));
CREATE POLICY "activity classes write scoped" ON public.activity_classes FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()) OR public.teaches_class(class_id, auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) OR public.teaches_class(class_id, auth.uid()));

CREATE FUNCTION public.activity_for_parent(_activity_id uuid, _user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.activities a JOIN public.activity_classes ac ON ac.activity_id = a.id
    WHERE a.id = _activity_id AND a.published AND public.has_child_in_class(ac.class_id, _user_id))
$$;
CREATE FUNCTION public.activity_for_teacher(_activity_id uuid, _user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.activity_classes ac WHERE ac.activity_id = _activity_id AND public.teaches_class(ac.class_id, _user_id))
$$;
REVOKE ALL ON FUNCTION public.activity_for_parent(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.activity_for_teacher(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.activity_for_parent(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activity_for_teacher(uuid, uuid) TO authenticated;

CREATE POLICY "activities multi class read" ON public.activities FOR SELECT TO authenticated
  USING (public.activity_for_parent(id, auth.uid()) OR public.activity_for_teacher(id, auth.uid()));
CREATE POLICY "activity photos multi class read" ON public.activity_photos FOR SELECT TO authenticated
  USING (public.activity_for_parent(activity_id, auth.uid()) OR public.activity_for_teacher(activity_id, auth.uid()));
CREATE POLICY "activity photos multi class storage read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'activity-photos' AND EXISTS (
    SELECT 1 FROM public.activity_photos p WHERE p.path = objects.name
      AND (public.activity_for_parent(p.activity_id, auth.uid()) OR public.activity_for_teacher(p.activity_id, auth.uid()))));

-- 5) Checkout notifications (separate type; attendance notifications unchanged)
ALTER TABLE public.parent_notifications DROP CONSTRAINT IF EXISTS parent_notifications_event_type_check;
ALTER TABLE public.parent_notifications ADD CONSTRAINT parent_notifications_event_type_check
  CHECK (event_type IN ('attendance','daily_log','note','activity','message','checkout'));

CREATE FUNCTION public.notify_parent_child_checkout() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.check_out IS NULL OR OLD.check_out IS NOT NULL THEN RETURN NEW; END IF;
  INSERT INTO public.parent_notifications(recipient_id,child_id,event_type,source_id,event_date,title,title_en,body,body_en)
  SELECT DISTINCT g.guardian_id, NEW.child_id, 'checkout', NEW.id, NEW.log_date,
    'تم تسجيل انصراف الطفل','Child checkout recorded','تم تسجيل انصراف طفلك من الروضة.','Your child''s checkout from the kindergarten was recorded.'
  FROM public.child_guardians g WHERE g.child_id = NEW.child_id
    AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = g.guardian_id AND r.role = 'parent')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Parent checkout notification failed, SQLSTATE %', SQLSTATE;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.notify_parent_child_checkout() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER notify_parent_checkout AFTER UPDATE OF check_out ON public.child_attendance
  FOR EACH ROW EXECUTE FUNCTION public.notify_parent_child_checkout();

-- Activity notifications for additional target classes
CREATE FUNCTION public.notify_parent_activity_class() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.activities;
BEGIN
  SELECT * INTO a FROM public.activities WHERE id = NEW.activity_id;
  IF NOT FOUND OR NOT a.published THEN RETURN NEW; END IF;
  INSERT INTO public.parent_notifications(recipient_id,child_id,event_type,source_id,event_date,title,title_en,body,body_en)
  SELECT DISTINCT g.guardian_id, c.id, 'activity', a.id, a.activity_date, 'نشاط جديد منشور','New published activity', a.title, coalesce(nullif(a.title_en,''), a.title)
  FROM public.children c JOIN public.child_guardians g ON g.child_id = c.id
  WHERE c.class_id = NEW.class_id AND c.archived_at IS NULL
    AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = g.guardian_id AND r.role = 'parent')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Parent activity class notification failed, SQLSTATE %', SQLSTATE;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.notify_parent_activity_class() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER notify_parent_activity_class AFTER INSERT ON public.activity_classes
  FOR EACH ROW EXECUTE FUNCTION public.notify_parent_activity_class();

-- When a draft is published later, notify all target classes (primary class handled by the existing trigger)
CREATE FUNCTION public.notify_parent_activity_publish_classes() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT NEW.published OR OLD.published THEN RETURN NEW; END IF;
  INSERT INTO public.parent_notifications(recipient_id,child_id,event_type,source_id,event_date,title,title_en,body,body_en)
  SELECT DISTINCT g.guardian_id, c.id, 'activity', NEW.id, NEW.activity_date, 'نشاط جديد منشور','New published activity', NEW.title, coalesce(nullif(NEW.title_en,''), NEW.title)
  FROM public.activity_classes ac JOIN public.children c ON c.class_id = ac.class_id JOIN public.child_guardians g ON g.child_id = c.id
  WHERE ac.activity_id = NEW.id AND c.archived_at IS NULL
    AND EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = g.guardian_id AND r.role = 'parent')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Parent activity publish notification failed, SQLSTATE %', SQLSTATE;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.notify_parent_activity_publish_classes() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER notify_parent_activity_publish_classes AFTER UPDATE OF published ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.notify_parent_activity_publish_classes();