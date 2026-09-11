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
  nameEn: string | null;
  taglineEn: string | null;
  cityEn: string | null;
  dayStart: string | null;
  dayEnd: string | null;
}

const settingsSelect =
  "id, name, tagline, city, phone, email, instagram, name_en, tagline_en, city_en, day_start, day_end";

function mapNurseryRow(row: any): NurseryInfo {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    city: row.city,
    phone: row.phone,
    email: row.email,
    instagram: row.instagram,
    nameEn: row.name_en ?? null,
    taglineEn: row.tagline_en ?? null,
    cityEn: row.city_en ?? null,
    dayStart: row.day_start ? String(row.day_start).slice(0, 5) : null,
    dayEnd: row.day_end ? String(row.day_end).slice(0, 5) : null,
  };
}

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
    return data ? mapNurseryRow(data) : null;
  });

const nurserySchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2),
  tagline: z.string().trim().min(1),
  city: z.string().trim().min(1),
  phone: z.string().trim().min(5),
  email: z.string().trim().min(3),
  instagram: z.string().trim().min(1),
  nameEn: z.string().trim().min(1),
  taglineEn: z.string().trim().min(1),
  cityEn: z.string().trim().min(1),
  dayStart: z.string().trim().min(1),
  dayEnd: z.string().trim().min(1),
});

/** حفظ بيانات الروضة — الإدارة فقط (RLS). */
export const saveNurserySettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => nurserySchema.parse(d))
  .handler(async ({ data, context }): Promise<NurseryInfo> => {
    const { id, nameEn, taglineEn, cityEn, dayStart, dayEnd, ...patch } = data;
    const { data: row, error } = await context.supabase
      .from("nursery_settings")
      .update({
        ...patch,
        name_en: nameEn,
        tagline_en: taglineEn,
        city_en: cityEn,
        day_start: dayStart,
        day_end: dayEnd,
      })
      .eq("id", id)
      .select(settingsSelect)
      .single();
    if (error) throw new Error(error.message);
    return mapNurseryRow(row);
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
