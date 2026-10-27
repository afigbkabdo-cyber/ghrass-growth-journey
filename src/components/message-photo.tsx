import { Download } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
export interface MessageMedia { url: string; downloadUrl: string | null; kind: 'image' | 'video' }
export function MessagePhoto({url}:{url:string|null}) {
 const {t}=useI18n();
 if(!url) return null;
 return <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={t('صورة مرفقة')} className="mb-2 max-h-80 w-full rounded-xl object-contain" /></a>;
}
export function MessageMediaList({items}:{items:MessageMedia[]}) {
 const {t}=useI18n();
 if(!items.length) return null;
 return <div className={`mb-2 grid gap-1.5 ${items.length>1?'grid-cols-2':''}`}>{items.map((m,i)=>(
  <div key={i} className="relative">
   {m.kind==='video'
    ? <video src={m.url} controls playsInline preload="metadata" className="max-h-80 w-full rounded-xl bg-muted" />
    : <a href={m.url} target="_blank" rel="noreferrer"><img src={m.url} alt={t('صورة مرفقة')} className={`w-full rounded-xl ${items.length>1?'aspect-square object-cover':'max-h-80 object-contain'}`} /></a>}
   {m.downloadUrl && <a href={m.downloadUrl} aria-label={t('تنزيل')} className="absolute bottom-1.5 left-1.5 grid h-8 w-8 place-items-center rounded-full bg-card/90 text-foreground shadow-soft"><Download className="h-4 w-4" /></a>}
  </div>))}</div>;
}
