'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { fetchJobApplicants, type Applicant } from '@/services/jobApplicantsApi';

type Props = {
  postId: string;
};

export function JobApplicantsView({ postId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [total, setTotal] = useState(0);
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJobApplicants(postId);
      setTitle(data.postTitle);
      setTotal(data.totalApplicants);
      setApplicants(data.applicants);
    } catch (err: any) {
      setError(err?.message ?? '지원자를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-secondary text-white px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>

        <div>
          <p className="text-sm text-white/50">Join our project:</p>
          <h1 className="text-2xl font-semibold md:text-3xl">{title || 'Loading…'}</h1>
        </div>

        {error && (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
            <button
              type="button"
              onClick={load}
              className="mt-3 rounded-full bg-red-500/70 px-3 py-1 text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="animate-pulse rounded-3xl bg-white/5 p-6">
                <div className="h-4 w-1/3 rounded bg-white/10" />
                <div className="mt-3 h-3 w-1/2 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <header className="grid gap-4 md:grid-cols-3">
              <Stat label="총 지원자" value={`${total}명`} />
              <Stat label="신규 지원" value={`${applicants.length}명`} subtle="(최근 데이터)" />
              <Stat label="확인한 지원자" value="-" subtle="추후 연결" />
            </header>

            <div className="mt-6 space-y-4">
              {applicants.length === 0 ? (
                <div className="rounded-3xl bg-white/5 p-6 text-center text-sm text-white/60">
                  아직 지원자가 없습니다.
                </div>
              ) : (
                applicants.map((applicant) => (
                  <ApplicantCard key={applicant.applicationId} applicant={applicant} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, subtle }: { label: string; value: string; subtle?: string }) {
  return (
    <div className="rounded-2xl bg-[#1b1f2a] p-4 text-center">
      <p className="text-xs uppercase text-white/50">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      {subtle && <p className="text-xs text-white/40">{subtle}</p>}
    </div>
  );
}

function ApplicantCard({ applicant }: { applicant: Applicant }) {
  const appliedDate = applicant.appliedAt
    ? new Date(applicant.appliedAt).toLocaleDateString()
    : '지원일 미상';
  return (
    <div className="rounded-3xl bg-[#1b1f2a] p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/10" />
          <div>
            <p className="text-lg font-semibold">{applicant.name}</p>
            <p className="text-sm text-white/70">{appliedDate} 지원</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/80">
              {applicant.positions.slice(0, 4).map((pos, idx) => (
                <span key={idx} className="rounded-full bg-white/10 px-3 py-1">
                  {pos}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">
            Resume
          </button>
          <button className="rounded-full bg-primary/20 px-4 py-2 text-sm text-primary hover:bg-primary/30">
            Message
          </button>
          <button className="rounded-full bg-emerald-500/20 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-500/30">
            Contract
          </button>
        </div>
      </div>
    </div>
  );
}
