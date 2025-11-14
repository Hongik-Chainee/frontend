 "use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JobPost, JobSort } from "@/models/job";
import type { Project, Person } from "@/models/project";
import { fetchJobPosts } from "@/services/jobApi";

type FetchMode = "replace" | "append";

const peopleMock: Person[] = [
  {
    id: "u1",
    name: "Timothy Smith",
    titleTags: ["Frontend", "Illustrator"],
    skills: ["Vue.js", "JavaScript", "CSS", "HTML"],
    location: "Seoul, South Korea",
  },
  {
    id: "u2",
    name: "Amy. H. Miller",
    titleTags: ["Mobile UX Designer", "Illustrator"],
    skills: ["Vue.js", "JavaScript", "CSS", "HTML"],
    location: "Seoul, South Korea",
  },
  {
    id: "u3",
    name: "John Martin",
    titleTags: ["Frontend", "Illustrator"],
    skills: ["Vue.js", "JavaScript", "CSS", "HTML"],
    location: "Seoul, South Korea",
  },
];

function mapJobToProject(job: JobPost): Project {
  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  };
  const formatPayment = (payment?: number | null) => {
    if (!payment) return "Fee negotiable";
    return `${payment.toLocaleString()} KRW`;
  };

  return {
    id: String(job.id),
    title: job.title,
    company: job.author?.name ?? "",
    description: job.description ?? "",
    tags: [
      job.requiredSkills?.[0] ?? "General",
      job.author?.in || job.author?.from || "Remote",
      job.payment ? formatPayment(job.payment) : "Fee negotiable",
    ].filter(Boolean),
    author: job.author?.name ?? "Anonymous",
    postedAt: job.createdAt ? formatDate(job.createdAt) : "-",
    stats: {
      views: job.applicantCount ?? 0,
      applications: job.applicantCount ?? 0,
    },
  };
}

export function useProjectsViewModel() {
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [people] = useState<Person[]>(peopleMock);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(9);
  const [sort, setSort] = useState<JobSort>("RECENT");
  const [totalPages, setTotalPages] = useState(0);

  const nextModeRef = useRef<FetchMode>("replace");

  const fetchProjects = useCallback(
    async (mode: FetchMode = "replace") => {
      mode === "append" ? setLoadingMore(true) : setLoading(true);
      setError(null);
      try {
        const data = await fetchJobPosts({ page, size, sort });
        setTotalPages(data.totalPages);
        const mapped = data.posts.map(mapJobToProject);
        setProjects((prev) => (mode === "append" ? [...prev, ...mapped] : mapped));
      } catch (err: any) {
        setError(err?.message ?? "프로젝트를 불러오지 못했어요.");
      } finally {
        mode === "append" ? setLoadingMore(false) : setLoading(false);
      }
    },
    [page, size, sort]
  );

  useEffect(() => {
    fetchProjects(nextModeRef.current);
    nextModeRef.current = "replace";
  }, [fetchProjects]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.author.toLowerCase().includes(q)
    );
  }, [projects, query]);

  const canLoadMore = page + 1 < totalPages;

  const loadMore = () => {
    if (!canLoadMore || loadingMore) return;
    nextModeRef.current = "append";
    setPage((prev) => prev + 1);
  };

  const changeSort = (value: JobSort) => {
    if (value === sort) return;
    nextModeRef.current = "replace";
    setPage(0);
    setSort(value);
  };

  return {
    query,
    setQuery,
    projects,
    filteredProjects,
    people,
    loading,
    loadingMore,
    error,
    sort,
    setSort: changeSort,
    loadMore,
    canLoadMore,
  };
}
