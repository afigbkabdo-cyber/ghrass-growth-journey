import { createFileRoute } from "@tanstack/react-router";
import { AppShell, teacherNav } from "@/components/shells";

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
  return <AppShell navItems={teacherNav} roleLabel="معلمة" tone="blue" />;
}
