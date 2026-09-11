import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { PageContainer, EmptyState } from "@/components/ghiras";
import { toneClasses } from "@/components/ghiras";
import { teacherNotifications } from "@/lib/teacher-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/teacher/notifications")({
  head: () => ({
    meta: [
      { title: "إشعارات المعلمة — غراس" },
      {
        name: "description",
        content: "إشعارات المعلمة اليومية: قيمة الأسبوع، الرسائل الجديدة، الغياب، وإعلانات الإدارة.",
      },
      { property: "og:title", content: "إشعارات المعلمة — غراس" },
      { property: "og:description", content: "متابعة كل ما يهم المعلمة في يومها الدراسي." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherNotificationsPage,
});

function TeacherNotificationsPage() {
  const { t } = useI18n();
  const unread = teacherNotifications.filter((n) => n.unread).length;

  return (
    <PageContainer>
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-yellow-soft">
          <Bell className="h-5.5 w-5.5 text-brand-yellow-deep" strokeWidth={2.2} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground">{t("الإشعارات")}</h1>
          <p className="text-xs text-muted-foreground">
            {unread > 0 ? t("{count} إشعار غير مقروء", { count: unread }) : t("كل الإشعارات مقروءة")}
          </p>
        </div>
      </header>

      {teacherNotifications.length === 0 ? (
        <EmptyState title={t("لا توجد إشعارات")} message={t("سنخبرك هنا بكل جديد يخص فصلك.")} />
      ) : (
        <div className="space-y-2">
          {teacherNotifications.map((n) => {
            const tone = toneClasses[n.tone];
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-2xl border p-4 shadow-soft ${
                  n.unread ? "border-primary/30 bg-card" : "border-border bg-card/60"
                }`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ${tone.soft}`}>
                  <span aria-hidden>{n.emoji}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm leading-relaxed ${n.unread ? "font-bold text-foreground" : "text-muted-foreground"}`}
                  >
                    {t(n.text)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{t(n.time)}</p>
                </div>
                {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-pink" />}
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
