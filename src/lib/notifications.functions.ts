import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { attachmentNotice } from './message-media';

export const listParentNotifications = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: allowed, error: roleError } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'parent' });
  if (roleError || !allowed) throw new Error('Forbidden');
  const { data, error } = await context.supabase.from('parent_notifications').select('id,child_id,thread_id,source_id,event_type,event_date,title,title_en,body,body_en,created_at,read_at').eq('recipient_id', context.userId).order('created_at', { ascending: false }).order('id', { ascending: false });
  if (error) throw new Error('Unable to load notifications');
  const messageIds = (data ?? []).filter(item => item.event_type === 'message').map(item => item.source_id);
  if (!messageIds.length) return data ?? [];
  // Resolve attachment wording from the existing RLS-scoped message, without rewriting notifications or their triggers.
  const { data: messages, error: messageError } = await context.supabase.from('messages').select('id,body,photo_path,attachments').in('id', messageIds);
  if (messageError) throw new Error('Unable to load message notifications');
  const sources = new Map((messages ?? []).map(message => [message.id, message]));
  return (data ?? []).map(item => {
    const message = item.event_type === 'message' ? sources.get(item.source_id) : undefined;
    const notice = message ? attachmentNotice(message) : null;
    return notice ? { ...item, ...notice } : item;
  });
});

export const markParentNotificationRead = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.rpc('mark_parent_notification_read', { _id: data.id });
  if (error) throw new Error('Unable to mark notification read');
  return { ok: true };
});