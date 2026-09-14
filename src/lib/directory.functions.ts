import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ClassRow {
  id: string;
  name: string;
  nameEn: string | null;
  stage: string;
}

export interface ChildRow {
  id: string;
  name: string;
  nameEn: string | null;
  stage: string;
  className: string | null;
  classNameEn: string | null;
  classId: string | null;
  birthDate: string | null;
  allergies: string | null;
  allergiesEn: string | null;
  guardians: string[];
  guardiansEn: string[];
}

export interface StaffRow {
  id: string;
  name: string;
  nameEn: string | null;
  phone: string | null;
  title: string | null;
  role: string;
  classes: string[];
}

/** قائمة الفصول. */
export const listClasses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ClassRow[]> => {
    const { data, error } = await context.supabase
      .from("classes")
      .select("id, name, stage")
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** سجل الأطفال مع الفصل وأولياء الأمور. */
export const listChildren = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ChildRow[]> => {
    const { data, error } = await context.supabase
      .from("children")
      .select(
        "id, name, name_en, stage, class_id, birth_date, allergies, allergies_en, classes(name, name_en), child_guardians(profiles(full_name, full_name_en))",
      )
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => {
      const r = row as unknown as {
        id: string;
        name: string;
        name_en: string | null;
        stage: string;
        class_id: string | null;
        birth_date: string | null;
        allergies: string | null;
        allergies_en: string | null;
        classes: { name: string; name_en: string | null } | null;
        child_guardians: { profiles: { full_name: string; full_name_en: string | null } | null }[] | null;
      };
      return {
        id: r.id,
        name: r.name,
        nameEn: r.name_en ?? null,
        stage: r.stage,
        classId: r.class_id,
        className: r.classes?.name ?? null,
        classNameEn: r.classes?.name_en ?? null,
        birthDate: r.birth_date,
        allergies: r.allergies,
        allergiesEn: r.allergies_en ?? null,
        guardians: (r.child_guardians ?? [])
          .map((g) => g.profiles?.full_name)
          .filter((n): n is string => Boolean(n)),
        guardiansEn: (r.child_guardians ?? [])
          .map((g) => g.profiles?.full_name_en ?? g.profiles?.full_name)
          .filter((n): n is string => Boolean(n)),
      };
    });
  });

/** الكادر: المعلمات والإدارة مع فصولهن. */
export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StaffRow[]> => {
    const [{ data: roles, error: rolesError }, { data: profiles, error: profilesError }, { data: links }] =
      await Promise.all([
        context.supabase.from("user_roles").select("user_id, role"),
        context.supabase.from("profiles").select("id, full_name, full_name_en, phone, title"),
        context.supabase.from("teacher_classes").select("teacher_id, classes(name)"),
      ]);
    if (rolesError) throw new Error(rolesError.message);
    if (profilesError) throw new Error(profilesError.message);

    const roleOf = new Map<string, string>();
    for (const r of roles ?? []) {
      const current = roleOf.get(r.user_id);
      const rank = ["parent", "teacher", "admin", "super_admin"];
      if (!current || rank.indexOf(r.role) > rank.indexOf(current)) roleOf.set(r.user_id, r.role);
    }

    const classesOf = new Map<string, string[]>();
    for (const l of (links ?? []) as unknown as { teacher_id: string; classes: { name: string } | null }[]) {
      if (!l.classes?.name) continue;
      classesOf.set(l.teacher_id, [...(classesOf.get(l.teacher_id) ?? []), l.classes.name]);
    }

    return (profiles ?? [])
      .map((p) => ({
        id: p.id,
        name: p.full_name,
        nameEn: (p as { full_name_en?: string | null }).full_name_en ?? null,
        phone: p.phone,
        title: p.title,
        role: roleOf.get(p.id) ?? "parent",
        classes: classesOf.get(p.id) ?? [],
      }))
      .filter((p) => p.role !== "parent")
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));
  });

/** أولياء الأمور المسجّلون. */
export const listParents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StaffRow[]> => {
    const [{ data: roles }, { data: profiles }] = await Promise.all([
      context.supabase.from("user_roles").select("user_id, role").eq("role", "parent"),
      context.supabase.from("profiles").select("id, full_name, full_name_en, phone, title"),
    ]);
    const parentIds = new Set((roles ?? []).map((r) => r.user_id));
    return (profiles ?? [])
      .filter((p) => parentIds.has(p.id))
      .map((p) => ({ id: p.id, name: p.full_name, nameEn: (p as { full_name_en?: string | null }).full_name_en ?? null, phone: p.phone, title: p.title, role: "parent", classes: [] }))
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));
  });

