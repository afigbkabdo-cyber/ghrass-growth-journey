-- 0) helpers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.teaches_class(_class_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.teacher_classes WHERE class_id = _class_id AND teacher_id = _user_id)
$$;
REVOKE ALL ON FUNCTION public.teaches_class(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.teaches_class(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.has_child_in_class(_class_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.child_guardians cg
    JOIN public.children c ON c.id = cg.child_id
    WHERE cg.guardian_id = _user_id AND c.class_id = _class_id
  )
$$;
REVOKE ALL ON FUNCTION public.has_child_in_class(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_child_in_class(uuid, uuid) TO authenticated;

-- 1) allergies on children
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS allergies text;

-- 2) weekly values
CREATE TABLE public.values_week (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tagline text,
  hadith text,
  source text,
  description text,
  week_start date,
  approved boolean NOT NULL DEFAULT false,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.values_week TO authenticated;
GRANT ALL ON public.values_week TO service_role;
ALTER TABLE public.values_week ENABLE ROW LEVEL SECURITY;
CREATE POLICY "values read all" ON public.values_week FOR SELECT TO authenticated USING (true);
CREATE POLICY "values admin write" ON public.values_week FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER values_week_updated_at BEFORE UPDATE ON public.values_week
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) activities
CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  activity_date date NOT NULL DEFAULT current_date,
  activity_time time,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  value_id uuid REFERENCES public.values_week(id) ON DELETE SET NULL,
  linked_to_value boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities admin write" ON public.activities FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "activities teacher write" ON public.activities FOR ALL TO authenticated
  USING (class_id IS NOT NULL AND public.teaches_class(class_id, auth.uid()))
  WITH CHECK (class_id IS NOT NULL AND public.teaches_class(class_id, auth.uid()));
CREATE POLICY "activities parent read" ON public.activities FOR SELECT TO authenticated
  USING (published AND class_id IS NOT NULL AND public.has_child_in_class(class_id, auth.uid()));
CREATE TRIGGER activities_updated_at BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.activity_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_photos TO authenticated;
GRANT ALL ON public.activity_photos TO service_role;
ALTER TABLE public.activity_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity photos follow activity" ON public.activity_photos FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.activities a WHERE a.id = activity_id));
CREATE POLICY "activity photos write" ON public.activity_photos FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.activities a WHERE a.id = activity_id
    AND (public.is_admin(auth.uid()) OR (a.class_id IS NOT NULL AND public.teaches_class(a.class_id, auth.uid())))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.activities a WHERE a.id = activity_id
    AND (public.is_admin(auth.uid()) OR (a.class_id IS NOT NULL AND public.teaches_class(a.class_id, auth.uid())))));

-- 4) daily follow-up logs
CREATE TABLE public.daily_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT current_date,
  meal_status text,
  meal_time time,
  meal_notes text,
  bathroom_count integer NOT NULL DEFAULT 0,
  diaper_count integer NOT NULL DEFAULT 0,
  bathroom_notes text,
  slept boolean NOT NULL DEFAULT false,
  sleep_start time,
  sleep_end time,
  prayer_done boolean NOT NULL DEFAULT false,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (child_id, log_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_logs TO authenticated;
GRANT ALL ON public.daily_logs TO service_role;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily logs admin write" ON public.daily_logs FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "daily logs teacher write" ON public.daily_logs FOR ALL TO authenticated
  USING (public.teaches_child(child_id, auth.uid())) WITH CHECK (public.teaches_child(child_id, auth.uid()));
CREATE POLICY "daily logs guardian read" ON public.daily_logs FOR SELECT TO authenticated
  USING (public.is_guardian_of(child_id, auth.uid()));
CREATE TRIGGER daily_logs_updated_at BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) teacher notes on a child
CREATE TABLE public.child_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  author_id uuid NOT NULL DEFAULT auth.uid(),
  domain text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_notes TO authenticated;
GRANT ALL ON public.child_notes TO service_role;
ALTER TABLE public.child_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "child notes admin write" ON public.child_notes FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "child notes teacher write" ON public.child_notes FOR ALL TO authenticated
  USING (public.teaches_child(child_id, auth.uid())) WITH CHECK (public.teaches_child(child_id, auth.uid()));
CREATE POLICY "child notes guardian read" ON public.child_notes FOR SELECT TO authenticated
  USING (public.is_guardian_of(child_id, auth.uid()));

-- 6) daily schedule per class
CREATE TABLE public.schedule_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  at_time time,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_items TO authenticated;
GRANT ALL ON public.schedule_items TO service_role;
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule admin write" ON public.schedule_items FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "schedule read scoped" ON public.schedule_items FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()) OR public.teaches_class(class_id, auth.uid()) OR public.has_child_in_class(class_id, auth.uid()));
CREATE TRIGGER schedule_items_updated_at BEFORE UPDATE ON public.schedule_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.schedule_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.schedule_items(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT current_date,
  done boolean NOT NULL DEFAULT true,
  marked_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, log_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schedule_progress TO authenticated;
GRANT ALL ON public.schedule_progress TO service_role;
ALTER TABLE public.schedule_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "schedule progress read scoped" ON public.schedule_progress FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.schedule_items s WHERE s.id = item_id
    AND (public.is_admin(auth.uid()) OR public.teaches_class(s.class_id, auth.uid()) OR public.has_child_in_class(s.class_id, auth.uid()))));
CREATE POLICY "schedule progress teacher write" ON public.schedule_progress FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.schedule_items s WHERE s.id = item_id
    AND (public.is_admin(auth.uid()) OR public.teaches_class(s.class_id, auth.uid()))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.schedule_items s WHERE s.id = item_id
    AND (public.is_admin(auth.uid()) OR public.teaches_class(s.class_id, auth.uid()))));

-- 7) parent <-> admin messaging
CREATE TABLE public.message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id uuid REFERENCES public.children(id) ON DELETE SET NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_threads TO authenticated;
GRANT ALL ON public.message_threads TO service_role;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "threads admin write" ON public.message_threads FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "threads parent read" ON public.message_threads FOR SELECT TO authenticated
  USING (parent_id = auth.uid());
CREATE POLICY "threads parent create" ON public.message_threads FOR INSERT TO authenticated
  WITH CHECK (parent_id = auth.uid());
CREATE TRIGGER message_threads_updated_at BEFORE UPDATE ON public.message_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid(),
  sender_role text NOT NULL DEFAULT 'parent',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages admin write" ON public.messages FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "messages parent read" ON public.messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.message_threads t WHERE t.id = thread_id AND t.parent_id = auth.uid()));
CREATE POLICY "messages parent send" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.message_threads t WHERE t.id = thread_id AND t.parent_id = auth.uid()));