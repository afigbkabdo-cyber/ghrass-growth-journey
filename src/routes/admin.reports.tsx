import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, CalendarCheck, Users, Sprout } from "lucide-react";
import { SectionHeader, ToneBadge, ProgressBar, toneClasses } from "@/components/ghiras";
import {
  reportCards,
  weeklyChildAttendance,
  weeklyStaffAttendance,
  developmentReport,
} from "@/lib/admin-data";
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
  const { t } = useI18n();
  const maxChildren = Math.max(...weeklyChildAttendance.map((d) => d.present + d.absent));

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-growth p-5 text-primary-foreground shadow-soft">
        <p className="text-xs font-bold opacity-90">{t("تقارير الأسبوع 🌱")}</p>
        <h2 className="mt-1 font-display text-xl font-extrabold">{t("أداء روضة غراس")}</h2>
        <p className="mt-1 text-xs opacity-90">{t("مؤشرات تشغيلية لمتابعة الحضور والأنشطة وخطة القيم.")}</p>
      </div>

      <section>
        <SectionHeader title={t("مؤشرات عامة")} icon={BarChart3} tone="orange" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {reportCards.map((c) => {
            const tone = toneClasses[c.tone];
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <p className={cn("font-display text-2xl font-extrabold", tone.deep)}>{c.value}</p>
                <p className="mt-1 text-xs font-bold text-foreground">{t(c.title)}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{t(c.note)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeader title={t("حضور الأطفال — أسبوعيًا")} icon={CalendarCheck} tone="green" />
        <div className="space-y-3 rounded-3xl border border-border bg-card p-4 shadow-soft">
          {weeklyChildAttendance.map((d) => (
            <div key={d.day}>
              <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
                <span className="text-foreground">{t(d.day)}</span>
                <span className="text-muted-foreground">
                  {t("حاضر {present} · غائب {absent}", { present: d.present, absent: d.absent })}
                </span>
              </div>
              <ProgressBar value={Math.round((d.present / maxChildren) * 100)} tone="green" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title={t("حضور المعلمات — أسبوعيًا")} icon={Users} tone="blue" />
        <div className="space-y-3">
          {weeklyStaffAttendance.map((d) => (
            <div
              key={d.day}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <span className="text-sm font-bold text-foreground">{t(d.day)}</span>
              <span className="flex items-center gap-1.5">
                <ToneBadge tone="green">{t("حاضرات {count}", { count: d.present })}</ToneBadge>
                <ToneBadge tone={d.late > 0 ? "yellow" : "blue"}>{t("تأخير {count}", { count: d.late })}</ToneBadge>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title={t("مؤشرات تطور المهارات")} icon={Sprout} tone="pink" />
        <div className="space-y-3 rounded-3xl border border-border bg-card p-4 shadow-soft">
          {developmentReport.map((d) => (
            <div key={d.domain}>
              <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
                <span className="text-foreground">{t(d.domain)}</span>
                <span className="text-muted-foreground">{d.value}%</span>
              </div>
              <ProgressBar value={d.value} tone={d.tone} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
