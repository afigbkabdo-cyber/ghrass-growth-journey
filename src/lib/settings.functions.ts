/*
 * بيانات الروضة (تُدار من الإدارة فقط عبر RLS) وتفضيل اللغة لكل مستخدم.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface NurseryInfo {
  id: string;
  name: string;
  tagline: string;
  city: string;
  phone: string;
  email: string;
  instagram: string;
}

const settingsSelect = "id, name, tagline, city, phone, email, instagram";

/** بيانات الروضة — يقرأها أي مستخدم مسجّل. */
export const getNurserySettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<NurseryInfo | null> => {
    const { data, error } = await context.supabase
      .from("nursery_settings")
      .select(settingsSelect)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? null;
  });

const nurserySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2),
  tagline: z.string().trim().min(1),
  city: z.string().trim().min(1),
  phone: z.string().trim().min(5),
  email: z.string().trim().min(3),
  instagram: z.string().trim().min(1),
});

/** حفظ بيانات الروضة — الإدارة فقط (RLS). */
export const saveNurserySettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => nurserySchema.parse(d))
  .handler(async ({ data, context }): Promise<NurseryInfo> => {
    const { id, ...patch } = data;
    const { data: row, error } = await context.supabase
      .from("nursery_settings")
      .update(patch)
      .eq("id", id)
      .select(settingsSelect)
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

/** لغة المستخدم الحالي. */
export const getMyLanguage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<"ar" | "en"> => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("language")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.language === "en" ? "en" : "ar";
  });

/** حفظ لغة المستخدم الحالي فقط — لا تتأثر لغة بقية المستخدمين. */
export const setMyLanguage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ language: z.enum(["ar", "en"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ language: data.language })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
