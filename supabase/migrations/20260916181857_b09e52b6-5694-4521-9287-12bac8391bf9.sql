ALTER TABLE public.daily_logs
  ADD COLUMN IF NOT EXISTS meal2_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS meal2_status text,
  ADD COLUMN IF NOT EXISTS meal2_time time without time zone,
  ADD COLUMN IF NOT EXISTS meal2_notes text,
  ADD COLUMN IF NOT EXISTS sleeps jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.daily_logs
SET sleeps = jsonb_build_array(jsonb_build_object('start', to_char(sleep_start, 'HH24:MI'), 'end', CASE WHEN sleep_end IS NULL THEN NULL ELSE to_char(sleep_end, 'HH24:MI') END))
WHERE slept = true AND sleep_start IS NOT NULL AND sleeps = '[]'::jsonb;