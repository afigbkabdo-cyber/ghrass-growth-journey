/*
 * وظائف الخادم لملاحظات الإدارة: القيم، الأنشطة والصور، المتابعة اليومية،
 * ملاحظات المعلمة، الجدول اليومي، ورسائل ولي الأمر مع الإدارة.
 * الصلاحيات مفروضة في قاعدة البيانات عبر RLS (كل استدعاء يعمل بهوية المستخدم).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ================= أنواع مشتركة ================= */

export interface ValueRow {
  id: string;
  name: string;
  nameEn: string | null;
  tagline: string | null;
  taglineEn: string | null;
  hadith: string | null;
  hadithEn: string | null;
  source: string | null;
  sourceEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  weekStart: string | null;
  approved: boolean;
  isCurrent: boolean;
  learnings: string[];
  learningsEn: string[];
  atSchool: string[];
  atSchoolEn: string[];
  atHome: string[];
  atHomeEn: string[];
}

export interface ActivityRow {
  id: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  activityDate: string;
  activityTime: string | null;
  classId: string | null;
  className: string | null;
  classNameEn: string | null;
  valueId: string | null;
  valueName: string | null;
  valueNameEn: string | null;
  linkedToValue: boolean;
  published: boolean;
  photos: string[];
}

export interface ClassChildRow {
  id: string;
  name: string;
  nameEn: string | null;
  stage: string;
  birthDate: string | null;
  gender: string | null;
  allergies: string | null;
  allergiesEn: string | null;
  notes: string | null;
  classId: string | null;
  className: string | null;
  classNameEn: string | null;
}

/** نومة واحدة داخل اليوم — HH:MM. */
export interface SleepEntry {
  start: string | null;
  end: string | null;
}

export interface DailyLogRow {
  childId: string;
  logDate: string;
  mealStatus: string | null;
  mealTime: string | null;
  mealNotes: string | null;
  meal2Enabled: boolean;
  meal2Status: string | null;
  meal2Time: string | null;
  meal2Notes: string | null;
  bathroomCount: number;
  diaperCount: number;
  bathroomNotes: string | null;
  slept: boolean;
  sleepStart: string | null;
  sleepEnd: string | null;
  sleeps: SleepEntry[];
  prayerDone: boolean;
}

export interface ChildNoteRow {
  id: string;
  childId: string;
  body: string;
  domain: string | null;
  createdAt: string;
  authorName: string | null;
  authorNameEn: string | null;
}

export interface ScheduleRow {
  id: string;
  classId: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  descriptionEn: string | null;
  atTime: string | null;
  orderIndex: number;
  done: boolean;
}

export interface ThreadRow {
  id: string;
  subject: string;
  status: string;
  parentId: string;
  parentName: string | null;
  parentNameEn: string | null;
  childId: string | null;
  childName: string | null;
  childNameEn: string | null;
  lastMessageAt: string;
}

export interface MessageRow {
  id: string;
  body: string;
  senderRole: string;
  senderId: string;
  createdAt: string;
}

const emptyLog = (childId: string, logDate: string): DailyLogRow => ({
  childId,
  logDate,
  mealStatus: null,
  mealTime: null,
  mealNotes: null,
  meal2Enabled: false,
  meal2Status: null,
  meal2Time: null,
  meal2Notes: null,
  bathroomCount: 0,
  diaperCount: 0,
  bathroomNotes: null,
  slept: false,
  sleepStart: null,
  sleepEnd: null,
  sleeps: [],
  prayerDone: false,
});

const today = () => new Date().toISOString().slice(0, 10);

/* ================= القيم الأسبوعية ================= */

export const listValues = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ValueRow[]> => {
    const { data, error } = await context.supabase
      .from("values_week")
      .select("*")
      .order("week_start", { ascending: false, nullsFirst: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      nameEn: v.name_en ?? null,
      tagline: v.tagline,
      taglineEn: v.tagline_en ?? null,
      hadith: v.hadith,
      hadithEn: v.hadith_en ?? null,
      source: v.source,
      sourceEn: v.source_en ?? null,
      description: v.description,
      descriptionEn: v.description_en ?? null,
      weekStart: v.week_start,
      approved: v.approved,
      isCurrent: v.is_current,
      learnings: v.learnings ?? [],
      learningsEn: v.learnings_en ?? [],
      atSchool: v.at_school ?? [],
      atSchoolEn: v.at_school_en ?? [],
      atHome: v.at_home ?? [],
      atHomeEn: v.at_home_en ?? [],
    }));
  });

