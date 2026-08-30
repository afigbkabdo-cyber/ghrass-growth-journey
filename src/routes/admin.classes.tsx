import { createFileRoute } from "@tanstack/react-router";
import { School, Plus } from "lucide-react";
import { ProgressBar, SectionHeader, ToneBadge, toneClasses } from "@/components/ghiras";
import { classes, children, stageLabels } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/classes")({
  head: () => ({
    meta: [
      { title: "الفصول — لوحة إدارة غراس" },
      { name: "description", content: "توزيع فصول روضة غراس: الطاقة الاستيعابية، المعلمة المسؤولة، وقائمة الأطفال." },
      { property: "og:title", content: "الفصول — لوحة إدارة غراس" },
      { property: "og:description", content: "إدارة الفصول والطاقة الاستيعابية." },
    ],
  }),
  component: AdminClasses,
});

function AdminClasses() {
  return (
    <div className="space-y-6">
      <SectionHeader title="الفصول" subtitle="الطاقة الاستيعابية وتوزيع الأطفال" icon={School} tone="green" />

      {classes.map((c) => {
        const t = toneClasses[c.tone];
        const kids = children.filter((k) => k.className === c.name);
        const rate = Math.round((c.students / c.capacity) * 100);
        return (
          <div key={c.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={cn("grid h-11 w-11 place-items-center rounded-2xl", t.soft)}>
                  <School className={cn("h-5 w-5", t.deep)} strokeWidth={2.2} />
                </span>
                <div>
                  <p className="font-display text-base font-extrabold text-foreground">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {stageLabels[c.stage]} — {c.teacher}
                  </p>
                </div>
              </div>
              <ToneBadge tone={c.tone}>
                {c.students}/{c.capacity}
              </ToneBadge>
            </div>

            <ProgressBar value={rate} tone={c.tone} className="mt-4" />
            <p className="mt-2 text-[11px] font-bold text-muted-foreground">نسبة الإشغال {rate}%</p>

            {kids.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {kids.map((k) => (
                  <span
                    key={k.id}
                    className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {k.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform active:scale-95">
        <Plus className="h-4.5 w-4.5" />
        إضافة فصل
      </button>
    </div>
  );
}
