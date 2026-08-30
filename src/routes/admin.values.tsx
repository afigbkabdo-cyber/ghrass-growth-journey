import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake, Plus, CheckCircle2, BookOpenCheck } from "lucide-react";
import { SectionHeader, SuccessNote, ToneBadge, toneClasses } from "@/components/ghiras";
import { allValues, statusLabels, type WeekValue } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/values")({
  head: () => ({
    meta: [
      { title: "خطة القيم — لوحة إدارة غراس" },
      { name: "description", content: "بناء واعتماد خطة القيم الأسبوعية في روضة غراس مع الحديث الموثق والأنشطة." },
      { property: "og:title", content: "خطة القيم — لوحة إدارة غراس" },
      { property: "og:description", content: "اعتماد قيم الأسابيع والتحقق من التوثيق الشرعي." },
    ],
  }),
  component: AdminValues,
});

const statusTone: Record<WeekValue["status"], "green" | "yellow" | "blue" | "pink"> = {
  published: "green",
  approved: "blue",
  pending: "yellow",
  draft: "pink",
};

function AdminValues() {
  const [approved, setApproved] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);

  const approve = (v: WeekValue) => {
    setApproved((p) => [...p, v.id]);
    setNote(`تم اعتماد قيمة «${v.name}» ونشرها لأولياء الأمور.`);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="خطة القيم الأسبوعية"
        subtitle="كل قيمة مرتبطة بدليل شرعي موثق قبل الاعتماد"
        icon={HeartHandshake}
        tone="orange"
      />

      {note && <SuccessNote>{note}</SuccessNote>}

      <div className="space-y-3">
        {allValues.map((v) => {
          const t = toneClasses[v.tone];
          const isApproved = approved.includes(v.id) || v.status === "published" || v.status === "approved";
          return (
            <article key={v.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={cn("grid h-11 w-11 place-items-center rounded-2xl", t.soft)}>
                    <HeartHandshake className={cn("h-5 w-5", t.deep)} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-base font-extrabold text-foreground">{v.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {v.weekStart} — {v.weekEnd}
                    </p>
                  </div>
                </div>
                <ToneBadge tone={isApproved ? statusTone[v.status] : "pink"}>
                  {approved.includes(v.id) ? "منشورة" : statusLabels[v.status]}
                </ToneBadge>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.tagline}</p>

              <div className={cn("mt-3 rounded-2xl p-3.5", t.soft)}>
                <p className={cn("text-xs font-bold leading-relaxed", t.deep)}>{v.hadith}</p>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                  <BookOpenCheck className="h-3.5 w-3.5" />
                  {v.source} · {v.authentication}
                </p>
              </div>

              <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                <div>
                  <p className="mb-1 font-bold text-foreground">في الروضة</p>
                  <ul className="space-y-1">
                    {v.atSchool.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 font-bold text-foreground">في المنزل</p>
                  <ul className="space-y-1">
                    {v.atHome.map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {v.status === "pending" || v.status === "draft" ? (
                approved.includes(v.id) ? (
                  <p className="mt-4 flex items-center gap-1.5 text-xs font-bold text-brand-green-deep">
                    <CheckCircle2 className="h-4 w-4" /> معتمدة ومنشورة
                  </p>
                ) : (
                  <button
                    onClick={() => approve(v)}
                    className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-transform active:scale-95"
                  >
                    اعتماد ونشر
                  </button>
                )
              ) : null}
            </article>
          );
        })}
      </div>

      <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card py-3.5 text-sm font-bold text-foreground transition-transform active:scale-95">
        <Plus className="h-4.5 w-4.5" />
        إضافة قيمة لأسبوع جديد
      </button>
    </div>
  );
}