export const getCurrentValue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ValueRow | null> => {
    const { data, error } = await context.supabase
      .from("values_week")
      .select("*")
      .eq("is_current", true)
      .eq("approved", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      nameEn: data.name_en ?? null,
      tagline: data.tagline,
      taglineEn: data.tagline_en ?? null,
      hadith: data.hadith,
      hadithEn: data.hadith_en ?? null,
      source: data.source,
      sourceEn: data.source_en ?? null,
      description: data.description,
      descriptionEn: data.description_en ?? null,
      weekStart: data.week_start,
      approved: data.approved,
      isCurrent: data.is_current,
      learnings: data.learnings ?? [],
      learningsEn: data.learnings_en ?? [],
      atSchool: data.at_school ?? [],
      atSchoolEn: data.at_school_en ?? [],
      atHome: data.at_home ?? [],
      atHomeEn: data.at_home_en ?? [],
    };
  });

const valueInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2),
  nameEn: z.string().trim().optional().nullable(),
  tagline: z.string().trim().optional().nullable(),
  taglineEn: z.string().trim().optional().nullable(),
  hadith: z.string().trim().optional().nullable(),
  hadithEn: z.string().trim().optional().nullable(),
  source: z.string().trim().optional().nullable(),
  sourceEn: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  descriptionEn: z.string().trim().optional().nullable(),
  weekStart: z.string().trim().optional().nullable(),
  learnings: z.array(z.string().trim().min(1)).max(30).optional(),
  learningsEn: z.array(z.string().trim().min(1)).max(30).optional(),
  atSchool: z.array(z.string().trim().min(1)).max(30).optional(),
  atSchoolEn: z.array(z.string().trim().min(1)).max(30).optional(),
  atHome: z.array(z.string().trim().min(1)).max(30).optional(),
  atHomeEn: z.array(z.string().trim().min(1)).max(30).optional(),
});

export const saveValue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => valueInput.parse(d))
  .handler(async ({ data, context }) => {
    const payload = {
      name: data.name,
      name_en: data.nameEn ?? null,
      tagline: data.tagline ?? null,
      tagline_en: data.taglineEn ?? null,
      hadith: data.hadith ?? null,
      hadith_en: data.hadithEn ?? null,
      source: data.source ?? null,
      source_en: data.sourceEn ?? null,
      description: data.description ?? null,
      description_en: data.descriptionEn ?? null,
      week_start: data.weekStart || null,
      learnings: data.learnings ?? [],
      learnings_en: data.learningsEn ?? [],
      at_school: data.atSchool ?? [],
      at_school_en: data.atSchoolEn ?? [],
      at_home: data.atHome ?? [],
      at_home_en: data.atHomeEn ?? [],
    };
    if (data.id) {
      const { error } = await context.supabase.from("values_week").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("values_week")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteValue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("values_week").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** اعتماد القيمة (وتحديدها قيمة الأسبوع اختياريًا) — للإدارة فقط عبر RLS. */
export const approveValue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), approved: z.boolean(), makeCurrent: z.boolean().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    if (data.makeCurrent) {
      const { error: clearError } = await context.supabase
        .from("values_week")
        .update({ is_current: false })
        .eq("is_current", true);
      if (clearError) throw new Error(clearError.message);
    }
    const patch: { approved: boolean; is_current?: boolean } = { approved: data.approved };
    if (data.makeCurrent) patch.is_current = true;
    if (!data.approved) patch.is_current = false;
    const { error } = await context.supabase.from("values_week").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ================= الفصول والأطفال ================= */

/** فصول المعلمة الحالية. */
export const myClasses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ id: string; name: string; nameEn: string | null; stage: string }[]> => {
    const { data, error } = await context.supabase
      .from("teacher_classes")
      .select("class_id, classes(name, name_en, stage)")
      .eq("teacher_id", context.userId);
    if (error) throw new Error(error.message);
    return (
      (data ?? []) as unknown as {
        class_id: string;
        classes: { name: string; name_en: string | null; stage: string } | null;
      }[]
    )
      .filter((r) => r.classes)
      .map((r) => ({
        id: r.class_id,
        name: r.classes!.name,
        nameEn: r.classes!.name_en ?? null,
        stage: r.classes!.stage,
      }));
  });

