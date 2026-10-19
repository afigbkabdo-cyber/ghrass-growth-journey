import { createFileRoute } from "@tanstack/react-router";
import { Check, Lock, Sprout } from "lucide-react";
import { AppShell, parentNav } from "@/components/shells";
import { GrowthIcon, PageContainer, ProgressBar, ToneBadge, toneClasses } from "@/components/ghiras";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { myChildren } from "@/lib/kg.functions";
import { childJourney } from "@/lib/dashboard.functions";
import { scopedKey } from "@/lib/dashboard";
import { RoleGuard } from "@/components/role-guard";
import { sectionRoles, useAppSession } from "@/lib/session";
import { DataStatus } from "@/components/data-status";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/journey")({
  head: () => ({
    meta: [
      { title: "رحلة غراس — نمو القيم عبر العام" },
      {
        name: "description",
        content: "سجلات الطفل وملاحظاته الفعلية المرتبطة بحساب ولي الأمر.",
      },
      { property: "og:title", content: "رحلة غراس — نمو القيم عبر العام" },
      { property: "og:description", content: "سجلات الطفل وملاحظاته في روضة غراس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <RoleGuard allow={sectionRoles.parent}><JourneyPage /></RoleGuard>,
});

function JourneyPage() {
  const { t, n, d, num } = useI18n();
  const { session } = useAppSession();
  const fetchChildren = useServerFn(myChildren);
  const fetchJourney = useServerFn(childJourney);
  const [selected, setSelected] = useState<string | null>(null);
  const children = useQuery({ queryKey: scopedKey(["my-children"], session?.userId ?? null), queryFn: () => fetchChildren({}), enabled: Boolean(session) });
  const child = children.data?.find(c => c.id === selected) ?? children.data?.[0];
  const journey = useQuery({ queryKey: scopedKey(["child-journey", child?.id], session?.userId ?? null), queryFn: () => {
    if (!child) throw new Error("No child");
    return fetchJourney({ data: { childId: child.id } });
  }, enabled: Boolean(child), refetchInterval: 30000 });
  const entries = journey.data ?? [];
  return (
    <AppShell navItems={parentNav} roleLabel={t("ولي أمر")} tone="orange">
      <PageContainer>
        <header className="mb-5"><h1 className="font-display text-2xl font-extrabold text-foreground">{t("رحلة غراس")}</h1><p className="mt-1 text-sm text-muted-foreground">{t("سجلات الطفل وملاحظاته المسجلة")}</p></header>
        {(children.data?.length ?? 0) > 1 && <div className="mb-4 flex flex-wrap gap-2">{children.data?.map(c => <Button key={c.id} variant={c.id === child?.id ? "default" : "outline"} onClick={() => setSelected(c.id)}>{n(c.name, c.nameEn)}</Button>)}</div>}
        <DataStatus loading={children.isPending} error={children.isError} />
        {children.data && !child && <p className="text-sm text-muted-foreground">{t("لا يوجد طفل مرتبط بحسابك")}</p>}
        {child && <>
          <section className="mb-6 rounded-3xl border border-border bg-card p-5 shadow-soft"><div className="flex items-center gap-2.5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-green-soft"><Sprout className="h-5 w-5 text-brand-green-deep" /></span><div><p className="text-sm font-extrabold">{t("رحلة {name}", { name: n(child.name, child.nameEn) })}</p>{journey.data && <p className="text-[11px] text-muted-foreground">{t("سجلات المتابعة")} · {num(entries.length)}</p>}</div></div></section>
          <DataStatus loading={journey.isPending} error={journey.isError} empty={!entries.length} />
          <ol className="relative border-s-2 border-dashed border-border">{entries.map(entry => <li key={entry.id} className="relative pb-6 ps-8 last:pb-0"><span className="absolute -start-[17px] top-0 grid h-8 w-8 place-items-center rounded-full border-2 border-border bg-card"><Sprout className="h-4 w-4 text-brand-green-deep" /></span><article className="rounded-2xl border border-border bg-card p-4 shadow-soft"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-extrabold">{t(entry.kind === "note" ? "ملاحظة مسجلة" : "متابعة يومية مسجلة")}</h2><span className="text-[10px] font-bold text-muted-foreground">{d(entry.date)}</span></div>{entry.body && <p className="mt-1 text-xs text-muted-foreground">{entry.body}</p>}</article></li>)}</ol>
        </>}
      </PageContainer>
    </AppShell>
  );
}
