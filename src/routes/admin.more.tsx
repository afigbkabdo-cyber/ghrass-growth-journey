import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutGrid,
  Users,
  School,
  CalendarCheck,
  Blocks,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { SectionHeader, Avatar, ToneBadge } from "@/components/ghiras";
import { clearSession, readSession, roleLabels } from "@/lib/session";

export const Route = createFileRoute("/admin/more")({
  head: () => ({
    meta: [
      { title: "القائمة وحساب الإدارة — غراس" },
      {
        name: "description",
        content: "كل أقسام لوحة إدارة غراس في مكان واحد، مع حساب المديرة وتسجيل الخروج الآمن.",
      },
      { property: "og:title", content: "القائمة وحساب الإدارة — غراس" },
      { property: "og:description", content: "أقسام لوحة الإدارة وحساب المديرة وتسجيل الخروج." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminMorePage,
});

const sections = [
  { to: "/admin/staff", label: "الموظفون والكادر", icon: Users },
  { to: "/admin/classes", label: "الفصول", icon: School },
  { to: "/admin/attendance", label: "الحضور العام", icon: CalendarCheck },
  { to: "/admin/activities", label: "الأنشطة", icon: Blocks },
  { to: "/admin/announcements", label: "الإعلانات", icon: Megaphone },
  { to: "/admin/reports", label: "التقارير", icon: BarChart3 },
  { to: "/admin/settings", label: "الإعدادات", icon: Settings },
] as const;

function AdminMorePage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<ReturnType<typeof readSession>>(null);

  useEffect(() => {
    setSession(readSession());
  }, []);

  const logout = () => {
    clearSession();
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-green-soft">
          <LayoutGrid className="h-5.5 w-5.5 text-brand-green-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">القائمة</h1>
          <p className="text-xs text-muted-foreground">كل أقسام الإدارة وحسابك</p>
        </div>
      </header>

      <section className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <Avatar name={session?.name || "الإدارة"} tone="green" size="xl" />
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-extrabold text-foreground">
            {session?.name || "حساب الإدارة"}
          </h2>
          <p className="truncate text-xs text-muted-foreground" dir="ltr">
            {session?.email || "admin@ghiras.sa"}
          </p>
          <div className="mt-2">
            <ToneBadge tone="green">{roleLabels[session?.role ?? "admin"]}</ToneBadge>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="الأقسام" icon={LayoutGrid} tone="blue" />
        <div className="space-y-2">
          {sections.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted">
                <s.icon className="h-4.5 w-4.5 text-muted-foreground" strokeWidth={2.2} />
              </span>
              <span className="flex-1 text-sm font-bold text-foreground">{s.label}</span>
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>

      <button
        onClick={logout}
        className="flex w-full items-center gap-3 rounded-2xl border border-brand-pink/40 bg-brand-pink-soft/50 p-4 text-sm font-bold text-brand-pink-deep transition-colors hover:bg-brand-pink-soft"
      >
        <LogOut className="h-4.5 w-4.5" />
        تسجيل الخروج
      </button>
    </div>
  );
}
