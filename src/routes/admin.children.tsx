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
  updateChild,
  updateProfileContact,
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
  const { t: tr, n, d } = useI18n();
  const qc = useQueryClient();
  const fetchChildren = useServerFn(listChildren);
  const fetchClasses = useServerFn(listClasses);
  const fetchParents = useServerFn(listParents);
  const addChild = useServerFn(createChild);
  const removeChild = useServerFn(deleteChild);
  const fetchDetails = useServerFn(getChildDetails);
  const moveChild = useServerFn(moveChildToClass);
  const saveChild = useServerFn(updateChild);
  const saveContact = useServerFn(updateProfileContact);

  const [q, setQ] = useState("");
  const [stage, setStage] = useState<Stage | "all">("all");
  const [open, setOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    nameEn: "",
    stage: "kg1" as Stage,
    birthDate: "",
    gender: "",
    allergies: "",
    notes: "",
    sessionPeriod: "",
    enrollmentTerm: "",
  });
  const [guardianEdits, setGuardianEdits] = useState<Record<string, { name: string; phone: string }>>({});
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
    { key: "nursery", label: tr(stageLabels.nursery) },
    { key: "kg1", label: tr(stageLabels.kg1) },
    { key: "kg2", label: tr(stageLabels.kg2) },
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
      setMessage(tr("تم تسجيل الطفل وحفظه."));
      qc.invalidateQueries({ queryKey: ["admin-children"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeChild({ data: { id } }),
    onSuccess: () => {
      setMessage(tr("تم حذف الطفل من السجل."));
      setConfirmDeleteId(null);
      setDetailId(null);
      qc.invalidateQueries({ queryKey: ["admin-children"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const move = useMutation({
    mutationFn: (v: { id: string; classId: string | null }) => moveChild({ data: v }),
    onSuccess: () => {
      setMessage(tr("تم نقل الطفل إلى الفصل الجديد دون تغيير بياناته الأساسية."));
      setMoveTarget("");
      qc.invalidateQueries({ queryKey: ["admin-children"] });
      qc.invalidateQueries({ queryKey: ["child-details"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const update = useMutation({
    mutationFn: () =>
      saveChild({
        data: {
          id: detailId!,
          name: editForm.name,
          nameEn: editForm.nameEn || null,
          stage: editForm.stage,
          birthDate: editForm.birthDate || null,
          gender: editForm.gender || null,
          allergies: editForm.allergies || null,
          notes: editForm.notes || null,
          sessionPeriod: editForm.sessionPeriod || null,
          enrollmentTerm: editForm.enrollmentTerm || null,
        },
      }),
    onSuccess: () => {
      setMessage(tr("تم حفظ التعديلات."));
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["admin-children"] });
      qc.invalidateQueries({ queryKey: ["child-details"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const updateGuardian = useMutation({
    mutationFn: (v: { id: string; fullName: string; phone: string | null }) =>
      saveContact({ data: v }),
    onSuccess: () => {
      setMessage(tr("تم حفظ بيانات ولي الأمر."));
      qc.invalidateQueries({ queryKey: ["child-details"] });
      qc.invalidateQueries({ queryKey: ["admin-parents"] });
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const startEditing = () => {
    if (!detail) return;
    setEditForm({
      name: detail.name,
      nameEn: detail.nameEn ?? "",
      stage: detail.stage as Stage,
      birthDate: detail.birthDate ?? "",
      gender: detail.gender ?? "",
      allergies: detail.allergies ?? "",
      notes: detail.notes ?? "",
      sessionPeriod: detail.sessionPeriod ?? "",
      enrollmentTerm: detail.enrollmentTerm ?? "",
    });
    setGuardianEdits(
      Object.fromEntries(detail.guardians.map((g) => [g.id, { name: g.name, phone: g.phone ?? "" }])),
    );
    setEditing(true);
  };

  const rows = childrenQuery.data ?? [];
  const list = useMemo(() => {
    const term = q.trim();
    return rows.filter(
      (c) =>
        (stage === "all" || c.stage === stage) &&
        (!term || c.name.includes(term) || (c.nameEn ?? "").includes(term) || (c.className ?? "").includes(term)),
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
          placeholder={tr("ابحث باسم الطفل أو الفصل…")}
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
          title={tr("لا نتائج مطابقة")}
          message={tr("جرّب اسمًا آخر أو غيّر المرحلة المحددة.")}
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
                setEditing(false);
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-start shadow-soft transition-colors hover:bg-muted/60"
            >
              <Avatar name={n(c.name, c.nameEn)} tone="orange" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{n(c.name, c.nameEn)}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {c.className ? n(c.className, c.classNameEn) : tr("بدون فصل")} · {tr("ولي الأمر")}:{" "}
                  {c.guardians.length ? c.guardians.map((g, i) => n(g, c.guardiansEn[i])).join("، ") : tr("غير مرتبط")}
                </p>
                {c.allergies && (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-extrabold text-destructive">
                    {tr("الحساسية")}: {n(c.allergies, c.allergiesEn)}
                  </p>
                )}
              </div>
              <ToneBadge tone="orange">{tr(stageLabels[c.stage as Stage] ?? c.stage)}</ToneBadge>
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
                  setEditing(false);
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
                    [tr("اسم الطفل"), n(detail.name, detail.nameEn)],
                    [tr("تاريخ الميلاد"), detail.birthDate ? d(detail.birthDate) : ""],
                    [tr("الفئة العمرية"), tr(stageLabels[detail.stage as Stage] ?? detail.stage)],
                    [tr("الفصل"), detail.className ? n(detail.className, detail.classNameEn) : ""],
                    [tr("الفترة"), detail.sessionPeriod],
                    [tr("فترة التسجيل"), detail.enrollmentTerm],
                    [tr("الحساسية"), detail.allergies],
                    [tr("ملاحظات"), detail.notes],
                    [tr("تاريخ الإضافة"), d(detail.createdAt)],
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
                        {n(g.name, g.nameEn)}
                        {g.phone ? ` · ${g.phone}` : ""}
                      </span>
                    </div>
                  ))}
                </div>

                {editing ? (
                  <div className="mt-4 space-y-2.5 rounded-2xl border border-border p-3">
                    <p className="text-xs font-bold text-foreground">{tr("تعديل بيانات الطفل")}</p>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder={tr("اسم الطفل")}
                      className={inputCls}
                    />
                    <input
                      value={editForm.nameEn}
                      onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })}
                      placeholder={tr("الاسم بالإنجليزية (اختياري)")}
                      dir="ltr"
                      className={inputCls}
                    />
                    <select
                      value={editForm.stage}
                      onChange={(e) => setEditForm({ ...editForm, stage: e.target.value as Stage })}
                      aria-label={tr("الفئة العمرية")}
                      className={inputCls}
                    >
                      <option value="nursery">{tr(stageLabels.nursery)}</option>
                      <option value="kg1">{tr(stageLabels.kg1)}</option>
                      <option value="kg2">{tr(stageLabels.kg2)}</option>
                    </select>
                    <label className="block text-[11px] font-bold text-muted-foreground">
                      {tr("تاريخ الميلاد")}
                      <input
                        type="date"
                        value={editForm.birthDate}
                        onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                        className={inputCls}
                      />
                    </label>
                    <input
                      value={editForm.sessionPeriod}
                      onChange={(e) => setEditForm({ ...editForm, sessionPeriod: e.target.value })}
                      placeholder={tr("الفترة")}
                      className={inputCls}
                    />
                    <input
                      value={editForm.enrollmentTerm}
                      onChange={(e) => setEditForm({ ...editForm, enrollmentTerm: e.target.value })}
                      placeholder={tr("فترة التسجيل")}
                      className={inputCls}
                    />
                    <input
                      value={editForm.allergies}
                      onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                      placeholder={tr("الحساسية")}
                      className={inputCls}
                    />
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder={tr("ملاحظات")}
                      rows={2}
                      className={inputCls}
                    />
                    {detail.guardians.map((g) => (
                      <div key={g.id} className="space-y-2 rounded-xl bg-muted p-2.5">
                        <p className="text-[11px] font-bold text-muted-foreground">{tr("ولي الأمر")}</p>
                        <input
                          value={guardianEdits[g.id]?.name ?? ""}
                          onChange={(e) =>
                            setGuardianEdits({
                              ...guardianEdits,
                              [g.id]: { ...guardianEdits[g.id], name: e.target.value },
                            })
                          }
                          placeholder={tr("اسم ولي الأمر")}
                          className={inputCls}
                        />
                        <input
                          value={guardianEdits[g.id]?.phone ?? ""}
                          onChange={(e) =>
                            setGuardianEdits({
                              ...guardianEdits,
                              [g.id]: { ...guardianEdits[g.id], phone: e.target.value },
                            })
                          }
                          placeholder={tr("رقم الجوال")}
                          dir="ltr"
                          inputMode="tel"
                          className={inputCls}
                        />
                        <button
                          type="button"
                          disabled={updateGuardian.isPending}
                          onClick={() =>
                            updateGuardian.mutate({
                              id: g.id,
                              fullName: guardianEdits[g.id]?.name ?? g.name,
                              phone: guardianEdits[g.id]?.phone || null,
                            })
                          }
                          className="w-full rounded-xl border border-border bg-card py-2 text-xs font-bold text-foreground disabled:opacity-60"
                        >
                          {tr("حفظ بيانات ولي الأمر")}
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={update.isPending || editForm.name.trim().length < 2}
                        onClick={() => update.mutate()}
                        className="flex-1 rounded-2xl bg-primary py-2.5 text-xs font-extrabold text-primary-foreground disabled:opacity-60"
                      >
                        {update.isPending ? tr("جارٍ الحفظ…") : tr("حفظ التعديلات")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="rounded-2xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground"
                      >
                        {tr("إلغاء")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="mt-4 w-full rounded-2xl border border-border bg-muted py-3 text-sm font-bold text-foreground"
                  >
                    {tr("تعديل البيانات")}
                  </button>
                )}

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
                        {n(c.name)}
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
            <option value="nursery">{tr(stageLabels.nursery)}</option>
            <option value="kg1">{tr(stageLabels.kg1)}</option>
            <option value="kg2">{tr(stageLabels.kg2)}</option>
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
                {n(c.name)}
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
                {n(p.name, p.nameEn)}
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
            placeholder={tr("الفترة (مثال: صباحية ٧:٠٠ — ١٢:٣٠)")}
            aria-label={tr("الفترة")}
            className={inputCls}
          />
          <input
            value={form.enrollmentTerm}
            onChange={(e) => setForm({ ...form, enrollmentTerm: e.target.value })}
            placeholder={tr("فترة التسجيل (مثال: الفصل الأول ١٤٤٨هـ)")}
            aria-label={tr("فترة التسجيل")}
            className={inputCls}
          />
          <input
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            placeholder={tr("الحساسية (اتركه فارغًا إن لا يوجد)")}
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
