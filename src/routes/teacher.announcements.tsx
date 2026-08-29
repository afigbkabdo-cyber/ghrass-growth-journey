import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { PageContainer, ToneBadge, EmptyState } from "@/components/ghiras";
import { teacherAnnouncements } from "@/lib/teacher-data";

export const Route = createFileRoute("/teacher/announcements")({
  head: () => ({
    meta: [
      { title: "إعلانات الإدارة — غراس" },
      {
        name: "description",
        content: "إعلانات إدارة روضة غراس الموجهة للمعلمات: الاجتماعات والفعاليات وقيمة الأسبوع.",
      },
      { property: "og:title", content: "إعلانات الإدارة — غراس" },
      { property: "og:description", content: "إعلانات الإدارة الموجهة لمعلمات روضة غراس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherAnnouncementsPage,
});

function TeacherAnnouncementsPage() {
  return (
    <PageContainer>
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-green-soft">
          <Megaphone className="h-5.5 w-5.5 text-brand-green-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">إعلانات الإدارة</h1>
          <p className="text-xs text-muted-foreground">للقراءة فقط</p>
        </div>
      </header>

      {teacherAnnouncements.length === 0 ? (
        <EmptyState title="لا توجد إعلانات" description="ستظهر إعلانات الإدارة هنا عند نشرها." />
      ) : (
        <div className="space-y-3">
          {teacherAnnouncements.map((a) => (
            <article key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <h2 className="text-sm font-extrabold text-foreground">{a.title}</h2>
                <ToneBadge tone={a.tone} className="shrink-0">
                  {a.date}
                </ToneBadge>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{a.body}</p>
              <p className="mt-2 text-[11px] font-bold text-muted-foreground">من: {a.from}</p>
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
