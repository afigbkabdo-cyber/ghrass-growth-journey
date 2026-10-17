import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { attendanceDate } from './attendance';
const dateInput = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });
export const childAttendance = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => dateInput.parse(d)).handler(async ({ data, context }) => {
 const { data: rows, error } = await context.supabase.from('child_attendance').select('*').eq('log_date', data.date);
 if (error) throw new Error(error.message); return rows ?? [];
});
export const recordChildAttendance = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => z.object({ entries: z.array(z.object({ childId: z.string().uuid(), action: z.enum(['present','late','absent','out']) })).min(1).max(200) }).parse(d)).handler(async ({ data, context }) => {
 const { error } = await context.supabase.rpc('record_child_attendance', { _entries: data.entries });
 if (error) throw new Error(error.message); return { ok: true };
});
export const teacherAttendance = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
 const { data, error } = await context.supabase.from('teacher_attendance').select('*').eq('teacher_id',context.userId).order('log_date', { ascending:false });
 if(error) throw new Error(error.message); return data ?? [];
});
export const recordTeacherAttendance = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((d: unknown) => z.object({ action:z.enum(['in','out']) }).parse(d)).handler(async ({ data, context }) => {
 const { data: row, error } = await context.supabase.rpc('record_teacher_attendance', { _action:data.action });
 if(error) throw new Error(error.message); return row;
});
export const attendanceReport = createServerFn({ method:'GET' }).middleware([requireSupabaseAuth]).inputValidator((d:unknown) => dateInput.parse(d)).handler(async ({data,context}) => {
 const { data: admin, error: roleError } = await context.supabase.rpc('is_admin',{ _user_id:context.userId });
 if(roleError || !admin) throw new Error('Forbidden');
 const [children,teachers,classes,childRows,teacherRows] = await Promise.all([
 context.supabase.from('children').select('id,name,name_en,class_id').order('name'),
 context.supabase.from('user_roles').select('user_id').eq('role','teacher'),
 context.supabase.from('classes').select('id,name,name_en'),
 context.supabase.from('child_attendance').select('*').eq('log_date',data.date),
 context.supabase.from('teacher_attendance').select('*').eq('log_date',data.date),
 ]);
 for(const result of [children,teachers,classes,childRows,teacherRows]) if(result.error) throw new Error(result.error.message);
 const ids=(teachers.data ?? []).map(r=>r.user_id);
 const profiles=ids.length ? await context.supabase.from('profiles').select('id,full_name,full_name_en').in('id',ids) : { data:[],error:null };
 if(profiles.error) throw new Error(profiles.error.message);
 const links=ids.length ? await context.supabase.from('teacher_classes').select('*').in('teacher_id',ids) : {data:[],error:null};
 if(links.error) throw new Error(links.error.message);
 return {children:children.data ?? [],teachers:profiles.data ?? [],classes:classes.data ?? [],childRows:childRows.data ?? [],teacherRows:teacherRows.data ?? [],links:links.data ?? [],today:attendanceDate()};
});
