import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Baby, Search, UserPlus, Trash2 } from "lucide-react";
import { Avatar, EmptyState, ErrorState, LoadingCards, SectionHeader, ToneBadge } from "@/components/ghiras";
import { createChild, deleteChild, listChildren, listClasses, listParents } from "@/lib/directory.functions";
import { stageLabels, type Stage } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/children")({
  head: () => ({
    meta: [
      { title: "الأطفال — لوحة إدارة غراس" },
      { name: "description", content: "سجل جميع أطفال روضة غراس وتوزيعهم على الفصول والمراحل." },
      { property: "og:title", content: "الأطفال — لوحة إدارة غراس" },
      { property: "og:description", content: "إدارة سجل الأطفال وتوزيع الفصول." },
    ],
  }),
  component: AdminChildren,
});

const stageFilters: { key: Stage | "all"; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "nursery", label: stageLabels.nursery },
  { key: "kg1", label: stageLabels.kg1 },
  { key: "kg2", label: stageLabels.kg2 },
];

function AdminChildren() {
  const qc = useQueryClient();
  const fetchChildren = useServerFn(listChildren);
  const fetchClasses = useServerFn(listClasses);
  const fetchParents = useServerFn(listParents);
  const addChild = useServerFn(createChild);
  const removeChild = useServerFn(deleteChild);

  const [q, setQ] = useState("");
  const [stage, setStage] = useState<Stage | "all">("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    stage: "kg1" as Stage,
    classId: "",
    guardianId: "",
    birthDate: "",
    allergies: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  const childrenQuery = useQuery({ queryKey: ["admin-children"], queryFn: () => fetchChildren({}) });
  const classesQuery = useQuery({ queryKey: ["admin-classes"], queryFn: () => fetchClasses({}) });
  const parentsQuery = useQuery({ queryKey: ["admin-parents"], queryFn: () => fetchParents({}) });

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
        },
      }),
    onSuccess: () => {
      setForm({ name: "", stage: "kg1", classId: "", guardianId: "", birthDate: "", allergies: "" });
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
      qc.invalidateQueries({ queryKey: ["admin-children"] });
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

  return (
    <div className="space-y-5">
      <SectionHeader
        title="سجل الأطفال"
        subtitle={`${rows.length} طفلًا في ${(classesQuery.data ?? []).length} فصول`}
        icon={Baby}
        tone="orange"
      />

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 start-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث باسم الطفل أو الفصل…"
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
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft"
            >
              <Avatar name={c.name} tone="orange" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{c.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {c.className ?? "بدون فصل"} · ولي الأمر:{" "}
                  {c.guardians.length ? c.guardians.join("، ") : "غير مرتبط"}
                </p>
                {c.allergies && (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-extrabold text-destructive">
                    حساسية: {c.allergies}
                  </p>
                )}
              </div>
              <ToneBadge tone="orange">{stageLabels[c.stage as Stage] ?? c.stage}</ToneBadge>
              <button
                onClick={() => remove.mutate(c.id)}
                aria-label={`حذف ${c.name}`}
                className="rounded-xl border border-brand-pink/40 bg-brand-pink-soft/50 p-2 text-brand-pink-deep"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
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
          <p className="text-sm font-bold text-foreground">تسجيل طفل جديد</p>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="اسم الطفل"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <select
            value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value as Stage })}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          >
            <option value="nursery">{stageLabels.nursery}</option>
            <option value="kg1">{stageLabels.kg1}</option>
            <option value="kg2">{stageLabels.kg2}</option>
          </select>
          <select
            value={form.classId}
            onChange={(e) => setForm({ ...form, classId: e.target.value })}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          >
            <option value="">بدون فصل</option>
            {(classesQuery.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={form.guardianId}
            onChange={(e) => setForm({ ...form, guardianId: e.target.value })}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          >
            <option value="">بدون ولي أمر</option>
            {(parentsQuery.data ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <label className="block text-[11px] font-bold text-muted-foreground">
            تاريخ الميلاد (لحساب العمر)
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <input
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            placeholder="الحساسية (اتركه فارغًا إن لا يوجد)"
            aria-label="الحساسية"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={create.isPending}
              className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {create.isPending ? "جارٍ الحفظ…" : "حفظ"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold text-muted-foreground"
            >
              إلغاء
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
          تسجيل طفل جديد
        </button>
      )}
    </div>
  );
}
