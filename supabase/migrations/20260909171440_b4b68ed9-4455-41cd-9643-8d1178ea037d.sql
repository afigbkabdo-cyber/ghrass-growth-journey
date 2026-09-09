REVOKE ALL ON FUNCTION public.teaches_class(uuid, uuid) FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.has_child_in_class(uuid, uuid) FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.teaches_class(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_child_in_class(uuid, uuid) TO authenticated;