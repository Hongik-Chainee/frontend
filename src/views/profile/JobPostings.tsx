import Link from "next/link";
import { JobPosting } from '@/models/profile';

interface JobPostingsProps {
  jobPostings: JobPosting[];
}

export function JobPostings({ jobPostings }: JobPostingsProps) {
  const hasPosts = jobPostings.length > 0;

  return (
    <section className="mt-16">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-purple-400">Job postings</h2>
        <Link
          href="/profile/job-post"
          className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:border-purple-400 hover:bg-purple-500/20"
        >
          + Add job post
        </Link>
      </div>

      {hasPosts ? (
        <>
          <div className="space-y-4">
            {jobPostings.map((job, index) => (
              <div key={job.id ?? index} className="bg-[#222] rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-bold mr-2">{job.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${job.status === 'OPEN' ? 'bg-purple-600' : 'bg-gray-600'}`}>{job.status}</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{job.details}</p>
                </div>
                {job.id ? (
                  <Link
                    href={`/profile/job-post/${job.id}/applicants`}
                    className="bg-purple-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700"
                  >
                    View details
                  </Link>
                ) : (
                  <span className="text-xs text-gray-400">No details</span>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="bg-[#222] px-6 py-2 rounded-lg hover:bg-gray-700">More postings</button>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-white/20 bg-black/20 p-6 text-center text-sm text-white/60">
          You haven&apos;t posted any openings yet.
          <Link href="/profile/job-post" className="ml-2 text-purple-300 hover:text-purple-200 underline">
            Create your first job post
          </Link>
        </div>
      )}
    </section>
  );
}
