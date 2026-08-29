import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake, Lock, Target, Sparkles } from "lucide-react";
import { PageContainer, SectionHeader, ToneBadge } from "@/components/ghiras";
import { teacherValueGuide, otherSubjectActivities, subjectLabels } from "@/lib/teacher-data";

export const Route = createFileRoute("/teacher/value-guide")({
  head: () => ({
    meta: [
      { title: "دليل قيمة الأسبوع — غراس" },
      {
        name: "description",
        content: "دليل المعلمة لتنفيذ قيمة الأسبوع: الأهداف التربوية والأفكار والأنشطة المقترحة.",
      },
      { property: "og:title", content: "دليل قيمة الأسبوع — غراس" },
      { property: "og:description", content: "الأهداف والأفكار المعتمدة لتنفيذ قيمة الأسبوع." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherValueGuidePage,
});

function TeacherValueGuidePage() {
  const g = teacherValueGuide;

  return (
    <PageContainer>
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-orange-soft">
          <HeartHandshake className="h-5.5 w-5.5 text-brand-orange-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">دليل قيمة الأسبوع</h1>
          <p className="text-xs text-muted-foreground">{g.week}</p>
        </div>
      </header>

      <section className="mb-5 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-xl font-extrabold text-brand-orange-deep">{g.name}</h2>
          <ToneBadge tone="green">
            <Lock className="h-3 w-3" /> معتمد من الإدارة
          </ToneBadge>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{g.tagline}</p>

        <div className="mt-4 rounded-2xl bg-brand-green-soft/70 p-4">
          <p className="text-sm font-bold leading-relaxed text-brand-green-deep">{g.hadith}</p>
          <p className="mt-2 text-[11px] font-medium text-brand-green-deep/80">{g.source}</p>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          نص الحديث ومصدره غير قابلين للتعديل من المعلمة.
        </p>
      </section>

      <section className="mb-5">
        <SectionHeader title="الأهداف التربوية" icon={Target} tone="blue" />
        <ul className="space-y-2">
          {g.goals.map((goal) => (
            <li
              key={goal}
              className="flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3.5 text-sm text-foreground shadow-soft"
            >
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-blue-soft text-[10px] font-extrabold text-brand-blue-deep">
                ✓
              </span>
              {goal}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-5">
        <SectionHeader title="أفكار وأنشطة مقترحة" icon={Sparkles} tone="yellow" />
        <div className="space-y-2">
          {g.ideas.map((idea) => (
            <article
              key={idea.title}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
            >
              <span className="text-xl leading-none" aria-hidden>
                {idea.emoji}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-foreground">{idea.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{idea.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="القيمة في المواد الأخرى"
          subtitle="للعلم فقط — من إعداد معلمات المواد"
          tone="green"
        />
        <div className="space-y-2">
          {otherSubjectActivities.map((a) => (
            <div
              key={a.title}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft"
            >
              <p className="min-w-0 truncate text-sm font-bold text-foreground">{a.title}</p>
              <ToneBadge tone={a.tone}>{subjectLabels[a.subject]}</ToneBadge>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
