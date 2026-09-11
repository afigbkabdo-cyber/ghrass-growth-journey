import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Sparkles,
  Blocks,
  Megaphone,
  MessagesSquare,
  ChevronLeft,
  Baby,
  ListChecks,
} from "lucide-react";
import { AppShell, parentNav } from "@/components/shells";
import { Avatar, PageContainer, SectionHeader, ToneBadge } from "@/components/ghiras";
import { announcements } from "@/lib/data";
import { RoleGuard } from "@/components/role-guard";
import { sectionRoles, useAppSession } from "@/lib/session";
import { getCurrentValue, listActivities, listThreads, myChildren } from "@/lib/kg.functions";
import { stageLabels } from "@/lib/kg-labels";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الرئيسية — غراس | ننمو معًا" },
      {
        name: "description",
        content: "تابع قيمة الأسبوع وأنشطة طفلك اليومية ومتابعته في الروضة عبر تطبيق غراس.",
      },
      { property: "og:title", content: "الرئيسية — غراس | ننمو معًا" },
      {
        property: "og:description",
        content: "القيمة ← الحديث ← التعلم ← النشاط ← البيت ← نمو الطفل.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ParentHome,
});

function ParentHome() {
  return (
    <RoleGuard allow={sectionRoles.parent}>
      <ParentHomeContent />
    </RoleGuard>
  );
}

function ParentHomeContent() {
  const { t, n, d, num } = useI18n();
  const { session } = useAppSession();
  const fetchValue = useServerFn(getCurrentValue);
  const fetchActivities = useServerFn(listActivities);
  const fetchChildren = useServerFn(myChildren);
  const fetchThreads = useServerFn(listThreads);

  const value = useQuery({ queryKey: ["current-value"], queryFn: () => fetchValue({}) });
  const activities = useQuery({ queryKey: ["activities"], queryFn: () => fetchActivities({}) });
  const children = useQuery({ queryKey: ["my-children"], queryFn: () => fetchChildren({}) });
  const threads = useQuery({ queryKey: ["parent-threads"], queryFn: () => fetchThreads({}) });

  const child = (children.data ?? [])[0];
  const published = (activities.data ?? []).filter((a) => a.published).slice(0, 3);
  const parentName = session?.name ? n(session.name) : t("ولي الأمر");
  const childName = child ? n(child.name, child.nameEn) : null;

  return (
    <AppShell navItems={parentNav} roleLabel={t("ولي أمر")} tone="orange">
      <PageContainer>
        {/* ترحيب */}
        <section className="mb-5 flex items-center gap-3">
          <Avatar name={childName ?? session?.name ?? "غراس"} tone="pink" size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">{t("صباح النور، {name} 🌱", { name: parentName })}</p>
            <h1 className="font-display text-xl font-extrabold text-foreground">
              {child ? t("يوم {name} في غراس", { name: childName!.split(" ")[0] ?? childName! }) : t("أهلًا بك في غراس")}
            </h1>
          </div>
          {child && (
            <ToneBadge tone="green">
              <Baby className="h-3.5 w-3.5" />
              {t(stageLabels[child.stage] ?? child.stage)}
            </ToneBadge>
          )}
        </section>

        {/* بطاقة قيمة الأسبوع */}
        {value.data && (
          <Link to="/value" className="group mb-6 block">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-growth p-5 shadow-soft">
              <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-primary-foreground/15" />
              <div className="absolute -bottom-10 left-16 h-24 w-24 rounded-full bg-primary-foreground/10" />
              <div className="relative">
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/20 px-3 py-1 text-[11px] font-bold text-primary-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t("قيمة الأسبوع")}
                  </span>
                  {value.data.weekStart && (
                    <span className="text-[11px] font-medium text-primary-foreground/85">
                      {d(value.data.weekStart)}
                    </span>
                  )}
                </div>
                <h2 className="font-display text-3xl font-extrabold text-primary-foreground">{value.data.name}</h2>
                {value.data.tagline && (
                  <p className="mt-1 text-sm font-medium leading-relaxed text-primary-foreground/90">
                    {value.data.tagline}
                  </p>
                )}
                {value.data.hadith && (
                  <p className="mt-3 rounded-2xl bg-primary-foreground/15 p-3 text-xs leading-relaxed text-primary-foreground">
                    {value.data.hadith}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary-foreground transition-transform group-hover:-translate-x-1">
                  {t("اكتشف الرحلة كاملة")}
                  <ChevronLeft className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* متابعة اليوم */}
        <Link
          to="/child"
          className="mb-6 flex items-center gap-3 rounded-3xl border border-brand-green-soft bg-brand-green-soft/50 p-4 shadow-soft"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-card shadow-soft">
            <ListChecks className="h-5.5 w-5.5 text-brand-green-deep" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-brand-green-deep">{t("متابعة اليوم")}</p>
            <p className="text-[11px] text-foreground/75">{t("الوجبة، دورة المياه، النوم، الصلاة والجدول")}</p>
          </div>
          <ChevronLeft className="h-4.5 w-4.5 shrink-0 text-brand-green-deep" />
        </Link>

        {/* الأنشطة */}
        <SectionHeader
          title={t("أنشطة اليوم")}
          subtitle={t("{count} أنشطة منشورة", { count: num(published.length) })}
          icon={Blocks}
          tone="blue"
          action={{ label: t("كل الأنشطة"), to: "/activities" }}
        />
        <div className="mb-6 space-y-3">
          {published.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("لا توجد أنشطة منشورة بعد.")}</p>
          ) : (
            published.map((a) => (
              <article key={a.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  {a.photos[0] ? (
                    <img
                      src={a.photos[0]}
                      alt={t("صورة من نشاط {title}", { title: a.title })}
                      loading="lazy"
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-brand-blue-soft">
                      <Blocks className="h-6 w-6 text-brand-blue-deep" strokeWidth={2.2} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold leading-snug text-foreground">{a.title}</h3>
                    {a.description && (
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{a.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {a.className && <ToneBadge tone="blue">{n(a.className, a.classNameEn)}</ToneBadge>}
                      {a.linkedToValue && a.valueName && <ToneBadge tone="green">{n(a.valueName)}</ToneBadge>}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* رسائل الإدارة */}
        <SectionHeader
          title={t("رسائل الإدارة")}
          icon={MessagesSquare}
          tone="pink"
          action={{ label: t("كل الرسائل"), to: "/messages" }}
        />
        <div className="mb-6 space-y-3">
          {(threads.data ?? []).length === 0 ? (
            <Link
              to="/messages"
              className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <p className="text-xs text-muted-foreground">{t("لأي استفسار عن طفلك، راسل الإدارة من هنا.")}</p>
              <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ) : (
            (threads.data ?? []).slice(0, 2).map((th) => (
              <Link
                key={th.id}
                to="/messages/$id"
                params={{ id: th.id }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{th.subject}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {d(th.lastMessageAt)}
                  </p>
                </div>
                <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))
          )}
        </div>

        {/* الإعلانات */}
        <SectionHeader
          title={t("أخبار الروضة")}
          icon={Megaphone}
          tone="green"
          action={{ label: t("كل الإعلانات"), to: "/announcements" }}
        />
        <div className="space-y-3">
          {announcements.slice(0, 2).map((an) => (
            <article key={an.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-foreground">{t(an.title)}</h3>
                <ToneBadge tone={an.tone}>{t(an.date)}</ToneBadge>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t(an.body)}</p>
            </article>
          ))}
        </div>
      </PageContainer>
    </AppShell>
  );
}
