import { getValidAccessToken } from "@/services/auth/authApi";
import type { ProfileResponse } from "@/models/profile";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

export type UpdateProfilePayload = {
  name?: string;
  profileImageUrl?: string;
  positions?: string[];
  from?: string;
  inLocation?: string;
  website?: string;
  introductionHeadline?: string;
  introductionContent?: string;
};

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<ProfileResponse> {
  const token = await getValidAccessToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const res = await fetch(`${BASE}/api/profile/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PROFILE_UPDATE_FAILED ${res.status} ${text}`);
  }

  return (await res.json()) as ProfileResponse;
}
