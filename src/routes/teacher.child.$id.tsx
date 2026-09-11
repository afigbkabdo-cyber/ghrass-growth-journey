import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronRight, Utensils, Droplets, Moon, HandHeart, StickyNote, TriangleAlert, Save } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, Avatar, SectionHeader, ToneBadge, EmptyState } from "@/components/ghiras";
import { Switch } from "@/components/ui/switch";
import { childAge, mealStatusOptions, stageLabels } from "@/lib/kg-labels";
import {
  addChildNote,
  getDailyLog,
  listChildNotes,
  myClassChildren,
  saveDailyLog,
} from "@/lib/kg.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/teacher/child/$id")({
  head: () => ({
    meta: [
      { title: "متابعة الطفل — غراس" },
      { name: "description", content: "تسجيل المتابعة اليومية للطفل: الوجبة، دورة المياه، النوم، الصلاة والملاحظات." },
      { property: "og:title", content: "متابعة الطفل — غراس" },
      { property: "og:description", content: "تسجيل المتابعة اليومية للطفل في روضة غراس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: () => <EmptyState title="Could not load child profile" message="Please refresh the page." />,
  notFoundComponent: () => <EmptyState title="Child not found" message="Make sure the child is in one of your classes." />,
  component: TeacherChildPage,
});

const field =
  "w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:shadow-soft";

function TeacherChildPage() {
  const { t, n, d } = useI18n();
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fetchChildren = useServerFn(myClassChildren);
  const fetchLog = useServerFn(getDailyLog);
  const saveLog = useServerFn(saveDailyLog);
  const fetchNotes = useServerFn(listChildNotes);
  const addNote = useServerFn(addChildNote);

  const children = useQuery({ queryKey: ["teacher-children"], queryFn: () => fetchChildren({}) });
  const child = (children.data ?? []).find((c) => c.id === id);

  const log = useQuery({ queryKey: ["daily-log", id], queryFn: () => fetchLog({ data: { childId: id } }) });
  const notes = useQuery({ queryKey: ["child-notes", id], queryFn: () => fetchNotes({ data: { childId: id } }) });

  const [mealStatus, setMealStatus] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [mealNotes, setMealNotes] = useState("");
  const [bathroomCount, setBathroomCount] = useState(0);
  const [diaperCount, setDiaperCount] = useState(0);
  const [bathroomNotes, setBathroomNotes] = useState("");
  const [slept, setSlept] = useState(false);
  const [sleepStart, setSleepStart] = useState("");
  const [sleepEnd, setSleepEnd] = useState("");
  const [prayerDone, setPrayerDone] = useState(false);
  const [noteBody, setNoteBody] = useState("");

  useEffect(() => {
    const d = log.data;
    if (!d) return;
    setMealStatus(d.mealStatus ?? "");
    setMealTime(d.mealTime ? d.mealTime.slice(0, 5) : "");
    setMealNotes(d.mealNotes ?? "");
    setBathroomCount(d.bathroomCount);
    setDiaperCount(d.diaperCount);
    setBathroomNotes(d.bathroomNotes ?? "");
    setSlept(d.slept);
    setSleepStart(d.sleepStart ? d.sleepStart.slice(0, 5) : "");
    setSleepEnd(d.sleepEnd ? d.sleepEnd.slice(0, 5) : "");
    setPrayerDone(d.prayerDone);
  }, [log.data]);

  const save = useMutation({
    mutationFn: () =>
      saveLog({
        data: {
          childId: id,
          mealStatus: mealStatus || null,
          mealTime: mealTime || null,
          mealNotes: mealNotes || null,
          bathroomCount,
          diaperCount,
          bathroomNotes: bathroomNotes || null,
          slept,
          sleepStart: sleepStart || null,
          sleepEnd: sleepEnd || null,
          prayerDone,
        },
      }),
    onSuccess: () => {
      toast.success(t("تم حفظ متابعة اليوم — ستظهر لولي الأمر"));
      qc.invalidateQueries({ queryKey: ["daily-log", id] });
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر الحفظ")),
  });

  const createNote = useMutation({
    mutationFn: () => addNote({ data: { childId: id, body: noteBody.trim() } }),
    onSuccess: () => {
      setNoteBody("");
      toast.success(t("تمت إضافة الملاحظة"));
      qc.invalidateQueries({ queryKey: ["child-notes", id] });
    },
    onError: (e: Error) => toast.error(e.message || t("تعذر إضافة الملاحظة")),
  });

  return (
    <PageContainer>
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft">
        <Link to="/teacher/children" aria-label={t("عودة")} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-muted">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
        <Avatar name={child?.name ?? t("طفل")} tone="blue" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-extrabold text-foreground">{child ? n(child.name) : t("الطفل")}</h1>
          <p className="text-[11px] text-muted-foreground">
            {child?.className ? n(child.className) : ""} {child ? `• ${t(stageLabels[child.stage] ?? child.stage)}` : ""}
            {child && childAge(child.birthDate) ? ` • ${childAge(child.birthDate)}` : ""}
          </p>
        </div>
      </div>

      {child?.allergies && (
        <p className="mb-4 flex items-start gap-2 rounded-2xl border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-xs font-bold leading-relaxed text-destructive">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {t("حساسية مسجلة: {value}", { value: child.allergies })}
        </p>
      )}

      <SectionHeader title={t("متابعة اليوم")} subtitle={t("تُعرض لولي الأمر بعد الحفظ")} icon={Utensils} tone="orange" />
      <section className="mb-6 space-y-4 rounded-3xl border border-border bg-card p-4 shadow-soft">
        <div className="space-y-2.5">
          <p className="flex items-center gap-2 text-xs font-extrabold text-foreground">
            <Utensils className="h-4 w-4 text-brand-orange-deep" /> {t("الوجبة")}
          </p>
          <select value={mealStatus} onChange={(e) => setMealStatus(e.target.value)} aria-label={t("حالة الوجبة")} className={field}>
            <option value="">{t("لم تُسجّل")}</option>
            {mealStatusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.label)}
              </option>
            ))}
          </select>
          <input type="time" value={mealTime} onChange={(e) => setMealTime(e.target.value)} aria-label={t("وقت الوجبة")} className={field} />
          <input
            value={mealNotes}
            onChange={(e) => setMealNotes(e.target.value)}
            placeholder={t("ملاحظة عن الوجبة (اختياري)")}
            aria-label={t("ملاحظة الوجبة")}
            className={field}
          />
        </div>

        <div className="space-y-2.5 border-t border-border pt-4">
          <p className="flex items-center gap-2 text-xs font-extrabold text-foreground">
            <Droplets className="h-4 w-4 text-brand-blue-deep" /> {t("دورة المياه / الحفاض")}
          </p>
          <div className="flex gap-2">
            <label className="flex-1 text-[11px] font-bold text-muted-foreground">
              {t("دورة المياه")}
              <input
                type="number"
                min={0}
                value={bathroomCount}
                onChange={(e) => setBathroomCount(Number(e.target.value) || 0)}
                className={field}
              />
            </label>
            <label className="flex-1 text-[11px] font-bold text-muted-foreground">
              {t("تغيير الحفاض")}
              <input
                type="number"
                min={0}
                value={diaperCount}
                onChange={(e) => setDiaperCount(Number(e.target.value) || 0)}
                className={field}
              />
            </label>
          </div>
          <input
            value={bathroomNotes}
            onChange={(e) => setBathroomNotes(e.target.value)}
            placeholder={t("ملاحظة (اختياري)")}
            aria-label={t("ملاحظة دورة المياه")}
            className={field}
          />
        </div>

        <div className="space-y-2.5 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs font-extrabold text-foreground">
              <Moon className="h-4 w-4 text-brand-pink-deep" /> {t("نام اليوم")}
            </p>
            <Switch checked={slept} onCheckedChange={setSlept} aria-label={t("نام اليوم")} />
          </div>
          {slept && (
            <div className="flex gap-2">
              <label className="flex-1 text-[11px] font-bold text-muted-foreground">
                {t("من")}
                <input type="time" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} className={field} />
              </label>
              <label className="flex-1 text-[11px] font-bold text-muted-foreground">
                {t("إلى")}
                <input type="time" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)} className={field} />
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="flex items-center gap-2 text-xs font-extrabold text-foreground">
            <HandHeart className="h-4 w-4 text-brand-green-deep" /> {t("صلّى مع المجموعة")}
          </p>
          <Switch checked={prayerDone} onCheckedChange={setPrayerDone} aria-label={t("الصلاة")} />
        </div>

        <button
          type="button"
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {save.isPending ? t("جارٍ الحفظ…") : t("حفظ متابعة اليوم")}
        </button>
      </section>

      <SectionHeader title={t("ملاحظات على الطفل")} icon={StickyNote} tone="yellow" />
      <section className="mb-4 space-y-2.5 rounded-3xl border border-border bg-card p-4 shadow-soft">
        <textarea
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
          rows={3}
          placeholder={t("اكتبي ملاحظتك عن الطفل…")}
          aria-label={t("نص الملاحظة")}
          className="w-full resize-none rounded-2xl border border-border bg-background p-3 text-sm outline-none"
        />
        <button
          type="button"
          disabled={createNote.isPending || noteBody.trim().length < 2}
          onClick={() => createNote.mutate()}
          className="w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-primary-foreground disabled:opacity-50"
        >
          {t("إضافة الملاحظة")}
        </button>
      </section>

      <div className="space-y-3">
        {(notes.data ?? []).map((note) => (
          <article key={note.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-extrabold text-foreground">{note.authorName ? n(note.authorName) : t("المعلمة")}</p>
              <span className="text-[11px] text-muted-foreground">
                {d(note.createdAt)}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{note.body}</p>
            {note.domain && (
              <div className="mt-2">
                <ToneBadge tone="blue">{t(note.domain)}</ToneBadge>
              </div>
            )}
          </article>
        ))}
      </div>
    </PageContainer>
  );
}
