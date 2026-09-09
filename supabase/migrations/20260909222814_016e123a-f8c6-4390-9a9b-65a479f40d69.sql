-- 1. Harden SECURITY DEFINER helpers: only answer for the calling user, and remove anon/public access.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT _user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT _user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'))
$$;

CREATE OR REPLACE FUNCTION public.is_guardian_of(_child_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT _user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.child_guardians WHERE child_id = _child_id AND guardian_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.teaches_class(_class_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT _user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.teacher_classes WHERE class_id = _class_id AND teacher_id = _user_id)
$$;

CREATE OR REPLACE FUNCTION public.teaches_child(_child_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT _user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.children c
    JOIN public.teacher_classes tc ON tc.class_id = c.class_id
    WHERE c.id = _child_id AND tc.teacher_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.has_child_in_class(_class_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT _user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.child_guardians cg
    JOIN public.children c ON c.id = cg.child_id
    WHERE cg.guardian_id = _user_id AND c.class_id = _class_id
  )
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM anon, public;
REVOKE ALL ON FUNCTION public.is_guardian_of(uuid, uuid) FROM anon, public;
REVOKE ALL ON FUNCTION public.teaches_class(uuid, uuid) FROM anon, public;
REVOKE ALL ON FUNCTION public.teaches_child(uuid, uuid) FROM anon, public;
REVOKE ALL ON FUNCTION public.has_child_in_class(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_guardian_of(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.teaches_class(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.teaches_child(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_child_in_class(uuid, uuid) TO authenticated;

-- 2. Scope activity_photos reads to the activity's audience.
DROP POLICY IF EXISTS "activity photos follow activity" ON public.activity_photos;
CREATE POLICY "activity photos read scoped" ON public.activity_photos
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.activities a
  WHERE a.id = activity_photos.activity_id
    AND (
      public.is_admin(auth.uid())
      OR (a.class_id IS NOT NULL AND public.teaches_class(a.class_id, auth.uid()))
      OR (a.published AND a.class_id IS NOT NULL AND public.has_child_in_class(a.class_id, auth.uid()))
    )
));

-- 3. Scope storage reads of activity photo files the same way.
DROP POLICY IF EXISTS "activity photos read" ON storage.objects;
CREATE POLICY "activity photos read" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'activity-photos'
  AND EXISTS (
    SELECT 1 FROM public.activity_photos p
    JOIN public.activities a ON a.id = p.activity_id
    WHERE p.path = storage.objects.name
      AND (
        public.is_admin(auth.uid())
        OR (a.class_id IS NOT NULL AND public.teaches_class(a.class_id, auth.uid()))
        OR (a.published AND a.class_id IS NOT NULL AND public.has_child_in_class(a.class_id, auth.uid()))
      )
  )
);