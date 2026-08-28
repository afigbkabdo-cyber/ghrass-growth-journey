import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Check, Clock, X, Save } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, Avatar, SuccessNote, toneClasses } from "@/components/ghiras";
import { teacherChildren, teacherClassTitle } from "@/lib/teacher-data";
import type { AttendanceStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/attendance")({
  head: () => ({
    meta: [
      { title: "تسجيل الحضور — غراس" },
      { name: "description", content: "تسجيل حضور وغياب أطفال الفصل بضغطة واحدة، ثم حفظ السجل اليومي." },
      { property: "og:title", content: "تسجيل الحضور — غراس" },
      { property: "og:description", content: "سجل حضور أطفال الفصل اليومي في روضة غراس." },
    ],
  }),
  component: AttendancePage,
});

const options: { key: AttendanceStatus; label: string; icon: typeof Check; tone: "green" | "yellow" | "pink" }[] = [
  { key: "present", label: "حاضر", icon: Check, tone: "green" },
  { key: "late", label: "متأخر", icon: Clock, tone: "yellow" },
  { key: "absent", label: "غائب", icon: X, tone: "pink" },
];

function AttendancePage() {
  const [state, setState] = useState<Record<string, AttendanceStatus>>(
    () => Object.fromEntries(teacherChildren.map((c) => [c.id, c.attendance])),
  );
  const [saved, setSaved] = useState(false);

  const counts = options.map((o) => ({
    ...o,
    count: Object.values(state).filter((s) => s === o.key).length,
  }));

  return (
    <PageContainer>
      <header className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-green-soft">
          <CalendarCheck className="h-5.5 w-5.5 text-brand-green-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">تسجيل الحضور</h1>
          <p className="text-xs text-muted-foreground">{teacherClassTitle} — اليوم</p>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {counts.map((c) => {
          const t = toneClasses[c.tone];
          return (
            <div key={c.key} className={cn("rounded-2xl p-3 text-center", t.soft)}>
              <p className={cn("font-display text-xl font-extrabold", t.deep)}>{c.count}</p>
              <p className="text-[11px] font-bold text-muted-foreground">{c.label}</p>
            </div>
          );
        })}
      </div>

      {saved && <SuccessNote>تم حفظ حضور اليوم بنجاح وإشعار أولياء الأمور.</SuccessNote>}

      <div className="mt-4 space-y-2">
        {teacherChildren.map((child) => (
          <div
            key={child.id}
            className="rounded-2xl border border-border bg-card p-3.5 shadow-soft"
          >
            <div className="flex items-center gap-3">
              <Avatar name={child.name} tone={child.tone} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-foreground">{child.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {child.guardian} · نسبة الحضور {child.attendanceRate}%
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {options.map((o) => {
                const active = state[child.id] === o.key;
                const t = toneClasses[o.tone];
                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => {
                      setState((s) => ({ ...s, [child.id]: o.key }));
                      setSaved(false);
                    }}
                    aria-pressed={active}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all",
                      active
                        ? cn(t.soft, t.deep, "border-transparent")
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <o.icon className="h-4 w-4" strokeWidth={2.4} />
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setSaved(true);
          toast.success("تم حفظ سجل الحضور لهذا اليوم");
        }}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
      >
        <Save className="h-4.5 w-4.5" strokeWidth={2.4} />
        حفظ سجل اليوم
      </button>
    </PageContainer>
  );
}
