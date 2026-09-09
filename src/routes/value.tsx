import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BookOpenText,
  CheckCircle2,
  GraduationCap,
  House,
  School,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { AppShell, parentNav } from "@/components/shells";
import { PageContainer, SectionHeader, ToneBadge, toneClasses } from "@/components/ghiras";
import { currentValue } from "@/lib/data";
import { getCurrentValue } from "@/lib/kg.functions";
import { RoleGuard } from "@/components/role-guard";
import { sectionRoles } from "@/lib/session";

export const Route = createFileRoute("/value")({
  head: () => ({
    meta: [
      { title: "قيمة الأسبوع — غراس" },
      { name: "description", content: "قيمة الأسبوع المعتمدة من إدارة روضة غراس مع حديثها وأنشطتها." },
      { property: "og:title", content: "قيمة الأسبوع — غراس" },
      { property: "og:description", content: "قيمة الأسبوع المعتمدة من إدارة روضة غراس." },
    ],
  }),
  component: () => (
    <RoleGuard allow={sectionRoles.parent}>
      <ValuePage />
    </RoleGuard>
  ),
});

function ValuePage() {
  const fetchValue = useServerFn(getCurrentValue);
  const valueQuery = useQuery({ queryKey: ["current-value"], queryFn: () => fetchValue({}) });
  const db = valueQuery.data;
  const v = {
    ...currentValue,
    name: db?.name ?? currentValue.name,
    tagline: db?.tagline ?? currentValue.tagline,
    hadith: db?.hadith ?? currentValue.hadith,
    source: db?.source ?? currentValue.source,
    explanation: db?.description ?? currentValue.explanation,
    weekStart: db?.weekStart ?? currentValue.weekStart,
  };
  const t = toneClasses[currentValue.tone];

  return (
    <AppShell navItems={parentNav} roleLabel="ولي أمر" tone="orange">
      <PageContainer>
        {/* رأس القيمة */}
        <section className={`relative mb-5 overflow-hidden rounded-3xl p-6 shadow-soft ${t.soft}`}>
          <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-card/50" />
          <div className="relative text-center">
            <ToneBadge tone={v.tone} className="mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              {db?.weekStart
                ? new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(db.weekStart))
                : `${currentValue.weekStart} — ${currentValue.weekEnd}`}
            </ToneBadge>
            <h1 className={`font-display text-4xl font-extrabold ${t.deep}`}>{v.name}</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-relaxed text-foreground/80">
              {v.tagline}
            </p>
          </div>
        </section>

        {/* الحديث الشريف */}
        <section className="mb-5 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${t.soft}`}>
              <BookOpenText className={`h-4.5 w-4.5 ${t.deep}`} strokeWidth={2.2} />
            </span>
            <h2 className="text-base font-bold text-foreground">حديث الأسبوع</h2>
          </div>
          <blockquote className="rounded-2xl bg-muted/60 p-4 text-sm font-medium leading-loose text-foreground">
            {v.hadith}
          </blockquote>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ToneBadge tone={v.tone}>{v.source}</ToneBadge>
            <ToneBadge tone="green">
              <ShieldCheck className="h-3.5 w-3.5" />
              {v.authentication}
            </ToneBadge>
          </div>
        </section>

        {/* شرح مبسط */}
        <section className="mb-5 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-2 text-base font-bold text-foreground">ما معنى {v.name} لطفلك؟</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{v.explanation}</p>
        </section>

        {/* ماذا سيتعلم */}
        <SectionHeader title="ماذا سيتعلم طفلك؟" icon={GraduationCap} tone="blue" />
        <div className="mb-6 space-y-2.5">
          {v.learnings.map((l) => (
            <div key={l} className="flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3.5 shadow-soft">
              <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-blue" strokeWidth={2.2} />
              <p className="text-sm leading-relaxed text-foreground">{l}</p>
            </div>
          ))}
        </div>

        {/* في الروضة */}
        <SectionHeader title="ماذا نفعل في الروضة؟" icon={School} tone="green" />
        <div className="mb-6 space-y-2.5">
          {v.atSchool.map((s) => (
            <div key={s} className="flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3.5 shadow-soft">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-green" />
              <p className="text-sm leading-relaxed text-foreground">{s}</p>
            </div>
          ))}
        </div>

        {/* في البيت */}
        <SectionHeader title="كيف تشارك من البيت؟" icon={House} tone="pink" />
        <div className="mb-6 space-y-2.5">
          {v.atHome.map((h) => (
            <div key={h} className="flex items-start gap-2.5 rounded-2xl border border-brand-pink/25 bg-brand-pink-soft/50 p-3.5">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-pink" />
              <p className="text-sm leading-relaxed text-foreground">{h}</p>
            </div>
          ))}
        </div>

        {/* التحدي */}
        <section className="rounded-3xl bg-gradient-sun p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-card/90 shadow-soft">
              <Trophy className="h-6 w-6 text-brand-yellow-deep" strokeWidth={2.2} />
            </span>
            <div>
              <p className="font-display text-base font-extrabold text-brand-yellow-deep">تحدي غراس لهذا الأسبوع</p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-foreground/85">{v.challenge}</p>
            </div>
          </div>
        </section>
      </PageContainer>
    </AppShell>
  );
}
