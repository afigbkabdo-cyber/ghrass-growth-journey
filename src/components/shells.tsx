import { type ReactNode } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Baby,
  Sprout,
  Blocks,
  MessagesSquare,
  Menu,
  CalendarCheck,
  Users,
  Megaphone,
  LayoutGrid,
  HeartHandshake,
  BarChart3,
  Settings,
  Bell,
  School,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GhirasLogo, toneClasses } from "@/components/ghiras";
import type { Tone } from "@/lib/data";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

/* ---------- ترويسة علوية ---------- */

function TopBar({ roleLabel, tone }: { roleLabel: string; tone: Tone }) {
  const t = toneClasses[tone];
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-4">
        <GhirasLogo />
        <div className="flex items-center gap-2">
          <span className={cn("hidden rounded-full px-3 py-1 text-[11px] font-bold sm:inline", t.soft, t.deep)}>
            {roleLabel}
          </span>
          <button
            aria-label="الإشعارات"
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-muted"
          >
            <Bell className="h-4.5 w-4.5 text-muted-foreground" />
            <span className="absolute top-2 end-2 h-2 w-2 rounded-full bg-brand-pink" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------- شريط تنقل سفلي ---------- */

function BottomNav({ items }: { items: NavItem[] }) {
  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 backdrop-blur-md pb-safe"
    >
      <div className="mx-auto flex w-full max-w-2xl items-stretch justify-between px-1">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.exact ?? false }}
            className="group flex flex-1 flex-col items-center gap-0.5 py-2"
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "grid h-8 w-14 place-items-center rounded-full transition-all duration-300",
                    isActive ? "bg-brand-orange-soft" : "group-hover:bg-muted",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-brand-orange-deep" : "text-muted-foreground",
                    )}
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold transition-colors",
                    isActive ? "text-brand-orange-deep" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

/* ---------- هيكل عام (ولي أمر / معلمة) ---------- */

export function AppShell({
  children,
  navItems,
  roleLabel,
  tone,
}: {
  children?: ReactNode;
  navItems: NavItem[];
  roleLabel: string;
  tone: Tone;
}) {
  return (
    <div className="min-h-screen bg-background">
      <TopBar roleLabel={roleLabel} tone={tone} />
      {children ?? <Outlet />}
      <BottomNav items={navItems} />
    </div>
  );
}

/* ---------- هيكل الإدارة: Sidebar على الكمبيوتر + Bottom Nav على الهاتف ---------- */

export function AdminShell({
  sidebarItems,
  bottomItems,
}: {
  sidebarItems: NavItem[];
  bottomItems: NavItem[];
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current =
    [...sidebarItems]
      .sort((a, b) => b.to.length - a.to.length)
      .find((i) => (i.exact ? pathname === i.to : pathname.startsWith(i.to))) ??
    sidebarItems[0];

  return (
    <div className="min-h-screen bg-background">
      {/* الشريط الجانبي — سطح المكتب */}
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 flex-col border-e border-border bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <GhirasLogo />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="قائمة الإدارة">
          {sidebarItems.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact ?? false }}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all",
                  active
                    ? "bg-brand-orange-soft text-brand-orange-deep"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" strokeWidth={active ? 2.4 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-3 border-t border-border p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-orange-soft font-display text-sm font-extrabold text-brand-orange-deep">
              ج
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-bold text-foreground">أ. الجوهرة السبيعي</p>
              <p className="text-[11px] text-muted-foreground">مديرة الروضة</p>
            </div>
          </div>
          <AdminLogoutButton />
        </div>

      </aside>

      {/* المحتوى */}
      <div className="md:ps-64">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md md:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <GhirasLogo />
            <span className="rounded-full bg-brand-blue-soft px-3 py-1 text-[11px] font-bold text-brand-blue-deep">
              لوحة الإدارة
            </span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 pt-5 pb-28 md:px-8 md:pb-10">
          <div className="mb-5 hidden items-center justify-between md:flex">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-foreground">{current?.label ?? "لوحة الإدارة"}</h1>
              <p className="text-sm text-muted-foreground">لوحة تحكم روضة غراس — العام الأول ١٤٤٨هـ</p>
            </div>
            <button
              aria-label="الإشعارات"
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-card transition-colors hover:bg-muted"
            >
              <Bell className="h-4.5 w-4.5 text-muted-foreground" />
              <span className="absolute top-2 end-2 h-2 w-2 rounded-full bg-brand-pink" />
            </button>
          </div>
          <Outlet />
        </main>
      </div>

      <BottomNav items={bottomItems} />
    </div>
  );
}

/* ---------- قوائم التنقل لكل دور ---------- */

export const parentNav: NavItem[] = [
  { to: "/", label: "الرئيسية", icon: Home, exact: true },
  { to: "/child", label: "طفلي", icon: Baby },
  { to: "/journey", label: "رحلة غراس", icon: Sprout },
  { to: "/activities", label: "الأنشطة", icon: Blocks },
  { to: "/messages", label: "الرسائل", icon: MessagesSquare },
  { to: "/more", label: "المزيد", icon: Menu },
];

export const teacherNav: NavItem[] = [
  { to: "/teacher", label: "الرئيسية", icon: Home, exact: true },
  { to: "/teacher/children", label: "الأطفال", icon: Baby },
  { to: "/teacher/attendance", label: "الحضور", icon: CalendarCheck },
  { to: "/teacher/activities", label: "الأنشطة", icon: Blocks },
  { to: "/teacher/messages", label: "الرسائل", icon: MessagesSquare },
  { to: "/teacher/more", label: "المزيد", icon: Menu },
];

export const adminSidebarNav: NavItem[] = [
  { to: "/admin", label: "الرئيسية", icon: Home, exact: true },
  { to: "/admin/children", label: "الأطفال", icon: Baby },
  { to: "/admin/staff", label: "الموظفون", icon: Users },
  { to: "/admin/classes", label: "الفصول", icon: School },
  { to: "/admin/attendance", label: "الحضور", icon: CalendarCheck },
  { to: "/admin/values", label: "القيم", icon: HeartHandshake },
  { to: "/admin/activities", label: "الأنشطة", icon: Blocks },
  { to: "/admin/announcements", label: "الإعلانات", icon: Megaphone },
  { to: "/admin/messages", label: "الرسائل", icon: MessagesSquare },
  { to: "/admin/reports", label: "التقارير", icon: BarChart3 },
  { to: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export const adminBottomNav: NavItem[] = [
  { to: "/admin", label: "الرئيسية", icon: Home, exact: true },
  { to: "/admin/children", label: "الأطفال", icon: Baby },
  { to: "/admin/values", label: "القيم", icon: HeartHandshake },
  { to: "/admin/messages", label: "الرسائل", icon: MessagesSquare },
  { to: "/admin/more", label: "القائمة", icon: LayoutGrid },
];
