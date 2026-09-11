/*
 * نظام اللغة: العربية (افتراضية، RTL) والإنجليزية (LTR).
 * التفضيل محفوظ لكل مستخدم في ملفه الشخصي (قاعدة البيانات) وأيضًا محليًا للاستجابة الفورية.
 * الترجمة تعمل بمفتاح النص العربي — البيانات التي يدخلها المستخدم لا تُترجم أبدًا،
 * بل تُعرض بالاسم الإنجليزي المحفوظ إن وُجد، وإلا بالتحويل الصوتي.
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
import { dictionaryEn } from "@/lib/i18n-dict";
import { transliterate } from "@/lib/translit";

export type Lang = "ar" | "en";

const STORAGE_KEY = "ghiras.lang";

export type TVars = Record<string, string | number>;

/** ترجمة نص واجهة مع دعم المتغيرات: t("حذف {name}", { name }). */
export function translate(lang: Lang, text: string, vars?: TVars): string {
  let out = lang === "en" ? (dictionaryEn[text] ?? text) : text;
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      out = out.split(`{${key}}`).join(String(value));
    }
  }
  return out;
}

/** اسم شخص/فصل: يُعرض الاسم الإنجليزي المحفوظ عند اختيار English، وإلا التحويل الصوتي. */
export function localizedName(
  lang: Lang,
  arabicName: string | null | undefined,
  englishName?: string | null,
): string {
  const ar = arabicName ?? "";
  if (lang !== "en") return ar;
  const en = (englishName ?? "").trim();
  if (en) return en;
  return transliterate(ar);
}

interface I18nValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  locale: string;
  setLang: (lang: Lang) => void;
  /** نص واجهة */
  t: (text: string, vars?: TVars) => string;
  /** اسم مُدخل من المستخدم (طفل/ولي أمر/معلمة/فصل) */
  n: (arabicName: string | null | undefined, englishName?: string | null) => string;
  /** تاريخ */
  d: (iso: string | Date | null | undefined) => string;
  /** تاريخ ووقت */
  dt: (iso: string | Date | null | undefined) => string;
  /** وقت HH:MM */
  time: (hhmm: string | null | undefined) => string;
  /** رقم */
  num: (value: number) => string;
}

const fallback: I18nValue = {
  lang: "ar",
  dir: "rtl",
  locale: "ar-SA",
  setLang: () => {},
  t: (text) => text,
  n: (ar) => ar ?? "",
  d: () => "",
  dt: () => "",
  time: (v) => v ?? "",
  num: (v) => String(v),
};

const I18nContext = createContext<I18nValue>(fallback);

/** تنسيق الوقت "HH:MM" حسب اللغة. */
export function formatTime(lang: Lang, hhmm: string | null | undefined): string {
  if (!hhmm) return "";
  const [hRaw, mRaw] = hhmm.split(":");
  const h = Number(hRaw);
  const m = (mRaw ?? "00").slice(0, 2);
  if (Number.isNaN(h)) return hhmm;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  if (lang === "en") return `${hour12}:${m} ${h < 12 ? "AM" : "PM"}`;
  return `${hour12}:${m} ${h < 12 ? "ص" : "م"}`;
}

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

  const value = useMemo<I18nValue>(() => {
    const locale = lang === "en" ? "en-GB" : "ar-SA";
    const toDate = (input: string | Date | null | undefined) => {
      if (!input) return null;
      const date = input instanceof Date ? input : new Date(input);
      return Number.isNaN(date.getTime()) ? null : date;
    };
    return {
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      locale,
      setLang,
      t: (text: string, vars?: TVars) => translate(lang, text, vars),
      n: (ar, en) => localizedName(lang, ar, en),
      d: (input) => {
        const date = toDate(input);
        return date ? date.toLocaleDateString(locale, { dateStyle: "medium" }) : "";
      },
      dt: (input) => {
        const date = toDate(input);
        return date
          ? date.toLocaleString(locale, { dateStyle: "short", timeStyle: "short" })
          : "";
      },
      time: (hhmm) => formatTime(lang, hhmm ? hhmm.slice(0, 5) : hhmm),
      num: (v) => v.toLocaleString(lang === "en" ? "en-US" : "ar-EG"),
    };
  }, [lang, setLang]);

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
