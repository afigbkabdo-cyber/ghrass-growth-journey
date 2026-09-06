import { createServerFn } from "@tanstack/react-start";
import { phoneToEmail } from "./phone";

/**
 * تهيئة بيانات العرض التجريبية مرة واحدة (فصول، أطفال، حسابات العرض).
 * آمنة للتكرار: لا تنشئ شيئًا موجودًا مسبقًا.
 */
export const seedDemoData = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const accounts = [
    { phone: "966551000001", name: "أم ليان الحربي", role: "parent", title: "ولية أمر" },
    { phone: "966551000002", name: "أبو عمر الشهري", role: "parent", title: "ولي أمر" },
    { phone: "966552000001", name: "أ. نورة العتيبي", role: "teacher", title: "معلمة اللغة العربية" },
    { phone: "966552000002", name: "أ. سارة القحطاني", role: "teacher", title: "معلمة الرياضيات" },
    { phone: "966553000001", name: "أ. الجوهرة السبيعي", role: "admin", title: "مديرة الروضة" },
    { phone: "966555000000", name: "مسؤول نظام غراس", role: "super_admin", title: "مالك النظام" },
  ] as const;

  const password = "Ghiras@1447";
  const ids: Record<string, string> = {};

  for (const acc of accounts) {
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("phone", acc.phone)
      .maybeSingle();
    if (existing?.id) {
      ids[acc.phone] = existing.id;
      continue;
    }
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: phoneToEmail(acc.phone),
      password,
      email_confirm: true,
      user_metadata: { full_name: acc.name, phone: acc.phone },
    });
    if (error || !created.user) continue;
    ids[acc.phone] = created.user.id;
    await supabaseAdmin.from("profiles").insert({
      id: created.user.id,
      full_name: acc.name,
      phone: acc.phone,
      title: acc.title,
      must_change_password: false,
    });
    await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: acc.role });
  }

  const classDefs = [
    { name: "فصل البذور", stage: "nursery" },
    { name: "فصل البراعم", stage: "kg1" },
    { name: "فصل الأوراق", stage: "kg2" },
  ];
  const classIds: Record<string, string> = {};
  for (const c of classDefs) {
    const { data: existing } = await supabaseAdmin
      .from("classes")
      .select("id")
      .eq("name", c.name)
      .maybeSingle();
    if (existing?.id) {
      classIds[c.name] = existing.id;
      continue;
    }
    const { data: inserted } = await supabaseAdmin.from("classes").insert(c).select("id").single();
    if (inserted) classIds[c.name] = inserted.id;
  }

  // ربط المعلمات بالفصول
  const teacherLinks: Array<[string, string]> = [
    ["966552000001", "فصل البراعم"],
    ["966552000002", "فصل الأوراق"],
  ];
  for (const [phone, className] of teacherLinks) {
    if (!ids[phone] || !classIds[className]) continue;
    await supabaseAdmin
      .from("teacher_classes")
      .upsert({ teacher_id: ids[phone], class_id: classIds[className] }, { onConflict: "teacher_id,class_id" });
  }

  const childDefs = [
    { name: "ليان الحربي", className: "فصل البراعم", stage: "kg1", gender: "female", guardian: "966551000001" },
    { name: "عمر الشهري", className: "فصل البراعم", stage: "kg1", gender: "male", guardian: "966551000002" },
    { name: "جوري المطيري", className: "فصل البراعم", stage: "kg1", gender: "female", guardian: null },
    { name: "يوسف الزهراني", className: "فصل البراعم", stage: "kg1", gender: "male", guardian: null },
    { name: "فيصل العنزي", className: "فصل الأوراق", stage: "kg2", gender: "male", guardian: null },
    { name: "سلمى القحطاني", className: "فصل الأوراق", stage: "kg2", gender: "female", guardian: null },
    { name: "مها السبيعي", className: "فصل الأوراق", stage: "kg2", gender: "female", guardian: null },
    { name: "ريان الدوسري", className: "فصل البذور", stage: "nursery", gender: "male", guardian: null },
    { name: "تالا الغامدي", className: "فصل البذور", stage: "nursery", gender: "female", guardian: null },
    { name: "آدم الحربي", className: "فصل البذور", stage: "nursery", gender: "male", guardian: "966551000001" },
  ] as const;

  for (const child of childDefs) {
    const { data: existing } = await supabaseAdmin
      .from("children")
      .select("id")
      .eq("name", child.name)
      .maybeSingle();
    let childId = existing?.id;
    if (!childId) {
      const { data: inserted } = await supabaseAdmin
        .from("children")
        .insert({
          name: child.name,
          stage: child.stage,
          gender: child.gender,
          class_id: classIds[child.className] ?? null,
        })
        .select("id")
        .single();
      childId = inserted?.id;
    }
    if (childId && child.guardian && ids[child.guardian]) {
      await supabaseAdmin
        .from("child_guardians")
        .upsert({ child_id: childId, guardian_id: ids[child.guardian] }, { onConflict: "child_id,guardian_id" });
    }
  }

  return { ok: true };
});
