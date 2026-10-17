import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { myClasses, myClassChildren } from "@/lib/kg.functions";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Check, Clock, X, Save } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, Avatar, SuccessNote, toneClasses } from "@/components/ghiras";
import type { AttendanceStatus } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/teacher/attendance")({
  head: () => ({
    meta: [
      { title: "تسجيل الحضور — غراس" },
      { name: "description", content: "تسجيل حضور وغياب أطفال الفصل بضغطة واحدة، ثم حفظ السجل اليومي." },
      { property: "og:title", content: "تسجيل الحضور — غراس" },
      { property: "og:description", content: "سجل حضور أطفال الفصل اليومي في روضة غراس." },
    ],
  }),
  component: AttendancePage,
});

const options: { key: AttendanceStatus; label: string; icon: typeof Check; tone: "green" | "yellow" | "pink" }[] = [
  { key: "present", label: "حاضر", icon: Check, tone: "green" },
  { key: "late", label: "متأخر", icon: Clock, tone: "yellow" },
  { key: "absent", label: "غائب", icon: X, tone: "pink" },
];

function AttendancePage() {
  const { t, n } = useI18n();
  const fetchClasses = useServerFn(myClasses);
  const fetchChildren = useServerFn(myClassChildren);
  const classesQuery = useQuery({ queryKey: ["teacher-classes"], queryFn: () => fetchClasses({}) });
  const childrenQuery = useQuery({ queryKey: ["teacher-children"], queryFn: () => fetchChildren({}) });
  const classes = classesQuery.data ?? [];
  const classIds = new Set(classes.map((c) => c.id));
  // أطفال فصول المعلمة المعيّنة فقط (من قاعدة البيانات)
  const teacherChildren = (childrenQuery.data ?? []).filter((c) => c.classId && classIds.has(c.classId));
  const classTitle = classes.map((c) => n(c.name, c.nameEn)).join("، ");
  const loading = classesQuery.isLoading || childrenQuery.isLoading;
  const noClass = !loading && classesQuery.isSuccess && classes.length === 0;
  const [state, setState] = useState<Record<string, AttendanceStatus>>({});
  const childKey = teacherChildren.map((c) => c.id).join(",");
  useEffect(() => {
    setState((s) => {
      const next = { ...s };
      for (const c of teacherChildren) if (!next[c.id]) next[c.id] = "present";
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childKey]);
  const [saved, setSaved] = useState(false);

  const counts = options.map((o) => ({
    ...o,
    count: teacherChildren.filter((c) => state[c.id] === o.key).length,
  }));

  return (
    <PageContainer>
      <header className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-green-soft">
          <CalendarCheck className="h-5.5 w-5.5 text-brand-green-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">{t("تسجيل الحضور")}</h1>
          <p className="text-xs text-muted-foreground">{classTitle ? `${classTitle} — ` : ""}{t("اليوم")}</p>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {counts.map((c) => {
          const tone = toneClasses[c.tone];
          return (
            <div key={c.key} className={cn("rounded-2xl p-3 text-center", tone.soft)}>
              <p className={cn("font-display text-xl font-extrabold", tone.deep)}>{c.count}</p>
              <p className="text-[11px] font-bold text-muted-foreground">{t(c.label)}</p>
            </div>
          );
        })}
      </div>

      {saved && <SuccessNote>{t("تم حفظ حضور اليوم بنجاح وإشعار أولياء الأمور.")}</SuccessNote>}

      {loading && <p className="mt-4 text-center text-sm text-muted-foreground">{t("جارٍ التحميل…")}</p>}
      {noClass && (
        <p className="mt-4 rounded-2xl border border-border bg-card p-4 text-center text-sm font-bold text-muted-foreground">
          {t("لم يتم تعيين فصل لكِ بعد. يرجى التواصل مع الإدارة.")}
        </p>
      )}
      {!loading && !noClass && teacherChildren.length === 0 && (
        <p className="mt-4 rounded-2xl border border-border bg-card p-4 text-center text-sm font-bold text-muted-foreground">
          {t("لا يوجد أطفال مسجلون في فصلك بعد.")}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {teacherChildren.map((child) => (
          <div
            key={child.id}
            className="rounded-2xl border border-border bg-card p-3.5 shadow-soft"
          >
            <div className="flex items-center gap-3">
              <Avatar name={n(child.name, child.nameEn)} tone="blue" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-foreground">{n(child.name, child.nameEn)}</p>
                {child.className && (
                  <p className="text-[11px] text-muted-foreground">{n(child.className, child.classNameEn)}</p>
                )}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {options.map((o) => {
                const active = state[child.id] === o.key;
                const tone = toneClasses[o.tone];
                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => {
                      setState((s) => ({ ...s, [child.id]: o.key }));
                      setSaved(false);
                    }}
                    aria-pressed={active}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all",
                      active
                        ? cn(tone.soft, tone.deep, "border-transparent")
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <o.icon className="h-4 w-4" strokeWidth={2.4} />
                    {t(o.label)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {teacherChildren.length > 0 && (
      <button
        type="button"
        onClick={() => {
          setSaved(true);
          toast.success(t("تم حفظ سجل الحضور لهذا اليوم"));
        }}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
      >
        <Save className="h-4.5 w-4.5" strokeWidth={2.4} />
        {t("حفظ سجل اليوم")}
      </button>
      )}
    </PageContainer>
  );
}
