import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Baby,
  CalendarCheck,
  Users,
  School,
  Blocks,
  MessagesSquare,
  HeartHandshake,
  Megaphone,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import {
  StatCard,
  SectionHeader,
  ToneBadge,
  ProgressBar,
  toneClasses,
} from "@/components/ghiras";
import {
  adminStats,
  classes,
  currentValue,
  announcements,
  kindLabels,
  statusLabels,
  allValues,
  stageLabels,
} from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "الرئيسية — لوحة إدارة غراس" },
      {
        name: "description",
        content: "نظرة عامة على روضة غراس: أعداد الأطفال، حضور اليوم، قيمة الأسبوع، والإعلانات النشطة.",
      },
      { property: "og:title", content: "الرئيسية — لوحة إدارة غراس" },
      { property: "og:description", content: "نظرة عامة يومية على أداء روضة غراس." },
    ],
  }),
  component: AdminHome,
});

const quickLinks = [
  { to: "/admin/attendance", label: "الحضور", icon: CalendarCheck, tone: "green" as const },
  { to: "/admin/values", label: "خطة القيم", icon: HeartHandshake, tone: "orange" as const },
  { to: "/admin/announcements", label: "إعلان جديد", icon: Megaphone, tone: "blue" as const },
  { to: "/admin/reports", label: "التقارير", icon: BarChart3, tone: "pink" as const },
];

function AdminHome() {
  const presentRate = Math.round((adminStats.presentToday / adminStats.totalChildren) * 100);
  const pending = allValues.filter((v) => v.status === "pending" || v.status === "draft");

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-growth p-5 text-primary-foreground shadow-soft">
        <p className="text-xs font-bold opacity-90">أهلًا أ. الجوهرة 🌱</p>
        <h2 className="mt-1 font-display text-xl font-extrabold">روضة غراس تنمو معًا</h2>
        <p className="mt-1 text-xs opacity-90">
          حضور اليوم {adminStats.presentToday} من {adminStats.totalChildren} طفلًا ({presentRate}%)
        </p>
        <div className="mt-4 rounded-2xl bg-white/15 p-3">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${presentRate}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Baby} value={adminStats.totalChildren} label="إجمالي الأطفال" tone="orange" />
        <StatCard icon={CalendarCheck} value={adminStats.presentToday} label="حاضرون اليوم" tone="green" />
        <StatCard icon={Users} value={adminStats.teachersCount} label="الكادر التعليمي" tone="blue" />
        <StatCard icon={School} value={adminStats.classesCount} label="الفصول" tone="pink" />
      </div>

      <section>
        <SectionHeader title="إجراءات سريعة" icon={Blocks} tone="blue" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {quickLinks.map((q) => {
            const t = toneClasses[q.tone];
            return (
              <Link
                key={q.to}
                to={q.to}
                className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-3.5 shadow-soft transition-transform active:scale-95"
              >
                <span className={cn("grid h-9 w-9 place-items-center rounded-xl", t.soft)}>
                  <q.icon className={cn("h-4.5 w-4.5", t.deep)} strokeWidth={2.2} />
                </span>
                <span className="text-xs font-bold text-foreground">{q.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeader
          title="قيمة الأسبوع"
          subtitle={`${currentValue.weekStart} — ${currentValue.weekEnd}`}
          icon={HeartHandshake}
          tone="orange"
          action={{ label: "خطة القيم", to: "/admin/values" }}
        />
        <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-lg font-extrabold text-foreground">{currentValue.name}</p>
            <ToneBadge tone="green">{statusLabels[currentValue.status]}</ToneBadge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{currentValue.tagline}</p>
          {pending.length > 0 && (
            <p className="mt-3 rounded-xl bg-brand-yellow-soft px-3 py-2 text-[11px] font-bold text-brand-yellow-deep">
              لديك {pending.length} قيم بانتظار الاعتماد أو الإكمال
            </p>
          )}
        </div>
      </section>

      <section>
        <SectionHeader title="الفصول" icon={School} tone="green" action={{ label: "التفاصيل", to: "/admin/classes" }} />
        <div className="space-y-3">
          {classes.map((c) => {
            const t = toneClasses[c.tone];
            const rate = Math.round((c.students / c.capacity) * 100);
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {stageLabels[c.stage]} — {c.teacher}
                    </p>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold", t.soft, t.deep)}>
                    {c.students}/{c.capacity}
                  </span>
                </div>
                <ProgressBar value={rate} tone={c.tone} className="mt-3" />
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeader
          title="الإعلانات النشطة"
          icon={Megaphone}
          tone="blue"
          action={{ label: "الكل", to: "/admin/announcements" }}
        />
        <div className="space-y-3">
          {announcements.slice(0, 3).map((a) => (
            <div key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-bold text-foreground">{a.title}</p>
                <ToneBadge tone={a.tone}>{kindLabels[a.kind]}</ToneBadge>
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{a.body}</p>
              <p className="mt-2 text-[11px] font-bold text-muted-foreground">{a.date}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-pink-soft">
            <MessagesSquare className="h-4.5 w-4.5 text-brand-pink-deep" strokeWidth={2.2} />
          </span>
          <span className="text-sm font-bold text-foreground">
            {adminStats.unreadMessages} رسائل غير مقروءة
          </span>
        </span>
        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}
