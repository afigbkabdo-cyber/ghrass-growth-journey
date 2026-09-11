import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { School, Plus, Trash2, Check, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, SectionHeader, ToneBadge } from "@/components/ghiras";
import {
  createClass,
  deleteClass,
  listClassDetails,
  renameClass,
  setClassTeacher,
} from "@/lib/classes.functions";
import { listStaff } from "@/lib/directory.functions";
import { stageLabels, type Stage } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/classes")({
  head: () => ({
    meta: [
      { title: "إدارة الفصول — لوحة إدارة غراس" },
      {
        name: "description",
        content: "إدارة فصول روضة غراس: إضافة فصل، تغيير الاسم، ربط المعلمات، ومتابعة أطفال كل فصل.",
      },
      { property: "og:title", content: "إدارة الفصول — لوحة إدارة غراس" },
      { property: "og:description", content: "إضافة وتعديل وحذف الفصول وربطها بالمعلمات والأطفال." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminClassesPage,
});

const inputCls =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary";

function AdminClassesPage() {
  const { t: tr } = useI18n();
  const qc = useQueryClient();
  const fetchClasses = useServerFn(listClassDetails);
  const fetchStaff = useServerFn(listStaff);
  const add = useServerFn(createClass);
  const rename = useServerFn(renameClass);
  const remove = useServerFn(deleteClass);
  const linkTeacher = useServerFn(setClassTeacher);

  const classes = useQuery({ queryKey: ["class-details"], queryFn: () => fetchClasses({}) });
  const staff = useQuery({ queryKey: ["admin-staff"], queryFn: () => fetchStaff({}) });
  const teachers = (staff.data ?? []).filter((s) => s.role === "teacher");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [stage, setStage] = useState<Stage>("kg1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["class-details"] });
    qc.invalidateQueries({ queryKey: ["admin-classes"] });
    qc.invalidateQueries({ queryKey: ["admin-children"] });
    qc.invalidateQueries({ queryKey: ["admin-staff"] });
  };

  const createMut = useMutation({
    mutationFn: () => add({ data: { name: name.trim(), stage } }),
    onSuccess: () => {
      toast.success("تمت إضافة الفصل");
      setName("");
      setOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const renameMut = useMutation({
    mutationFn: (v: { id: string; name: string }) => rename({ data: v }),
    onSuccess: () => {
      toast.success("تم تحديث اسم الفصل");
      setEditingId(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("تم حذف الفصل");
      setConfirmId(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const teacherMut = useMutation({
    mutationFn: (v: { classId: string; teacherId: string; linked: boolean }) => linkTeacher({ data: v }),
    onSuccess: () => {
      toast.success("تم تحديث ربط المعلمة بالفصل");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <SectionHeader title={tr("إدارة الفصول")} subtitle="الأسماء والأطفال والمعلمات" icon={School} tone="green" />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={tr("إضافة فصل")}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"
        >
          {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <section className="space-y-2.5 rounded-3xl border border-brand-green-soft bg-card p-4 shadow-soft">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={tr("اسم الفصل")}
            aria-label={tr("اسم الفصل")}
            className={inputCls}
          />
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as Stage)}
            aria-label={tr("المرحلة")}
            className={inputCls}
          >
            <option value="nursery">{stageLabels.nursery}</option>
            <option value="kg1">{stageLabels.kg1}</option>
            <option value="kg2">{stageLabels.kg2}</option>
          </select>
          <button
            type="button"
            disabled={createMut.isPending || name.trim().length < 2}
            onClick={() => createMut.mutate()}
            className="w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-50"
          >
            {createMut.isPending ? tr("جارٍ الحفظ…") : tr("إضافة فصل")}
          </button>
        </section>
      )}

      {classes.isLoading ? (
        <p className="text-sm text-muted-foreground">{tr("جارٍ التحميل…")}</p>
      ) : (classes.data ?? []).length === 0 ? (
        <EmptyState icon={School} title="لا توجد فصول" message="أضف أول فصل للروضة." tone="green" />
      ) : (
        (classes.data ?? []).map((c) => (
          <article key={c.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {editingId === c.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      aria-label={tr("اسم الفصل")}
                      className={inputCls}
                    />
                    <button
                      type="button"
                      aria-label={tr("حفظ")}
                      disabled={editName.trim().length < 2}
                      onClick={() => renameMut.mutate({ id: c.id, name: editName.trim() })}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={tr("إلغاء")}
                      onClick={() => setEditingId(null)}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="font-display text-base font-extrabold text-foreground">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {stageLabels[c.stage as Stage] ?? c.stage} · {tr("عدد الأطفال")}: {c.childCount}
                    </p>
                  </>
                )}
              </div>
              {editingId !== c.id && (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label={tr("تعديل")}
                    onClick={() => {
                      setEditingId(c.id);
                      setEditName(c.name);
                    }}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={tr("حذف الفصل")}
                    onClick={() => setConfirmId(c.id)}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-destructive/25 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {confirmId === c.id && (
              <div className="mt-3 space-y-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs font-bold text-destructive">
                  حذف الفصل نهائيًا؟ لن يُحذف إن كان مرتبطًا بأطفال أو بيانات.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={deleteMut.isPending}
                    onClick={() => deleteMut.mutate(c.id)}
                    className="flex-1 rounded-2xl bg-destructive py-2.5 text-xs font-extrabold text-destructive-foreground disabled:opacity-60"
                  >
                    {tr("تأكيد الحذف")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(null)}
                    className="flex-1 rounded-2xl border border-border py-2.5 text-xs font-bold text-muted-foreground"
                  >
                    {tr("إلغاء")}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3">
              <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">{tr("المعلمات")}</p>
              <div className="flex flex-wrap gap-2">
                {teachers.length === 0 ? (
                  <span className="text-[11px] text-muted-foreground">{tr("لا توجد بيانات")}</span>
                ) : (
                  teachers.map((t) => {
                    const linked = c.teachers.some((x) => x.id === t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => teacherMut.mutate({ classId: c.id, teacherId: t.id, linked: !linked })}
                        className={
                          linked
                            ? "rounded-full bg-brand-blue-soft px-3 py-1.5 text-[11px] font-extrabold text-brand-blue-deep"
                            : "rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-muted-foreground hover:bg-muted"
                        }
                      >
                        {t.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {c.children.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-[11px] font-bold text-muted-foreground">{tr("الأطفال")}</p>
                <div className="flex flex-wrap gap-2">
                  {c.children.map((k) => (
                    <span
                      key={k.id}
                      className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      {k.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3">
              <ToneBadge tone="green">
                {c.childCount} · {tr("عدد الأطفال")}
              </ToneBadge>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
