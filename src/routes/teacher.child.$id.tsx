import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { NotebookPen, MessagesSquare, TrendingUp, Send, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  PageContainer,
  Avatar,
  SectionHeader,
  ToneBadge,
  ProgressBar,
  EmptyState,
  toneClasses,
} from "@/components/ghiras";
import {
  teacherChildren,
  childNotesLog,
  devIndicators,
  learnedValues,
  noteDomains,
  type NoteDomain,
  type ChildNote,
} from "@/lib/teacher-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teacher/child/$id")({
  head: () => ({
    meta: [
      { title: "ملف الطفل — واجهة المعلمة | غراس" },
      { name: "description", content: "ملف الطفل من منظور المعلمة: الحضور، الملاحظات، مؤشرات التطور، والقيم." },
      { property: "og:title", content: "ملف الطفل — واجهة المعلمة | غراس" },
      { property: "og:description", content: "متابعة تطور الطفل وملاحظاته اليومية." },
    ],
  }),
  notFoundComponent: ChildNotFound,
  component: TeacherChildPage,
});

function ChildNotFound() {
  return (
    <PageContainer>
      <EmptyState title="لم نجد هذا الطفل" message="قد يكون الطفل من فصل آخر لا تملكين صلاحية عرضه." />
      <Link
        to="/teacher/children"
        className="mt-4 block rounded-2xl bg-primary py-3 text-center text-sm font-extrabold text-primary-foreground"
      >
        العودة لأطفال فصلي
      </Link>
    </PageContainer>
  );
}

function TeacherChildPage() {
  const { id } = Route.useParams();
  const child = teacherChildren.find((c) => c.id === id);
  if (!child) throw notFound();

  const [notes, setNotes] = useState<ChildNote[]>(() =>
    childNotesLog.filter((n) => n.childId === id),
  );
  const [domain, setDomain] = useState<NoteDomain>("المشاركة");
  const [text, setText] = useState("");
  const [share, setShare] = useState(true);

  function addNote() {
    if (!text.trim()) {
      toast.error("اكتبي نص الملاحظة أولًا");
      return;
    }
    setNotes((prev) => [
      {
        id: `new-${prev.length + 1}`,
        childId: id,
        domain,
        text: text.trim(),
        date: "الآن",
        sharedWithParent: share,
      },
      ...prev,
    ]);
    setText("");
    toast.success(share ? "تمت إضافة الملاحظة ومشاركتها مع ولي الأمر" : "تمت إضافة الملاحظة (خاصة)");
  }

  return (
    <PageContainer>
      {/* بطاقة الطفل */}
      <section className="mb-6 rounded-3xl border border-border bg-card p-5 text-center shadow-soft">
        <Avatar name={child.name} tone={child.tone} size="xl" className="mx-auto" />
        <h1 className="mt-3 font-display text-xl font-extrabold text-foreground">{child.name}</h1>
        <p className="text-xs text-muted-foreground">
          {child.guardian} · {child.age}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <ToneBadge tone={child.attendance === "present" ? "green" : "pink"}>
            {child.attendance === "present" ? `حاضر ${child.arriveTime ?? ""}` : "غائب اليوم"}
          </ToneBadge>
          <ToneBadge tone="blue">نسبة الحضور {child.attendanceRate}%</ToneBadge>
        </div>
        <Link
          to="/teacher/messages"
          className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-xs font-extrabold text-foreground transition-colors hover:bg-muted"
        >
          <MessagesSquare className="h-4 w-4" strokeWidth={2.2} />
          مراسلة {child.guardian}
        </Link>
      </section>

      {/* مؤشرات التطور */}
      <SectionHeader title="مؤشرات التطور" subtitle="تقدير المعلمة لهذا الشهر" icon={TrendingUp} tone="green" />
      <section className="mb-6 space-y-3 rounded-3xl border border-border bg-card p-5 shadow-soft">
        {devIndicators.map((d) => (
          <div key={d.label}>
            <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
              <span className="text-foreground">{d.label}</span>
              <span className={toneClasses[d.tone].deep}>{d.value}%</span>
            </div>
            <ProgressBar value={d.value} tone={d.tone} />
          </div>
        ))}
      </section>

      {/* القيم المتعلّمة */}
      <SectionHeader title="القيم التي تعلمها" icon={TrendingUp} tone="pink" />
      <div className="mb-6 flex flex-wrap gap-2">
        {learnedValues.map((v) => (
          <ToneBadge key={v.name} tone={v.tone}>
            🌱 {v.name}
          </ToneBadge>
        ))}
      </div>

      {/* إضافة ملاحظة */}
      <SectionHeader title="إضافة ملاحظة" subtitle="ملاحظة تربوية قصيرة ومحددة" icon={NotebookPen} tone="orange" />
      <section className="mb-6 rounded-3xl border border-border bg-card p-4 shadow-soft">
        <div className="mb-3 flex flex-wrap gap-2">
          {noteDomains.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDomain(d)}
              aria-pressed={domain === d}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors",
                domain === d
                  ? "border-transparent bg-brand-orange-soft text-brand-orange-deep"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {d}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="مثال: شارك اليوم بحماس في نشاط شجرة الصدق وتعاون مع زملائه."
          aria-label="نص الملاحظة"
          className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus:shadow-soft"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShare((s) => !s)}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground"
          >
            {share ? (
              <Eye className="h-4 w-4 text-brand-green-deep" strokeWidth={2.2} />
            ) : (
              <EyeOff className="h-4 w-4" strokeWidth={2.2} />
            )}
            {share ? "تُشارك مع ولي الأمر" : "ملاحظة خاصة بالمعلمة"}
          </button>
          <button
            type="button"
            onClick={addNote}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-extrabold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Send className="h-4 w-4" strokeWidth={2.4} />
            حفظ الملاحظة
          </button>
        </div>
      </section>

      {/* سجل الملاحظات */}
      <SectionHeader title="سجل الملاحظات" subtitle={`${notes.length} ملاحظة`} icon={NotebookPen} tone="blue" />
      {notes.length === 0 ? (
        <EmptyState title="لا توجد ملاحظات بعد" message="أضيفي أول ملاحظة عن هذا الطفل من الأعلى." />
      ) : (
        <div className="space-y-2">
          {notes.map((n) => (
            <article key={n.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <ToneBadge tone="blue">{n.domain}</ToneBadge>
                <span className="text-[10px] text-muted-foreground">{n.date}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">{n.text}</p>
              <p className="mt-2 text-[10px] font-bold text-muted-foreground">
                {n.sharedWithParent ? "👁️ مرئية لولي الأمر" : "🔒 خاصة بالمعلمة"}
              </p>
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
