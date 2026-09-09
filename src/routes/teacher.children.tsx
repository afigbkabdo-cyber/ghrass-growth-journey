import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Baby, Search, TriangleAlert, ChevronLeft } from "lucide-react";
import { PageContainer, Avatar, ToneBadge, EmptyState } from "@/components/ghiras";
import { myClassChildren } from "@/lib/kg.functions";
import { childAge, stageLabels } from "@/lib/kg-labels";

export const Route = createFileRoute("/teacher/children")({
  head: () => ({
    meta: [
      { title: "أطفال فصلي — غراس" },
      { name: "description", content: "قائمة أطفال فصل المعلمة مع العمر والحساسية والمتابعة اليومية." },
      { property: "og:title", content: "أطفال فصلي — غراس" },
      { property: "og:description", content: "قائمة أطفال فصل المعلمة في روضة غراس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherChildrenPage,
});

function TeacherChildrenPage() {
  const fetchChildren = useServerFn(myClassChildren);
  const children = useQuery({ queryKey: ["teacher-children"], queryFn: () => fetchChildren({}) });
  const [q, setQ] = useState("");

  const list = (children.data ?? []).filter((c) => c.name.includes(q.trim()));

  return (
    <PageContainer>
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-blue-soft">
          <Baby className="h-5.5 w-5.5 text-brand-blue-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">أطفال فصلي</h1>
          <p className="text-xs text-muted-foreground">{(children.data ?? []).length} طفلًا في فصولي</p>
        </div>
      </header>

      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 shadow-soft">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="بحث باسم الطفل"
          aria-label="بحث باسم الطفل"
          className="h-11 flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {children.isLoading ? (
        <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>
      ) : list.length === 0 ? (
        <EmptyState title="لا يوجد أطفال" message="لم يُسجَّل أطفال في فصولك بعد." />
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <Link
              key={c.id}
              to="/teacher/child/$id"
              params={{ id: c.id }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md"
            >
              <Avatar name={c.name} tone="blue" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-foreground">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {c.className ?? "بدون فصل"} • {stageLabels[c.stage] ?? c.stage}
                  {childAge(c.birthDate) ? ` • ${childAge(c.birthDate)}` : ""}
                </p>
                {c.allergies && (
                  <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-extrabold text-destructive">
                    <TriangleAlert className="h-3 w-3" />
                    حساسية: {c.allergies}
                  </p>
                )}
              </div>
              <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}

      <p className="mt-6 rounded-2xl bg-muted p-3 text-[11px] leading-relaxed text-muted-foreground">
        تواصل أولياء الأمور يكون مع الإدارة — أي ملاحظة تحتاج متابعة سجّليها في صفحة الطفل.
      </p>
    </PageContainer>
  );
}
