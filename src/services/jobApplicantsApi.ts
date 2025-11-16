import { getValidAccessToken } from "@/services/auth/authApi";

const BASE = process.env.NEXT_PUBLIC_API_BASE!;

export type Applicant = {
  applicationId: number;
  applicantId: number;
  name: string;
  appliedAt: string;
  positions: string[];
};

export type JobApplicantsResponse = {
  postId: number;
  postTitle: string;
  totalApplicants: number;
  applicants: Applicant[];
};

export async function fetchJobApplicants(postId: number | string): Promise<JobApplicantsResponse> {
  const token = await getValidAccessToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const res = await fetch(`${BASE}/api/job/posts/${postId}/applicants`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`JOB_APPLICANTS_FETCH_FAILED ${res.status} ${text}`);
  }

  const data = (await res.json()) as JobApplicantsResponse;
  if (typeof data?.postId !== "number") {
    throw new Error("INVALID_JOB_APPLICANTS_RESPONSE");
  }
  return {
    postId: data.postId,
    postTitle: data.postTitle ?? "Job posting",
    totalApplicants: data.totalApplicants ?? data.applicants?.length ?? 0,
    applicants: Array.isArray(data.applicants)
      ? data.applicants.map((a) => ({
          applicationId: Number(a.applicationId ?? 0),
          applicantId: Number(a.applicantId ?? 0),
          name: a.name ?? "지원자",
          appliedAt: a.appliedAt ?? "",
          positions: Array.isArray(a.positions) ? a.positions.filter(Boolean) : [],
        }))
      : [],
  };
}
