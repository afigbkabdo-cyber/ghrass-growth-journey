import { createFileRoute } from "@tanstack/react-router";
import { Users, UserPlus, ShieldCheck } from "lucide-react";
import { Avatar, SectionHeader, ToneBadge } from "@/components/ghiras";
import { teachers, admins, classes } from "@/lib/data";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({
    meta: [
      { title: "الموظفون — لوحة إدارة غراس" },
      { name: "description", content: "إدارة الكادر التعليمي والإداري في روضة غراس وصلاحيات كل دور." },
      { property: "og:title", content: "الموظفون — لوحة إدارة غراس" },
      { property: "og:description", content: "الكادر التعليمي والإداري وصلاحياتهم." },
    ],
  }),
  component: AdminStaff,
});

function AdminStaff() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="الكادر التعليمي"
        subtitle={`${teachers.length} معلمات في ${classes.length} فصول`}
        icon={Users}
        tone="blue"
      />
      <div className="space-y-3">
        {teachers.map((t) => {
          const cls = classes.find((c) => c.teacher === t.name);
          return (
            <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft">
              <Avatar name={t.name} tone={t.tone} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{t.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {t.role}
                  {cls ? ` — ${cls.name}` : ""}
                </p>
              </div>
              <ToneBadge tone={t.tone}>{t.subject ?? "معلمة"}</ToneBadge>
            </div>
          );
        })}
      </div>

      <SectionHeader title="الإدارة" subtitle="أعلى مستوى صلاحيات" icon={ShieldCheck} tone="orange" />
      <div className="space-y-3">
        {admins.map((a) => (
          <div key={a.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft">
            <Avatar name={a.name} tone={a.tone} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">{a.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{a.role}</p>
            </div>
            <ToneBadge tone="orange">إدارة</ToneBadge>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
        <p className="text-sm font-bold text-foreground">الصلاحيات حسب الدور</p>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
          <li>• الإدارة: اعتماد خطة القيم، إدارة الأطفال والكادر، الإعلانات والتقارير.</li>
          <li>• المعلمة: الحضور، الأنشطة، الملاحظات، والتواصل مع أولياء الأمور.</li>
          <li>• ولي الأمر: متابعة طفله فقط — بيانات الأطفال الآخرين محجوبة.</li>
        </ul>
      </div>

      <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform active:scale-95">
        <UserPlus className="h-4.5 w-4.5" />
        إضافة عضو كادر
      </button>
    </div>
  );
}