const childSchema = z.object({
  name: z.string().trim().min(2),
  nameEn: z.string().trim().optional(),
  stage: z.enum(["nursery", "kg1", "kg2"]),
  classId: z.string().uuid().nullable().optional(),
  guardianId: z.string().uuid().nullable().optional(),
  birthDate: z.string().trim().nullable().optional(),
  allergies: z.string().trim().nullable().optional(),
  allergiesEn: z.string().trim().nullable().optional(),
  sessionPeriod: z.string().trim().nullable().optional(),
  enrollmentTerm: z.string().trim().nullable().optional(),
});

/** تسجيل طفل جديد وربطه بولي أمر إن وُجد. */
export const createChild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => childSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: inserted, error } = await context.supabase
      .from("children")
      .insert({
        name: data.name,
        name_en: data.nameEn ?? null,
        stage: data.stage,
        class_id: data.classId ?? null,
        birth_date: data.birthDate || null,
        allergies: data.allergies || null,
        allergies_en: data.allergiesEn || null,
        session_period: data.sessionPeriod || null,
        enrollment_term: data.enrollmentTerm || null,
      })
      .select("id")
      .single();
    if (error || !inserted) throw new Error(error?.message ?? "تعذر تسجيل الطفل.");
    if (data.guardianId) {
      await context.supabase
        .from("child_guardians")
        .insert({ child_id: inserted.id, guardian_id: data.guardianId });
    }
    return { id: inserted.id };
  });

/** حذف طفل من السجل. */
export const deleteChild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await context.supabase.from("child_guardians").delete().eq("child_id", data.id);
    const { error } = await context.supabase.from("children").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ================= تفاصيل الطفل والإجراءات الإدارية ================= */

export interface ChildDetailRow {
  id: string;
  name: string;
  nameEn: string | null;
  stage: string;
  classId: string | null;
  className: string | null;
  classNameEn: string | null;
  birthDate: string | null;
  gender: string | null;
  allergies: string | null;
  allergiesEn: string | null;
  notes: string | null;
  sessionPeriod: string | null;
  enrollmentTerm: string | null;
  createdAt: string;
  guardians: { id: string; name: string; nameEn: string | null; phone: string | null; relation: string | null }[];
}

/** بيانات تسجيل الطفل كاملة — للعرض فقط (لا تعديل). */
export const getChildDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<ChildDetailRow | null> => {
    const { data: row, error } = await context.supabase
      .from("children")
      .select(
        "id, name, name_en, stage, class_id, birth_date, gender, allergies, allergies_en, notes, session_period, enrollment_term, created_at, classes(name, name_en), child_guardians(relation, guardian_id, profiles(full_name, full_name_en, phone))",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const r = row as unknown as {
      id: string;
      name: string;
      name_en: string | null;
      stage: string;
      class_id: string | null;
      birth_date: string | null;
      gender: string | null;
      allergies: string | null;
      allergies_en: string | null;
      notes: string | null;
      session_period: string | null;
      enrollment_term: string | null;
      created_at: string;
      classes: { name: string; name_en: string | null } | null;
      child_guardians:
        | {
            relation: string | null;
            guardian_id: string;
            profiles: { full_name: string; full_name_en: string | null; phone: string | null } | null;
          }[]
        | null;
    };
    return {
      id: r.id,
      name: r.name,
      nameEn: r.name_en ?? null,
      stage: r.stage,
      classId: r.class_id,
      className: r.classes?.name ?? null,
      classNameEn: r.classes?.name_en ?? null,
      birthDate: r.birth_date,
      gender: r.gender,
      allergies: r.allergies,
      allergiesEn: r.allergies_en ?? null,
      notes: r.notes,
      sessionPeriod: r.session_period,
      enrollmentTerm: r.enrollment_term,
      createdAt: r.created_at,
      guardians: (r.child_guardians ?? []).map((g) => ({
        id: g.guardian_id,
        name: g.profiles?.full_name ?? "—",
        nameEn: g.profiles?.full_name_en ?? null,
        phone: g.profiles?.phone ?? null,
        relation: g.relation,
      })),
    };
  });

/** نقل الطفل إلى فصل آخر — لا يغيّر أي بيانات أساسية أخرى. */
export const moveChildToClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), classId: z.string().uuid().nullable() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("children")
      .update({ class_id: data.classId })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
