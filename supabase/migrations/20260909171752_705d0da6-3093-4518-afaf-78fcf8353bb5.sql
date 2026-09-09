CREATE POLICY "threads parent touch" ON public.message_threads FOR UPDATE TO authenticated
  USING (parent_id = auth.uid()) WITH CHECK (parent_id = auth.uid());

DROP POLICY "messages parent send" ON public.messages;
CREATE POLICY "messages parent send" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND sender_role = 'parent'
    AND EXISTS (SELECT 1 FROM public.message_threads t WHERE t.id = thread_id AND t.parent_id = auth.uid())
  );