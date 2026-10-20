import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { listParentNotifications } from '@/lib/notifications.functions';
import { useAppSession } from '@/lib/session';

export function useParentNotifications() {
  const { session } = useAppSession();
  const fetch = useServerFn(listParentNotifications);
  const query = useQuery({ queryKey: ['parent-notifications', session?.userId], queryFn: () => fetch({}), enabled: session?.role === 'parent', refetchInterval: 15000 });
  return { ...query, unread: query.data?.filter(item => !item.read_at).length ?? 0 };
}