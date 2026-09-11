ALTER TABLE public.nursery_settings
  ADD COLUMN IF NOT EXISTS name_en text NOT NULL DEFAULT 'Ghiras Nursery',
  ADD COLUMN IF NOT EXISTS tagline_en text NOT NULL DEFAULT 'Growing together',
  ADD COLUMN IF NOT EXISTS city_en text NOT NULL DEFAULT 'Khobar — Saudi Arabia',
  ADD COLUMN IF NOT EXISTS day_start time without time zone NOT NULL DEFAULT '07:00',
  ADD COLUMN IF NOT EXISTS day_end time without time zone NOT NULL DEFAULT '16:00';

UPDATE public.nursery_settings SET day_start = '07:00', day_end = '16:00';

ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS name_en text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name_en text;