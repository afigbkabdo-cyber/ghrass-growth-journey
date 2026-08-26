import { createFileRoute } from "@tanstack/react-router";
import {
  Baby,
  Bell,
  CircleHelp,
  ChevronLeft,
  Languages,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, parentNav } from "@/components/shells";
import { Avatar, PageContainer, SectionHeader, ToneBadge } from "@/components/ghiras";
import { Switch } from "@/components/ui/switch";
import { consents, currentChild } from "@/lib/data";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "المزيد والإعدادات — غراس" },
      { name: "description", content: "الملف الشخصي، الموافقات والخصوصية، وإعدادات الحساب." },
      { property: "og:title", content: "المزيد والإعدادات — غراس" },
      { property: "og:description", content: "الملف الشخصي، الموافقات والخصوصية، وإعدادات الحساب." },
    ],
  }),
  component: MorePage,
});

function MorePage() {
  const [items, setItems] = useState(consents);
  const [notifications, setNotifications] = useState(true);

  const toggleConsent = (id: string) => {
    setItems((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.required) {
          toast.info("هذه الموافقة لازمة لتقديم الخدمة ولا يمكن إيقافها.");
          return c;
        }
        toast.success(c.granted ? "تم إيقاف الموافقة (عرض تجريبي)" : "تم منح الموافقة (عرض تجريبي)");
        return { ...c, granted: !c.granted };
      }),
    );
  };

  return (
    <AppShell navItems={parentNav} roleLabel="ولي أمر" tone="orange">
      <PageContainer>
        {/* الملف */}
        <section className="mb-6 flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <Avatar name={currentChild.guardian} tone="orange" size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg font-extrabold text-foreground">{currentChild.guardian}</h1>
            <p className="text-xs text-muted-foreground">ولية أمر {currentChild.name} — {currentChild.className}</p>
          </div>
          <ToneBadge tone="green">حساب موثق</ToneBadge>
        </section>

        {/* الموافقات والخصوصية */}
        <SectionHeader title="الموافقات والخصوصية" subtitle="أنتِ المتحكمة في بيانات طفلك" icon={ShieldCheck} tone="green" />
        <div className="mb-6 space-y-3">
          {items.map((c) => (
            <div key={c.id} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">{c.title}</p>
                  {c.required && <ToneBadge tone="yellow">لازمة</ToneBadge>}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
              </div>
              <Switch
                checked={c.granted}
                onCheckedChange={() => toggleConsent(c.id)}
                disabled={c.required}
                aria-label={c.title}
              />
            </div>
          ))}
        </div>

        {/* إعدادات عامة */}
        <SectionHeader title="إعدادات التطبيق" icon={Bell} tone="blue" />
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-blue-soft">
                <Bell className="h-4.5 w-4.5 text-brand-blue-deep" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">الإشعارات الفورية</p>
                <p className="text-[11px] text-muted-foreground">أنشطة ورسائل وحضور طفلك</p>
              </div>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} aria-label="الإشعارات" />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-green-soft">
                <Languages className="h-4.5 w-4.5 text-brand-green-deep" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">لغة التطبيق</p>
                <p className="text-[11px] text-muted-foreground">العربية (الافتراضية)</p>
              </div>
            </div>
            <ToneBadge tone="green">العربية</ToneBadge>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-pink-soft">
                <Baby className="h-4.5 w-4.5 text-brand-pink-deep" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">إضافة طفل آخر</p>
                <p className="text-[11px] text-muted-foreground">اربط أخًا أو أختًا في غراس بحسابك</p>
              </div>
            </div>
            <ChevronLeft className="h-4.5 w-4.5 text-muted-foreground" />
          </div>
        </div>

        {/* دعم وخروج */}
        <div className="space-y-3">
          <button
            onClick={() => toast.info("الدعم الفني متاح في المرحلة الثانية — تواصل مع إدارة الروضة حاليًا.")}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-start shadow-soft transition-shadow hover:shadow-md"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-yellow-soft">
              <CircleHelp className="h-4.5 w-4.5 text-brand-yellow-deep" strokeWidth={2.2} />
            </span>
            <span className="text-sm font-bold text-foreground">المساعدة والدعم</span>
          </button>
          <button
            onClick={() => toast.info("تسجيل الخروج معروض للتجربة فقط — لا حسابات في المرحلة الأولى.")}
            className="flex w-full items-center gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-start transition-colors hover:bg-destructive/10"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/10">
              <LogOut className="h-4.5 w-4.5 text-destructive" strokeWidth={2.2} />
            </span>
            <span className="text-sm font-bold text-destructive">تسجيل الخروج</span>
          </button>
          <p className="pt-2 text-center text-[11px] text-muted-foreground">
            غراس • نمو معًا — المرحلة الأولى (عرض تفاعلي للتصميم)
          </p>
        </div>
      </PageContainer>
    </AppShell>
  );
}
