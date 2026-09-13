import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Blocks, Plus, X, Eye, EyeOff, ImagePlus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, ToneBadge, EmptyState } from "@/components/ghiras";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteActivity,
  getCurrentValue,
  listActivities,
  myClasses,
  saveActivity,
  setActivityPublished,
} from "@/lib/kg.functions";

export const Route = createFileRoute("/teacher/activities")({
  head: () => ({
    meta: [
      { title: "أنشطة فصلي — غراس" },
      { name: "description", content: "إضافة الأنشطة اليومية مع صورها وربطها بقيمة الأسبوع ونشرها لأولياء الأمور." },
      { property: "og:title", content: "أنشطة فصلي — غراس" },
      { property: "og:description", content: "إدارة الأنشطة التعليمية في روضة غراس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherActivitiesPage,
});

const field =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:shadow-soft";

function TeacherActivitiesPage() {
  const { t, n } = useI18n();
  const qc = useQueryClient();
  const fetchActivities = useServerFn(listActivities);
  const fetchClasses = useServerFn(myClasses);
  const fetchValue = useServerFn(getCurrentValue);
  const save = useServerFn(saveActivity);
  const publish = useServerFn(setActivityPublished);
  const remove = useServerFn(deleteActivity);

  const activities = useQuery({ queryKey: ["activities"], queryFn: () => fetchActivities({}) });
  const classes = useQuery({ queryKey: ["my-classes"], queryFn: () => fetchClasses({}) });
  const value = useQuery({ queryKey: ["current-value"], queryFn: () => fetchValue({}) });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [classId, setClassId] = useState("");
  const [linked, setLinked] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const activeClass = classId || (classes.data ?? [])[0]?.id || "";

  const create = useMutation({
    mutationFn: async () => {
      setUploading(true);
      try {
        const paths: string[] = [];
        for (const file of files) {
          const ext = file.name.split(".").pop() ?? "jpg";
          const path = `${activeClass}/${crypto.randomUUID()}.${ext}`;
          const { error } = await supabase.storage.from("activity-photos").upload(path, file);
          if (error) throw new Error(error.message);
          paths.push(path);
        }
        return save({
          data: {
            title: title.trim(),
            description: description.trim() || null,
            activityDate: new Date().toISOString().slice(0, 10),
            activityTime: time || null,
            classId: activeClass,
            linkedToValue: linked && Boolean(value.data),
            valueId: linked ? (value.data?.id ?? null) : null,
            published: false,
            photoPaths: paths,
          },
        });
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      toast.success(t("تم حفظ النشاط كمسودة"));
      setTitle("");
      setDescription("");
      setTime("");
      setFiles([]);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["activities"] });
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر حفظ النشاط")),
  });

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

  return (
    <PageContainer>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-orange-soft">
            <Blocks className="h-5.5 w-5.5 text-brand-orange-deep" strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground">{t("أنشطة فصلي")}</h1>
            <p className="text-xs text-muted-foreground">
              {value.data ? t("قيمة الأسبوع: {name}", { name: n(value.data.name, value.data.nameEn) }) : t("لا توجد قيمة معتمدة حاليًا")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft"
          aria-label={t("إضافة نشاط")}
        >
          {open ? <X className="h-5 w-5" strokeWidth={2.4} /> : <Plus className="h-5 w-5" strokeWidth={2.4} />}
        </button>
      </header>

      {open && (
        <section className="mb-5 space-y-2.5 rounded-3xl border border-brand-orange-soft bg-card p-4 shadow-soft">
          <h2 className="text-sm font-extrabold text-foreground">{t("نشاط جديد")}</h2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("عنوان النشاط")} aria-label={t("عنوان النشاط")} className={field} />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={t("وصف مختصر لما فعله الأطفال…")}
            aria-label={t("وصف النشاط")}
            className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm outline-none"
          />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label={t("وقت النشاط")} className={field} />
          {(classes.data ?? []).length > 1 && (
            <select value={activeClass} onChange={(e) => setClassId(e.target.value)} aria-label={t("الفصل")} className={field}>
              {(classes.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <label className="flex items-center justify-between rounded-2xl border border-border bg-background p-3.5">
            <span className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Sparkles className="h-4 w-4 text-brand-green-deep" />
              {t("مرتبط بقيمة الأسبوع")} {value.data ? `(${n(value.data.name, value.data.nameEn)})` : ""}
            </span>
            <input
              type="checkbox"
              checked={linked && Boolean(value.data)}
              disabled={!value.data}
              onChange={(e) => setLinked(e.target.checked)}
              className="h-5 w-5 accent-[var(--brand-green,green)]"
              aria-label={t("ربط النشاط بقيمة الأسبوع")}
            />
          </label>

          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-border bg-background p-3.5 text-xs font-bold text-muted-foreground">
            <ImagePlus className="h-4.5 w-4.5" />
            {files.length > 0 ? t("{count} صورة مختارة", { count: files.length }) : t("إضافة صور النشاط")}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
          </label>

          <button
            type="button"
            onClick={() => {
              if (!title.trim()) {
                toast.error(t("اكتبي عنوان النشاط"));
                return;
              }
              if (!activeClass) {
                toast.error(t("لا يوجد فصل مرتبط بحسابك"));
                return;
              }
              create.mutate();
            }}
            disabled={create.isPending || uploading}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-50"
          >
            {create.isPending || uploading ? t("جارٍ الحفظ…") : t("حفظ كمسودة")}
          </button>
          <p className="rounded-2xl bg-muted p-3 text-[11px] leading-relaxed text-muted-foreground">
            {t("القيمة والحديث ومصدرهما معتمدان من الإدارة ولا يمكن تعديلهما من واجهة المعلمة.")}
          </p>
        </section>
      )}

      {activities.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("جارٍ التحميل…")}</p>
      ) : (activities.data ?? []).length === 0 ? (
        <EmptyState title={t("لا توجد أنشطة")} message={t("أضيفي أول نشاط لفصلك.")} />
      ) : (
        <div className="space-y-3">
          {(activities.data ?? []).map((a) => (
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
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => togglePublish.mutate({ id: a.id, published: !a.published })}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-foreground hover:bg-muted"
                  >
                    {a.published ? (
                      <>
                        <Eye className="h-3.5 w-3.5 text-brand-green-deep" strokeWidth={2.2} /> {t("مرئي لأولياء الأمور")}
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" strokeWidth={2.2} /> {t("غير منشور")}
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
    </PageContainer>
  );
}
