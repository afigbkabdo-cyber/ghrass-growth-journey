CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(trim(title)) > 0),
  body text NOT NULL DEFAULT '',
  audience text NOT NULL DEFAULT 'all' CHECK (audience IN ('all','parents','teachers')),
  state text NOT NULL DEFAULT 'published' CHECK (state IN ('published','draft','archived')),
  tone text NOT NULL DEFAULT 'orange' CHECK (tone IN ('orange','blue','green','yellow','pink')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Audience reads published announcements" ON public.announcements FOR SELECT TO authenticated
  USING (state = 'published' AND (
    audience = 'all'
    OR (audience = 'parents' AND public.has_role(auth.uid(), 'parent'))
    OR (audience = 'teachers' AND public.has_role(auth.uid(), 'teacher'))
  ));