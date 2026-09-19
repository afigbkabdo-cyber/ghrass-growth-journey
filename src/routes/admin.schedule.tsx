import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ListChecks,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Pencil,
  ArrowUp,
  ArrowDown,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { SectionHeader, EmptyState } from "@/components/ghiras";
import { listClasses } from "@/lib/directory.functions";
import { deleteScheduleItem, listSchedule, saveScheduleItem } from "@/lib/kg.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/schedule")({
  head: () => ({
    meta: [
      { title: "الجدول اليومي — لوحة إدارة غراس" },
      { name: "description", content: "إعداد فقرات الجدول اليومي لكل فصل ومتابعة ما أنجزته المعلمات." },
      { property: "og:title", content: "الجدول اليومي — لوحة إدارة غراس" },
      { property: "og:description", content: "إعداد الجدول اليومي لفصول روضة غراس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminSchedulePage,
});

const field =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:shadow-soft";

function AdminSchedulePage() {
  const { t, n, time } = useI18n();
  const qc = useQueryClient();
  const fetchClasses = useServerFn(listClasses);
  const fetchSchedule = useServerFn(listSchedule);
  const save = useServerFn(saveScheduleItem);
  const remove = useServerFn(deleteScheduleItem);

  const classes = useQuery({ queryKey: ["admin-classes"], queryFn: () => fetchClasses({}) });
  const [classId, setClassId] = useState<string | null>(null);
  const active = classId ?? (classes.data ?? [])[0]?.id ?? null;

  const [title, setTitle] = useState("");
  const [atTime, setAtTime] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTime, setEditTime] = useState("");

  const schedule = useQuery({
    queryKey: ["schedule", active],
    queryFn: () => fetchSchedule({ data: { classId: active! } }),
    enabled: Boolean(active),
  });

  const items = schedule.data ?? [];

  const add = useMutation({
    mutationFn: () =>
      save({
        data: {
          classId: active!,
          title: title.trim(),
          atTime: atTime || null,
          orderIndex: items.reduce((max, i) => Math.max(max, i.orderIndex), 0) + 1,
        },
      }),
    onSuccess: () => {
      setTitle("");
      setAtTime("");
      toast.success(t("تمت إضافة الفقرة"));
      qc.invalidateQueries({ queryKey: ["schedule", active] });
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر الحفظ")),
  });

  const update = useMutation({
    mutationFn: (v: {
      id: string;
      title: string;
      description: string | null;
      atTime: string | null;
      orderIndex: number;
    }) => save({ data: { ...v, classId: active! } }),
    onSuccess: () => {
      setEditId(null);
      toast.success(t("تم تحديث الفقرة"));
      qc.invalidateQueries({ queryKey: ["schedule", active] });
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر الحفظ")),
  });

  const reorder = useMutation({
    mutationFn: async (v: { index: number; dir: -1 | 1 }) => {
      const a = items[v.index];
      const b = items[v.index + v.dir];
      if (!a || !b) return;
      await save({
        data: {
          id: a.id,
          classId: active!,
          title: a.title,
          titleEn: a.titleEn,
          description: a.description,
          descriptionEn: a.descriptionEn,
          atTime: a.atTime,
          orderIndex: b.orderIndex,
        },
      });
      await save({
        data: {
          id: b.id,
          classId: active!,
          title: b.title,
          titleEn: b.titleEn,
          description: b.description,
          descriptionEn: b.descriptionEn,
          atTime: b.atTime,
          orderIndex: a.orderIndex,
        },
      });
    },
    onSuccess: () => {
      toast.success(t("تم تحديث الترتيب"));
      qc.invalidateQueries({ queryKey: ["schedule", active] });
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر الحفظ")),
  });

  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success(t("تم حذف الفقرة"));
      qc.invalidateQueries({ queryKey: ["schedule", active] });
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر الحذف")),
  });

  const startEdit = (id: string, itemTitle: string, description: string | null, itemTime: string | null) => {
    setEditId(id);
    setEditTitle(itemTitle);
    setEditDescription(description ?? "");
    setEditTime(itemTime ? itemTime.slice(0, 5) : "");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
        <h2 className="font-display text-lg font-extrabold text-foreground">{t("الجدول اليومي")}</h2>
        <p className="text-xs text-muted-foreground">{t("فقرات يوم الفصل — تراها المعلمة وولي الأمر")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(classes.data ?? []).map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setClassId(c.id)}
            aria-pressed={c.id === active}
            className={`rounded-full border px-4 py-1.5 text-xs font-bold ${
              c.id === active
                ? "border-transparent bg-brand-blue-soft text-brand-blue-deep"
                : "border-border text-muted-foreground"
            }`}
          >
            {n(c.name, c.nameEn)}
          </button>
        ))}
      </div>

      <section className="flex flex-wrap items-end gap-2 rounded-3xl border border-border bg-card p-4 shadow-soft">
        <label className="min-w-40 flex-1 text-[11px] font-bold text-muted-foreground">
          {t("عنوان الفقرة")}
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("مثال: الحلقة الصباحية")} className={field} />
        </label>
        <label className="text-[11px] font-bold text-muted-foreground">
          {t("الوقت")}
          <input type="time" value={atTime} onChange={(e) => setAtTime(e.target.value)} className={field} />
        </label>
        <button
          type="button"
          disabled={add.isPending || title.trim().length < 2 || !active}
          onClick={() => add.mutate()}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {t("إضافة")}
        </button>
      </section>

      <SectionHeader title={t("فقرات اليوم")} icon={ListChecks} tone="green" />
      {schedule.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("جارٍ التحميل…")}</p>
      ) : items.length === 0 ? (
        <EmptyState title={t("لا توجد فقرات")} message={t("أضف فقرات الجدول لهذا الفصل.")} />
      ) : (
        <div className="space-y-2.5">
          {items.map((s, index) =>
            editId === s.id ? (
              <div key={s.id} className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <label className="block text-[11px] font-bold text-muted-foreground">
                  {t("عنوان الفقرة")}
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={field} />
                </label>
                <label className="block text-[11px] font-bold text-muted-foreground">
                  {t("وصف الفقرة (اختياري)")}
                  <input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className={field}
                  />
                </label>
                <label className="block text-[11px] font-bold text-muted-foreground">
                  {t("الوقت")}
                  <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className={field} />
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={update.isPending || editTitle.trim().length < 2}
                    onClick={() =>
                      update.mutate({
                        id: s.id,
                        title: editTitle.trim(),
                        description: editDescription.trim() ? editDescription.trim() : null,
                        atTime: editTime || null,
                        orderIndex: s.orderIndex,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    {t("حفظ")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditId(null)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                    {t("إلغاء")}
                  </button>
                </div>
              </div>
            ) : (
              <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                {s.done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-green-deep" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{n(s.title, s.titleEn)}</p>
                  {s.description && (
                    <p className="truncate text-[11px] text-muted-foreground">{n(s.description, s.descriptionEn)}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    {s.atTime ? time(s.atTime.slice(0, 5)) : t("بدون وقت")} • {s.done ? t("أُنجزت اليوم") : t("لم تُنجز بعد")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    disabled={index === 0 || reorder.isPending}
                    onClick={() => reorder.mutate({ index, dir: -1 })}
                    aria-label={t("تحريك للأعلى")}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground disabled:opacity-40"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1 || reorder.isPending}
                    onClick={() => reorder.mutate({ index, dir: 1 })}
                    aria-label={t("تحريك للأسفل")}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground disabled:opacity-40"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(s.id, s.title, s.description, s.atTime)}
                    aria-label={t("تعديل الفقرة")}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-border text-brand-blue-deep"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => del.mutate(s.id)}
                    aria-label={t("حذف الفقرة")}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-destructive/25 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