function mapChild(r: {
  id: string;
  name: string;
  name_en: string | null;
  stage: string;
  birth_date: string | null;
  gender: string | null;
  allergies: string | null;
  allergies_en: string | null;
  notes: string | null;
  class_id: string | null;
  classes: { name: string; name_en: string | null } | null;
}): ClassChildRow {
  return {
    id: r.id,
    name: r.name,
    nameEn: r.name_en ?? null,
    stage: r.stage,
    birthDate: r.birth_date,
    gender: r.gender,
    allergies: r.allergies,
    allergiesEn: r.allergies_en ?? null,
    notes: r.notes,
    classId: r.class_id,
    className: r.classes?.name ?? null,
    classNameEn: r.classes?.name_en ?? null,
  };
}

const childSelect = "id, name, name_en, stage, birth_date, gender, allergies, allergies_en, notes, class_id, classes(name, name_en)";

/** أطفال فصول المعلمة — RLS يمنع رؤية أطفال الفصول الأخرى. */
export const myClassChildren = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ClassChildRow[]> => {
    const { data, error } = await context.supabase.from("children").select(childSelect).order("name");
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown as Parameters<typeof mapChild>[0][]).map(mapChild);
  });

/** أطفال ولي الأمر الحالي. */
export const myChildren = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ClassChildRow[]> => {
    const { data: links, error: linkError } = await context.supabase
      .from("child_guardians")
      .select("child_id")
      .eq("guardian_id", context.userId);
    if (linkError) throw new Error(linkError.message);
    const ids = (links ?? []).map((l) => l.child_id);
    if (ids.length === 0) return [];
    const { data, error } = await context.supabase
      .from("children")
      .select(childSelect)
      .in("id", ids)
      .order("name");
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown as Parameters<typeof mapChild>[0][]).map(mapChild);
  });

/* ================= المتابعة اليومية ================= */

function mapSleeps(v: unknown): SleepEntry[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
    .map((s) => ({
      start: typeof s["start"] === "string" ? (s["start"] as string).slice(0, 5) : null,
      end: typeof s["end"] === "string" ? (s["end"] as string).slice(0, 5) : null,
    }));
}

function mapLog(r: Record<string, unknown>): DailyLogRow {
  return {
    childId: r["child_id"] as string,
    logDate: r["log_date"] as string,
    mealStatus: (r["meal_status"] as string) ?? null,
    mealTime: (r["meal_time"] as string) ?? null,
    mealNotes: (r["meal_notes"] as string) ?? null,
    meal2Enabled: Boolean(r["meal2_enabled"]),
    meal2Status: (r["meal2_status"] as string) ?? null,
    meal2Time: (r["meal2_time"] as string) ?? null,
    meal2Notes: (r["meal2_notes"] as string) ?? null,
    bathroomCount: (r["bathroom_count"] as number) ?? 0,
    diaperCount: (r["diaper_count"] as number) ?? 0,
    bathroomNotes: (r["bathroom_notes"] as string) ?? null,
    slept: Boolean(r["slept"]),
    sleepStart: (r["sleep_start"] as string) ?? null,
    sleepEnd: (r["sleep_end"] as string) ?? null,
    sleeps: mapSleeps(r["sleeps"]),
    prayerDone: Boolean(r["prayer_done"]),
  };
}

export const getDailyLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ childId: z.string().uuid(), date: z.string().optional() }).parse(d),
  )
  .handler(async ({ data, context }): Promise<DailyLogRow> => {
    const date = data.date || today();
    const { data: row, error } = await context.supabase
      .from("daily_logs")
      .select("*")
      .eq("child_id", data.childId)
      .eq("log_date", date)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? mapLog(row as Record<string, unknown>) : emptyLog(data.childId, date);
  });

const logInput = z.object({
  childId: z.string().uuid(),
  date: z.string().optional(),
  mealStatus: z.string().nullable().optional(),
  mealTime: z.string().nullable().optional(),
  mealNotes: z.string().nullable().optional(),
  meal2Enabled: z.boolean().optional(),
  meal2Status: z.string().nullable().optional(),
  meal2Time: z.string().nullable().optional(),
  meal2Notes: z.string().nullable().optional(),
  bathroomCount: z.number().int().min(0).max(50).optional(),
  diaperCount: z.number().int().min(0).max(50).optional(),
  bathroomNotes: z.string().nullable().optional(),
  slept: z.boolean().optional(),
  sleepStart: z.string().nullable().optional(),
  sleepEnd: z.string().nullable().optional(),
  sleeps: z
    .array(z.object({ start: z.string().nullable(), end: z.string().nullable() }))
    .max(12)
    .optional(),
  prayerDone: z.boolean().optional(),
});

