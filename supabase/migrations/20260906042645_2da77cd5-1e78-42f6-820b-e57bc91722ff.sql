
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_guardian_of(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.teaches_child(uuid, uuid) FROM anon, authenticated;
