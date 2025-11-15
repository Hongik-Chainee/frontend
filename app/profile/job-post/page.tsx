import type { Metadata } from "next";
import { JobPostForm } from "@/views/profile/JobPostForm";

export const metadata: Metadata = {
  title: "Post a job | Chainee",
};

export default function JobPostPage() {
  return (
    <div className="min-h-screen bg-background text-white">
      <JobPostForm />
    </div>
  );
}
