import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ClassRow {
  id: string;
  name: string;
  stage: string;
}

export interface ChildRow {
  id: string;
  name: string;
  stage: string;
  className: string | null;
  classId: string | null;
  birthDate: string | null;
  allergies: string | null;
  guardians: string[];
}

export interface StaffRow {
  id: string;
  name: string;
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
        "id, name, stage, class_id, birth_date, allergies, classes(name), child_guardians(profiles(full_name))",
      )
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => {
      const r = row as unknown as {
        id: string;
        name: string;
        stage: string;
        class_id: string | null;
        birth_date: string | null;
        allergies: string | null;
        classes: { name: string } | null;
        child_guardians: { profiles: { full_name: string } | null }[] | null;
      };
      return {
        id: r.id,
        name: r.name,
        stage: r.stage,
        classId: r.class_id,
        className: r.classes?.name ?? null,
        birthDate: r.birth_date,
        allergies: r.allergies,
        guardians: (r.child_guardians ?? [])
          .map((g) => g.profiles?.full_name)
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
        context.supabase.from("profiles").select("id, full_name, phone, title"),
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
      context.supabase.from("profiles").select("id, full_name, phone, title"),
    ]);
    const parentIds = new Set((roles ?? []).map((r) => r.user_id));
    return (profiles ?? [])
      .filter((p) => parentIds.has(p.id))
      .map((p) => ({ id: p.id, name: p.full_name, phone: p.phone, title: p.title, role: "parent", classes: [] }))
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));
  });

const childSchema = z.object({
  name: z.string().trim().min(2),
  stage: z.enum(["nursery", "kg1", "kg2"]),
  classId: z.string().uuid().nullable().optional(),
  guardianId: z.string().uuid().nullable().optional(),
  birthDate: z.string().trim().nullable().optional(),
  allergies: z.string().trim().nullable().optional(),
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
        stage: data.stage,
        class_id: data.classId ?? null,
        birth_date: data.birthDate || null,
        allergies: data.allergies || null,
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
