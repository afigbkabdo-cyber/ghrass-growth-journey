import { createFileRoute } from "@tanstack/react-router";
import { AppShell, teacherNav } from "@/components/shells";
import { RoleGuard } from "@/components/role-guard";
import { sectionRoles } from "@/lib/session";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/teacher")({
  head: () => ({
    meta: [
      { title: "واجهة المعلمة — غراس" },
      { name: "description", content: "أدوات المعلمة اليومية في روضة غراس: الحضور والأنشطة والملاحظات والتواصل." },
      { property: "og:title", content: "واجهة المعلمة — غراس" },
      { property: "og:description", content: "أدوات المعلمة اليومية في روضة غراس." },
    ],
  }),
  component: TeacherLayout,
});

function TeacherLayout() {
  const { t } = useI18n();
  return (
    <RoleGuard allow={sectionRoles.teacher}>
      <AppShell navItems={teacherNav} roleLabel={t("معلمة")} tone="blue" />
    </RoleGuard>
  );
}
