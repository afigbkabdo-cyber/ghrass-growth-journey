
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_guardian_of(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.teaches_child(uuid, uuid) FROM PUBLIC;
