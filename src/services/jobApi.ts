import type { JobListResponse, JobSort } from "@/models/job";

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