/** حفظ المتابعة اليومية — المعلمة لأطفال فصلها فقط (RLS). */
export const saveDailyLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => logInput.parse(d))
  .handler(async ({ data, context }): Promise<DailyLogRow> => {
    const date = data.date || today();
    const sleeps = (data.sleeps ?? []).filter((s) => s.start || s.end);
    const payload = {
      child_id: data.childId,
      log_date: date,
      meal_status: data.mealStatus ?? null,
      meal_time: data.mealTime || null,
      meal_notes: data.mealNotes ?? null,
      meal2_enabled: data.meal2Enabled ?? false,
      meal2_status: data.meal2Status ?? null,
      meal2_time: data.meal2Time || null,
      meal2_notes: data.meal2Notes ?? null,
      bathroom_count: data.bathroomCount ?? 0,
      diaper_count: data.diaperCount ?? 0,
      bathroom_notes: data.bathroomNotes ?? null,
      // التوافق مع الحقول القديمة — أول نومة اليوم.
      slept: sleeps.length > 0 ? true : (data.slept ?? false),
      sleep_start: sleeps[0]?.start || data.sleepStart || null,
      sleep_end: sleeps[0]?.end || data.sleepEnd || null,
      sleeps,
      prayer_done: data.prayerDone ?? false,
      recorded_by: context.userId,
    };
    const { data: row, error } = await context.supabase
      .from("daily_logs")
      .upsert(payload, { onConflict: "child_id,log_date" })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapLog(row as Record<string, unknown>);
  });

/* ================= ملاحظات المعلمة على الطفل ================= */

export const listChildNotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ childId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<ChildNoteRow[]> => {
    const { data: rows, error } = await context.supabase
      .from("child_notes")
      .select("id, child_id, body, domain, created_at, author_id")
      .eq("child_id", data.childId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const notes = rows ?? [];
    const authorIds = [...new Set(notes.map((n) => n.author_id).filter(Boolean))] as string[];
    const names = new Map<string, string>();
    const namesEn = new Map<string, string>();
    if (authorIds.length > 0) {
      // أسماء الكاتبات فقط — ولي الأمر لا يستطيع قراءة ملفات الكادر مباشرة.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, full_name_en")
        .in("id", authorIds);
      for (const p of profiles ?? []) names.set(p.id, p.full_name);
      for (const p of profiles ?? []) if (p.full_name_en) namesEn.set(p.id, p.full_name_en);
    }
    return notes.map((n) => ({
      id: n.id,
      childId: n.child_id,
      body: n.body,
      domain: n.domain,
      createdAt: n.created_at,
      authorName: names.get(n.author_id) ?? null,
      authorNameEn: namesEn.get(n.author_id) ?? null,
    }));
  });

export const addChildNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        childId: z.string().uuid(),
        body: z.string().trim().min(2),
        domain: z.string().trim().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("child_notes").insert({
      child_id: data.childId,
      body: data.body,
      domain: data.domain ?? null,
      author_id: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ================= الجدول اليومي ================= */

export const listSchedule = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ classId: z.string().uuid(), date: z.string().optional() }).parse(d),
  )
  .handler(async ({ data, context }): Promise<ScheduleRow[]> => {
    const date = data.date || today();
    const { data: items, error } = await context.supabase
      .from("schedule_items")
      .select("id, class_id, title, title_en, description, description_en, at_time, order_index")
      .eq("class_id", data.classId)
      .order("order_index");
    if (error) throw new Error(error.message);
    const ids = (items ?? []).map((i) => i.id);
    const done = new Set<string>();
    if (ids.length > 0) {
      const { data: progress } = await context.supabase
        .from("schedule_progress")
        .select("item_id, done")
        .eq("log_date", date)
        .in("item_id", ids);
      for (const p of progress ?? []) if (p.done) done.add(p.item_id);
    }
    return (items ?? []).map((i) => ({
      id: i.id,
      classId: i.class_id,
      title: i.title,
      titleEn: i.title_en ?? null,
      description: i.description,
      descriptionEn: i.description_en ?? null,
      atTime: i.at_time,
      orderIndex: i.order_index,
      done: done.has(i.id),
    }));
  });

