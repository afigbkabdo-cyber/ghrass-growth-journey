import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizePhone, phoneToEmail } from "./phone";

/** توليد كلمة مرور مؤقتة قوية وسهلة القراءة. */
function tempPassword() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const small = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const pick = (s: string, n: number) =>
    Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join("");
  return `Ghiras${pick(letters, 1)}${pick(small, 3)}${pick(digits, 3)}`;
}

async function assertAdmin(supabase: {
  from: (t: "user_roles") => {
    select: (c: string) => { eq: (c: string, v: string) => Promise<{ data: { role: string }[] | null }> };
  };
}, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.includes("admin") && !roles.includes("super_admin")) {
    throw new Error("هذه العملية متاحة للإدارة فقط.");
  }
}

const createSchema = z.object({
  fullName: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  role: z.enum(["parent", "teacher"]),
  title: z.string().trim().optional(),
});

/** إنشاء حساب معلمة أو ولي أمر مع كلمة مرور مؤقتة (لا تُخزَّن كنص في قاعدة البيانات). */
export const createAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);

    const phone = normalizePhone(data.phone);
    if (!phone) throw new Error("رقم الجوال غير صحيح. استخدم الصيغة 05XXXXXXXX.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const password = tempPassword();

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: phoneToEmail(phone),
      password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName, phone },
    });
    if (error || !created.user) {
      throw new Error(
        error?.message?.includes("already")
          ? "يوجد حساب مسجّل بهذا الرقم."
          : (error?.message ?? "تعذر إنشاء الحساب."),
      );
    }

    const userId = created.user.id;
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      full_name: data.fullName,
      phone,
      title: data.title ?? null,
      must_change_password: true,
    });
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error("تعذر حفظ بيانات الحساب.");
    }
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: data.role });

    return { userId, phone, password };
  });

/** إعادة تعيين كلمة مرور مؤقتة لحساب موجود. */
export const resetAccountPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const password = tempPassword();
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password });
    if (error) throw new Error("تعذر إعادة تعيين كلمة المرور.");
    await supabaseAdmin.from("profiles").update({ must_change_password: true }).eq("id", data.userId);
    return { password };
  });

/** حذف حساب معلمة أو ولي أمر: يُعطَّل تسجيل الدخول نهائيًا ويُحرَّر رقم الجوال لإعادة الإنشاء لاحقًا. */
export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", data.userId);
    const list = (roles ?? []).map((r) => r.role as string);
    if (list.includes("admin") || list.includes("super_admin")) {
      throw new Error("لا يمكن حذف حساب الإدارة.");
    }
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      email: `deleted-${data.userId}@ghiras.app`,
      ban_duration: "876000h",
    });
    if (error) throw new Error("تعذر حذف الحساب.");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    await supabaseAdmin.from("profiles").update({ phone: null }).eq("id", data.userId);
    return { ok: true };
  });
