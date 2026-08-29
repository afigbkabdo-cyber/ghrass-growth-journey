import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Menu,
  Bell,
  Megaphone,
  HeartHandshake,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Repeat,
  ChevronLeft,
} from "lucide-react";
import { PageContainer, SectionHeader, Avatar, ToneBadge } from "@/components/ghiras";
import { currentTeacher, teacherClassTitle, subjectLabels, teacherPermissions } from "@/lib/teacher-data";
import { clearSession } from "@/lib/session";

export const Route = createFileRoute("/teacher/more")({
  head: () => ({
    meta: [
      { title: "حساب المعلمة والمزيد — غراس" },
      {
        name: "description",
        content: "الملف الشخصي للمعلمة، صلاحياتها داخل غراس، تبديل العرض، وتسجيل الخروج.",
      },
      { property: "og:title", content: "حساب المعلمة والمزيد — غراس" },
      { property: "og:description", content: "الملف الشخصي والصلاحيات وإعدادات حساب المعلمة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherMorePage,
});

const links = [
  { to: "/teacher/value-guide", label: "دليل قيمة الأسبوع", icon: HeartHandshake },
  { to: "/teacher/announcements", label: "إعلانات الإدارة", icon: Megaphone },
  { to: "/teacher/notifications", label: "الإشعارات", icon: Bell },
] as const;

function TeacherMorePage() {
  const navigate = useNavigate();

  const logout = () => {
    clearSession();
    navigate({ to: "/login" });
  };

  return (
    <PageContainer>
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-blue-soft">
          <Menu className="h-5.5 w-5.5 text-brand-blue-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">المزيد</h1>
          <p className="text-xs text-muted-foreground">حسابك وصلاحياتك في غراس</p>
        </div>
      </header>

      <section className="mb-5 flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <Avatar name={currentTeacher.name} tone={currentTeacher.tone} size="xl" />
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-extrabold text-foreground">
            {currentTeacher.name}
          </h2>
          <p className="text-xs text-muted-foreground">{currentTeacher.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <ToneBadge tone="orange">{subjectLabels[currentTeacher.subject]}</ToneBadge>
            <ToneBadge tone="blue">{teacherClassTitle}</ToneBadge>
          </div>
        </div>
      </section>

      <section className="mb-5 space-y-2">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted">
              <l.icon className="h-4.5 w-4.5 text-muted-foreground" strokeWidth={2.2} />
            </span>
            <span className="flex-1 text-sm font-bold text-foreground">{l.label}</span>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </section>

      <section className="mb-5">
        <SectionHeader title="صلاحياتي" subtitle="ما أستطيع فعله وما هو محجوب" icon={ShieldCheck} tone="green" />
        <div className="space-y-2">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-brand-green-deep">
              <ShieldCheck className="h-4 w-4" /> مسموح
            </p>
            <ul className="space-y-1.5">
              {teacherPermissions.allowed.map((p) => (
                <li key={p} className="text-xs text-muted-foreground">
                  • {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-brand-pink-deep">
              <ShieldAlert className="h-4 w-4" /> غير مسموح
            </p>
            <ul className="space-y-1.5">
              {teacherPermissions.denied.map((p) => (
                <li key={p} className="text-xs text-muted-foreground">
                  • {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <Link
          to="/"
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm font-bold text-foreground shadow-soft transition-shadow hover:shadow-md"
        >
          <Repeat className="h-4.5 w-4.5 text-brand-orange-deep" />
          تبديل العرض إلى واجهة ولي الأمر
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl border border-brand-pink/40 bg-brand-pink-soft/50 p-4 text-sm font-bold text-brand-pink-deep transition-colors hover:bg-brand-pink-soft"
        >
          <LogOut className="h-4.5 w-4.5" />
          تسجيل الخروج
        </button>
      </section>
    </PageContainer>
  );
}
