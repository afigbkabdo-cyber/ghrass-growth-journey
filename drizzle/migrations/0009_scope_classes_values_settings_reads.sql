DROP POLICY IF EXISTS "classes read" ON public.classes;
CREATE POLICY "classes read scoped" ON public.classes FOR SELECT TO authenticated
USING (
  public.is_admin(auth.uid())
  OR public.teaches_class(id, auth.uid())
  OR public.has_child_in_class(id, auth.uid())
);

DROP POLICY IF EXISTS "values read all" ON public.values_week;
CREATE POLICY "values read scoped" ON public.values_week FOR SELECT TO authenticated
USING (
  public.is_admin(auth.uid())
  OR (approved AND (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'parent')))
);

DROP POLICY IF EXISTS "nursery settings read" ON public.nursery_settings;
CREATE POLICY "nursery settings read members" ON public.nursery_settings FOR SELECT TO authenticated
USING (
  public.is_admin(auth.uid())
  OR public.has_role(auth.uid(), 'teacher')
  OR public.has_role(auth.uid(), 'parent')
);