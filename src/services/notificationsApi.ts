import { getValidAccessToken } from "@/services/auth/authApi";
import { NotificationListResponse } from "@/models/notification";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function fetchNotifications(page = 0, size = 10): Promise<NotificationListResponse> {
  const token = await getValidAccessToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const res = await fetch(`${BASE}/api/notifications?${params.toString()}`, {
    credentials: "include",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`NOTIFICATION_FETCH_FAIL ${res.status} ${text}`);
  }

  const data = (await res.json()) as NotificationListResponse;
  if (!Array.isArray(data?.notifications)) {
    throw new Error("INVALID_NOTIFICATION_RESPONSE");
  }
  return data;
}
