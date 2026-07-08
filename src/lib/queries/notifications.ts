import { getAuthedContext } from "@/lib/supabase/auth";
import { notifications as mockNotifications, type AppNotification } from "@/data/notifications";

/**
 * The signed-in user's notifications (demo data when unconfigured). There is
 * no notifications table yet — a real account has none until that's built,
 * so it correctly starts blank rather than showing the demo seed data.
 */
export async function getNotifications(): Promise<AppNotification[]> {
  const ctx = await getAuthedContext();
  if (!ctx) return mockNotifications;
  return [];
}
