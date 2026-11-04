import { useI18n } from '@/lib/i18n';
import type { ActivityRow } from '@/lib/kg.functions';
import { ToneBadge } from '@/components/ghiras';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function ActivityDetails({ activity, onClose }: { activity: ActivityRow | null; onClose: () => void }) {
  const { t, n, d, lang } = useI18n();
  return (
    <Dialog open={Boolean(activity)} onOpenChange={(open) => { if (!open) onClose(); }}>
      {activity && (
        <DialogContent dir={lang === 'ar' ? 'rtl' : 'ltr'} className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg">
          <DialogTitle className="pe-7 break-words leading-relaxed tracking-normal">{n(activity.title, activity.titleEn)}</DialogTitle>
          <DialogDescription className="whitespace-pre-wrap break-words text-start leading-relaxed">
            {n(activity.description, activity.descriptionEn) || t('لا يوجد شرح إضافي')}
          </DialogDescription>
          <p className="text-xs text-muted-foreground">{d(activity.activityDate)}{activity.activityTime ? ` • ${activity.activityTime.slice(0, 5)}` : ''}</p>
          <div className="flex flex-wrap gap-2">
            {activity.classNames.map((c, index) => <ToneBadge key={index} tone="blue">{n(c.name, c.nameEn)}</ToneBadge>)}
            {activity.linkedToValue && activity.valueName && <ToneBadge tone="green">{t('مرتبط بقيمة {value}', { value: n(activity.valueName, activity.valueNameEn) })}</ToneBadge>}
          </div>
          <div className="space-y-3">
            {activity.photos.map((src, index) => <img key={`${index}-${src}`} src={src} alt={t('صورة من نشاط {title}', { title: n(activity.title, activity.titleEn) })} className="h-auto max-h-[65dvh] w-full object-contain" />)}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}