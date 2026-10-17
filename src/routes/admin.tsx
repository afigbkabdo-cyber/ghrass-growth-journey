import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, adminSidebarNav, adminBottomNav } from "@/components/shells";
import { RoleGuard } from "@/components/role-guard";
import { sectionRoles } from "@/lib/session";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة — غراس" },
      {
        name: "description",
        content: "لوحة إدارة روضة غراس: الأطفال والكادر والفصول والحضور وخطة القيم والتقارير.",
      },
      { property: "og:title", content: "لوحة الإدارة — غراس" },
      { property: "og:description", content: "إدارة كاملة لروضة غراس من مكان واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <RoleGuard allow={sectionRoles.admin}>
      <AdminShell sidebarItems={adminSidebarNav} bottomItems={adminBottomNav} />
    </RoleGuard>
  );
}
