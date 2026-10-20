import { Link } from '@tanstack/react-router';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParentNotifications } from '@/hooks/use-parent-notifications';
import { useI18n } from '@/lib/i18n';

export function ParentNotificationBell() {
  const { unread, isError } = useParentNotifications();
  const { t, num } = useI18n();
  return <Button asChild size="icon" variant="outline" className="relative h-10 w-10 rounded-xl">
    <Link to="/notifications" aria-label={isError ? t('تعذر تحميل الإشعارات') : unread ? t('{count} إشعار غير مقروء', { count: num(unread) }) : t('الإشعارات')}>
      <Bell className="h-4.5 w-4.5 text-muted-foreground" />
      {unread > 0 && <span className="absolute -top-1 -end-1 min-w-5 rounded-full bg-brand-pink px-1 text-center text-[10px] font-bold text-foreground">{num(unread)}</span>}
    </Link>
  </Button>;
}