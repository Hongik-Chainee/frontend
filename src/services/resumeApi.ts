import type { Resume } from "@/models/profile";
import { getValidAccessToken } from "@/services/auth/authApi";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

export type ResumePayload = {
  title: string;
  name: string;
  introduction?: string;
  desiredPosition?: string;
  skills?: string[];
  careerLevel?: string;
  portfolioUrl?: string;
};

type ResumeListResponse = Array<Record<string, any>>;

function toResume(raw: Record<string, any>): Resume {
  return {
    id: Number(raw?.id ?? raw?.resumeId ?? 0),
    title: raw?.title ?? raw?.name ?? "Resume",
    name: raw?.name ?? "",
    introduction: raw?.introduction ?? "",
    desiredPosition: raw?.desiredPosition ?? "",
    skills: normalizeSkills(raw?.skills),
    careerLevel: raw?.careerLevel ?? "",
    portfolioUrl: raw?.portfolioUrl ?? "",
    updatedAt: raw?.updatedAt ?? raw?.lastUpdate ?? "",
    createdAt: raw?.createdAt ?? "",
  };
}

function normalizeSkills(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    const tryJson = value.trim();
    if (tryJson.startsWith("[") && tryJson.endsWith("]")) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
      } catch {
        // ignore
      }
    }
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export async function fetchMyResumes(): Promise<Resume[]> {
  const token = await getValidAccessToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const res = await fetch(`${BASE}/api/resumes/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RESUME_LIST_FAILED ${res.status} ${text}`);
  }

  const data = (await res.json()) as ResumeListResponse;
  if (!Array.isArray(data)) return [];
  return data.map(toResume);
}

type CreateResumeResponse = {
  success?: boolean;
  messageCode?: string;
  data?: { resumeId?: number };
};

export async function createResume(payload: ResumePayload): Promise<number> {
  const token = await getValidAccessToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const res = await fetch(`${BASE}/api/resumes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RESUME_CREATE_FAILED ${res.status} ${text}`);
  }

  const data = (await res.json()) as CreateResumeResponse;
  const id = data?.data?.resumeId;
  if (!data?.success || typeof id !== "number") {
    throw new Error("INVALID_RESUME_CREATE_RESPONSE");
  }
  return id;
}

export async function updateResume(
  resumeId: number,
  payload: Partial<ResumePayload>
): Promise<Resume> {
  const token = await getValidAccessToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const res = await fetch(`${BASE}/api/resumes/${resumeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RESUME_UPDATE_FAILED ${res.status} ${text}`);
  }

  const data = (await res.json()) as Record<string, any>;
  return toResume(data);
}
