import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCurrentValue, listActivities } from "@/lib/kg.functions";
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
import { teacherDashboard } from "@/lib/dashboard.functions";
import { attendanceDate } from "@/lib/attendance";
import { scopedKey } from "@/lib/dashboard";
import { usePublishedAnnouncements } from "@/lib/announcements";
import { DataStatus } from "@/components/data-status";
import { TeacherShiftCard } from "@/components/teacher-shift-card";
import { useI18n } from "@/lib/i18n";
import { useAppSession } from "@/lib/session";

export const Route = createFileRoute("/teacher/")({
  head: () => ({
    meta: [
      { title: "لوحة المعلمة — غراس" },
      { name: "description", content: "ملخص يوم المعلمة: الحضور، قيمة الأسبوع، الأنشطة، وإعلانات الإدارة." },
      { property: "og:title", content: "لوحة المعلمة — غراس" },
      { property: "og:description", content: "ملخص يوم المعلمة في روضة غراس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  const { t, n, d, num } = useI18n();
  const { session } = useAppSession();
  const date = attendanceDate();
  const fetchValue = useServerFn(getCurrentValue);
  const fetchDashboard = useServerFn(teacherDashboard);
  const fetchActivities = useServerFn(listActivities);
  const valueQuery = useQuery({ queryKey: scopedKey(["current-value"], session?.userId ?? null), queryFn: () => fetchValue({}), enabled: Boolean(session) });
  const dashboardQuery = useQuery({ queryKey: scopedKey(["teacher-dashboard"], session?.userId ?? null, date), queryFn: () => fetchDashboard({ data: { date } }), enabled: Boolean(session), refetchInterval: 30000 });
  const activitiesQuery = useQuery({ queryKey: scopedKey(["activities"], session?.userId ?? null), queryFn: () => fetchActivities({}), enabled: Boolean(session), refetchInterval: 30000 });
  const announcementsQuery = usePublishedAnnouncements();
  const value = valueQuery.data;
  const data = dashboardQuery.data;
  const activities = activitiesQuery.data ?? [];
  const published = activities.filter(a => a.published);
  const childCount = data?.children.length ?? t("لم يُسجل");

  return (
    <PageContainer>
      {/* ترحيب */}
      <section className="mb-5 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <Avatar name={session?.name ? n(session.name) : t("معلمة")} tone="blue" size="lg" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">{t("صباح الخير")} 🌤️</p>
            <h1 className="font-display text-xl font-extrabold text-foreground">{session?.name ? n(session.name) : t("معلمة")}</h1>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {session?.title ? t(session.title) : t("معلمة")}
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
        <StatCard icon={UserCheck} value={data?.today.present ?? t("لم يُسجل")} label={t("حاضر")} tone="green" />
        <StatCard icon={UserX} value={data?.today.absent ?? t("لم يُسجل")} label={t("غائب")} tone="pink" />
        <StatCard icon={Blocks} value={activitiesQuery.data ? activities.filter(a => a.activityDate === date).length : t("لم يُسجل")} label={t("أنشطة اليوم")} tone="orange" />
      </div>

      <DataStatus loading={dashboardQuery.isPending} error={dashboardQuery.isError} />
      {data?.classCount === 0 && <p className="text-sm text-muted-foreground">{t("لا يوجد فصل معيّن لحسابك. تواصلي مع الإدارة.")}</p>}
      {data && <p className="mb-4 text-xs text-muted-foreground">{t("لم يُسجل {count}", { count: num(data.today.unrecorded) })}</p>}
      {/* إجراءات سريعة */}
      <SectionHeader title={t("إجراءات سريعة")} icon={Bell} tone="orange" />
      <div className="mb-6 grid grid-cols-2 gap-3">
        {quickActions.map((a) => {
          const tone = toneClasses.blue;
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
            {value ? n(value.name, value.nameEn) : t("لا توجد قيمة معتمدة حالية.")}
          </h3>
          {value?.weekStart && <ToneBadge tone="orange">{value.weekStart}</ToneBadge>}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          {value ? n(value.tagline, value.taglineEn) : ""}
        </p>
        <p className="mt-3 rounded-2xl bg-card p-3 text-xs leading-relaxed text-muted-foreground">
          {value ? n(value.hadith, value.hadithEn) : ""}
          <span className="mt-1 block text-[11px] font-bold text-brand-orange-deep">
            {value ? n(value.source, value.sourceEn) : ""}
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
        {activities.slice(0, 3).map((a) => {
          const tone = toneClasses.blue;
          return (
            <article
              key={a.id}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl ${tone.soft}`}>
                <Blocks className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-extrabold text-foreground">{n(a.title, a.titleEn)}</h3>
                  <ToneBadge tone={a.published ? "green" : "yellow"}>
                    {t(a.published ? "منشور" : "مسودة")}
                  </ToneBadge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {n(a.description, a.descriptionEn)}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <DataStatus loading={activitiesQuery.isPending} error={activitiesQuery.isError} empty={!activities.length} />
      {/* أطفال يحتاجون متابعة */}
      <SectionHeader
        title={t("يحتاجون متابعة")}
        subtitle={t("نسبة الحضور من السجلات المتاحة")}
        icon={Baby}
        tone="pink"
        action={{ label: t("كل الأطفال"), to: "/teacher/children" }}
      />
      <div className="mb-6 space-y-2">
        {(data?.followup ?? [])
          .map((c) => (
            <Link
              key={c.id}
              to="/teacher/child/$id"
              params={{ id: c.id }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft transition-shadow hover:shadow-md"
            >
              <Avatar name={c.name} tone="pink" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{n(c.name, c.name_en)}</p>
                <p className="text-[11px] text-muted-foreground">{t("نسبة الحضور {rate}%", { rate: num(c.rate ?? 0) })}</p>
              </div>
              <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
      </div>

      <DataStatus empty={!data?.followup.length} />
      {/* إعلانات الإدارة */}
      <SectionHeader
        title={t("من الإدارة")}
        icon={Megaphone}
        tone="green"
        action={{ label: t("كل الإعلانات"), to: "/teacher/announcements" }}
      />
      <div className="space-y-2">
        {(announcementsQuery.data ?? []).slice(0, 2).map((an) => (
          <article key={an.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-extrabold text-foreground">{t(an.title)}</h3>
              <ToneBadge tone={an.tone}>{d(an.created_at)}</ToneBadge>
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{t(an.body)}</p>
          </article>
        ))}
      </div>
      <DataStatus loading={announcementsQuery.isPending} error={announcementsQuery.isError} empty={!announcementsQuery.data?.length} />
      <DataStatus error={valueQuery.isError} />
    </PageContainer>
  );
}