export const saveScheduleItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        classId: z.string().uuid(),
        title: z.string().trim().min(2),
        titleEn: z.string().trim().nullable().optional(),
        description: z.string().trim().nullable().optional(),
        descriptionEn: z.string().trim().nullable().optional(),
        atTime: z.string().nullable().optional(),
        orderIndex: z.number().int().min(0).max(100).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      class_id: data.classId,
      title: data.title,
      title_en: data.titleEn ?? null,
      description: data.description ?? null,
      description_en: data.descriptionEn ?? null,
      at_time: data.atTime || null,
      order_index: data.orderIndex ?? 0,
    };
    if (data.id) {
      const { error } = await context.supabase.from("schedule_items").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const { error } = await context.supabase.from("schedule_items").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteScheduleItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("schedule_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** تعليم عنصر الجدول كمنجز — المعلمة لفصلها فقط (RLS). */
export const markScheduleDone = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ itemId: z.string().uuid(), done: z.boolean(), date: z.string().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const date = data.date || today();
    const { error } = await context.supabase.from("schedule_progress").upsert(
      { item_id: data.itemId, log_date: date, done: data.done, marked_by: context.userId },
      { onConflict: "item_id,log_date" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ================= الأنشطة ================= */

const activitySelect =
  "id, title, title_en, description, description_en, activity_date, activity_time, class_id, value_id, linked_to_value, published, classes(name, name_en), values_week(name, name_en), activity_photos(path)";

type ActivityQueryRow = {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  activity_date: string;
  activity_time: string | null;
  class_id: string | null;
  value_id: string | null;
  linked_to_value: boolean;
  published: boolean;
  classes: { name: string; name_en: string | null } | null;
  values_week: { name: string; name_en: string | null } | null;
  activity_photos: { path: string }[] | null;
};

function mapActivity(r: ActivityQueryRow): ActivityRow {
  return {
    id: r.id,
    title: r.title,
    titleEn: r.title_en ?? null,
    description: r.description,
    descriptionEn: r.description_en ?? null,
    activityDate: r.activity_date,
    activityTime: r.activity_time,
    classId: r.class_id,
    className: r.classes?.name ?? null,
    classNameEn: r.classes?.name_en ?? null,
    valueId: r.value_id,
    valueName: r.values_week?.name ?? null,
    valueNameEn: r.values_week?.name_en ?? null,
    linkedToValue: r.linked_to_value,
    published: r.published,
    photos: (r.activity_photos ?? []).map((p) => p.path),
  };
}

/** الأنشطة المرئية للمستخدم الحالي حسب صلاحياته (RLS). */
export const listActivities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ActivityRow[]> => {
    const { data, error } = await context.supabase
      .from("activities")
      .select(activitySelect)
      .order("activity_date", { ascending: false })
      .order("activity_time", { ascending: true, nullsFirst: true });
    if (error) throw new Error(error.message);
    const rows = ((data ?? []) as unknown as ActivityQueryRow[]).map(mapActivity);
    // روابط موقّتة آمنة لصور الأنشطة (المستودع خاص).
    const paths = rows.flatMap((r) => r.photos);
    if (paths.length > 0) {
      const { data: signed } = await context.supabase.storage
        .from("activity-photos")
        .createSignedUrls(paths, 60 * 60);
      const map = new Map<string, string>();
      for (const s of signed ?? []) if (s.path && s.signedUrl) map.set(s.path, s.signedUrl);
      for (const r of rows) r.photos = r.photos.map((p) => map.get(p) ?? p);
    }
    return rows;
  });

export const saveActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        title: z.string().trim().min(2),
        titleEn: z.string().trim().nullable().optional(),
        description: z.string().trim().nullable().optional(),
        descriptionEn: z.string().trim().nullable().optional(),
        activityDate: z.string(),
        activityTime: z.string().nullable().optional(),
        classId: z.string().uuid(),
        linkedToValue: z.boolean(),
        valueId: z.string().uuid().nullable().optional(),
        published: z.boolean().optional(),
        photoPaths: z.array(z.string()).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const payload = {
      title: data.title,
      title_en: data.titleEn ?? null,
      description: data.description ?? null,
      description_en: data.descriptionEn ?? null,
      activity_date: data.activityDate,
      activity_time: data.activityTime || null,
      class_id: data.classId,
      linked_to_value: data.linkedToValue,
      value_id: data.linkedToValue ? (data.valueId ?? null) : null,
      published: data.published ?? false,
      created_by: context.userId,
    };
    let activityId = data.id;
    if (activityId) {
      const { error } = await context.supabase.from("activities").update(payload).eq("id", activityId);
      if (error) throw new Error(error.message);
    } else {
      const { data: row, error } = await context.supabase
        .from("activities")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      activityId = row.id;
    }
    if (data.photoPaths && data.photoPaths.length > 0) {
      const { error } = await context.supabase
        .from("activity_photos")
        .insert(data.photoPaths.map((path) => ({ activity_id: activityId!, path })));
      if (error) throw new Error(error.message);
    }
    return { id: activityId! };
  });

export const setActivityPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), published: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("activities")
      .update({ published: data.published })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("activities").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ================= رسائل ولي الأمر مع الإدارة ================= */

