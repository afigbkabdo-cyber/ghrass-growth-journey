import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { HeartHandshake, Plus, X, Trash2, CheckCircle2, Star } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader, ToneBadge, EmptyState } from "@/components/ghiras";
import { approveValue, deleteValue, listValues, saveValue } from "@/lib/kg.functions";

export const Route = createFileRoute("/admin/values")({
  head: () => ({
    meta: [
      { title: "خطة القيم — لوحة إدارة غراس" },
      { name: "description", content: "إضافة قيم الأسبوع واعتمادها وتحديد القيمة الحالية للروضة." },
      { property: "og:title", content: "خطة القيم — لوحة إدارة غراس" },
      { property: "og:description", content: "إدارة خطة القيم الأسبوعية واعتمادها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminValuesPage,
});

const field =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:shadow-soft";

function AdminValuesPage() {
  const qc = useQueryClient();
  const fetchValues = useServerFn(listValues);
  const save = useServerFn(saveValue);
  const approve = useServerFn(approveValue);
  const remove = useServerFn(deleteValue);

  const values = useQuery({ queryKey: ["admin-values"], queryFn: () => fetchValues({}) });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [hadith, setHadith] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [weekStart, setWeekStart] = useState("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-values"] });
    qc.invalidateQueries({ queryKey: ["current-value"] });
  };

  const create = useMutation({
    mutationFn: () =>
      save({
        data: {
          name: name.trim(),
          tagline: tagline.trim() || null,
          hadith: hadith.trim() || null,
          source: source.trim() || null,
          description: description.trim() || null,
          weekStart: weekStart || null,
        },
      }),
    onSuccess: () => {
      toast.success("تمت إضافة القيمة — تحتاج اعتمادًا لتظهر للمعلمات وأولياء الأمور");
      setName("");
      setTagline("");
      setHadith("");
      setSource("");
      setDescription("");
      setWeekStart("");
      setOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "تعذر الحفظ"),
  });

  const setApproval = useMutation({
    mutationFn: (v: { id: string; approved: boolean; makeCurrent?: boolean }) => approve({ data: v }),
    onSuccess: () => {
      toast.success("تم تحديث حالة القيمة");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "تعذر التحديث"),
  });

  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("تم حذف القيمة");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || "تعذر الحذف"),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft">
        <div>
          <h2 className="font-display text-lg font-extrabold text-foreground">خطة القيم</h2>
          <p className="text-xs text-muted-foreground">القيم والأحاديث تُدار من الإدارة فقط</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"
          aria-label="إضافة قيمة"
        >
          {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <section className="space-y-2.5 rounded-3xl border border-brand-green-soft bg-card p-4 shadow-soft">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم القيمة (مثال: الرحمة)" aria-label="اسم القيمة" className={field} />
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="عبارة تعريفية قصيرة" aria-label="عبارة تعريفية" className={field} />
          <textarea
            value={hadith}
            onChange={(e) => setHadith(e.target.value)}
            rows={3}
            placeholder="نص الحديث"
            aria-label="نص الحديث"
            className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm outline-none"
          />
          <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="مصدر الحديث" aria-label="مصدر الحديث" className={field} />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="كيف نغرس هذه القيمة"
            aria-label="وصف القيمة"
            className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm outline-none"
          />
          <label className="block text-[11px] font-bold text-muted-foreground">
            بداية الأسبوع
            <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} className={field} />
          </label>
          <button
            type="button"
            disabled={create.isPending || name.trim().length < 2}
            onClick={() => create.mutate()}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-50"
          >
            {create.isPending ? "جارٍ الحفظ…" : "حفظ القيمة"}
          </button>
        </section>
      )}

      <SectionHeader title="القيم" icon={HeartHandshake} tone="green" />
      {values.isLoading ? (
        <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>
      ) : (values.data ?? []).length === 0 ? (
        <EmptyState title="لا توجد قيم" message="أضف أول قيمة أسبوعية." />
      ) : (
        <div className="space-y-3">
          {(values.data ?? []).map((v) => (
            <article key={v.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-foreground">{v.name}</h3>
                  {v.tagline && <p className="mt-0.5 text-xs text-muted-foreground">{v.tagline}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <ToneBadge tone={v.approved ? "green" : "yellow"}>{v.approved ? "معتمدة" : "مسودة"}</ToneBadge>
                  {v.isCurrent && <ToneBadge tone="orange">قيمة الأسبوع</ToneBadge>}
                </div>
              </div>
              {v.hadith && (
                <p className="mt-2 rounded-2xl bg-muted p-3 text-[11px] leading-relaxed text-foreground/80">{v.hadith}</p>
              )}
              {v.source && <p className="mt-1.5 text-[11px] font-bold text-muted-foreground">المصدر: {v.source}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setApproval.mutate({ id: v.id, approved: !v.approved })}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-foreground hover:bg-muted"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-green-deep" />
                  {v.approved ? "إلغاء الاعتماد" : "اعتماد"}
                </button>
                <button
                  type="button"
                  onClick={() => setApproval.mutate({ id: v.id, approved: true, makeCurrent: true })}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-foreground hover:bg-muted"
                >
                  <Star className="h-3.5 w-3.5 text-brand-yellow-deep" />
                  اعتماد ونشر كقيمة الأسبوع
                </button>
                <button
                  type="button"
                  onClick={() => del.mutate(v.id)}
                  aria-label="حذف القيمة"
                  className="grid h-8 w-8 place-items-center rounded-xl border border-destructive/25 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
