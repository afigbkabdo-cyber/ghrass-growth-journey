import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Bell, Check, ChevronLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { AppShell, parentNav } from '@/components/shells';
import { PageContainer, EmptyState } from '@/components/ghiras';
import { Button } from '@/components/ui/button';
import { RoleGuard } from '@/components/role-guard';
import { useParentNotifications } from '@/hooks/use-parent-notifications';
import { markParentNotificationRead } from '@/lib/notifications.functions';
import { notificationTarget } from '@/lib/notifications';
import { useI18n } from '@/lib/i18n';

export const Route = createFileRoute('/notifications')({
  head: () => ({ meta: [{ title: 'إشعارات طفلك — غراس' }, { name: 'description', content: 'إشعارات ولي الأمر الخاصة بحضور الطفل ومتابعته وأنشطته ورسائل الإدارة داخل غراس.' }, { property: 'og:title', content: 'إشعارات طفلك — غراس' }, { property: 'og:description', content: 'تحديثات الطفل الخاصة داخل حساب ولي الأمر.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: () => <RoleGuard allow={['parent']}><NotificationsPage /></RoleGuard>,
});

function NotificationsPage() {
  const { t, dt, lang, num } = useI18n();
  const query = useParentNotifications();
  const mark = useServerFn(markParentNotificationRead);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const read = useMutation({ mutationFn: (id: string) => mark({ data: { id } }), onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['parent-notifications'] }); }, onError: () => toast.error(t('تعذر تحديد الإشعار كمقروء')) });
  return <AppShell navItems={parentNav} roleLabel={t('ولي أمر')} tone="orange"><PageContainer>
    <header className="mb-4 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-yellow-soft"><Bell className="h-5.5 w-5.5 text-brand-yellow-deep" /></span><div className="min-w-0 flex-1"><h1 className="font-display text-2xl font-extrabold text-foreground">{t('الإشعارات')}</h1><p className="text-xs text-muted-foreground">{query.isSuccess && (query.unread ? t('{count} إشعار غير مقروء', { count: num(query.unread) }) : t('كل الإشعارات مقروءة'))}</p></div><Button size="icon" variant="ghost" aria-label={t('تحديث الإشعارات')} disabled={query.isFetching} onClick={() => query.refetch()}><RefreshCw /></Button></header>
    {query.isPending && <p className="text-sm text-muted-foreground">{t('جارٍ التحميل…')}</p>}
    {query.isError && <p role="alert" className="text-sm text-destructive">{t('تعذر تحميل الإشعارات')}</p>}
    {query.isSuccess && !query.data.length && <EmptyState title={t('لا توجد إشعارات')} message={t('لا توجد تحديثات جديدة مسجلة.')} />}
    <div className="space-y-2">{query.data?.map(item => <article key={item.id} className={`flex items-start gap-3 rounded-2xl border p-4 shadow-soft ${!item.read_at ? 'border-primary/30 bg-card' : 'border-border bg-card/60'}`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-yellow-soft"><Bell className="h-5 w-5 text-brand-yellow-deep" /></span>
      <div className="min-w-0 flex-1"><h2 className={`text-sm ${!item.read_at ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{lang === 'en' ? item.title_en : item.title}</h2><p dir="auto" className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">{lang === 'en' ? item.body_en : item.body}</p><p className="mt-1 text-[10px] text-muted-foreground">{dt(item.created_at)}</p><div className="mt-2 flex flex-wrap gap-2"><Button variant="ghost" size="sm" onClick={async () => { if (!item.read_at) { try { await read.mutateAsync(item.id); } catch { return; } } await navigate(notificationTarget(item)); }}>{t('فتح الإشعار')}<ChevronLeft className="h-4 w-4" /></Button>{!item.read_at && <Button variant="outline" size="sm" disabled={read.isPending} onClick={() => read.mutate(item.id)}><Check className="h-4 w-4" />{t('تحديد كمقروء')}</Button>}</div></div>
      {!item.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-pink" aria-label={t('غير مقروء')} />}
    </article>)}</div>
  </PageContainer></AppShell>;
}