import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CalendarCheck, Users, Sprout } from "lucide-react";
import { SectionHeader, ToneBadge, ProgressBar, toneClasses } from "@/components/ghiras";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminDashboard } from "@/lib/dashboard.functions";
import { attendanceDate } from "@/lib/attendance";
import { recordedSummary, scopedKey } from "@/lib/dashboard";
import { useAppSession } from "@/lib/session";
import { DataStatus } from "@/components/data-status";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "التقارير — لوحة إدارة غراس" },
      {
        name: "description",
        content: "تقارير روضة غراس التشغيلية: حضور الأطفال والمعلمات، الأنشطة، ومؤشرات تطور المهارات.",
      },
      { property: "og:title", content: "التقارير — لوحة إدارة غراس" },
      { property: "og:description", content: "مؤشرات أسبوعية لأداء روضة غراس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminReportsPage,
});

function AdminReportsPage() {
  const { t, d, num } = useI18n();
  const { session } = useAppSession();
  const date = attendanceDate();
  const fetch = useServerFn(adminDashboard);
  const query = useQuery({ queryKey: scopedKey(["admin-dashboard"], session?.userId ?? null, date), queryFn: () => fetch({ data: { date } }), enabled: Boolean(session), refetchInterval: 30000 });
  if (!query.data) return <DataStatus loading={query.isPending} error={query.isError} />;
  const data = query.data;
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(`${data.weekStart}T12:00:00Z`);
    day.setUTCDate(day.getUTCDate() + i);
    return day.toISOString().slice(0, 10);
  }).filter(day => day <= date);
  const reportCards = [
    { title: "إجمالي الأطفال", value: data.totalChildren, tone: "orange" as const },
    { title: "الكادر التعليمي", value: data.teachersCount, tone: "blue" as const },
    { title: "الفصول", value: data.classes.length, tone: "pink" as const },
    { title: "الأنشطة", value: data.activitiesCount, tone: "green" as const },
    { title: "سجلات المتابعة", value: data.logsCount, tone: "yellow" as const },
  ];
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-growth p-5 text-primary-foreground shadow-soft">
        <p className="text-xs font-bold opacity-90">{t("تقارير السجلات الفعلية")}</p>
        <h2 className="mt-1 font-display text-xl font-extrabold">{t("أداء روضة غراس")}</h2>
        <p className="mt-1 text-xs opacity-90">{t("الفترة {start} — {end}", { start: d(data.weekStart), end: d(date) })}</p>
      </div>
      <section>
        <SectionHeader title={t("مؤشرات عامة")} icon={BarChart3} tone="orange" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {reportCards.map(c => <div key={c.title} className="rounded-2xl border border-border bg-card p-4 shadow-soft"><p className={cn("font-display text-2xl font-extrabold", toneClasses[c.tone].deep)}>{num(c.value)}</p><p className="mt-1 text-xs font-bold text-foreground">{t(c.title)}</p></div>)}
        </div>
      </section>
      <section>
        <SectionHeader title={t("حضور الأطفال — أسبوعيًا")} icon={CalendarCheck} tone="green" action={{ label: t("التفاصيل"), to: "/admin/attendance" }} />
        <div className="space-y-3 rounded-3xl border border-border bg-card p-4 shadow-soft">
          {days.map(day => {
            const summary = recordedSummary(data.childRows.filter(r => r.log_date === day), data.totalChildren);
            return <div key={day}><div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold"><span>{d(day)}</span><span className="text-muted-foreground">{summary.rate === null ? t("لم يُسجل") : t("حاضر {present} · غائب {absent}", { present: num(summary.present), absent: num(summary.absent) })} · {t("لم يُسجل {count}", { count: num(summary.unrecorded) })}</span></div>{summary.rate !== null && <ProgressBar value={summary.rate} tone="green" />}</div>;
          })}
        </div>
      </section>
      <section>
        <SectionHeader title={t("حضور المعلمات — أسبوعيًا")} icon={Users} tone="blue" action={{ label: t("التفاصيل"), to: "/admin/attendance" }} />
        <div className="space-y-3">
          {days.map(day => {
            const present = data.teacherRows.filter(r => r.log_date === day && r.check_in).length;
            return <div key={day} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"><span className="text-sm font-bold">{d(day)}</span><span className="flex flex-wrap gap-1.5"><ToneBadge tone="green">{t("حاضرات {count}", { count: num(present) })}</ToneBadge><ToneBadge tone="blue">{t("لم يُسجل {count}", { count: num(Math.max(0, data.teachersCount - present)) })}</ToneBadge></span></div>;
          })}
        </div>
      </section>
      <section><SectionHeader title={t("مؤشرات تطور المهارات")} icon={Sprout} tone="pink" /><p className="text-sm text-muted-foreground">{t("لا تتوفر قياسات مسجلة لتطور المهارات.")}</p></section>
      <DataStatus error={query.isError} />
    </div>
  );
}
