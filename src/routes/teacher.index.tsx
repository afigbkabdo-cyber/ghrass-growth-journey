import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCurrentValue, myClassChildren } from "@/lib/kg.functions";
import {
  Baby,
  CalendarCheck,
  UserCheck,
  UserX,
  Blocks,
  HeartHandshake,
  Bell,
  Megaphone,
  ArrowLeft,
} from "lucide-react";
import {
  PageContainer,
  SectionHeader,
  StatCard,
  ToneBadge,
  toneClasses,
  Avatar,
} from "@/components/ghiras";
import {
  currentTeacher,
  teacherClassTitle,
  teacherTodaySummary,
  teacherChildren,
  teacherValueGuide,
  teacherActivities,
  teacherAnnouncements,
  subjectLabels,
  activityStateLabels,
} from "@/lib/teacher-data";
import { TeacherShiftCard } from "@/components/teacher-shift-card";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/teacher/")({
  head: () => ({
    meta: [
      { title: "لوحة المعلمة — غراس" },
      { name: "description", content: "ملخص يوم المعلمة: الحضور، قيمة الأسبوع، الأنشطة، وإعلانات الإدارة." },
      { property: "og:title", content: "لوحة المعلمة — غراس" },
      { property: "og:description", content: "ملخص يوم المعلمة في روضة غراس." },
    ],
  }),
  component: TeacherHome,
});

const quickActions = [
  { to: "/teacher/attendance", label: "تسجيل الحضور", icon: CalendarCheck, tone: "green" as const },
  { to: "/teacher/activities", label: "إضافة نشاط", icon: Blocks, tone: "orange" as const },
  { to: "/teacher/children", label: "ملاحظة طفل", icon: Baby, tone: "pink" as const },
  { to: "/teacher/value-guide", label: "دليل القيمة", icon: HeartHandshake, tone: "blue" as const },
] as const;

function TeacherHome() {
  const { t, n } = useI18n();
  const published = teacherActivities.filter((a) => a.state === "published");
  const fetchValue = useServerFn(getCurrentValue);
  const fetchChildren = useServerFn(myClassChildren);
  const valueQuery = useQuery({ queryKey: ["current-value"], queryFn: () => fetchValue({}) });
  const childrenQuery = useQuery({ queryKey: ["teacher-children"], queryFn: () => fetchChildren({}) });
  const value = valueQuery.data;
  const childCount = childrenQuery.data?.length ?? teacherTodaySummary.children;

  return (
    <PageContainer>
      {/* ترحيب */}
      <section className="mb-5 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <Avatar name={currentTeacher.name} tone="blue" size="lg" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">{t("صباح الخير")} 🌤️</p>
            <h1 className="font-display text-xl font-extrabold text-foreground">{n(currentTeacher.name)}</h1>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {t(subjectLabels[currentTeacher.subject])} · {n(teacherClassTitle)}
            </p>
          </div>
        </div>
      </section>

      {/* دوام المعلمة اليوم */}
      <TeacherShiftCard />



      {/* إحصاءات اليوم */}
      <SectionHeader title={t("ملخص اليوم")} subtitle={t("حالة فصلي الآن")} icon={CalendarCheck} tone="green" />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Baby} value={childCount} label={t("أطفال الفصل")} tone="blue" />
        <StatCard icon={UserCheck} value={teacherTodaySummary.present} label={t("حاضر")} tone="green" />
        <StatCard icon={UserX} value={teacherTodaySummary.absent} label={t("غائب")} tone="pink" />
        <StatCard icon={Blocks} value={teacherTodaySummary.activities} label={t("أنشطة اليوم")} tone="orange" />
      </div>

      {/* إجراءات سريعة */}
      <SectionHeader title={t("إجراءات سريعة")} icon={Bell} tone="orange" />
      <div className="mb-6 grid grid-cols-2 gap-3">
        {quickActions.map((a) => {
          const tone = toneClasses[a.tone];
          return (
            <Link
              key={a.to}
              to={a.to}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md"
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone.soft}`}>
                <a.icon className={`h-5 w-5 ${tone.deep}`} strokeWidth={2.2} />
              </span>
              <span className="text-sm font-bold text-foreground">{t(a.label)}</span>
            </Link>
          );
        })}
      </div>

      {/* قيمة الأسبوع */}
      <SectionHeader
        title={t("قيمة الأسبوع")}
        subtitle={t("معتمدة من إدارة غراس")}
        icon={HeartHandshake}
        tone="orange"
        action={{ label: t("الدليل الكامل"), to: "/teacher/value-guide" }}
      />
      <section className="mb-6 rounded-3xl border border-brand-orange-soft bg-brand-orange-soft/50 p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-2xl font-extrabold text-brand-orange-deep">
            {value?.name ?? teacherValueGuide.name}
          </h3>
          {value?.weekStart && <ToneBadge tone="orange">{value.weekStart}</ToneBadge>}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          {value?.tagline ?? teacherValueGuide.tagline}
        </p>
        <p className="mt-3 rounded-2xl bg-card p-3 text-xs leading-relaxed text-muted-foreground">
          {value?.hadith ?? teacherValueGuide.hadith}
          <span className="mt-1 block text-[11px] font-bold text-brand-orange-deep">
            {value?.source ?? teacherValueGuide.source}
          </span>
        </p>
      </section>

      {/* أنشطة اليوم */}
      <SectionHeader
        title={t("أنشطة فصلي")}
        subtitle={t("{count} نشاط منشور لأولياء الأمور", { count: published.length })}
        icon={Blocks}
        tone="blue"
        action={{ label: t("إدارة الأنشطة"), to: "/teacher/activities" }}
      />
      <div className="mb-6 space-y-3">
        {teacherActivities.slice(0, 3).map((a) => {
          const tone = toneClasses[a.tone];
          return (
            <article
              key={a.id}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl ${tone.soft}`}>
                {a.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-extrabold text-foreground">{a.title}</h3>
                  <ToneBadge tone={a.state === "published" ? "green" : "yellow"}>
                    {t(activityStateLabels[a.state])}
                  </ToneBadge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {a.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* أطفال يحتاجون متابعة */}
      <SectionHeader
        title={t("يحتاجون متابعة")}
        subtitle={t("أقل نسبة حضور هذا الشهر")}
        icon={Baby}
        tone="pink"
        action={{ label: t("كل الأطفال"), to: "/teacher/children" }}
      />
      <div className="mb-6 space-y-2">
        {[...teacherChildren]
          .sort((a, b) => a.attendanceRate - b.attendanceRate)
          .slice(0, 3)
          .map((c) => (
            <Link
              key={c.id}
              to="/teacher/child/$id"
              params={{ id: c.id }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft transition-shadow hover:shadow-md"
            >
              <Avatar name={c.name} tone={c.tone} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{n(c.name)}</p>
                <p className="text-[11px] text-muted-foreground">{t("نسبة الحضور {rate}%", { rate: c.attendanceRate })}</p>
              </div>
              <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
      </div>

      {/* إعلانات الإدارة */}
      <SectionHeader
        title={t("من الإدارة")}
        icon={Megaphone}
        tone="green"
        action={{ label: t("كل الإعلانات"), to: "/teacher/announcements" }}
      />
      <div className="space-y-2">
        {teacherAnnouncements.slice(0, 2).map((an) => (
          <article key={an.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-extrabold text-foreground">{t(an.title)}</h3>
              <ToneBadge tone={an.tone}>{t(an.date)}</ToneBadge>
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{t(an.body)}</p>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}
