import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ListChecks, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader, EmptyState } from "@/components/ghiras";
import { listClasses } from "@/lib/directory.functions";
import { deleteScheduleItem, listSchedule, saveScheduleItem } from "@/lib/kg.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/schedule")({
  head: () => ({
    meta: [
      { title: "الجدول اليومي — لوحة إدارة غراس" },
      { name: "description", content: "إعداد فقرات الجدول اليومي لكل فصل ومتابعة ما أنجزته المعلمات." },
      { property: "og:title", content: "الجدول اليومي — لوحة إدارة غراس" },
      { property: "og:description", content: "إعداد الجدول اليومي لفصول روضة غراس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminSchedulePage,
});

const field =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:shadow-soft";

function AdminSchedulePage() {
  const { t, time } = useI18n();
  const qc = useQueryClient();
  const fetchClasses = useServerFn(listClasses);
  const fetchSchedule = useServerFn(listSchedule);
  const save = useServerFn(saveScheduleItem);
  const remove = useServerFn(deleteScheduleItem);

  const classes = useQuery({ queryKey: ["admin-classes"], queryFn: () => fetchClasses({}) });
  const [classId, setClassId] = useState<string | null>(null);
  const active = classId ?? (classes.data ?? [])[0]?.id ?? null;

  const [title, setTitle] = useState("");
  const [atTime, setAtTime] = useState("");

  const schedule = useQuery({
    queryKey: ["schedule", active],
    queryFn: () => fetchSchedule({ data: { classId: active! } }),
    enabled: Boolean(active),
  });

  const add = useMutation({
    mutationFn: () =>
      save({
        data: {
          classId: active!,
          title: title.trim(),
          atTime: atTime || null,
          orderIndex: (schedule.data ?? []).length,
        },
      }),
    onSuccess: () => {
      setTitle("");
      setAtTime("");
      toast.success(t("تمت إضافة الفقرة"));
      qc.invalidateQueries({ queryKey: ["schedule", active] });
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر الحفظ")),
  });

  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success(t("تم حذف الفقرة"));
      qc.invalidateQueries({ queryKey: ["schedule", active] });
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر الحذف")),
  });

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
        <h2 className="font-display text-lg font-extrabold text-foreground">{t("الجدول اليومي")}</h2>
        <p className="text-xs text-muted-foreground">{t("فقرات يوم الفصل — تراها المعلمة وولي الأمر")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(classes.data ?? []).map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setClassId(c.id)}
            aria-pressed={c.id === active}
            className={`rounded-full border px-4 py-1.5 text-xs font-bold ${
              c.id === active
                ? "border-transparent bg-brand-blue-soft text-brand-blue-deep"
                : "border-border text-muted-foreground"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <section className="flex flex-wrap items-end gap-2 rounded-3xl border border-border bg-card p-4 shadow-soft">
        <label className="min-w-40 flex-1 text-[11px] font-bold text-muted-foreground">
          {t("عنوان الفقرة")}
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("مثال: الحلقة الصباحية")} className={field} />
        </label>
        <label className="text-[11px] font-bold text-muted-foreground">
          {t("الوقت")}
          <input type="time" value={atTime} onChange={(e) => setAtTime(e.target.value)} className={field} />
        </label>
        <button
          type="button"
          disabled={add.isPending || title.trim().length < 2 || !active}
          onClick={() => add.mutate()}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {t("إضافة")}
        </button>
      </section>

      <SectionHeader title={t("فقرات اليوم")} icon={ListChecks} tone="green" />
      {schedule.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("جارٍ التحميل…")}</p>
      ) : (schedule.data ?? []).length === 0 ? (
        <EmptyState title={t("لا توجد فقرات")} message={t("أضف فقرات الجدول لهذا الفصل.")} />
      ) : (
        <div className="space-y-2.5">
          {(schedule.data ?? []).map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
              {s.done ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-green-deep" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{n(s.title, s.titleEn)}</p>
                <p className="text-[11px] text-muted-foreground">
                  {s.atTime ? time(s.atTime.slice(0, 5)) : t("بدون وقت")} • {s.done ? t("أُنجزت اليوم") : t("لم تُنجز بعد")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => del.mutate(s.id)}
                aria-label={t("حذف الفقرة")}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-destructive/25 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
