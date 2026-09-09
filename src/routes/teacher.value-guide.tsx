import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { HeartHandshake, BookOpenText, Lock } from "lucide-react";
import { PageContainer, SectionHeader, EmptyState } from "@/components/ghiras";
import { getCurrentValue } from "@/lib/kg.functions";

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

function TeacherValueGuidePage() {
  const fetchValue = useServerFn(getCurrentValue);
  const value = useQuery({ queryKey: ["current-value"], queryFn: () => fetchValue({}) });

  return (
    <PageContainer>
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-green-soft">
          <HeartHandshake className="h-5.5 w-5.5 text-brand-green-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">دليل قيمة الأسبوع</h1>
          <p className="text-xs text-muted-foreground">معتمدة من الإدارة</p>
        </div>
      </header>

      {value.isLoading ? (
        <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>
      ) : !value.data ? (
        <EmptyState title="لا توجد قيمة معتمدة" message="ستظهر القيمة بعد اعتمادها من الإدارة." />
      ) : (
        <>
          <div className="mb-5 overflow-hidden rounded-3xl bg-gradient-growth p-5 shadow-soft">
            <h2 className="font-display text-3xl font-extrabold text-primary-foreground">{value.data.name}</h2>
            {value.data.tagline && (
              <p className="mt-1 text-sm font-medium text-primary-foreground/90">{value.data.tagline}</p>
            )}
            {value.data.hadith && (
              <p className="mt-3 rounded-2xl bg-primary-foreground/15 p-3 text-xs leading-relaxed text-primary-foreground">
                {value.data.hadith}
              </p>
            )}
            {value.data.source && (
              <p className="mt-2 text-[11px] font-bold text-primary-foreground/85">المصدر: {value.data.source}</p>
            )}
          </div>

          {value.data.description && (
            <>
              <SectionHeader title="كيف نغرسها" icon={BookOpenText} tone="blue" />
              <p className="mb-5 rounded-2xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground shadow-soft">
                {value.data.description}
              </p>
            </>
          )}
        </>
      )}

      <p className="flex items-start gap-2 rounded-2xl bg-muted p-3 text-[11px] leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        القيمة والحديث ومصدرهما تُدار من الإدارة فقط، ولا يمكن تعديلها من واجهة المعلمة.
      </p>
    </PageContainer>
  );
}
