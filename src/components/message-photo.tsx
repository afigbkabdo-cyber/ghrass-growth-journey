import { Download } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
export interface MessageMedia { url: string; downloadUrl: string | null; kind: 'image' | 'video' }
export function MessagePhoto({url}:{url:string|null}) {
 const {t}=useI18n();
 if(!url) return null;
 return <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={t('صورة مرفقة')} className="mb-2 max-h-80 w-full rounded-xl object-contain" /></a>;
}
export function MessageMediaList({items, unavailable = 0}:{items:MessageMedia[]; unavailable?: number}) {
 const {t}=useI18n();
 if(!items.length && !unavailable) return null;
 return <div className="mb-2 grid gap-2">{items.map((m,i)=>(
  <div key={i} className="relative">
   {m.kind==='video'
    ? <video src={m.url} controls playsInline preload="metadata" className="max-h-80 w-full rounded-xl bg-muted" />
    : <a href={m.url} target="_blank" rel="noreferrer" aria-label={t('فتح الصورة')}><img src={m.url} alt={t('صورة مرفقة')} className="max-h-80 w-full rounded-xl object-contain" /></a>}
   {m.downloadUrl && <Button asChild size="sm" variant="outline" className="mt-1"><a href={m.downloadUrl} download aria-label={t('تنزيل')}><Download className="h-4 w-4" />{t('تنزيل')}</a></Button>}
  </div>))}{unavailable > 0 && <p role="alert" className="text-xs text-destructive">{t('تعذر تحميل بعض المرفقات. حاول تحديث المحادثة.')}</p>}</div>;
}
