import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "./client";

/**
 * ينتظر استعادة جلسة Supabase من التخزين المحلي قبل إرسال أي نداء إلى الخادم،
 * حتى لا تُرسل الطلبات بدون ترويسة Authorization بعد إعادة تحميل الصفحة.
 */
export const awaitSupabaseSession = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    if (typeof window !== "undefined") {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        await new Promise<void>((resolve) => {
          const timer = setTimeout(finish, 2500);
          const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) finish();
          });
          function finish() {
            clearTimeout(timer);
            sub.subscription.unsubscribe();
            resolve();
          }
        });
      }
    }
    return next();
  },
);
