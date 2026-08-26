import { createFileRoute } from "@tanstack/react-router";
import { BookOpenText, ImageIcon, Target } from "lucide-react";
import { AppShell, parentNav } from "@/components/shells";
import { EmptyState, PageContainer, ToneBadge, toneClasses } from "@/components/ghiras";
import { todayActivities } from "@/lib/data";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "أنشطة طفلي — غراس" },
      { name: "description", content: "أنشطة اليوم في الروضة والمهارات المستهدفة وربطها بقيمة الأسبوع." },
      { property: "og:title", content: "أنشطة طفلي — غراس" },
      { property: "og:description", content: "أنشطة اليوم والمهارات المستهدفة وربطها بقيمة الأسبوع." },
    ],
  }),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  return (
    <AppShell navItems={parentNav} roleLabel="ولي أمر" tone="orange">
      <PageContainer>
        <header className="mb-5">
          <h1 className="font-display text-2xl font-extrabold text-foreground">أنشطة اليوم</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            كل نشاط يروي جانبًا من قيمة الأسبوع — الصدق.
          </p>
        </header>

        <div className="space-y-4">
          {todayActivities.map((a) => {
            const t = toneClasses[a.tone];
            return (
              <article key={a.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
                {/* مساحة الصور */}
                {a.hasPhotos ? (
                  <div className={`relative grid h-36 place-items-center ${t.soft}`}>
                    <div className="flex items-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="grid h-16 w-20 place-items-center rounded-xl bg-card/80 shadow-soft"
                        >
                          <ImageIcon className={`h-5 w-5 ${t.deep}`} strokeWidth={1.8} />
                        </span>
                      ))}
                    </div>
                    <span className="absolute bottom-2 end-3 rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-bold text-foreground shadow-soft">
                      ٣ صور من النشاط
                    </span>
                  </div>
                ) : null}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${t.soft}`}>
                      <BookOpenText className={`h-5 w-5 ${t.deep}`} strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-extrabold leading-snug text-foreground">{a.title}</h2>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {a.subject} • {a.teacher} • {a.date}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.description}</p>
                  <div className="mt-3 flex items-start gap-2 rounded-2xl bg-muted/60 p-3">
                    <Target className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={2.2} />
                    <p className="text-xs leading-relaxed text-foreground">
                      <span className="font-bold">المهارة المستهدفة: </span>
                      {a.skill}
                    </p>
                  </div>
                  <div className="mt-3">
                    <ToneBadge tone={a.tone}>مرتبط بقيمة {a.value}</ToneBadge>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6">
          <EmptyState
            title="أرشيف الأنشطة"
            message="ستظهر هنا أنشطة الأيام السابقة مع صورها ومهاراتها عند توفر اتصال الخادم في المرحلة الثانية."
            tone="blue"
          />
        </div>
      </PageContainer>
    </AppShell>
  );
}
