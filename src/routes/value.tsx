import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpenText, CheckCircle2, GraduationCap, House, School, Sparkles } from "lucide-react";
import { AppShell, parentNav } from "@/components/shells";
import { EmptyState, PageContainer, SectionHeader, ToneBadge, toneClasses } from "@/components/ghiras";
import { getCurrentValue } from "@/lib/kg.functions";
import { RoleGuard } from "@/components/role-guard";
import { sectionRoles } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/value")({
  head: () => ({
    meta: [
      { title: "قيمة الأسبوع — غراس" },
      { name: "description", content: "قيمة الأسبوع المعتمدة من إدارة روضة غراس مع حديثها وأنشطتها." },
      { property: "og:title", content: "قيمة الأسبوع — غراس" },
      { property: "og:description", content: "قيمة الأسبوع المعتمدة من إدارة روضة غراس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RoleGuard allow={sectionRoles.parent}>
      <ValuePage />
    </RoleGuard>
  ),
});

function ValuePage() {
  const { t: tr, n, lang } = useI18n();
  const fetchValue = useServerFn(getCurrentValue);
  const valueQuery = useQuery({ queryKey: ["current-value"], queryFn: () => fetchValue({}) });
  const v = valueQuery.data;
  const t = toneClasses.orange;

  return (
    <AppShell navItems={parentNav} roleLabel={tr("ولي أمر")} tone="orange">
      <PageContainer>
        {valueQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">{tr("جارٍ التحميل…")}</p>
        ) : !v ? (
          <EmptyState
            icon={Sparkles}
            title={tr("لا توجد قيمة معتمدة")}
            message={tr("معتمدة من الإدارة")}
            tone="orange"
          />
        ) : (
          <>
            <section className={`relative mb-5 overflow-hidden rounded-3xl p-6 shadow-soft ${t.soft}`}>
              <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-card/50" />
              <div className="relative text-center">
                {v.weekStart && (
                  <ToneBadge tone="orange" className="mb-3">
                    <Sparkles className="h-3.5 w-3.5" />
                    {new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "ar-SA-u-ca-islamic", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(v.weekStart))}
                  </ToneBadge>
                )}
                <h1 className={`font-display text-4xl font-extrabold ${t.deep}`}>{n(v.name, v.nameEn)}</h1>
                {v.tagline && (
                  <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-relaxed text-foreground/80">
                    {n(v.tagline, v.taglineEn)}
                  </p>
                )}
              </div>
            </section>

            {v.hadith && (
              <section className="mb-5 rounded-3xl border border-border bg-card p-5 shadow-soft">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${t.soft}`}>
                    <BookOpenText className={`h-4.5 w-4.5 ${t.deep}`} strokeWidth={2.2} />
                  </span>
                  <h2 className="text-base font-bold text-foreground">{tr("حديث الأسبوع")}</h2>
                </div>
                <blockquote className="rounded-2xl bg-muted/60 p-4 text-sm font-medium leading-loose text-foreground">
                  {n(v.hadith, v.hadithEn)}
                </blockquote>
                {v.source && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <ToneBadge tone="orange">{n(v.source, v.sourceEn)}</ToneBadge>
                  </div>
                )}
              </section>
            )}

            {v.description && (
              <section className="mb-5 rounded-3xl border border-border bg-card p-5 shadow-soft">
                <h2 className="mb-2 text-base font-bold text-foreground">{tr("كيف نغرسها")}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{n(v.description, v.descriptionEn)}</p>
              </section>
            )}

            {v.learnings.length > 0 && (
              <>
                <SectionHeader title={tr("ماذا سيتعلم طفلك؟")} icon={GraduationCap} tone="blue" />
                <div className="mb-6 space-y-2.5">
                  {(lang === "en" && v.learningsEn.length > 0 ? v.learningsEn : v.learnings).map((l) => (
                    <div
                      key={l}
                      className="flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3.5 shadow-soft"
                    >
                      <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-blue" strokeWidth={2.2} />
                      <p className="text-sm leading-relaxed text-foreground">{l}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {v.atSchool.length > 0 && (
              <>
                <SectionHeader title={tr("ماذا نفعل في الروضة؟")} icon={School} tone="green" />
                <div className="mb-6 space-y-2.5">
                  {(lang === "en" && v.atSchoolEn.length > 0 ? v.atSchoolEn : v.atSchool).map((s) => (
                    <div
                      key={s}
                      className="flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3.5 shadow-soft"
                    >
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-green" />
                      <p className="text-sm leading-relaxed text-foreground">{s}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {v.atHome.length > 0 && (
              <>
                <SectionHeader title={tr("كيف تشارك من البيت؟")} icon={House} tone="pink" />
                <div className="mb-6 space-y-2.5">
                  {(lang === "en" && v.atHomeEn.length > 0 ? v.atHomeEn : v.atHome).map((h) => (
                    <div
                      key={h}
                      className="flex items-start gap-2.5 rounded-2xl border border-brand-pink/25 bg-brand-pink-soft/50 p-3.5"
                    >
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-pink" />
                      <p className="text-sm leading-relaxed text-foreground">{h}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </PageContainer>
    </AppShell>
  );
}
