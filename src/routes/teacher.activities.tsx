import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Blocks, Plus, Image, Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, SectionHeader, ToneBadge, toneClasses } from "@/components/ghiras";
import {
  teacherActivities,
  otherSubjectActivities,
  subjectLabels,
  activityStateLabels,
  teacherValueGuide,
  currentTeacher,
  type TeacherActivity,
} from "@/lib/teacher-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/activities")({
  head: () => ({
    meta: [
      { title: "أنشطة فصلي — غراس" },
      { name: "description", content: "إضافة الأنشطة اليومية وربطها بقيمة الأسبوع ونشرها لأولياء الأمور." },
      { property: "og:title", content: "أنشطة فصلي — غراس" },
      { property: "og:description", content: "إدارة الأنشطة التعليمية في روضة غراس." },
    ],
  }),
  component: TeacherActivitiesPage,
});

const filters = [
  { key: "all", label: "الكل" },
  { key: "published", label: "منشور" },
  { key: "draft", label: "مسودة" },
] as const;

function TeacherActivitiesPage() {
  const [items, setItems] = useState<TeacherActivity[]>(teacherActivities);
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skill, setSkill] = useState("");

  const list = items.filter((a) => (filter === "all" ? true : a.state === filter));

  function toggleVisibility(id: string) {
    setItems((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              visibleToParents: !a.visibleToParents,
              state: !a.visibleToParents ? "published" : "draft",
            }
          : a,
      ),
    );
  }

  function createActivity() {
    if (!title.trim()) {
      toast.error("اكتبي عنوان النشاط");
      return;
    }
    setItems((prev) => [
      {
        id: `new-${prev.length + 1}`,
        emoji: "🌟",
        title: title.trim(),
        subject: currentTeacher.subject,
        value: teacherValueGuide.name,
        teacher: currentTeacher.name,
        description: description.trim() || "نشاط جديد مرتبط بقيمة الأسبوع.",
        skill: skill.trim() || "مهارة عامة",
        state: "draft",
        visibleToParents: false,
        photos: 0,
        tone: "pink",
      },
      ...prev,
    ]);
    setTitle("");
    setDescription("");
    setSkill("");
    setOpen(false);
    toast.success("تم إنشاء النشاط كمسودة");
  }

  return (
    <PageContainer>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-orange-soft">
            <Blocks className="h-5.5 w-5.5 text-brand-orange-deep" strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground">أنشطة فصلي</h1>
            <p className="text-xs text-muted-foreground">
              مرتبطة بقيمة الأسبوع: {teacherValueGuide.name}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
          aria-label="إضافة نشاط"
        >
          {open ? <X className="h-5 w-5" strokeWidth={2.4} /> : <Plus className="h-5 w-5" strokeWidth={2.4} />}
        </button>
      </header>

      {open && (
        <section className="mb-5 rounded-3xl border border-brand-orange-soft bg-card p-4 shadow-soft">
          <h2 className="mb-3 text-sm font-extrabold text-foreground">نشاط جديد</h2>
          <div className="space-y-2.5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان النشاط"
              aria-label="عنوان النشاط"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:shadow-soft"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="وصف مختصر لما فعله الأطفال…"
              aria-label="وصف النشاط"
              className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm outline-none focus:shadow-soft"
            />
            <input
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="المهارة المستهدفة"
              aria-label="المهارة المستهدفة"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:shadow-soft"
            />
            <p className="rounded-2xl bg-muted p-3 text-[11px] leading-relaxed text-muted-foreground">
              القيمة والحديث ومصدرهما معتمدان من الإدارة ولا يمكن تعديلهما من واجهة المعلمة.
            </p>
            <button
              type="button"
              onClick={createActivity}
              className="w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground transition-opacity hover:opacity-90"
            >
              حفظ كمسودة
            </button>
          </div>
        </section>
      )}

      <div className="mb-4 flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-bold transition-colors",
              filter === f.key
                ? "border-transparent bg-brand-blue-soft text-brand-blue-deep"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mb-6 space-y-3">
        {list.map((a) => {
          const t = toneClasses[a.tone];
          return (
            <article key={a.id} className="rounded-3xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-start gap-3">
                <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl", t.soft)}>
                  {a.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-sm font-extrabold text-foreground">{a.title}</h3>
                    <ToneBadge tone={a.state === "published" ? "green" : "yellow"}>
                      {activityStateLabels[a.state]}
                    </ToneBadge>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.description}</p>
                  <p className="mt-2 text-[11px] font-bold text-brand-blue-deep">🎯 {a.skill}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                      <Image className="h-3.5 w-3.5" strokeWidth={2.2} />
                      {a.photos} صورة
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleVisibility(a.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-foreground transition-colors hover:bg-muted"
                    >
                      {a.visibleToParents ? (
                        <>
                          <Eye className="h-3.5 w-3.5 text-brand-green-deep" strokeWidth={2.2} />
                          مرئي لأولياء الأمور
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5" strokeWidth={2.2} />
                          غير منشور
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <SectionHeader
        title="أنشطة المواد الأخرى"
        subtitle="مرتبطة بنفس القيمة — للعرض فقط"
        icon={Blocks}
        tone="green"
      />
      <div className="space-y-2">
        {otherSubjectActivities.map((a) => (
          <div
            key={a.title}
            className="flex items-center justify-between gap-2 rounded-2xl border border-dashed border-border bg-muted/40 p-3.5"
          >
            <p className="truncate text-xs font-bold text-foreground">{a.title}</p>
            <ToneBadge tone={a.tone}>{subjectLabels[a.subject]}</ToneBadge>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
