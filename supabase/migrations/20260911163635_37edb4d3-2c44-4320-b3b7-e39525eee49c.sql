ALTER TABLE public.values_week
  ADD COLUMN IF NOT EXISTS learnings text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS at_school text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS at_home text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'ar';

ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS session_period text,
  ADD COLUMN IF NOT EXISTS enrollment_term text;

CREATE TABLE IF NOT EXISTS public.nursery_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  name text NOT NULL DEFAULT 'روضة غراس',
  tagline text NOT NULL DEFAULT 'ننمو معًا',
  city text NOT NULL DEFAULT 'الخبر — المملكة العربية السعودية',
  phone text NOT NULL DEFAULT '0552279219',
  email text NOT NULL DEFAULT 'info@ghiras.sa',
  instagram text NOT NULL DEFAULT '@ghirasnursery',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.nursery_settings TO authenticated;
GRANT ALL ON public.nursery_settings TO service_role;

ALTER TABLE public.nursery_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nursery settings read" ON public.nursery_settings;
CREATE POLICY "nursery settings read" ON public.nursery_settings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "nursery settings admin insert" ON public.nursery_settings;
CREATE POLICY "nursery settings admin insert" ON public.nursery_settings
  FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "nursery settings admin update" ON public.nursery_settings;
CREATE POLICY "nursery settings admin update" ON public.nursery_settings
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS nursery_settings_updated_at ON public.nursery_settings;
CREATE TRIGGER nursery_settings_updated_at BEFORE UPDATE ON public.nursery_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.nursery_settings (singleton) VALUES (true) ON CONFLICT (singleton) DO NOTHING;