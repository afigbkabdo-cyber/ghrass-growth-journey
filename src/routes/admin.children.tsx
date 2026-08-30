import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Baby, Search, UserPlus } from "lucide-react";
import { Avatar, EmptyState, SectionHeader, ToneBadge } from "@/components/ghiras";
import { children, classes, stageLabels, type Stage } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/children")({
  head: () => ({
    meta: [
      { title: "الأطفال — لوحة إدارة غراس" },
      { name: "description", content: "سجل جميع أطفال روضة غراس وتوزيعهم على الفصول والمراحل." },
      { property: "og:title", content: "الأطفال — لوحة إدارة غراس" },
      { property: "og:description", content: "إدارة سجل الأطفال وتوزيع الفصول." },
    ],
  }),
  component: AdminChildren,
});

const stageFilters: { key: Stage | "all"; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "nursery", label: stageLabels.nursery },
  { key: "kg1", label: stageLabels.kg1 },
  { key: "kg2", label: stageLabels.kg2 },
];

function AdminChildren() {
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<Stage | "all">("all");

  const list = useMemo(
    () =>
      children.filter(
        (c) => (stage === "all" || c.stage === stage) && (c.name.includes(q.trim()) || c.className.includes(q.trim())),
      ),
    [q, stage],
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        title="سجل الأطفال"
        subtitle={`${children.length} طفلًا في ${classes.length} فصول`}
        icon={Baby}
        tone="orange"
      />

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 start-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث باسم الطفل أو الفصل…"
          className="w-full rounded-2xl border border-border bg-card py-3 ps-10 pe-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {stageFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStage(f.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
              stage === f.key
                ? "bg-brand-orange text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Baby}
          title="لا نتائج مطابقة"
          message="جرّب اسمًا آخر أو غيّر المرحلة المحددة."
          tone="orange"
        />
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft"
            >
              <Avatar name={c.name} tone={c.tone} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{c.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {c.className} — {c.age} · ولي الأمر: {c.guardian}
                </p>
              </div>
              <ToneBadge tone={c.tone}>{stageLabels[c.stage]}</ToneBadge>
            </div>
          ))}
        </div>
      )}

      <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform active:scale-95">
        <UserPlus className="h-4.5 w-4.5" />
        تسجيل طفل جديد
      </button>
      <p className="text-center text-[11px] text-muted-foreground">
        نموذج تجريبي — التسجيل الفعلي يُفعّل مع ربط قاعدة البيانات.
      </p>
    </div>
  );
}
