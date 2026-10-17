import { useI18n } from '@/lib/i18n';
export function MessagePhoto({url}:{url:string|null}) {
 const {t}=useI18n();
 if(!url) return null;
 return <a href={url} target="_blank" rel="noreferrer"><img src={url} alt={t('صورة مرفقة')} className="mb-2 max-h-80 w-full rounded-xl object-contain" /></a>;
}
