import type { JobAuthor, JobListResponse, JobPost, JobSort } from "@/models/job";
import { getValidAccessToken } from "@/services/auth/authApi";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

type FetchJobParams = {
  page?: number;
  size?: number;
  sort?: JobSort;
};

export async function fetchJobPosts(params: FetchJobParams = {}): Promise<JobListResponse> {
  const { page = 0, size = 9, sort = "RECENT" } = params;
  const search = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort,
  });

  const res = await fetch(`${BASE}/api/job/posts?${search.toString()}`, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`JOB_POSTS_FETCH_FAILED ${res.status} ${text}`);
  }

  const data = (await res.json()) as JobListResponse;
  if (!Array.isArray(data?.posts)) {
    throw new Error("INVALID_JOB_POSTS_RESPONSE");
  }
  return data;
}

type JobDetailResponse = {
  id: number;
  title: string;
  description?: string | null;
  payment?: number | null;
  requiredSkills?: string[] | null;
  duration?: string | null;
  deadline?: string | null;
  createdAt?: string | null;
  applicantCount?: number | null;
  author?: Record<string, any> | null;
};

function normalizeAuthor(raw: Record<string, any> | null | undefined): JobAuthor | null {
  if (!raw) return null;
  const toArray = (value: unknown): string[] | null => {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (typeof value === "string") {
      const arr = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      return arr.length ? arr : null;
    }
    return null;
  };

  return {
    id: Number(raw.id ?? 0),
    name: raw.name ?? null,
    profileImageUrl: raw.profileImageUrl ?? raw.avatarUrl ?? null,
    positions: toArray(raw.positions),
    from: raw.from ?? null,
    in: raw.in ?? raw.inLocation ?? null,
    website: raw.website ?? null,
    followerCount: raw.followers ?? raw.followerCount ?? null,
    followingCount: raw.followings ?? raw.followingCount ?? null,
  };
}

export async function fetchJobPostDetail(postId: number | string): Promise<JobPost> {
  const res = await fetch(`${BASE}/api/job/posts/${postId}`, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`JOB_POST_DETAIL_FETCH_FAILED ${res.status} ${text}`);
  }

  const data = (await res.json()) as JobDetailResponse;
  if (typeof data?.id !== "number") {
    throw new Error("INVALID_JOB_POST_DETAIL_RESPONSE");
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description ?? null,
    payment: data.payment ?? null,
    requiredSkills: data.requiredSkills ?? null,
    duration: data.duration ?? null,
    deadline: data.deadline ?? null,
    createdAt: data.createdAt ?? null,
    applicantCount: data.applicantCount ?? null,
    author: normalizeAuthor(data.author),
  };
}

export type CreateJobPostPayload = {
  title: string;
  description: string;
  payment?: number;
  requiredSkills?: string[];
  duration?: string;
  deadline?: string;
};

type CreateJobPostResponse = {
  success: boolean;
  messageCode?: string;
  data?: {
    postId?: string;
  };
};

export async function createJobPost(
  payload: CreateJobPostPayload
): Promise<{ postId: string; messageCode?: string }> {
  const token = await getValidAccessToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const res = await fetch(`${BASE}/api/job/posts`, {
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
    throw new Error(`JOB_POST_CREATE_FAILED ${res.status} ${text}`);
  }

  const data = (await res.json()) as CreateJobPostResponse;
  const postId = data?.data?.postId;
  if (!data?.success || !postId) {
    throw new Error("INVALID_JOB_POST_RESPONSE");
  }
  return { postId, messageCode: data.messageCode };
}
