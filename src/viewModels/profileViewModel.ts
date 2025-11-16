"use client";

import { useCallback, useEffect, useState } from "react";
import type { User, Project, JobPosting, Resume, Introduction, ProfileResponse } from "@/models/profile";
import { fetchProfile } from "@/services/profileApi";
import { getAccessTokenRaw } from "@/services/auth/tokenStorage";

type UseProfileOptions = {
  userId?: string | number;
};

export function useProfileViewModel(options: UseProfileOptions = {}) {
  const { userId } = options;

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [introduction, setIntroduction] = useState<Introduction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(
    async (targetId?: string | number) => {
      const resolvedId = targetId ?? deriveUserIdFromToken();
      if (!resolvedId) {
        setError("사용자 ID가 필요합니다.");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProfile(resolvedId);
        setUser(adaptUser(data));
        setProjects(adaptProjects(data));
        setJobPostings(adaptJobPostings(data));
        setResumes(adaptResumes(data));
        setIntroduction(adaptIntroduction(data));
      } catch (err: any) {
        console.error("[useProfileViewModel] loadProfile error", err);
        setError(err?.message ?? "프로필을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadProfile(userId);
  }, [userId, loadProfile]);

  return {
    user,
    projects,
    jobPostings,
    resumes,
    introduction,
    isLoading,
    error,
    refetch: () => loadProfile(userId),
  };
}

function adaptUser(raw: ProfileResponse | undefined): User {
  if (!raw) {
    return {
      name: "Unknown",
      tags: [],
      university: "",
      location: "",
      website: "",
      followers: 0,
      following: 0,
      avatarUrl: "",
    };
  }
  return {
    id: raw.id,
    name: raw.name ?? "Unknown",
    tags: raw.positions ?? [],
    university: raw.from ?? "",
    location: raw.in ?? "",
    website: raw.website ?? "",
    followers: raw.followerCount ?? 0,
    following: raw.followingCount ?? 0,
    avatarUrl: raw.profileImageUrl ?? "",
    isFollowing: raw.isFollowing,
  };
}

function adaptProjects(raw: ProfileResponse): Project[] {
  return (raw.myProjects ?? []).map((p: any) => ({
    name: p?.title ?? p?.name ?? "Untitled project",
    description: p?.description ?? "",
    imageUrl: p?.thumbnailUrl ?? "",
  }));
}

function adaptJobPostings(raw: ProfileResponse): JobPosting[] {
  return (raw.jobPosts ?? []).map((job: any) => {
    const normalizedStatus = String(job?.status ?? "OPEN").toUpperCase();
    const status: JobPosting["status"] = normalizedStatus === "CLOSED" ? "Closed" : "OPEN";
    const location = job?.location ?? raw.in ?? "";
    const skills = parseSkills(job?.requiredSkills);
    const detailParts = [
      ...skills,
      location,
      job?.deadline ? `~${job.deadline}` : null,
      job?.payment ? `${job.payment.toLocaleString()} KRW` : null,
      job?.applicantCount != null ? `${job.applicantCount} applications` : null,
    ].filter(Boolean);
    return {
      id: job?.id,
      name: job?.title ?? "Untitled job",
      status,
      details: detailParts.join(" | "),
      applicantCount: job?.applicantCount ?? undefined,
    };
  });
}

function adaptResumes(raw: ProfileResponse): Resume[] {
  return (raw.resumes ?? []).map((r: any) => ({
    id: Number(r?.id ?? 0),
    title: r?.title ?? r?.name ?? "Resume",
    name: r?.name ?? "",
    introduction: r?.introduction ?? "",
    desiredPosition: r?.desiredPosition ?? "",
    skills: parseSkills(r?.skills),
    careerLevel: r?.careerLevel ?? "",
    portfolioUrl: r?.portfolioUrl ?? "",
    updatedAt: r?.updatedAt ?? r?.lastUpdate ?? "",
    createdAt: r?.createdAt ?? "",
  }));
}

function adaptIntroduction(raw: ProfileResponse): Introduction | null {
  if (!raw.introductionHeadline && !raw.introductionContent) return null;
  return {
    title: raw.introductionHeadline ?? "",
    body: raw.introductionContent ?? "",
  };
}

function deriveUserIdFromToken(): string | number | undefined {
  if (typeof window === "undefined") return undefined;
  const token = getAccessTokenRaw();
  if (!token || !token.includes(".")) return undefined;
  try {
    const payload = decodeJwtPayload(token);
    return payload?.userId ?? payload?.sub ?? payload?.id;
  } catch {
    return undefined;
  }
}

function decodeJwtPayload(token: string): any | undefined {
  const [, payload] = token.split(".");
  if (!payload) return undefined;
  let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) base64 += "=".repeat(4 - pad);
  const json = atob(base64);
  return JSON.parse(json);
}

function parseSkills(input?: string[] | string): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore
  }
  return [input];
}