async function nameLookup(ids: string[]) {
  const names = new Map<string, string>();
  const namesEn = new Map<string, string>();
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return { names, namesEn };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("profiles").select("id, full_name, full_name_en").in("id", unique);
  for (const p of data ?? []) {
    names.set(p.id, p.full_name);
    if (p.full_name_en) namesEn.set(p.id, p.full_name_en);
  }
  return { names, namesEn };
}

/** محادثات ولي الأمر نفسه، أو جميع المحادثات للإدارة (RLS). */
export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ThreadRow[]> => {
    const { data, error } = await context.supabase
      .from("message_threads")
      .select("id, subject, status, parent_id, child_id, last_message_at, children(name, name_en)")
      .order("last_message_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as unknown as {
      id: string;
      subject: string;
      status: string;
      parent_id: string;
      child_id: string | null;
      last_message_at: string;
      children: { name: string; name_en: string | null } | null;
    }[];
    const { names, namesEn } = await nameLookup(rows.map((r) => r.parent_id));
    return rows.map((r) => ({
      id: r.id,
      subject: r.subject,
      status: r.status,
      parentId: r.parent_id,
      parentName: names.get(r.parent_id) ?? null,
      parentNameEn: namesEn.get(r.parent_id) ?? null,
      childId: r.child_id,
      childName: r.children?.name ?? null,
      childNameEn: r.children?.name_en ?? null,
      lastMessageAt: r.last_message_at,
    }));
  });

export const listThreadMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ threadId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<MessageRow[]> => {
    const { data: rows, error } = await context.supabase
      .from("messages")
      .select("id, body, sender_role, sender_id, created_at")
      .eq("thread_id", data.threadId)
      .order("created_at");
    if (error) throw new Error(error.message);
    return (rows ?? []).map((m) => ({
      id: m.id,
      body: m.body,
      senderRole: m.sender_role,
      senderId: m.sender_id,
      createdAt: m.created_at,
    }));
  });

/** ولي الأمر يفتح محادثة جديدة مع الإدارة. */
export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        subject: z.string().trim().min(2),
        body: z.string().trim().min(2),
        childId: z.string().uuid().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: thread, error } = await context.supabase
      .from("message_threads")
      .insert({
        parent_id: context.userId,
        child_id: data.childId ?? null,
        subject: data.subject,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const { error: msgError } = await context.supabase.from("messages").insert({
      thread_id: thread.id,
      sender_id: context.userId,
      sender_role: "parent",
      body: data.body,
    });
    if (msgError) throw new Error(msgError.message);
    return { id: thread.id };
  });

/** إرسال رسالة داخل محادثة قائمة — ولي الأمر أو الإدارة. */
export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        threadId: z.string().uuid(),
        body: z.string().trim().min(1),
        
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    // الدور يُستنتج من الخادم ولا يُقبل من العميل.
    const { data: isAdmin } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
    const { error } = await context.supabase.from("messages").insert({
      thread_id: data.threadId,
      sender_id: context.userId,
      sender_role: isAdmin ? "admin" : "parent",
      body: data.body,
    });
    if (error) throw new Error(error.message);
    // تحديث وقت آخر رسالة — مسموح لصاحب المحادثة أو الإدارة عبر RLS.
    await context.supabase
      .from("message_threads")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", data.threadId);
    return { ok: true };
  });
