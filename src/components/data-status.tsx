import { useI18n } from '@/lib/i18n';
export function DataStatus({ loading, error, empty }: { loading?: boolean; error?: boolean; empty?: boolean }) {
  const { t } = useI18n();
  if (!loading && !error && !empty) return null;
  return <p role={error ? 'alert' : 'status'} className="py-3 text-sm text-muted-foreground">{t(error ? 'تعذر تحميل البيانات. حاول مرة أخرى.' : loading ? 'جارٍ التحميل…' : 'لا تتوفر بيانات مسجلة.')}</p>;
}