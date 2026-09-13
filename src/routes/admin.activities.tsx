import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Blocks, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader, ToneBadge, EmptyState } from "@/components/ghiras";
import { deleteActivity, listActivities, setActivityPublished } from "@/lib/kg.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/activities")({
  head: () => ({
    meta: [
      { title: "الأنشطة — لوحة إدارة غراس" },
      { name: "description", content: "متابعة أنشطة الفصول وصورها والتحكم في نشرها لأولياء الأمور." },
      { property: "og:title", content: "الأنشطة — لوحة إدارة غراس" },
      { property: "og:description", content: "متابعة أنشطة فصول روضة غراس والتحكم في نشرها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminActivitiesPage,
});

function AdminActivitiesPage() {
  const { t, d, n } = useI18n();
  const qc = useQueryClient();
  const fetchActivities = useServerFn(listActivities);
  const publish = useServerFn(setActivityPublished);
  const remove = useServerFn(deleteActivity);

  const activities = useQuery({ queryKey: ["activities"], queryFn: () => fetchActivities({}) });

  const togglePublish = useMutation({
    mutationFn: (v: { id: string; published: boolean }) => publish({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activities"] }),
    onError: (e: Error) => toast.error(e.message || t("تعذر التحديث")),
  });

  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success(t("تم حذف النشاط"));
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر الحذف")),
  });

  const list = activities.data ?? [];

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
        <h2 className="font-display text-lg font-extrabold text-foreground">{t("أنشطة الفصول")}</h2>
        <p className="text-xs text-muted-foreground">
          {t("{published} منشور من {total} نشاط", { published: list.filter((a) => a.published).length, total: list.length })}
        </p>
      </div>

      <SectionHeader title={t("كل الأنشطة")} icon={Blocks} tone="blue" />
      {activities.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("جارٍ التحميل…")}</p>
      ) : list.length === 0 ? (
        <EmptyState title={t("لا توجد أنشطة")} message={t("ستظهر أنشطة المعلمات هنا.")} />
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <article key={a.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              {a.photos.length > 0 && (
                <div className={a.photos.length === 1 ? "" : "grid grid-cols-2 gap-0.5"}>
                  {a.photos.slice(0, 4).map((src) => (
                    <img key={src} src={src} alt={t("صورة من نشاط {title}", { title: n(a.title, a.titleEn) })} loading="lazy" className="h-32 w-full object-cover" />
                  ))}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-sm font-extrabold text-foreground">{n(a.title, a.titleEn)}</h3>
                  <ToneBadge tone={a.published ? "green" : "yellow"}>{a.published ? t("منشور") : t("مسودة")}</ToneBadge>
                </div>
                {a.description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{n(a.description, a.descriptionEn)}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {a.className && <ToneBadge tone="blue">{n(a.className, a.classNameEn)}</ToneBadge>}
                  {a.linkedToValue && a.valueName && <ToneBadge tone="green">{t("مرتبط بقيمة {value}", { value: n(a.valueName, a.valueNameEn) })}</ToneBadge>}
                  <span className="text-[11px] font-bold text-muted-foreground">
                    {d(a.activityDate)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => togglePublish.mutate({ id: a.id, published: !a.published })}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-foreground hover:bg-muted"
                  >
                    {a.published ? (
                      <>
                        <Eye className="h-3.5 w-3.5 text-brand-green-deep" /> {t("إيقاف النشر")}
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" /> {t("نشر لأولياء الأمور")}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => del.mutate(a.id)}
                    aria-label={t("حذف النشاط")}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-destructive/25 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
