import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { AppShell, parentNav } from "@/components/shells";
import { PageContainer, toneClasses } from "@/components/ghiras";
import { usePublishedAnnouncements } from "@/lib/announcements";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "إعلانات الروضة — غراس" },
      { name: "description", content: "فعاليات وتنبيهات وأخبار روضة غراس لأولياء الأمور." },
      { property: "og:title", content: "إعلانات الروضة — غراس" },
      { property: "og:description", content: "فعاليات وتنبيهات وأخبار روضة غراس لأولياء الأمور." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const { t, lang } = useI18n();
  const list = usePublishedAnnouncements();
  return (
    <AppShell navItems={parentNav} roleLabel={t("ولي أمر")} tone="orange">
      <PageContainer>
        <header className="mb-5">
          <h1 className="font-display text-2xl font-extrabold text-foreground">{t("إعلانات الروضة")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("فعاليات وأخبار وتنبيهات من إدارة غراس.")}</p>
        </header>

        <div className="space-y-3">
          {(list.data ?? []).length === 0 && !list.isLoading && (
            <p className="rounded-3xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
              {t("لا توجد إعلانات حاليًا.")}
            </p>
          )}
          {(list.data ?? []).map((an) => {
            const tone = toneClasses[an.tone];
            return (
              <article key={an.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tone.soft}`}>
                    <Megaphone className={`h-5 w-5 ${tone.deep}`} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-extrabold text-foreground">{an.title}</h2>
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{an.body}</p>
                    <p className="mt-2 text-[11px] font-bold text-muted-foreground">
                      {new Date(an.created_at).toLocaleDateString(lang === "en" ? "en-GB" : "ar-SA", { day: "numeric", month: "long" })}
                    </p>
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
