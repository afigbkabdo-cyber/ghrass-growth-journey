ALTER FUNCTION public.validate_message_photo() SECURITY DEFINER;
REVOKE ALL ON FUNCTION public.validate_message_photo() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validate_message_photo() TO authenticated;