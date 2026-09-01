import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Baby, Search, ArrowLeft } from "lucide-react";
import { PageContainer, Avatar, ToneBadge, EmptyState } from "@/components/ghiras";
import { teacherChildren, teacherClassTitle } from "@/lib/teacher-data";

export const Route = createFileRoute("/teacher/children")({
  head: () => ({
    meta: [
      { title: "أطفال فصلي — غراس" },
      { name: "description", content: "قائمة أطفال فصل المعلمة مع حالة الحضور وآخر ملاحظة لكل طفل." },
      { property: "og:title", content: "أطفال فصلي — غراس" },
      { property: "og:description", content: "قائمة أطفال الفصل في روضة غراس." },
    ],
  }),
  component: TeacherChildrenPage,
});

function TeacherChildrenPage() {
  const [q, setQ] = useState("");
  const list = teacherChildren.filter(
    (c) => c.name.includes(q.trim()) || c.guardian.includes(q.trim()),
  );

  return (
    <PageContainer>
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-blue-soft">
          <Baby className="h-5.5 w-5.5 text-brand-blue-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">أطفال فصلي</h1>
          <p className="text-xs text-muted-foreground">
            {teacherClassTitle} — {teacherChildren.length} طفلًا
          </p>
        </div>
      </header>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 start-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث باسم الطفل أو ولي الأمر…"
          aria-label="البحث في أطفال الفصل"
          className="w-full rounded-2xl border border-border bg-card py-3 ps-10 pe-4 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:shadow-soft"
        />
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="لا توجد نتائج"
          message="جرّب البحث باسم آخر من أسماء أطفال فصلك."
        />
      ) : (
        <div className="space-y-2">
          {list.map((c) => (
            <Link
              key={c.id}
              to="/teacher/child/$id"
              params={{ id: c.id }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-md"
            >
              <Avatar name={c.name} tone={c.tone} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-extrabold text-foreground">{c.name}</p>
                  <ToneBadge
                    tone={c.attendance === "present" ? "green" : c.attendance === "late" ? "yellow" : "pink"}
                  >
                    {c.attendance === "present" ? "حاضر" : c.attendance === "late" ? "متأخر" : "غائب"}
                  </ToneBadge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {c.guardian} · {c.age}
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{c.lastNote}</p>
              </div>
              <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
