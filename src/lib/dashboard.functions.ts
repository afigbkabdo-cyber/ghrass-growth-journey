import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { recordedSummary } from './dashboard';

const dates = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });

export const adminDashboard = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => dates.parse(d)).handler(async ({ data, context }) => {
  const { data: admin, error } = await context.supabase.rpc('is_admin', { _user_id: context.userId });
  if (error || !admin) throw new Error('Forbidden');
  const start = new Date(`${data.date}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const weekStart = start.toISOString().slice(0, 10);
  const results = await Promise.all([
    context.supabase.from('children').select('id,class_id'),
    context.supabase.from('classes').select('id,name,name_en,stage').order('name'),
    context.supabase.from('user_roles').select('user_id').eq('role', 'teacher'),
    context.supabase.from('child_attendance').select('child_id,log_date,status,check_in,check_out').gte('log_date', weekStart).lte('log_date', data.date),
    context.supabase.from('teacher_attendance').select('teacher_id,log_date,check_in,check_out').gte('log_date', weekStart).lte('log_date', data.date),
    context.supabase.from('values_week').select('id,name,name_en,tagline,tagline_en,week_start,approved,is_current'),
    context.supabase.from('announcements').select('id,title,body,tone,created_at').eq('state', 'published').order('created_at', { ascending: false }),
    context.supabase.from('activities').select('id').gte('activity_date', weekStart).lte('activity_date', data.date),
    context.supabase.from('daily_logs').select('id').gte('log_date', weekStart).lte('log_date', data.date),
  ]);
  for (const r of results) if (r.error) throw new Error(r.error.message);
  const [children, classes, teachers, childRows, teacherRows, values, announcements, activities, logs] = results;
  const childList = children.data ?? [];
  const attendance = childRows.data ?? [];
  return {
    totalChildren: childList.length, teachersCount: new Set((teachers.data ?? []).map(t => t.user_id)).size,
    classes: (classes.data ?? []).map(c => ({ ...c, students: childList.filter(ch => ch.class_id === c.id).length })),
    today: recordedSummary(attendance.filter(r => r.log_date === data.date), childList.length),
    values: values.data ?? [], announcements: announcements.data ?? [],
    activitiesCount: activities.data?.length ?? 0, logsCount: logs.data?.length ?? 0,
    childRows: attendance, teacherRows: teacherRows.data ?? [], weekStart,
  };
});

export const teacherDashboard = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => dates.parse(d)).handler(async ({ data, context }) => {
  const { data: links, error } = await context.supabase.from('teacher_classes').select('class_id').eq('teacher_id', context.userId);
  if (error) throw new Error(error.message);
  const ids = (links ?? []).map(l => l.class_id);
  if (!ids.length) return { classCount: 0, children: [], today: recordedSummary([], 0), followup: [] };
  const children = await context.supabase.from('children').select('id,name,name_en').in('class_id', ids).order('name');
  const rows = await context.supabase.from('child_attendance').select('child_id,status,check_in,log_date').in('class_id', ids).gte('log_date', `${data.date.slice(0, 7)}-01`).lte('log_date', data.date);
  if (children.error) throw new Error(children.error.message);
  if (rows.error) throw new Error(rows.error.message);
  const childList = children.data ?? [];
  const attendance = (rows.data ?? []).filter(r => childList.some(c => c.id === r.child_id));
  const followup = childList.map(c => ({ ...c, ...recordedSummary(attendance.filter(r => r.child_id === c.id), 0) })).filter(c => c.rate !== null).sort((a, b) => (a.rate ?? 0) - (b.rate ?? 0)).slice(0, 3);
  return { classCount: ids.length, children: childList, today: recordedSummary(attendance.filter(r => r.log_date === data.date), childList.length), followup };
});

export const childJourney = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => z.object({ childId: z.string().uuid() }).parse(d)).handler(async ({ data, context }) => {
  const { data: guardian, error } = await context.supabase.from('child_guardians').select('child_id').eq('guardian_id', context.userId).eq('child_id', data.childId).maybeSingle();
  if (error || !guardian) throw new Error('Forbidden');
  const [notes, logs] = await Promise.all([
    context.supabase.from('child_notes').select('id,body,domain,created_at').eq('child_id', data.childId).order('created_at', { ascending: false }),
    context.supabase.from('daily_logs').select('id,log_date').eq('child_id', data.childId).order('log_date', { ascending: false }),
  ]);
  if (notes.error) throw new Error(notes.error.message);
  if (logs.error) throw new Error(logs.error.message);
  return [...(notes.data ?? []).map(n => ({ id: n.id, date: n.created_at, body: n.body, kind: 'note' as const })), ...(logs.data ?? []).map(l => ({ id: l.id, date: l.log_date, body: null, kind: 'daily-log' as const }))].sort((a, b) => b.date.localeCompare(a.date));
});