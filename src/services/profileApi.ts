import { getValidAccessToken } from "@/services/auth/authApi";
import type { ProfileResponse } from "@/models/profile";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function fetchProfile(userId: string | number): Promise<ProfileResponse> {
  if (!userId) throw new Error("USER_ID_REQUIRED");

  const token = await getValidAccessToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api/profile/${userId}`, {
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PROFILE_FETCH_FAILED ${res.status} ${text}`);
  }

  const data = (await res.json()) as ProfileResponse;
  if (!data || typeof data !== "object" || typeof data.id !== "number") {
    throw new Error("INVALID_PROFILE_RESPONSE");
  }
  return data;
}
