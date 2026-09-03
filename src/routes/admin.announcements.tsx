import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Plus, Users } from "lucide-react";
import { SectionHeader, ToneBadge, EmptyState } from "@/components/ghiras";
import {
  adminAnnouncements,
  announcementStateLabels,
  audienceLabels,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin/announcements")({
  head: () => ({
    meta: [
      { title: "الإعلانات — لوحة إدارة غراس" },
      {
        name: "description",
        content: "إنشاء ومتابعة إعلانات روضة غراس الموجّهة للمعلمات وأولياء الأمور والفصول.",
      },
      { property: "og:title", content: "الإعلانات — لوحة إدارة غراس" },
      { property: "og:description", content: "إدارة إعلانات الروضة وجمهورها وحالتها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminAnnouncementsPage,
});

const stateTone = { published: "green", draft: "yellow", archived: "blue" } as const;

function AdminAnnouncementsPage() {
  const published = adminAnnouncements.filter((a) => a.state === "published");
  const others = adminAnnouncements.filter((a) => a.state !== "published");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft">
        <div>
          <h2 className="font-display text-lg font-extrabold text-foreground">إعلانات الروضة</h2>
          <p className="text-xs text-muted-foreground">{published.length} إعلانًا نشطًا الآن</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-2xl bg-primary px-3.5 py-2.5 text-xs font-extrabold text-primary-foreground transition-transform active:scale-95">
          <Plus className="h-4 w-4" /> إعلان جديد
        </button>
      </div>

      <section>
        <SectionHeader title="منشورة" icon={Megaphone} tone="green" />
        {published.length === 0 ? (
          <EmptyState title="لا توجد إعلانات" message="أنشئ إعلانًا جديدًا ليظهر للمعلمات وأولياء الأمور." />
        ) : (
          <div className="space-y-3">
            {published.map((a) => (
              <article key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-foreground">{a.title}</h3>
                  <ToneBadge tone={a.tone} className="shrink-0">
                    {a.date}
                  </ToneBadge>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.body}</p>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {audienceLabels[a.audience]}
                  {a.audienceDetail ? ` — ${a.audienceDetail}` : ""}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="مسودات ومؤرشفة" icon={Megaphone} tone="yellow" />
        <div className="space-y-3">
          {others.map((a) => (
            <article key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-extrabold text-foreground">{a.title}</h3>
                <ToneBadge tone={stateTone[a.state]} className="shrink-0">
                  {announcementStateLabels[a.state]}
                </ToneBadge>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.body}</p>
              <p className="mt-2 text-[11px] font-bold text-muted-foreground">
                {audienceLabels[a.audience]}
                {a.audienceDetail ? ` — ${a.audienceDetail}` : ""} · {a.date}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
