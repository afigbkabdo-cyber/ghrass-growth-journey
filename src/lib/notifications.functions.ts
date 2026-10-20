import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const listParentNotifications = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: allowed, error: roleError } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'parent' });
  if (roleError || !allowed) throw new Error('Forbidden');
  const { data, error } = await context.supabase.from('parent_notifications').select('id,child_id,thread_id,event_type,event_date,title,title_en,body,body_en,created_at,read_at').eq('recipient_id', context.userId).order('created_at', { ascending: false }).order('id', { ascending: false });
  if (error) throw new Error('Unable to load notifications');
  return data ?? [];
});

export const markParentNotificationRead = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.rpc('mark_parent_notification_read', { _id: data.id });
  if (error) throw new Error('Unable to mark notification read');
  return { ok: true };
});