import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ListChecks, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, EmptyState } from "@/components/ghiras";
import { useI18n } from "@/lib/i18n";
import { listSchedule, markScheduleDone, myClasses } from "@/lib/kg.functions";

export const Route = createFileRoute("/teacher/schedule")({
  head: () => ({
    meta: [
      { title: "الجدول اليومي — غراس" },
      { name: "description", content: "جدول يوم الفصل وتعليم الفقرات المنجزة ليراها ولي الأمر." },
      { property: "og:title", content: "الجدول اليومي — غراس" },
      { property: "og:description", content: "جدول يوم الفصل في روضة غراس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherSchedulePage,
});

function TeacherSchedulePage() {
  const { t, n } = useI18n();
  const qc = useQueryClient();
  const fetchClasses = useServerFn(myClasses);
  const fetchSchedule = useServerFn(listSchedule);
  const mark = useServerFn(markScheduleDone);
  const [classId, setClassId] = useState<string | null>(null);

  const classes = useQuery({ queryKey: ["my-classes"], queryFn: () => fetchClasses({}) });
  const active = classId ?? (classes.data ?? [])[0]?.id ?? null;

  const schedule = useQuery({
    queryKey: ["schedule", active],
    queryFn: () => fetchSchedule({ data: { classId: active! } }),
    enabled: Boolean(active),
  });

  const toggle = useMutation({
    mutationFn: (v: { itemId: string; done: boolean }) => mark({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["schedule", active] }),
    onError: (e: Error) => toast.error(e.message || "تعذر التحديث"),
  });

  return (
    <PageContainer>
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-green-soft">
          <ListChecks className="h-5.5 w-5.5 text-brand-green-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">{t("الجدول اليومي")}</h1>
          <p className="text-xs text-muted-foreground">{t("علّمي ما تم إنجازه اليوم")}</p>
        </div>
      </header>

      {(classes.data ?? []).length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
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
              {n(c.name, c.nameEn)}
            </button>
          ))}
        </div>
      )}

      {schedule.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("جارٍ التحميل…")}</p>
      ) : (schedule.data ?? []).length === 0 ? (
        <EmptyState title={t("لا يوجد جدول")} message={t("الإدارة تضيف فقرات الجدول اليومي للفصل.")} />
      ) : (
        <div className="space-y-2.5">
          {(schedule.data ?? []).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle.mutate({ itemId: s.id, done: !s.done })}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-start shadow-soft transition-shadow hover:shadow-md"
            >
              {s.done ? (
                <CheckCircle2 className="h-5.5 w-5.5 shrink-0 text-brand-green-deep" strokeWidth={2.2} />
              ) : (
                <Circle className="h-5.5 w-5.5 shrink-0 text-muted-foreground" strokeWidth={2.2} />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{n(s.title, s.titleEn)}</p>
                {s.description && <p className="truncate text-[11px] text-muted-foreground">{n(s.description, s.descriptionEn)}</p>}
              </div>
              {s.atTime && (
                <span className="shrink-0 text-[11px] font-bold text-muted-foreground">{s.atTime.slice(0, 5)}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
