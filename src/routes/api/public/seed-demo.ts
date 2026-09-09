import { createFileRoute } from "@tanstack/react-router";
import { seedDemoData } from "@/lib/seed.functions";

/** تهيئة بيانات العرض — محمية بمفتاح سري ولا تعمل بدونه. */
export const Route = createFileRoute("/api/public/seed-demo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["LOVABLE_CRON_SECRET"];
        if (!secret || request.headers.get("x-seed-secret") !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const result = await seedDemoData();
          return Response.json(result);
        } catch (error) {
          return Response.json(
            { ok: false, error: error instanceof Error ? error.message : "unknown" },
            { status: 500 },
          );
        }
      },
    },
  },
});
