import { createFileRoute } from "@tanstack/react-router";
import { Check, Lock, Sprout } from "lucide-react";
import { AppShell, parentNav } from "@/components/shells";
import { GrowthIcon, PageContainer, ProgressBar, ToneBadge, toneClasses } from "@/components/ghiras";
import { cn } from "@/lib/utils";
import { journeyStops } from "@/lib/data";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "رحلة غراس — نمو القيم عبر العام" },
      {
        name: "description",
        content: "خارطة القيم الأسبوعية: كل قيمة مكتملة تزرع نبتة جديدة في حديقة طفلك.",
      },
      { property: "og:title", content: "رحلة غراس — نمو القيم عبر العام" },
      { property: "og:description", content: "كل قيمة مكتملة تزرع نبتة جديدة في حديقة طفلك." },
    ],
  }),
  component: JourneyPage,
});

function JourneyPage() {
  const done = journeyStops.filter((s) => s.state === "done").length;
  const progress = (done / journeyStops.length) * 100;

  return (
    <AppShell navItems={parentNav} roleLabel="ولي أمر" tone="orange">
      <PageContainer>
        <header className="mb-5">
          <h1 className="font-display text-2xl font-extrabold text-foreground">رحلة غراس</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            كل أسبوع قيمة جديدة، وكل قيمة مكتملة تنمو معها شجرة طفلك.
          </p>
        </header>

        {/* ملخص النمو */}
        <section className="mb-6 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-green-soft">
                <Sprout className="h-5 w-5 text-brand-green-deep" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-sm font-extrabold text-foreground">حديقة ليان القيمية</p>
                <p className="text-[11px] text-muted-foreground">{done} من {journeyStops.length} قيم هذا الفصل</p>
              </div>
            </div>
            <ToneBadge tone="green">{Math.round(progress)}٪</ToneBadge>
          </div>
          <ProgressBar value={progress} tone="green" />
        </section>

        {/* المسار الزمني */}
        <ol className="relative space-y-0 border-s-2 border-dashed border-border ps-0">
          {journeyStops.map((stop, i) => {
            const t = toneClasses[stop.tone];
            const isCurrent = stop.state === "current";
            const isDone = stop.state === "done";
            return (
              <li key={stop.id} className="relative pb-6 ps-8 last:pb-0">
                <span
                  className={cn(
                    "absolute -start-[17px] top-0 grid h-8 w-8 place-items-center rounded-full border-2 bg-card",
                    isDone && `${t.solid} border-transparent`,
                    isCurrent && `border-current ${t.deep} ring-4 ${t.ring}`,
                    stop.state === "upcoming" && "border-border",
                  )}
                >
                  {isDone ? (
                    <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
                  ) : isCurrent ? (
                    <GrowthIcon stage={stop.growth} className={`h-4 w-4 ${t.deep}`} />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </span>

                <article
                  className={cn(
                    "rounded-2xl border p-4 shadow-soft transition-all",
                    isCurrent ? `${t.soft} border-transparent` : "border-border bg-card",
                    stop.state === "upcoming" && "opacity-70",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className={cn("text-sm font-extrabold", isCurrent ? t.deep : "text-foreground")}>
                      {stop.value}
                    </h2>
                    <div className="flex items-center gap-1.5">
                      <GrowthIcon
                        stage={stop.growth}
                        className={cn("h-4 w-4", isDone || isCurrent ? t.deep : "text-muted-foreground")}
                      />
                      <span className="text-[10px] font-bold text-muted-foreground">{stop.week}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {isDone && "اكتملت — نبتت في حديقة ليان 🌱"}
                    {isCurrent && "قيمة هذا الأسبوع — نحن هنا الآن!"}
                    {stop.state === "upcoming" && `قادمة في ${stop.week}`}
                  </p>
                </article>
                {i === journeyStops.length - 1 && (
                  <p className="mt-4 text-center text-[11px] text-muted-foreground">
                    تُضاف قيم جديدة طوال العام الدراسي 🌳
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </PageContainer>
    </AppShell>
  );
}
