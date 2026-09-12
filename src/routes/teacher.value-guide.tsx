import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { HeartHandshake, BookOpenText, Lock, GraduationCap, School, House } from "lucide-react";
import { PageContainer, SectionHeader, EmptyState } from "@/components/ghiras";
import { getCurrentValue } from "@/lib/kg.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/teacher/value-guide")({
  head: () => ({
    meta: [
      { title: "دليل قيمة الأسبوع — غراس" },
      { name: "description", content: "قيمة الأسبوع المعتمدة من الإدارة والحديث ومصدره — للعرض فقط." },
      { property: "og:title", content: "دليل قيمة الأسبوع — غراس" },
      { property: "og:description", content: "قيمة الأسبوع المعتمدة من إدارة روضة غراس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherValueGuidePage,
});

function List({ items, marker }: { items: string[]; marker: string }) {
  return (
    <div className="mb-5 space-y-2.5">
      {items.map((i) => (
        <div key={i} className="flex items-start gap-2.5 rounded-2xl border border-border bg-card p-3.5 shadow-soft">
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${marker}`} />
          <p className="text-sm leading-relaxed text-foreground">{i}</p>
        </div>
      ))}
    </div>
  );
}

function TeacherValueGuidePage() {
  const { t: tr, n, lang } = useI18n();
  const fetchValue = useServerFn(getCurrentValue);
  const value = useQuery({ queryKey: ["current-value"], queryFn: () => fetchValue({}) });
  const v = value.data;

  return (
    <PageContainer>
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-green-soft">
          <HeartHandshake className="h-5.5 w-5.5 text-brand-green-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">{tr("دليل قيمة الأسبوع")}</h1>
          <p className="text-xs text-muted-foreground">{tr("معتمدة من الإدارة")}</p>
        </div>
      </header>

      {value.isLoading ? (
        <p className="text-sm text-muted-foreground">{tr("جارٍ التحميل…")}</p>
      ) : !v ? (
        <EmptyState title={tr("لا توجد قيمة معتمدة")} message="ستظهر القيمة بعد اعتمادها من الإدارة." />
      ) : (
        <>
          <div className="mb-5 overflow-hidden rounded-3xl bg-gradient-growth p-5 shadow-soft">
            <h2 className="font-display text-3xl font-extrabold text-primary-foreground">{n(v.name, v.nameEn)}</h2>
            {v.tagline && <p className="mt-1 text-sm font-medium text-primary-foreground/90">{n(v.tagline, v.taglineEn)}</p>}
            {v.hadith && (
              <p className="mt-3 rounded-2xl bg-primary-foreground/15 p-3 text-xs leading-relaxed text-primary-foreground">
                {n(v.hadith, v.hadithEn)}
              </p>
            )}
            {v.source && (
              <p className="mt-2 text-[11px] font-bold text-primary-foreground/85">
                {tr("المصدر")}: {n(v.source, v.sourceEn)}
              </p>
            )}
          </div>

          {v.description && (
            <>
              <SectionHeader title={tr("كيف نغرسها")} icon={BookOpenText} tone="blue" />
              <p className="mb-5 rounded-2xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground shadow-soft">
                {n(v.description, v.descriptionEn)}
              </p>
            </>
          )}

          {v.learnings.length > 0 && (
            <>
              <SectionHeader title={tr("ماذا سيتعلم طفلك؟")} icon={GraduationCap} tone="blue" />
              <List items={lang === "en" && v.learningsEn.length > 0 ? v.learningsEn : v.learnings} marker="bg-brand-blue" />
            </>
          )}

          {v.atSchool.length > 0 && (
            <>
              <SectionHeader title={tr("ماذا نفعل في الروضة؟")} icon={School} tone="green" />
              <List items={lang === "en" && v.atSchoolEn.length > 0 ? v.atSchoolEn : v.atSchool} marker="bg-brand-green" />
            </>
          )}

          {v.atHome.length > 0 && (
            <>
              <SectionHeader title={tr("كيف تشارك من البيت؟")} icon={House} tone="pink" />
              <List items={lang === "en" && v.atHomeEn.length > 0 ? v.atHomeEn : v.atHome} marker="bg-brand-pink" />
            </>
          )}
        </>
      )}

      <p className="flex items-start gap-2 rounded-2xl bg-muted p-3 text-[11px] leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {tr("القيمة والحديث ومصدرهما تُدار من الإدارة فقط، ولا يمكن تعديلها من واجهة المعلمة.")}
      </p>
    </PageContainer>
  );
}
