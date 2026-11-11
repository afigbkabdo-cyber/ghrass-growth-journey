import { Download } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
export interface MessageMedia { path?: string; url: string; downloadUrl: string | null; kind: 'image' | 'video' }
// يحتفظ بأول رابط مؤقت لكل ملف (صالح ساعة) حتى لا يُعاد تحميل الصورة أو يتوقف الفيديو عند التحديث التلقائي.
const linkCache = new Map<string, { media: MessageMedia; at: number }>();
const REUSE_MS = 45 * 60 * 1000;
export function stableMedia(m: MessageMedia, now = Date.now()): MessageMedia {
 if (!m.path) return m;
 const hit = linkCache.get(m.path);
 if (hit && now - hit.at < REUSE_MS) return hit.media;
 linkCache.set(m.path, { media: m, at: now });
 return m;
}
export function MessagePhoto({url}:{url:string|null}) {
 const {t}=useI18n();
 if(!url) return null;
 return <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={t('صورة مرفقة')} className="mb-2 max-h-80 w-full rounded-xl object-contain" /></a>;
}
export function MessageMediaList({items, unavailable = 0}:{items:MessageMedia[]; unavailable?: number}) {
 const {t}=useI18n();
 const [failedVideos, setFailedVideos] = useState<string[]>([]);
 if(!items.length && !unavailable) return null;
 return <div className="mb-2 grid gap-2">{items.map(stableMedia).map((m,i)=>(
  <div key={m.path ?? i} className="relative">
   {m.kind==='video'
    ? <><video src={m.url} controls playsInline preload="metadata" onError={() => setFailedVideos(current => current.includes(m.url) ? current : [...current, m.url])} className="max-h-80 w-full rounded-xl bg-muted" />{failedVideos.includes(m.url) && <p role="alert" className="mt-1 text-xs text-destructive">{t('تعذر تشغيل الفيديو في هذا المتصفح. يمكنك تنزيله.')}</p>}</>
    : <a href={m.url} target="_blank" rel="noreferrer" aria-label={t('فتح الصورة')}><img src={m.url} alt={t('صورة مرفقة')} className="max-h-80 w-full rounded-xl object-contain" /></a>}
   {m.downloadUrl && <Button asChild size="sm" variant="outline" className="mt-1"><a href={m.downloadUrl} download aria-label={t('تنزيل')}><Download className="h-4 w-4" />{t('تنزيل')}</a></Button>}
  </div>))}{unavailable > 0 && <p role="alert" className="text-xs text-destructive">{t('تعذر تحميل بعض المرفقات. حاول تحديث المحادثة.')}</p>}</div>;
}
