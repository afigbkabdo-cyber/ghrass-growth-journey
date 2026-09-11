import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { PageContainer, SectionHeader, ToneBadge, StatCard } from "@/components/ghiras";
import { TeacherShiftCard } from "@/components/teacher-shift-card";
import {
  shiftStatusLabels,
  shiftStatusTone,
  teacherShiftHistory,
} from "@/lib/teacher-shift";
import { CheckCircle2, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/teacher/my-attendance")({
  head: () => ({
    meta: [
      { title: "سجل دوامي — غراس" },
      {
        name: "description",
        content: "سجل حضور وانصراف المعلمة في روضة غراس: التاريخ ووقت الحضور والانصراف وحالة الدوام.",
      },
      { property: "og:title", content: "سجل دوامي — غراس" },
      { property: "og:description", content: "متابعة دوام المعلمة اليومي في روضة غراس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyAttendancePage,
});

function MyAttendancePage() {
  const { t, d, time } = useI18n();
  const sorted = [...teacherShiftHistory].sort((a, b) => (a.date < b.date ? 1 : -1));
  const completed = sorted.filter((r) => r.status === "completed").length;
  const absent = sorted.filter((r) => r.status === "absent").length;

  return (
    <PageContainer>
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-blue-soft">
          <CalendarClock className="h-5.5 w-5.5 text-brand-blue-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">{t("سجل دوامي")}</h1>
          <p className="text-xs text-muted-foreground">{t("حضور وانصراف المعلمة — بيانات تجريبية")}</p>
        </div>
      </header>

      <TeacherShiftCard />

      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard icon={CheckCircle2} value={completed} label={t("أيام مكتملة")} tone="green" />
        <StatCard icon={Clock} value={absent} label={t("أيام بدون تسجيل")} tone="pink" />
      </div>

      <SectionHeader title={t("آخر الأيام")} icon={CalendarClock} tone="blue" />
      <div className="space-y-3">
        {sorted.map((r) => (
          <article
            key={`${r.date}`}
            className="rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{t(r.dayLabel)}</p>
                <p className="text-[11px] text-muted-foreground" dir="ltr">
                  {d(r.date)}
                </p>
              </div>
              <ToneBadge tone={shiftStatusTone[r.status]}>{t(shiftStatusLabels[r.status])}</ToneBadge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-brand-green-soft/60 p-2.5">
                <p className="text-[11px] font-bold text-brand-green-deep">{t("الحضور")}</p>
                <p className="font-display text-sm font-extrabold text-foreground" dir="ltr">
                  {r.checkIn ? time(r.checkIn) : "—"}
                </p>
              </div>
              <div className="rounded-xl bg-brand-pink-soft/60 p-2.5">
                <p className="text-[11px] font-bold text-brand-pink-deep">{t("الانصراف")}</p>
                <p className="font-display text-sm font-extrabold text-foreground" dir="ltr">
                  {r.checkOut ? time(r.checkOut) : "—"}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}
