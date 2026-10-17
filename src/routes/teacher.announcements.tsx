import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { PageContainer, ToneBadge, EmptyState } from "@/components/ghiras";
import { usePublishedAnnouncements } from "@/lib/announcements";
import { useI18n } from "@/lib/i18n";

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
  const { t, lang } = useI18n();
  const list = usePublishedAnnouncements();
  return (
    <PageContainer>
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-green-soft">
          <Megaphone className="h-5.5 w-5.5 text-brand-green-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">{t("إعلانات الإدارة")}</h1>
          <p className="text-xs text-muted-foreground">{t("للقراءة فقط")}</p>
        </div>
      </header>

      {(list.data ?? []).length === 0 ? (
        <EmptyState title={t("لا توجد إعلانات")} message={t("ستظهر إعلانات الإدارة هنا عند نشرها.")} />
      ) : (
        <div className="space-y-3">
          {(list.data ?? []).map((a) => (
            <article key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <h2 className="text-sm font-extrabold text-foreground">{a.title}</h2>
                <ToneBadge tone={a.tone} className="shrink-0">
                  {new Date(a.created_at).toLocaleDateString(lang === "en" ? "en-GB" : "ar-SA", { day: "numeric", month: "long" })}
                </ToneBadge>
              </div>
              <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{a.body}</p>
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
