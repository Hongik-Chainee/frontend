import type { JobListResponse, JobSort } from "@/models/job";
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
