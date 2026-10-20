ALTER TABLE public.classes DROP CONSTRAINT classes_stage_check;
ALTER TABLE public.classes ADD CONSTRAINT classes_stage_check CHECK (stage IN ('nursery','kg1','kg2','prekg','after_school'));
ALTER TABLE public.children DROP CONSTRAINT children_stage_check;
ALTER TABLE public.children ADD CONSTRAINT children_stage_check CHECK (stage IN ('nursery','kg1','kg2','prekg','after_school'));