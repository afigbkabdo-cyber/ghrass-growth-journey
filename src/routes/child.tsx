import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, ClipboardList, ShieldCheck, StickyNote } from "lucide-react";
import { AppShell, parentNav } from "@/components/shells";
import {
  Avatar,
  PageContainer,
  SectionHeader,
  ToneBadge,
  toneClasses,
} from "@/components/ghiras";
import {
  attendanceLabels,
  childAttendance,
  childNotes,
  currentChild,
  stageLabels,
} from "@/lib/data";

const statusTone: Record<string, "green" | "pink" | "yellow"> = {
  present: "green",
  absent: "pink",
  late: "yellow",
};

export const Route = createFileRoute("/child")({
  head: () => ({
    meta: [
      { title: `ملف ${currentChild.name} — غراس` },
      { name: "description", content: "ملف الطفل: الحضور اليومي وملاحظات المعلمات ومعلومات الفصل." },
      { property: "og:title", content: `ملف ${currentChild.name} — غراس` },
      { property: "og:description", content: "الحضور اليومي وملاحظات المعلمات ومعلومات الفصل." },
    ],
  }),
  component: ChildPage,
});

function ChildPage() {
  return (
    <AppShell navItems={parentNav} roleLabel="ولي أمر" tone="orange">
      <PageContainer>
        {/* بطاقة الطفل */}
        <section className="mb-6 flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <Avatar name={currentChild.name} tone={currentChild.tone} size="xl" />
          <div className="min-w-0">
            <h1 className="font-display text-xl font-extrabold text-foreground">{currentChild.name}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {stageLabels[currentChild.stage]} • {currentChild.className} • {currentChild.age}
            </p>
            <div className="mt-2 flex gap-1.5">
              <ToneBadge tone="green">حاضرة اليوم</ToneBadge>
              <ToneBadge tone={currentChild.tone}>ولية الأمر: {currentChild.guardian}</ToneBadge>
            </div>
          </div>
        </section>

        {/* الحضور */}
        <SectionHeader title="سجل الحضور" subtitle="آخر ٦ أيام دراسية" icon={CalendarCheck} tone="blue" />
        <div className="mb-6 space-y-2.5">
          {childAttendance.map((d) => (
            <div
              key={d.date}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-3.5 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${toneClasses[statusTone[d.status]].soft}`}>
                  <CalendarCheck className={`h-4.5 w-4.5 ${toneClasses[statusTone[d.status]].deep}`} strokeWidth={2.2} />
                </span>
                <p className="text-sm font-bold text-foreground">{d.date}</p>
              </div>
              <div className="flex items-center gap-2">
                {d.time && <span className="text-[11px] text-muted-foreground">{d.time}</span>}
                <ToneBadge tone={statusTone[d.status]}>{attendanceLabels[d.status]}</ToneBadge>
              </div>
            </div>
          ))}
        </div>

        {/* ملاحظات المعلمات */}
        <SectionHeader title="ملاحظات المعلمات" subtitle="كلمات صغيرة تصنع فرقًا كبيرًا" icon={StickyNote} tone="orange" />
        <div className="mb-6 space-y-3">
          {childNotes.map((n) => {
            const t = toneClasses[n.tone];
            return (
              <article key={n.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center gap-2.5">
                  <Avatar name={n.teacher} tone={n.tone} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground">{n.teacher}</p>
                    <p className="text-[10px] text-muted-foreground">{n.date}</p>
                  </div>
                  <span className={`h-2 w-2 rounded-full ${t.solid}`} />
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-foreground">{n.text}</p>
              </article>
            );
          })}
        </div>

        {/* روابط */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/announcements"
            className="flex items-center gap-2.5 rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-blue-soft">
              <ClipboardList className="h-4.5 w-4.5 text-brand-blue-deep" strokeWidth={2.2} />
            </span>
            <span className="text-xs font-bold text-foreground">إعلانات الروضة</span>
          </Link>
          <Link
            to="/more"
            className="flex items-center gap-2.5 rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-green-soft">
              <ShieldCheck className="h-4.5 w-4.5 text-brand-green-deep" strokeWidth={2.2} />
            </span>
            <span className="text-xs font-bold text-foreground">الخصوصية والموافقات</span>
          </Link>
        </div>
      </PageContainer>
    </AppShell>
  );
}
