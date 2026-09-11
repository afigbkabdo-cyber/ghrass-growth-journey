import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Baby, Search, UserPlus, Trash2, X, ArrowLeftRight } from "lucide-react";
import { Avatar, EmptyState, ErrorState, LoadingCards, SectionHeader, ToneBadge } from "@/components/ghiras";
import {
  createChild,
  deleteChild,
  getChildDetails,
  listChildren,
  listClasses,
  listParents,
  moveChildToClass,
} from "@/lib/directory.functions";
import { stageLabels, type Stage } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/children")({
  head: () => ({
    meta: [
      { title: "الأطفال — لوحة إدارة غراس" },
      { name: "description", content: "سجل جميع أطفال روضة غراس وتوزيعهم على الفصول والمراحل." },
      { property: "og:title", content: "الأطفال — لوحة إدارة غراس" },
      { property: "og:description", content: "إدارة سجل الأطفال وتوزيع الفصول." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminChildren,
});

const inputCls =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary";

function AdminChildren() {
  const { t: tr } = useI18n();
  const qc = useQueryClient();
  const fetchChildren = useServerFn(listChildren);
  const fetchClasses = useServerFn(listClasses);
  const fetchParents = useServerFn(listParents);
  const addChild = useServerFn(createChild);
  const removeChild = useServerFn(deleteChild);
  const fetchDetails = useServerFn(getChildDetails);
  const moveChild = useServerFn(moveChildToClass);

  const [q, setQ] = useState("");
  const [stage, setStage] = useState<Stage | "all">("all");
  const [open, setOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState("");
  const [form, setForm] = useState({
    name: "",
    stage: "kg1" as Stage,
    classId: "",
    guardianId: "",
    birthDate: "",
    allergies: "",
    sessionPeriod: "",
    enrollmentTerm: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  const childrenQuery = useQuery({ queryKey: ["admin-children"], queryFn: () => fetchChildren({}) });
  const classesQuery = useQuery({ queryKey: ["admin-classes"], queryFn: () => fetchClasses({}) });
  const parentsQuery = useQuery({ queryKey: ["admin-parents"], queryFn: () => fetchParents({}) });
  const detailQuery = useQuery({
    queryKey: ["child-details", detailId],
    queryFn: () => fetchDetails({ data: { id: detailId! } }),
    enabled: !!detailId,
  });

  const stageFilters: { key: Stage | "all"; label: string }[] = [
    { key: "all", label: tr("الكل") },
    { key: "nursery", label: stageLabels.nursery },
    { key: "kg1", label: stageLabels.kg1 },
    { key: "kg2", label: stageLabels.kg2 },
  ];

  const create = useMutation({
    mutationFn: () =>
      addChild({
        data: {
          name: form.name,
          stage: form.stage,
          classId: form.classId || null,
          guardianId: form.guardianId || null,
          birthDate: form.birthDate || null,
          allergies: form.allergies || null,
          sessionPeriod: form.sessionPeriod || null,
          enrollmentTerm: form.enrollmentTerm || null,
        },
      }),
    onSuccess: () => {
      setForm({
        name: "",
        stage: "kg1",
        classId: "",
        guardianId: "",
        birthDate: "",
        allergies: "",
        sessionPeriod: "",
        enrollmentTerm: "",
      });
      setOpen(false);
      setMessage("تم تسجيل الطفل وحفظه.");
      qc.invalidateQueries({ queryKey: ["admin-children"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeChild({ data: { id } }),
    onSuccess: () => {
      setMessage("تم حذف الطفل من السجل.");
      setConfirmDeleteId(null);
      setDetailId(null);
      qc.invalidateQueries({ queryKey: ["admin-children"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const move = useMutation({
    mutationFn: (v: { id: string; classId: string | null }) => moveChild({ data: v }),
    onSuccess: () => {
      setMessage("تم نقل الطفل إلى الفصل الجديد دون تغيير بياناته الأساسية.");
      setMoveTarget("");
      qc.invalidateQueries({ queryKey: ["admin-children"] });
      qc.invalidateQueries({ queryKey: ["child-details"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const rows = childrenQuery.data ?? [];
  const list = useMemo(() => {
    const term = q.trim();
    return rows.filter(
      (c) =>
        (stage === "all" || c.stage === stage) &&
        (!term || c.name.includes(term) || (c.className ?? "").includes(term)),
    );
  }, [rows, q, stage]);

  const detail = detailQuery.data;

  return (
    <div className="space-y-5">
      <SectionHeader
        title={tr("سجل الأطفال")}
        subtitle={`${rows.length} · ${(classesQuery.data ?? []).length} ${tr("الفصول")}`}
        icon={Baby}
        tone="orange"
      />

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 start-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث باسم الطفل أو الفصل…"
          aria-label={tr("بحث")}
          className="w-full rounded-2xl border border-border bg-card py-3 ps-10 pe-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {stageFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStage(f.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
              stage === f.key
                ? "bg-brand-orange text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {message && (
        <p className="rounded-xl bg-brand-green-soft px-3 py-2.5 text-[11px] font-bold text-brand-green-deep">
          {message}
        </p>
      )}

      {childrenQuery.isPending ? (
        <LoadingCards count={4} />
      ) : childrenQuery.isError ? (
        <ErrorState onRetry={() => childrenQuery.refetch()} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={Baby}
          title="لا نتائج مطابقة"
          message="جرّب اسمًا آخر أو غيّر المرحلة المحددة."
          tone="orange"
        />
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setDetailId(c.id);
                setMoveTarget("");
                setMessage(null);
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-start shadow-soft transition-colors hover:bg-muted/60"
            >
              <Avatar name={c.name} tone="orange" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{c.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {c.className ?? tr("بدون فصل")} · {tr("ولي الأمر")}:{" "}
                  {c.guardians.length ? c.guardians.join("، ") : tr("غير مرتبط")}
                </p>
                {c.allergies && (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-extrabold text-destructive">
                    {tr("الحساسية")}: {c.allergies}
                  </p>
                )}
              </div>
              <ToneBadge tone="orange">{stageLabels[c.stage as Stage] ?? c.stage}</ToneBadge>
            </button>
          ))}
        </div>
      )}

      {detailId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-5 shadow-soft sm:rounded-3xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-extrabold text-foreground">{tr("تفاصيل الطفل")}</h2>
              <button
                type="button"
                aria-label={tr("إغلاق")}
                onClick={() => {
                  setDetailId(null);
                  setConfirmDeleteId(null);
                }}
                className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {detailQuery.isPending ? (
              <p className="text-sm text-muted-foreground">{tr("جارٍ التحميل…")}</p>
            ) : !detail ? (
              <p className="text-sm text-muted-foreground">{tr("لا توجد بيانات")}</p>
            ) : (
              <>
                <div className="divide-y divide-border rounded-2xl border border-border">
                  {[
                    [tr("اسم الطفل"), detail.name],
                    [tr("تاريخ الميلاد"), detail.birthDate],
                    [tr("الفئة العمرية"), stageLabels[detail.stage as Stage] ?? detail.stage],
                    [tr("الفصل"), detail.className],
                    [tr("الفترة"), detail.sessionPeriod],
                    [tr("فترة التسجيل"), detail.enrollmentTerm],
                    [tr("الحساسية"), detail.allergies],
                    ["ملاحظات", detail.notes],
                    [tr("تاريخ الإضافة"), new Date(detail.createdAt).toLocaleDateString("ar-SA")],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex items-start justify-between gap-3 p-3">
                      <span className="text-[11px] font-bold text-muted-foreground">{label}</span>
                      <span className="text-xs font-bold text-foreground">{value || tr("غير محدد")}</span>
                    </div>
                  ))}
                  {detail.guardians.map((g) => (
                    <div key={g.id} className="flex items-start justify-between gap-3 p-3">
                      <span className="text-[11px] font-bold text-muted-foreground">{tr("ولي الأمر")}</span>
                      <span className="text-xs font-bold text-foreground">
                        {g.name}
                        {g.phone ? ` · ${g.phone}` : ""}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-3 rounded-2xl bg-muted p-3 text-[11px] leading-relaxed text-muted-foreground">
                  {tr("بيانات التسجيل للعرض فقط ولا يمكن تعديلها.")}
                </p>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold text-foreground">{tr("نقل إلى فصل آخر")}</p>
                  <select
                    value={moveTarget}
                    onChange={(e) => setMoveTarget(e.target.value)}
                    aria-label={tr("نقل إلى فصل آخر")}
                    className={inputCls}
                  >
                    <option value="">{tr("بدون فصل")}</option>
                    {(classesQuery.data ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={move.isPending}
                    onClick={() => move.mutate({ id: detail.id, classId: moveTarget || null })}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-60"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    {tr("نقل")}
                  </button>
                </div>

                <div className="mt-4">
                  {confirmDeleteId === detail.id ? (
                    <div className="space-y-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-3">
                      <p className="text-xs font-bold text-destructive">
                        {tr("هل تريد حذف الطفل نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.")}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={remove.isPending}
                          onClick={() => remove.mutate(detail.id)}
                          className="flex-1 rounded-2xl bg-destructive py-2.5 text-xs font-extrabold text-destructive-foreground disabled:opacity-60"
                        >
                          {tr("تأكيد الحذف")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="flex-1 rounded-2xl border border-border py-2.5 text-xs font-bold text-muted-foreground"
                        >
                          {tr("إلغاء")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(detail.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 py-3 text-sm font-bold text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      {tr("حذف الطفل")}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {open ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setMessage(null);
            create.mutate();
          }}
          className="space-y-3 rounded-3xl border border-border bg-card p-4 shadow-soft"
        >
          <p className="text-sm font-bold text-foreground">{tr("تسجيل طفل جديد")}</p>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={tr("اسم الطفل")}
            className={inputCls}
          />
          <select
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}
            aria-label={tr("الفئة العمرية")}
            className={inputCls}
          >
            <option value="nursery">{stageLabels.nursery}</option>
            <option value="kg1">{stageLabels.kg1}</option>
            <option value="kg2">{stageLabels.kg2}</option>
          </select>
          <select
            value={form.classId}
            onChange={(e) => setForm({ ...form, classId: e.target.value })}
            aria-label={tr("الفصل")}
            className={inputCls}
          >
            <option value="">{tr("بدون فصل")}</option>
            {(classesQuery.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={form.guardianId}
            onChange={(e) => setForm({ ...form, guardianId: e.target.value })}
            aria-label={tr("ولي الأمر")}
            className={inputCls}
          >
            <option value="">{tr("بدون ولي أمر")}</option>
            {(parentsQuery.data ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <label className="block text-[11px] font-bold text-muted-foreground">
            {tr("تاريخ الميلاد")}
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className={inputCls}
            />
          </label>
          <input
            value={form.sessionPeriod}
            onChange={(e) => setForm({ ...form, sessionPeriod: e.target.value })}
            placeholder="الفترة (مثال: صباحية ٧:٠٠ — ١٢:٣٠)"
            aria-label={tr("الفترة")}
            className={inputCls}
          />
          <input
            value={form.enrollmentTerm}
            onChange={(e) => setForm({ ...form, enrollmentTerm: e.target.value })}
            placeholder="فترة التسجيل (مثال: الفصل الأول ١٤٤٨هـ)"
            aria-label={tr("فترة التسجيل")}
            className={inputCls}
          />
          <input
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            placeholder="الحساسية (اتركه فارغًا إن لا يوجد)"
            aria-label={tr("الحساسية")}
            className={inputCls}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={create.isPending}
              className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {create.isPending ? tr("جارٍ الحفظ…") : tr("حفظ")}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold text-muted-foreground"
            >
              {tr("إلغاء")}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => {
            setMessage(null);
            setOpen(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-soft transition-transform active:scale-95"
        >
          <UserPlus className="h-4.5 w-4.5" />
          {tr("تسجيل طفل جديد")}
        </button>
      )}
    </div>
  );
}
