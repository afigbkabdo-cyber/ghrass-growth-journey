import { createFileRoute } from "@tanstack/react-router";
import { Blocks, Plus } from "lucide-react";
import { SectionHeader, ToneBadge, EmptyState } from "@/components/ghiras";
import {
  adminActivities,
  adminActivityStateLabels,
  adminActivityStateTone,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin/activities")({
  head: () => ({
    meta: [
      { title: "الأنشطة — لوحة إدارة غراس" },
      {
        name: "description",
        content: "متابعة أنشطة المعلمات في روضة غراس: المنشورة والمسودات والمؤرشفة وربطها بقيمة الأسبوع.",
      },
      { property: "og:title", content: "الأنشطة — لوحة إدارة غراس" },
      { property: "og:description", content: "إدارة أنشطة الفصول وربطها بخطة القيم." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminActivitiesPage,
});

const groups = [
  { state: "published" as const, title: "منشورة", tone: "green" as const },
  { state: "draft" as const, title: "مسودات", tone: "yellow" as const },
  { state: "archived" as const, title: "مؤرشفة", tone: "blue" as const },
];

function AdminActivitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft">
        <div>
          <h2 className="font-display text-lg font-extrabold text-foreground">أنشطة الفصول</h2>
          <p className="text-xs text-muted-foreground">{adminActivities.length} نشاطًا مسجلًا هذا الفصل</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-2xl bg-primary px-3.5 py-2.5 text-xs font-extrabold text-primary-foreground transition-transform active:scale-95">
          <Plus className="h-4 w-4" /> نشاط جديد
        </button>
      </div>

      {groups.map((g) => {
        const items = adminActivities.filter((a) => a.state === g.state);
        return (
          <section key={g.state}>
            <SectionHeader title={g.title} icon={Blocks} tone={g.tone} />
            {items.length === 0 ? (
              <EmptyState title="لا توجد أنشطة" message="ستظهر الأنشطة هنا عند إضافتها من المعلمات." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((a) => (
                  <article key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-extrabold text-foreground">{a.title}</h3>
                      <ToneBadge tone={adminActivityStateTone[a.state]} className="shrink-0">
                        {adminActivityStateLabels[a.state]}
                      </ToneBadge>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {a.subject} — {a.teacher}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <ToneBadge tone={a.tone}>{a.className}</ToneBadge>
                      <ToneBadge tone="orange">قيمة {a.value}</ToneBadge>
                      <span className="text-[11px] font-bold text-muted-foreground">{a.date}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
