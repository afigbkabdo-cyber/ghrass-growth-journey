import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Info, Megaphone } from "lucide-react";
import { AppShell, parentNav } from "@/components/shells";
import { PageContainer, ToneBadge, toneClasses } from "@/components/ghiras";
import { announcements, kindLabels } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
  return (
    <AppShell navItems={parentNav} roleLabel={t("ولي أمر")} tone="orange">
      <PageContainer>
        <header className="mb-5">
          <h1 className="font-display text-2xl font-extrabold text-foreground">{t("إعلانات الروضة")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("فعاليات وأخبار وتنبيهات من إدارة غراس.")}</p>
        </header>

        <div className="space-y-3">
          {announcements.map((an) => {
            const tone = toneClasses[an.tone];
            const Icon = kindIcon[an.kind];
            return (
              <article key={an.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone.soft}`}>
                    <Icon className={`h-5 w-5 ${tone.deep}`} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-extrabold text-foreground">{t(an.title)}</h2>
                      <ToneBadge tone={an.tone}>{t(kindLabels[an.kind])}</ToneBadge>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(an.body)}</p>
                    <p className="mt-2 text-[11px] font-bold text-muted-foreground">{t(an.date)}</p>
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
