import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { CalendarCheck } from 'lucide-react';
import { SectionHeader, StatCard, ToneBadge } from '@/components/ghiras';
import { attendanceReport } from '@/lib/attendance.functions';
import { attendanceCounts, attendanceDate, attendanceStatus, attendanceTime } from '@/lib/attendance';
import { useI18n } from '@/lib/i18n';
export const Route = createFileRoute('/admin/attendance')({head:()=>({meta:[{title:'الحضور والانصراف — إدارة غراس'},{name:'description',content:'سجلات حضور وانصراف الأطفال والمعلمات حسب التاريخ والفصل.'},{property:'og:title',content:'الحضور والانصراف — إدارة غراس'},{property:'og:description',content:'متابعة سجلات حضور الأطفال والمعلمات الفعلية.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:AdminAttendance});
function AdminAttendance(){
 const {t,n,locale}=useI18n(); const [date,setDate]=useState(attendanceDate);const [classId,setClass]=useState('');const [teacherId,setTeacher]=useState('');
 const fetch=useServerFn(attendanceReport);const query=useQuery({queryKey:['attendance-report',date],queryFn:()=>fetch({data:{date}}),refetchInterval:15000});
 const data=query.data; const children=(data?.children ?? []).filter(c=>!classId || c.class_id===classId).filter(c=>!teacherId || data?.links.some(l=>l.teacher_id===teacherId && l.class_id===c.class_id));
 const rows=(data?.childRows ?? []).filter(r=>(!classId || r.class_id===classId) && (!teacherId || data?.links.some(l=>l.teacher_id===teacherId && l.class_id===r.class_id)));
 const counts=attendanceCounts(rows);
 const labels={unrecorded:'لم يُسجل',absent:'غائب',present:'حاضر',completed:'مكتمل'};
 const input='h-11 min-w-0 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground';
 const detail=(row:Parameters<typeof attendanceStatus>[0])=><><ToneBadge tone={row?.check_in?'green':row?.status==='absent'?'pink':'yellow'}>{t(labels[attendanceStatus(row)])}</ToneBadge><div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground"><span>{t('الحضور')}: {attendanceTime(row?.check_in ?? null,locale) ?? t('لم يُسجل')}</span><span>{t('الانصراف')}: {attendanceTime(row?.check_out ?? null,locale) ?? t('لم يُسجل')}</span></div></>;
 return <div className="space-y-5"><SectionHeader title={t('الحضور والانصراف')} icon={CalendarCheck} tone="green"/>
 <div className="grid gap-3 md:grid-cols-3"><label className="text-xs font-bold">{t('التاريخ')}<input aria-label={t('التاريخ')} type="date" value={date} onChange={e=>setDate(e.target.value)} className={input}/></label><label className="text-xs font-bold">{t('الفصل')}<select aria-label={t('الفصل')} value={classId} onChange={e=>setClass(e.target.value)} className={input}><option value="">{t('جميع الفصول')}</option>{data?.classes.map(c=><option key={c.id} value={c.id}>{n(c.name,c.name_en)}</option>)}</select></label><label className="text-xs font-bold">{t('المعلمة')}<select aria-label={t('المعلمة')} value={teacherId} onChange={e=>setTeacher(e.target.value)} className={input}><option value="">{t('جميع المعلمات')}</option>{data?.teachers.map(p=><option key={p.id} value={p.id}>{n(p.full_name,p.full_name_en)}</option>)}</select></label></div>
 {query.isPending && <p>{t('جارٍ التحميل…')}</p>}{query.isError && <p role="alert">{t('تعذر حفظ السجل')}</p>}
 <div className="grid grid-cols-2 gap-3"><StatCard icon={CalendarCheck} value={counts.present} label={t('حاضرون')} tone="green"/><StatCard icon={CalendarCheck} value={counts.absent} label={t('غائبون')} tone="pink"/></div>
 <section><SectionHeader title={t('حضور الأطفال')} icon={CalendarCheck} tone="green"/><div className="space-y-3">{children.map(c=>{const row=rows.find(r=>r.child_id===c.id);const cl=data?.classes.find(cl=>cl.id===(row?.class_id ?? c.class_id));return <article key={c.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft"><h3 className="font-bold text-sm">{n(c.name,c.name_en)}</h3><p className="mb-2 text-xs text-muted-foreground">{n(cl?.name,cl?.name_en)}</p>{detail(row)}</article>})}{!children.length && <p className="text-sm text-muted-foreground">{t('لا توجد سجلات')}</p>}</div></section>
 <section><SectionHeader title={t('حضور المعلمات')} icon={CalendarCheck} tone="blue"/><div className="space-y-3">{data?.teachers.filter(p=>(!teacherId || p.id===teacherId) && (!classId || data.links.some(l=>l.teacher_id===p.id && l.class_id===classId))).map(p=><article key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft"><h3 className="mb-2 text-sm font-bold">{n(p.full_name,p.full_name_en)}</h3>{detail(data.teacherRows.find(r=>r.teacher_id===p.id))}</article>)}</div></section></div>;
}
