/*
 * نظام اللغة: العربية (افتراضية، RTL) والإنجليزية (LTR).
 * التفضيل محفوظ لكل مستخدم في ملفه الشخصي (قاعدة البيانات) وأيضًا محليًا للاستجابة الفورية.
 * الترجمة تعمل بمفتاح النص العربي — البيانات التي يدخلها المستخدم لا تُترجم أبدًا.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

export type Lang = "ar" | "en";

const STORAGE_KEY = "ghiras.lang";

/** قاموس واجهة المستخدم: المفتاح هو النص العربي. */
const en: Record<string, string> = {
  // التنقل
  "الرئيسية": "Home",
  "طفلي": "My child",
  "رحلة غراس": "Ghiras journey",
  "الأنشطة": "Activities",
  "الرسائل": "Messages",
  "المزيد": "More",
  "الأطفال": "Children",
  "الحضور": "Attendance",
  "الجدول": "Schedule",
  "الجدول اليومي": "Daily schedule",
  "الموظفون": "Staff",
  "الموظفون والكادر": "Staff & team",
  "الفصول": "Classes",
  "القيم": "Values",
  "الإعلانات": "Announcements",
  "التقارير": "Reports",
  "الإعدادات": "Settings",
  "القائمة": "Menu",
  "الحضور العام": "Overall attendance",
  // الأدوار
  "ولي أمر": "Parent",
  "معلمة": "Teacher",
  "الإدارة": "Administration",
  "مسؤول النظام": "Super admin",
  // عام
  "حفظ": "Save",
  "إلغاء": "Cancel",
  "حذف": "Delete",
  "إضافة": "Add",
  "تعديل": "Edit",
  "بحث": "Search",
  "الكل": "All",
  "جارٍ التحميل…": "Loading…",
  "جارٍ الحفظ…": "Saving…",
  "تسجيل الخروج": "Sign out",
  "اللغة": "Language",
  "العربية": "العربية",
  "English": "English",
  "تم الحفظ": "Saved",
  "تعذر الحفظ": "Could not save",
  "إغلاق": "Close",
  "لا توجد بيانات": "No data",
  // قيمة الأسبوع
  "قيمة الأسبوع": "Value of the week",
  "خطة القيم": "Values plan",
  "أرشيف قيم الأسابيع": "Weekly values archive",
  "حديث الأسبوع": "Hadith of the week",
  "المصدر": "Source",
  "ماذا سيتعلم طفلك؟": "What will your child learn?",
  "ماذا نفعل في الروضة؟": "What we do at the nursery",
  "كيف تشارك من البيت؟": "How to take part at home",
  "اسم القيمة": "Value name",
  "نص الحديث": "Hadith text",
  "مصدر الحديث": "Hadith source",
  "عبارة تعريفية قصيرة": "Short tagline",
  "بداية الأسبوع": "Week start",
  "معتمدة": "Published",
  "مسودة": "Draft",
  "اعتماد": "Publish",
  "إلغاء الاعتماد": "Unpublish",
  "اعتماد ونشر كقيمة الأسبوع": "Publish as value of the week",
  "لا توجد قيمة معتمدة": "No published value yet",
  "دليل قيمة الأسبوع": "Value of the week guide",
  "معتمدة من الإدارة": "Published by the administration",
  "كيف نغرسها": "How we nurture it",
  // الأطفال
  "سجل الأطفال": "Children register",
  "تسجيل طفل جديد": "Register a new child",
  "اسم الطفل": "Child name",
  "تاريخ الميلاد": "Date of birth",
  "الفئة العمرية": "Age group",
  "الفصل": "Class",
  "بدون فصل": "No class",
  "ولي الأمر": "Guardian",
  "رقم ولي الأمر": "Guardian phone",
  "بدون ولي أمر": "No guardian",
  "الحساسية": "Allergies",
  "الفترة": "Session",
  "فترة التسجيل": "Enrollment term",
  "تفاصيل الطفل": "Child details",
  "بيانات التسجيل": "Registration data",
  "نقل إلى فصل آخر": "Move to another class",
  "نقل": "Move",
  "حذف الطفل": "Delete child",
  "تاريخ الإضافة": "Added on",
  "غير محدد": "Not set",
  "غير مرتبط": "Not linked",
  "بيانات التسجيل للعرض فقط ولا يمكن تعديلها.": "Registration data is view-only and cannot be edited.",
  "هل تريد حذف الطفل نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.":
    "Delete this child permanently? This cannot be undone.",
  "تأكيد الحذف": "Confirm delete",
  // الفصول
  "إدارة الفصول": "Class management",
  "إضافة فصل": "Add class",
  "اسم الفصل": "Class name",
  "المرحلة": "Stage",
  "المعلمات": "Teachers",
  "عدد الأطفال": "Children count",
  "ربط معلمة": "Assign teacher",
  "حذف الفصل": "Delete class",
  // بيانات الروضة
  "بيانات الروضة": "Nursery details",
  "اسم الروضة": "Nursery name",
  "الشعار": "Tagline",
  "المدينة": "City",
  "رقم التواصل": "Contact number",
  "البريد الإلكتروني": "Email",
  "إنستقرام": "Instagram",
  "تعديل بيانات الروضة": "Edit nursery details",
};

interface I18nValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (lang: Lang) => void;
  t: (text: string) => string;
}

const I18nContext = createContext<I18nValue>({
  lang: "ar",
  dir: "rtl",
  setLang: () => {},
  t: (text) => text,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  // القراءة المحلية أولًا (فورية)، ثم مزامنة تفضيل المستخدم من قاعدة البيانات.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ar") setLangState(stored);

    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user || cancelled) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("language")
        .eq("id", data.user.id)
        .maybeSingle();
      const dbLang: Lang = profile?.language === "en" ? "en" : "ar";
      if (!cancelled) {
        setLangState(dbLang);
        window.localStorage.setItem(STORAGE_KEY, dbLang);
      }
    })().catch(() => {
      /* بدون جلسة — نكتفي بالتفضيل المحلي */
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      await supabase.from("profiles").update({ language: next }).eq("id", data.user.id);
    })();
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang,
      t: (text: string) => (lang === "en" ? (en[text] ?? text) : text),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

/** مبدّل اللغة — يظهر في إعدادات كل دور. */
export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  const options: { key: Lang; label: string }[] = [
    { key: "ar", label: "العربية" },
    { key: "en", label: "English" },
  ];
  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
      <p className="mb-3 text-xs font-bold text-muted-foreground">{t("اللغة")}</p>
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => setLang(o.key)}
            className={
              lang === o.key
                ? "flex-1 rounded-2xl bg-primary py-2.5 text-sm font-extrabold text-primary-foreground"
                : "flex-1 rounded-2xl border border-border bg-background py-2.5 text-sm font-bold text-muted-foreground"
            }
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
