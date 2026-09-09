import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Blocks, Clock, Sparkles } from "lucide-react";
import { AppShell, parentNav } from "@/components/shells";
import { PageContainer, ToneBadge, EmptyState } from "@/components/ghiras";
import { RoleGuard } from "@/components/role-guard";
import { sectionRoles } from "@/lib/session";
import { listActivities } from "@/lib/kg.functions";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "أنشطة طفلي — غراس" },
      { name: "description", content: "أنشطة الروضة اليومية مع صورها وما تعلّمه طفلك في كل نشاط." },
      { property: "og:title", content: "أنشطة طفلي — غراس" },
      { property: "og:description", content: "أنشطة الروضة اليومية مع صورها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RoleGuard allow={sectionRoles.parent}>
      <ActivitiesPage />
    </RoleGuard>
  ),
});

export function ActivityCard({
  title,
  description,
  className,
  activityDate,
  activityTime,
  linkedToValue,
  valueName,
  photos,
}: {
  title: string;
  description: string | null;
  className: string | null;
  activityDate: string;
  activityTime: string | null;
  linkedToValue: boolean;
  valueName: string | null;
  photos: string[];
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      {photos.length > 0 && (
        <div className={photos.length === 1 ? "" : "grid grid-cols-2 gap-0.5"}>
          {photos.slice(0, 4).map((src) => (
            <img
              key={src}
              src={src}
              alt={`صورة من نشاط ${title}`}
              loading="lazy"
              className="h-40 w-full object-cover"
            />
          ))}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-extrabold leading-snug text-foreground">{title}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {activityTime ? activityTime.slice(0, 5) : new Date(activityDate).toLocaleDateString("ar-SA")}
          </span>
        </div>
        {description && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {className && <ToneBadge tone="blue">{className}</ToneBadge>}
          {linkedToValue && valueName && (
            <ToneBadge tone="green">
              <Sparkles className="h-3 w-3" />
              مرتبط بقيمة {valueName}
            </ToneBadge>
          )}
        </div>
      </div>
    </article>
  );
}

function ActivitiesPage() {
  const fetchActivities = useServerFn(listActivities);
  const activities = useQuery({ queryKey: ["activities"], queryFn: () => fetchActivities({}) });
  const list = (activities.data ?? []).filter((a) => a.published);

  return (
    <AppShell navItems={parentNav} roleLabel="ولي أمر" tone="orange">
      <PageContainer>
        <header className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-blue-soft">
            <Blocks className="h-5.5 w-5.5 text-brand-blue-deep" strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground">الأنشطة</h1>
            <p className="text-xs text-muted-foreground">ما عمله طفلك في الروضة مع الصور</p>
          </div>
        </header>

        {activities.isLoading ? (
          <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>
        ) : list.length === 0 ? (
          <EmptyState title="لا توجد أنشطة منشورة" message="ستظهر الأنشطة هنا بعد نشرها من الروضة." />
        ) : (
          <div className="space-y-4">
            {list.map((a) => (
              <ActivityCard key={a.id} {...a} />
            ))}
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
