import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Info, Megaphone } from "lucide-react";
import { AppShell, parentNav } from "@/components/shells";
import { PageContainer, ToneBadge, toneClasses } from "@/components/ghiras";
import { announcements, kindLabels } from "@/lib/data";

const kindIcon = { event: CalendarDays, reminder: Info, news: Megaphone };

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "إعلانات الروضة — غراس" },
      { name: "description", content: "فعاليات وتنبيهات وأخبار روضة غراس لأولياء الأمور." },
      { property: "og:title", content: "إعلانات الروضة — غراس" },
      { property: "og:description", content: "فعاليات وتنبيهات وأخبار روضة غراس لأولياء الأمور." },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  return (
    <AppShell navItems={parentNav} roleLabel="ولي أمر" tone="orange">
      <PageContainer>
        <header className="mb-5">
          <h1 className="font-display text-2xl font-extrabold text-foreground">إعلانات الروضة</h1>
          <p className="mt-1 text-sm text-muted-foreground">فعاليات وأخبار وتنبيهات من إدارة غراس.</p>
        </header>

        <div className="space-y-3">
          {announcements.map((an) => {
            const t = toneClasses[an.tone];
            const Icon = kindIcon[an.kind];
            return (
              <article key={an.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${t.soft}`}>
                    <Icon className={`h-5 w-5 ${t.deep}`} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-extrabold text-foreground">{an.title}</h2>
                      <ToneBadge tone={an.tone}>{kindLabels[an.kind]}</ToneBadge>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{an.body}</p>
                    <p className="mt-2 text-[11px] font-bold text-muted-foreground">{an.date}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </PageContainer>
    </AppShell>
  );
}
