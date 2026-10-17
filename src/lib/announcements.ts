import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublishedAnnouncement {
  id: string;
  title: string;
  body: string;
  tone: "orange" | "blue" | "green" | "yellow" | "pink";
  created_at: string;
}

/** الإعلانات المنشورة المسموح بها للمستخدم الحالي (تُصفّى حسب الجمهور عبر صلاحيات قاعدة البيانات). */
export function usePublishedAnnouncements() {
  return useQuery({
    queryKey: ["published-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id,title,body,tone,created_at")
        .eq("state", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PublishedAnnouncement[];
    },
  });
}
