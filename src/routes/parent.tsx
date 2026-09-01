import { createFileRoute, redirect } from "@tanstack/react-router";

/** مسار مختصر لواجهة ولي الأمر — يوجّه إلى الرئيسية. */
export const Route = createFileRoute("/parent")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
  component: () => null,
});
