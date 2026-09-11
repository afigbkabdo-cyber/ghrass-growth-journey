import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, TrendingUp } from "lucide-react";
import { ProgressBar, SectionHeader, StatCard, ToneBadge } from "@/components/ghiras";
import { adminStats, classes, stageLabels } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/attendance")({
  head: () => ({
    meta: [
      { title: "الحضور — لوحة إدارة غراس" },
      { name: "description", content: "متابعة حضور جميع فصول روضة غراس ونِسب الحضور الأسبوعية." },
      { property: "og:title", content: "الحضور — لوحة إدارة غراس" },
      { property: "og:description", content: "نِسب الحضور اليومية والأسبوعية لكل فصل." },
    ],
  }),
  component: AdminAttendance,
});

const perClass = [
  { id: "cl1", present: 7, late: 0, absent: 1 },
  { id: "cl2", present: 9, late: 1, absent: 0 },
  { id: "cl3", present: 8, late: 0, absent: 2 },
];

const week = [
  { day: "الأحد", rate: 92 },
  { day: "الاثنين", rate: 88 },
  { day: "الثلاثاء", rate: 95 },
  { day: "الأربعاء", rate: 90 },
  { day: "الخميس", rate: 86 },
];

function AdminAttendance() {
  const { t, n } = useI18n();
  return (
    <div className="space-y-6">
      <SectionHeader title={t("حضور اليوم")} subtitle={t("الأحد ١٢ محرم ١٤٤٨هـ")} icon={CalendarCheck} tone="green" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={CalendarCheck} value={adminStats.presentToday} label={t("حاضرون")} tone="green" />
        <StatCard icon={CalendarCheck} value={adminStats.lateToday} label={t("متأخرون")} tone="yellow" />
        <StatCard icon={CalendarCheck} value={adminStats.absentToday} label={t("غائبون")} tone="pink" />
        <StatCard
          icon={TrendingUp}
          value={`${Math.round((adminStats.presentToday / adminStats.totalChildren) * 100)}%`}
          label={t("نسبة الحضور")}
          tone="blue"
        />
      </div>

      <section>
        <SectionHeader title={t("حسب الفصل")} icon={CalendarCheck} tone="blue" />
        <div className="space-y-3">
          {classes.map((c) => {
            const row = perClass.find((p) => p.id === c.id) ?? { present: 0, late: 0, absent: 0 };
            const total = row.present + row.late + row.absent || 1;
            const rate = Math.round(((row.present + row.late) / total) * 100);
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">{n(c.name)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {t(stageLabels[c.stage])} — {n(c.teacher)}
                    </p>
                  </div>
                  <ToneBadge tone={rate >= 90 ? "green" : "yellow"}>{rate}%</ToneBadge>
                </div>
                <ProgressBar value={rate} tone={c.tone} className="mt-3" />
                <div className="mt-2 flex gap-3 text-[11px] font-bold text-muted-foreground">
                  <span className="text-brand-green-deep">{t("حاضر {count}", { count: row.present })}</span>
                  <span className="text-brand-yellow-deep">{t("متأخر {count}", { count: row.late })}</span>
                  <span className="text-brand-pink-deep">{t("غائب {count}", { count: row.absent })}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeader title={t("الأسبوع الحالي")} subtitle={t("نسبة الحضور العامة")} icon={TrendingUp} tone="orange" />
        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
          <div className="flex h-40 items-end justify-between gap-3">
            {week.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground">{d.rate}%</span>
                <div
                  className="w-full rounded-t-xl bg-brand-orange transition-all duration-700"
                  style={{ height: `${d.rate}%` }}
                />
                <span className="text-[10px] font-medium text-muted-foreground">{t(d.day)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
