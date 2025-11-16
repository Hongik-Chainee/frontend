"use client";

import Link from "next/link";
import { BriefcaseIcon } from "@heroicons/react/24/outline";
import type { Project } from "@/models/project";
import Badge from "./Badge";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-2xl border border-[#2A2F3B] bg-[#171A22] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A2F3B]">
          <BriefcaseIcon className="h-5 w-5 text-[#9AA4B2]" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold leading-tight text-white">{project.title}</h3>
          <p className="mt-2 line-clamp-3 text-sm text-[#9AA4B2]">{project.description}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {project.tags.map((t, i) => (
              <Badge key={i}>{t}</Badge>
            ))}
          </div>

          <div className="mt-4 h-px bg-[#2A2F3B]" />

          <div className="mt-3 flex items-center justify-between text-xs text-[#9AA4B2]">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[#2A2F3B]" />
              <span>
                From <span className="text-white">{project.author}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>📅 {project.postedAt}</span>
              <span>👁 {project.stats.views}</span>
              <span>📨 {project.stats.applications} applications</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
