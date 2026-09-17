import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Baby,
  Utensils,
  Droplets,
  Moon,
  HandHeart,
  ListChecks,
  StickyNote,
  TriangleAlert,
  CheckCircle2,
  Circle,
  MessagesSquare,
} from "lucide-react";
import { AppShell, parentNav } from "@/components/shells";
import { Avatar, PageContainer, SectionHeader, ToneBadge, EmptyState } from "@/components/ghiras";
import { RoleGuard } from "@/components/role-guard";
import { sectionRoles } from "@/lib/session";
import { childAge, mealStatusLabels, stageLabels, sleepMinutes, sleepDurationLabel } from "@/lib/kg-labels";
import { getDailyLog, listChildNotes, listSchedule, myChildren } from "@/lib/kg.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/child")({
  head: () => ({
    meta: [
      { title: "طفلي — غراس" },
      {
        name: "description",
        content: "متابعة يوم طفلك في الروضة: الوجبة، دورة المياه، النوم، الصلاة، الجدول اليومي وملاحظات المعلمة.",
      },
      { property: "og:title", content: "طفلي — غراس" },
      { property: "og:description", content: "متابعة يومية دقيقة ليوم طفلك في روضة غراس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RoleGuard allow={sectionRoles.parent}>
      <ChildPage />
    </RoleGuard>
  ),
});

function InfoRow({
  icon: Icon,
  title,
  value,
  note,
  tone,
}: {
  icon: typeof Utensils;
  title: string;
  value: string;
  note?: string | null;
  tone: "green" | "blue" | "orange" | "pink" | "yellow";
}) {
  const bg = {
    green: "bg-brand-green-soft text-brand-green-deep",
    blue: "bg-brand-blue-soft text-brand-blue-deep",
    orange: "bg-brand-orange-soft text-brand-orange-deep",
    pink: "bg-brand-pink-soft text-brand-pink-deep",
    yellow: "bg-brand-yellow-soft text-brand-yellow-deep",
  }[tone];
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${bg}`}>
        <Icon className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs font-bold text-muted-foreground">{value}</p>
        {note && <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{note}</p>}
      </div>
    </div>
  );
}

function ChildPage() {
  const { t, n, d, time, num, lang } = useI18n();
  const fetchChildren = useServerFn(myChildren);
  const fetchLog = useServerFn(getDailyLog);
  const fetchNotes = useServerFn(listChildNotes);
  const fetchSchedule = useServerFn(listSchedule);
  const [selected, setSelected] = useState<string | null>(null);

  const children = useQuery({ queryKey: ["my-children"], queryFn: () => fetchChildren({}) });
  const list = children.data ?? [];
  const child = list.find((c) => c.id === selected) ?? list[0];

  const log = useQuery({
    queryKey: ["daily-log", child?.id],
    queryFn: () => fetchLog({ data: { childId: child!.id } }),
    enabled: Boolean(child),
  });
  const notes = useQuery({
    queryKey: ["child-notes", child?.id],
    queryFn: () => fetchNotes({ data: { childId: child!.id } }),
    enabled: Boolean(child),
  });
  const schedule = useQuery({
    queryKey: ["schedule", child?.classId],
    queryFn: () => fetchSchedule({ data: { classId: child!.classId! } }),
    enabled: Boolean(child?.classId),
  });

  return (
    <AppShell navItems={parentNav} roleLabel={t("ولي أمر")} tone="orange">
      <PageContainer>
        {children.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("جارٍ التحميل…")}</p>
        ) : !child ? (
          <EmptyState
            title={t("لا يوجد طفل مرتبط بحسابك")}
            message={t("تواصل مع إدارة الروضة لربط طفلك بحسابك.")}
          />
        ) : (
          <>
            <header className="mb-4 flex items-center gap-3">
              <Avatar name={n(child.name, child.nameEn)} tone="pink" size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-xl font-extrabold text-foreground">{n(child.name, child.nameEn)}</h1>
                <p className="text-xs text-muted-foreground">
                  {child.className ? n(child.className, child.classNameEn) : t("بدون فصل")} • {t(stageLabels[child.stage] ?? child.stage)}
                  {childAge(child.birthDate, lang) ? ` • ${childAge(child.birthDate, lang)}` : ""}
                </p>
              </div>
              <Baby className="h-5 w-5 shrink-0 text-muted-foreground" />
            </header>

            {list.length > 1 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {list.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelected(c.id)}
                    aria-pressed={c.id === child.id}
                    className={`rounded-full border px-4 py-1.5 text-xs font-bold ${
                      c.id === child.id
                        ? "border-transparent bg-brand-orange-soft text-brand-orange-deep"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {n(c.name, c.nameEn)}
                  </button>
                ))}
              </div>
            )}

            {child.allergies && (
              <p className="mb-4 flex items-start gap-2 rounded-2xl border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-xs font-bold leading-relaxed text-destructive">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                {t("حساسية مسجلة: {allergies}", { allergies: n(child.allergies, child.allergiesEn) })}
              </p>
            )}

            <SectionHeader title={t("متابعة اليوم")} subtitle={t("تسجيل المعلمة لهذا اليوم")} icon={ListChecks} tone="green" />
            <div className="mb-6 space-y-3">
              <InfoRow
                icon={Utensils}
                tone="orange"
                title={t("الوجبة")}
                value={
                  log.data?.mealStatus
                    ? `${t(mealStatusLabels[log.data.mealStatus] ?? log.data.mealStatus)}${
                        log.data.mealTime ? ` • ${time(log.data.mealTime.slice(0, 5))}` : ""
                      }`
                    : t("لم تُسجّل بعد")
                }
                note={log.data?.mealNotes ?? null}
              />
              <InfoRow
                icon={Droplets}
                tone="blue"
                title={t("دورة المياه / الحفاض")}
                value={t("دورة المياه: {bathroom} • تغيير الحفاض: {diaper}", {
                  bathroom: num(log.data?.bathroomCount ?? 0),
                  diaper: num(log.data?.diaperCount ?? 0),
                })}
                note={log.data?.bathroomNotes ?? null}
              />
              <InfoRow
                icon={Moon}
                tone="pink"
                title={t("النوم")}
                value={
                  log.data?.slept
                    ? t("نام{from}{to}", {
                        from: log.data.sleepStart ? t(" من {time}", { time: time(log.data.sleepStart.slice(0, 5)) }) : "",
                        to: log.data.sleepEnd ? t(" إلى {time}", { time: time(log.data.sleepEnd.slice(0, 5)) }) : "",
                      })
                    : t("لم ينم اليوم")
                }
              />
              <InfoRow
                icon={HandHeart}
                tone="green"
                title={t("الصلاة")}
                value={log.data?.prayerDone ? t("صلّى مع المجموعة") : t("لم تُسجّل بعد")}
              />
            </div>

            <SectionHeader title={t("الجدول اليومي")} subtitle={t("ما تم إنجازه اليوم")} icon={ListChecks} tone="blue" />
            <div className="mb-6 space-y-2">
              {(schedule.data ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">{t("لا يوجد جدول لهذا الفصل بعد.")}</p>
              ) : (
                (schedule.data ?? []).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft"
                  >
                    {s.done ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-green-deep" strokeWidth={2.2} />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2.2} />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">{n(s.title, s.titleEn)}</p>
                      {s.description && (
                        <p className="truncate text-[11px] text-muted-foreground">{n(s.description, s.descriptionEn)}</p>
                      )}
                    </div>
                    {s.atTime && (
                      <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
                        {time(s.atTime.slice(0, 5))}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            <SectionHeader title={t("ملاحظات المعلمة")} icon={StickyNote} tone="yellow" />
            <div className="mb-6 space-y-3">
              {(notes.data ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">{t("لا توجد ملاحظات حتى الآن.")}</p>
              ) : (
                (notes.data ?? []).map((note) => (
                  <article key={note.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-extrabold text-foreground">{note.authorName ? n(note.authorName, note.authorNameEn) : t("المعلمة")}</p>
                      <span className="text-[11px] text-muted-foreground">
                        {d(note.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{note.body}</p>
                    {note.domain && (
                      <div className="mt-2">
                        <ToneBadge tone="blue">{t(note.domain)}</ToneBadge>
                      </div>
                    )}
                  </article>
                ))
              )}
            </div>

            <Link
              to="/messages"
              className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground shadow-soft"
            >
              <MessagesSquare className="h-4.5 w-4.5" />
              {t("استفسار للإدارة عن {name}", { name: n(child.name, child.nameEn).split(" ")[0] ?? n(child.name, child.nameEn) })}
            </Link>
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
