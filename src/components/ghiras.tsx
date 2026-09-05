import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sprout,
  Leaf,
  TreeDeciduous,
  CloudOff,
  CircleAlert,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/data";

/* ---------- خريطة درجات الألوان ---------- */

export const toneClasses: Record<
  Tone,
  { soft: string; deep: string; solid: string; ring: string }
> = {
  orange: {
    soft: "bg-brand-orange-soft",
    deep: "text-brand-orange-deep",
    solid: "bg-brand-orange",
    ring: "ring-brand-orange/30",
  },
  blue: {
    soft: "bg-brand-blue-soft",
    deep: "text-brand-blue-deep",
    solid: "bg-brand-blue",
    ring: "ring-brand-blue/30",
  },
  green: {
    soft: "bg-brand-green-soft",
    deep: "text-brand-green-deep",
    solid: "bg-brand-green",
    ring: "ring-brand-green/30",
  },
  yellow: {
    soft: "bg-brand-yellow-soft",
    deep: "text-brand-yellow-deep",
    solid: "bg-brand-yellow",
    ring: "ring-brand-yellow/30",
  },
  pink: {
    soft: "bg-brand-pink-soft",
    deep: "text-brand-pink-deep",
    solid: "bg-brand-pink",
    ring: "ring-brand-pink/30",
  },
};

/* ---------- الشعار ---------- */

/** الشعار الرسمي الكامل (الرمز + الاسم) — لشاشة الدخول والشاشات التعريفية. */
export function GhirasLogoFull({ className }: { className?: string }) {
  return (
    <img
      src={ghirasLogoFull.url}
      alt="شعار روضة غراس — نمو معًا"
      className={cn("h-auto w-40 select-none object-contain", className)}
    />
  );
}

export function GhirasLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={ghirasLogoMark.url}
        alt="شعار غراس"
        className={cn("shrink-0 select-none object-contain", box)}
      />
      <div className="leading-tight">
        <p className={cn("font-display font-extrabold text-foreground", size === "lg" ? "text-2xl" : "text-lg")}>
          غراس
        </p>
        {size !== "sm" && (
          <p className="text-[10px] font-medium text-muted-foreground">نمو معًا</p>
        )}
      </div>
    </div>

  );
}

/* ---------- حاوية الصفحة ---------- */

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn("mx-auto w-full max-w-2xl px-4 pt-5 pb-28 md:pb-10", className)}>
      {children}
    </main>
  );
}

/* ---------- عنوان قسم ---------- */

export function SectionHeader({
  title,
  subtitle,
  action,
  icon: Icon,
  tone = "green",
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; to: string };
  icon?: LucideIcon;
  tone?: Tone;
}) {
  const t = toneClasses[tone];
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon && (
          <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", t.soft)}>
            <Icon className={cn("h-4.5 w-4.5", t.deep)} strokeWidth={2.2} />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <Link
          to={action.to}
          className="shrink-0 text-xs font-bold text-primary transition-colors hover:text-brand-orange-deep"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

/* ---------- شارة ---------- */

export function ToneBadge({
  children,
  tone = "green",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const t = toneClasses[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
        t.soft,
        t.deep,
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------- صورة رمزية بالأحرف ---------- */

export function Avatar({
  name,
  tone = "orange",
  size = "md",
  className,
}: {
  name: string;
  tone?: Tone;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const t = toneClasses[tone];
  const s =
    size === "xl"
      ? "h-20 w-20 rounded-3xl text-2xl"
      : size === "lg"
        ? "h-14 w-14 rounded-2xl text-lg"
        : size === "sm"
          ? "h-9 w-9 rounded-xl text-xs"
          : "h-11 w-11 rounded-xl text-sm";
  const initial = name.replace(/^أ\.\s*/, "").trim().charAt(0);
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center font-display font-extrabold",
        t.soft,
        t.deep,
        s,
        className,
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
}

/* ---------- بطاقة إحصائية ---------- */

export function StatCard({
  icon: Icon,
  value,
  label,
  tone = "orange",
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  tone?: Tone;
}) {
  const t = toneClasses[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 shadow-soft">
      <span className={cn("mb-2 grid h-9 w-9 place-items-center rounded-xl", t.soft)}>
        <Icon className={cn("h-4.5 w-4.5", t.deep)} strokeWidth={2.2} />
      </span>
      <p className="font-display text-xl font-extrabold text-foreground">{value}</p>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

/* ---------- الحالات الفارغة وغيرها ---------- */

export function EmptyState({
  icon: Icon = Sprout,
  title,
  message,
  tone = "green",
  action,
}: {
  icon?: LucideIcon;
  title: string;
  message: string;
  tone?: Tone;
  action?: ReactNode;
}) {
  const t = toneClasses[tone];
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
      <span className={cn("mb-3 grid h-14 w-14 place-items-center rounded-2xl", t.soft)}>
        <Icon className={cn("h-7 w-7", t.deep)} strokeWidth={1.8} />
      </span>
      <p className="font-display text-base font-bold text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-destructive/20 bg-destructive/5 px-6 py-10 text-center">
      <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10">
        <CircleAlert className="h-7 w-7 text-destructive" strokeWidth={1.8} />
      </span>
      <p className="font-display text-base font-bold text-foreground">حدث خطأ غير متوقع</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        تعذر تحميل البيانات. تحقق من الاتصال وحاول مرة أخرى.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-transform active:scale-95"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

export function OfflineNote() {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-brand-yellow/40 bg-brand-yellow-soft px-4 py-3">
      <CloudOff className="h-4.5 w-4.5 shrink-0 text-brand-yellow-deep" />
      <p className="text-xs font-medium text-brand-yellow-deep">
        أنت غير متصل حاليًا — سنعرض آخر البيانات المحفوظة ونحدّثها عند عودة الاتصال.
      </p>
    </div>
  );
}

export function SuccessNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-brand-green/30 bg-brand-green-soft px-4 py-3 animate-in fade-in slide-in-from-top-1">
      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-brand-green-deep" />
      <p className="text-xs font-bold text-brand-green-deep">{children}</p>
    </div>
  );
}

/* ---------- هيكل تحميل ---------- */

export function LoadingCards({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-label="جارٍ التحميل">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 rounded-full bg-muted" />
              <div className="h-2.5 w-1/3 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- أيقونة مرحلة النمو ---------- */

export function GrowthIcon({
  stage,
  className,
}: {
  stage: "seed" | "sprout" | "tree";
  className?: string;
}) {
  if (stage === "seed") return <Leaf className={className} strokeWidth={2.2} />;
  if (stage === "sprout") return <Sprout className={className} strokeWidth={2.2} />;
  return <TreeDeciduous className={className} strokeWidth={2.2} />;
}

/* ---------- شريط تقدم ---------- */

export function ProgressBar({
  value,
  tone = "green",
  className,
}: {
  value: number;
  tone?: Tone;
  className?: string;
}) {
  const t = toneClasses[tone];
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-700", t.solid)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
