import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { HeartHandshake, Plus, X, Trash2, CheckCircle2, Star, Pencil, Archive } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader, ToneBadge, EmptyState } from "@/components/ghiras";
import { approveValue, deleteValue, listValues, saveValue } from "@/lib/kg.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/values")({
  head: () => ({
    meta: [
      { title: "خطة القيم — لوحة إدارة غراس" },
      { name: "description", content: "إضافة قيم الأسبوع ومحتواها التعليمي واعتمادها وأرشفة القيم السابقة." },
      { property: "og:title", content: "خطة القيم — لوحة إدارة غراس" },
      { property: "og:description", content: "إدارة خطة القيم الأسبوعية ومحتواها وأرشيفها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminValuesPage,
});

const field = "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary";
const area = "w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm outline-none";

function ListEditor({
  title,
  items,
  setItems,
  placeholder,
}: {
  title: string;
  items: string[];
  setItems: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const addItem = () => {
    const v = draft.trim();
    if (!v) return;
    setItems([...items, v]);
    setDraft("");
  };
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-3">
      <p className="mb-2 text-xs font-extrabold text-foreground">{title}</p>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={`${it}-${i}`} className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
            <span className="min-w-0 flex-1 text-xs text-foreground">{it}</span>
            <button
              type="button"
              aria-label={`حذف: ${it}`}
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-destructive/25 text-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          aria-label={title}
          className={field}
        />
        <button
          type="button"
          onClick={addItem}
          aria-label="إضافة"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"
        >
          <Plus className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}

function AdminValuesPage() {
  const { t: tr } = useI18n();
  const qc = useQueryClient();
  const fetchValues = useServerFn(listValues);
  const save = useServerFn(saveValue);
  const approve = useServerFn(approveValue);
  const removeValue = useServerFn(deleteValue);

  const values = useQuery({ queryKey: ["admin-values"], queryFn: () => fetchValues({}) });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [hadith, setHadith] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [learnings, setLearnings] = useState<string[]>([]);
  const [atSchool, setAtSchool] = useState<string[]>([]);
  const [atHome, setAtHome] = useState<string[]>([]);

  const reset = () => {
    setEditId(null);
    setName("");
    setTagline("");
    setHadith("");
    setSource("");
    setDescription("");
    setWeekStart("");
    setLearnings([]);
    setAtSchool([]);
    setAtHome([]);
  };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-values"] });
    qc.invalidateQueries({ queryKey: ["current-value"] });
  };

  const create = useMutation({
    mutationFn: () =>
      save({
        data: {
          ...(editId ? { id: editId } : {}),
          name: name.trim(),
          tagline: tagline.trim() || null,
          hadith: hadith.trim() || null,
          source: source.trim() || null,
          description: description.trim() || null,
          weekStart: weekStart || null,
          learnings,
          atSchool,
          atHome,
        },
      }),
    onSuccess: () => {
      toast.success(editId ? "تم تحديث القيمة" : "تمت إضافة القيمة — تحتاج اعتمادًا لتظهر للمعلمات وأولياء الأمور");
      reset();
      setOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message || tr("تعذر الحفظ")),
  });

  const setApproval = useMutation({
    mutationFn: (v: { id: string; approved: boolean; makeCurrent?: boolean }) => approve({ data: v }),
    onSuccess: () => {
      toast.success("تم تحديث حالة القيمة");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => removeValue({ data: { id } }),
    onSuccess: () => {
      toast.success("تم حذف القيمة");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = values.data ?? [];
  const current = rows.filter((v) => v.isCurrent || !v.approved);
  const archive = rows.filter((v) => v.approved && !v.isCurrent);

  const startEdit = (v: (typeof rows)[number]) => {
    setEditId(v.id);
    setName(v.name);
    setTagline(v.tagline ?? "");
    setHadith(v.hadith ?? "");
    setSource(v.source ?? "");
    setDescription(v.description ?? "");
    setWeekStart(v.weekStart ?? "");
    setLearnings(v.learnings);
    setAtSchool(v.atSchool);
    setAtHome(v.atHome);
    setOpen(true);
  };

  const card = (v: (typeof rows)[number]) => (
    <article key={v.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-foreground">{v.name}</h3>
          {v.tagline && <p className="mt-0.5 text-xs text-muted-foreground">{v.tagline}</p>}
          {v.weekStart && <p className="mt-0.5 text-[11px] text-muted-foreground">{v.weekStart}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <ToneBadge tone={v.approved ? "green" : "yellow"}>{v.approved ? tr("معتمدة") : tr("مسودة")}</ToneBadge>
          {v.isCurrent && <ToneBadge tone="orange">{tr("قيمة الأسبوع")}</ToneBadge>}
        </div>
      </div>
      {v.hadith && (
        <p className="mt-2 rounded-2xl bg-muted p-3 text-[11px] leading-relaxed text-foreground/80">{v.hadith}</p>
      )}
      {v.source && (
        <p className="mt-1.5 text-[11px] font-bold text-muted-foreground">
          {tr("المصدر")}: {v.source}
        </p>
      )}
      {[
        [tr("ماذا سيتعلم طفلك؟"), v.learnings],
        [tr("ماذا نفعل في الروضة؟"), v.atSchool],
        [tr("كيف تشارك من البيت؟"), v.atHome],
      ].map(([label, items]) =>
        (items as string[]).length > 0 ? (
          <div key={label as string} className="mt-2.5">
            <p className="text-[11px] font-extrabold text-foreground">{label}</p>
            <ul className="mt-1 space-y-1">
              {(items as string[]).map((i) => (
                <li key={i} className="text-[11px] text-muted-foreground">
                  • {i}
                </li>
              ))}
            </ul>
          </div>
        ) : null,
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => startEdit(v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-foreground hover:bg-muted"
        >
          <Pencil className="h-3.5 w-3.5" />
          {tr("تعديل")}
        </button>
        <button
          type="button"
          onClick={() => setApproval.mutate({ id: v.id, approved: !v.approved })}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-foreground hover:bg-muted"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-brand-green-deep" />
          {v.approved ? tr("إلغاء الاعتماد") : tr("اعتماد")}
        </button>
        <button
          type="button"
          onClick={() => setApproval.mutate({ id: v.id, approved: true, makeCurrent: true })}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-foreground hover:bg-muted"
        >
          <Star className="h-3.5 w-3.5 text-brand-yellow-deep" />
          {tr("اعتماد ونشر كقيمة الأسبوع")}
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
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-3xl border border-border bg-card p-4 shadow-soft">
        <div>
          <h2 className="font-display text-lg font-extrabold text-foreground">{tr("خطة القيم")}</h2>
          <p className="text-xs text-muted-foreground">القيم والأحاديث والمحتوى تُدار من الإدارة فقط</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (open) reset();
            setOpen((o) => !o);
          }}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"
          aria-label="إضافة قيمة"
        >
          {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <section className="space-y-2.5 rounded-3xl border border-brand-green-soft bg-card p-4 shadow-soft">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم القيمة (مثال: الرحمة)"
            aria-label={tr("اسم القيمة")}
            className={field}
          />
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder={tr("عبارة تعريفية قصيرة")}
            aria-label={tr("عبارة تعريفية قصيرة")}
            className={field}
          />
          <textarea
            value={hadith}
            onChange={(e) => setHadith(e.target.value)}
            rows={3}
            placeholder={tr("نص الحديث")}
            aria-label={tr("نص الحديث")}
            className={area}
          />
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder={tr("مصدر الحديث")}
            aria-label={tr("مصدر الحديث")}
            className={field}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="كيف نغرس هذه القيمة"
            aria-label="وصف القيمة"
            className={area}
          />
          <label className="block text-[11px] font-bold text-muted-foreground">
            {tr("بداية الأسبوع")}
            <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} className={field} />
          </label>

          <ListEditor
            title={tr("ماذا سيتعلم طفلك؟")}
            items={learnings}
            setItems={setLearnings}
            placeholder="أضف هدف تعلم…"
          />
          <ListEditor
            title={tr("ماذا نفعل في الروضة؟")}
            items={atSchool}
            setItems={setAtSchool}
            placeholder="أضف نشاطًا في الروضة…"
          />
          <ListEditor
            title={tr("كيف تشارك من البيت؟")}
            items={atHome}
            setItems={setAtHome}
            placeholder="أضف فكرة منزلية…"
          />

          <button
            type="button"
            disabled={create.isPending || name.trim().length < 2}
            onClick={() => create.mutate()}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-50"
          >
            {create.isPending ? tr("جارٍ الحفظ…") : tr("حفظ")}
          </button>
        </section>
      )}

      <SectionHeader title={tr("القيم")} icon={HeartHandshake} tone="green" />
      {values.isLoading ? (
        <p className="text-sm text-muted-foreground">{tr("جارٍ التحميل…")}</p>
      ) : rows.length === 0 ? (
        <EmptyState title="لا توجد قيم" message="أضف أول قيمة أسبوعية." />
      ) : (
        <>
          <div className="space-y-3">{current.map(card)}</div>
          {archive.length > 0 && (
            <>
              <SectionHeader title={tr("أرشيف قيم الأسابيع")} icon={Archive} tone="blue" />
              <div className="space-y-3">{archive.map(card)}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}
