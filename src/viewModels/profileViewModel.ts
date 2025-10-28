// src/viewModels/profileViewModel.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchProfile, ProfileApi } from "@/services/profile/profileApi";
import { getAccessTokenRaw } from "@/services/auth/tokenStorage";

// UI 모델들 (네가 올린 models/profile.ts 인터페이스에 맞춰 매핑)
import type { User, Project, JobPosting, Resume, Introduction } from "@/models/profile";

/** (검증 없이) JWT payload uid 추출 유틸 */
function getUidFromAccess(access?: string | null): number | null {
  if (!access) return null;
  const parts = access.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    const uid: unknown = payload?.uid ?? payload?.sub;
    if (typeof uid === "number") return uid;
    if (typeof uid === "string") return Number(uid);
    return null;
  } catch {
    return null;
  }
}

function mapToUser(api: ProfileApi): User {
  return {
    name: api.name || "",
    tags: api.positions ?? [],
    university: api.from || "",
    location: api.in || "",
    website: (api.website || "").replace(/^https?:\/\//, ""),
    followers: api.followerCount ?? 0,
    following: api.followingCount ?? 0,
    avatarUrl: api.profileImageUrl || "",
  };
}

function mapToProjects(api: ProfileApi): Project[] {
  return (api.myProjects ?? []).map(p => ({
    name: p.title,
    description: p.nftTokenUri || "", // 일단 설명 대체; 추후 별도 필드 매핑
    imageUrl: "",                      // 필요 시 mainProject/cover 이미지 엔드포인트 붙이기
  }));
}

function mapToJobPosts(api: ProfileApi): JobPosting[] {
  return (api.jobPosts ?? []).map(j => ({
    name: j.title,
    status: new Date(j.deadline) >= new Date() ? "OPEN" : "Closed",
    details: `${j.description} (지원자 ${j.applicantCount}명)`,
  }));
}

function mapToResumes(api: ProfileApi): Resume[] {
  return (api.resumes ?? []).map(r => ({
    name: r.title,
    lastUpdate: r.createdAt?.slice(0, 10) ?? "",
  }));
}

function mapToIntroduction(api: ProfileApi): Introduction | null {
  const hasAny = api.introductionHeadline || api.introductionContent;
  if (!hasAny) return null;
  return {
    title: api.introductionHeadline || "",
    body: api.introductionContent || "",
  };
}

export function useProfileViewModel(userId: string) {
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<ProfileApi | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchProfile(userId);
        if (!alive) return;
        if (!data) {
          setNotFound(true);
          setApi(null);
        } else {
          setApi(data);
          setNotFound(false);
        }
      } catch (e) {
        console.error(e);
        if (alive) setNotFound(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [userId]);

  // 소유자 여부: accessToken의 uid === api.id
  const isOwner = useMemo(() => {
    const uid = getUidFromAccess(getAccessTokenRaw());
    if (!uid || !api?.id) return false;
    return Number(uid) === Number(api.id);
  }, [api]);

  // UI 모델 매핑
  const user: User | null = useMemo(() => (api ? mapToUser(api) : null), [api]);
  const projects: Project[] = useMemo(() => (api ? mapToProjects(api) : []), [api]);
  const jobPostings: JobPosting[] = useMemo(() => (api ? mapToJobPosts(api) : []), [api]);
  const resumes: Resume[] = useMemo(() => (api ? mapToResumes(api) : []), [api]);
  const introduction: Introduction | null = useMemo(() => (api ? mapToIntroduction(api) : null), [api]);

  return {
    isLoading: loading,
    notFound,
    isOwner,
    user,
    projects,
    jobPostings,
    resumes,
    introduction,
  };
}
