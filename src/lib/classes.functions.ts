/*
 * إدارة الفصول — الإدارة فقط (RLS على جدول classes وteacher_classes).
 * أسماء الفصول تأتي من قاعدة البيانات ولا توجد أسماء ثابتة في الكود.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface ClassDetailRow {
  id: string;
  name: string;
  stage: string;
  childCount: number;
  children: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
}

/** الفصول مع أطفالها ومعلماتها. */
export const listClassDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ClassDetailRow[]> => {
    const [{ data: classes, error }, { data: kids }, { data: links }] = await Promise.all([
      context.supabase.from("classes").select("id, name, stage").order("name"),
      context.supabase.from("children").select("id, name, class_id").order("name"),
      context.supabase.from("teacher_classes").select("teacher_id, class_id, profiles(full_name)"),
    ]);
    if (error) throw new Error(error.message);

    const teacherLinks = (links ?? []) as unknown as {
      teacher_id: string;
      class_id: string;
      profiles: { full_name: string } | null;
    }[];

    return (classes ?? []).map((c) => {
      const children = (kids ?? [])
        .filter((k) => k.class_id === c.id)
        .map((k) => ({ id: k.id, name: k.name }));
      return {
        id: c.id,
        name: c.name,
        stage: c.stage,
        childCount: children.length,
        children,
        teachers: teacherLinks
          .filter((l) => l.class_id === c.id)
          .map((l) => ({ id: l.teacher_id, name: l.profiles?.full_name ?? "—" })),
      };
    });
  });

/** إضافة فصل جديد — يُحفظ فعليًا في قاعدة البيانات. */
export const createClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ name: z.string().trim().min(2), stage: z.enum(["nursery", "kg1", "kg2"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("classes")
      .insert({ name: data.name, stage: data.stage })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/** تغيير اسم الفصل — هوية الفصل وبيانات أطفاله لا تتغير. */
export const renameClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), name: z.string().trim().min(2) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("classes")
      .update({ name: data.name })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** حذف فصل — ممنوع إن كان مرتبطًا بأطفال أو بيانات (أنشطة/جدول). */
export const deleteClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const [{ count: childCount }, { count: activityCount }, { count: scheduleCount }] = await Promise.all([
      context.supabase.from("children").select("id", { count: "exact", head: true }).eq("class_id", data.id),
      context.supabase.from("activities").select("id", { count: "exact", head: true }).eq("class_id", data.id),
      context.supabase
        .from("schedule_items")
        .select("id", { count: "exact", head: true })
        .eq("class_id", data.id),
    ]);
    if ((childCount ?? 0) > 0) {
      throw new Error(
        `لا يمكن حذف الفصل: مرتبط بـ ${childCount} من الأطفال. انقل الأطفال إلى فصل آخر أولًا.`,
      );
    }
    if ((activityCount ?? 0) > 0 || (scheduleCount ?? 0) > 0) {
      throw new Error("لا يمكن حذف الفصل: يوجد أنشطة أو جدول يومي مرتبط به. عالج هذه البيانات أولًا.");
    }
    await context.supabase.from("teacher_classes").delete().eq("class_id", data.id);
    const { error } = await context.supabase.from("classes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** ربط معلمة بفصل أو فصل الارتباط. */
export const setClassTeacher = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        classId: z.string().uuid(),
        teacherId: z.string().uuid(),
        linked: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    if (data.linked) {
      const { error } = await context.supabase
        .from("teacher_classes")
        .upsert({ class_id: data.classId, teacher_id: data.teacherId });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("teacher_classes")
        .delete()
        .eq("class_id", data.classId)
        .eq("teacher_id", data.teacherId);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });
