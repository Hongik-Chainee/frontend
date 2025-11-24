'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchJobPostDetail } from '@/services/jobApi';
import { getAccessTokenRaw } from '@/services/auth/tokenStorage';

type ContractRole = 'employer' | 'applicant';

type JobSummary = {
  id: number;
  title: string;
  deadline?: string | null;
  payment?: number | null;
  authorId?: number | null;
};

function getUserIdFromToken(): number | null {
  if (typeof window === 'undefined') return null;
  const token = getAccessTokenRaw();
  if (!token || !token.includes('.')) return null;
  try {
    const [, payload] = token.split('.');
    let b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad) b64 += '='.repeat(4 - pad);
    const json = atob(b64);
    const parsed = JSON.parse(json);
    const raw = parsed?.userId ?? parsed?.sub ?? parsed?.id;
    return raw != null ? Number(raw) : null;
  } catch {
    return null;
  }
}

export function ContractProgressView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postIdParam = searchParams?.get('postId');
  const roleParam = searchParams?.get('role');
  const roleOverride: ContractRole | null =
    roleParam === 'employer' || roleParam === 'applicant' ? (roleParam as ContractRole) : null;
  const applicationIdParam = searchParams?.get('applicationId');

  const [job, setJob] = useState<JobSummary | null>(null);
  const [role, setRole] = useState<ContractRole>(roleOverride ?? 'applicant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postIdParam) {
      setError('공고 ID가 필요합니다.');
      return;
    }
    const id = Number(postIdParam);
    if (Number.isNaN(id)) {
      setError('잘못된 공고 ID입니다.');
      return;
    }

    setLoading(true);
    setError(null);
    (async () => {
      try {
        const detail = await fetchJobPostDetail(id);
        setJob({
          id,
          title: detail.title,
          deadline: detail.deadline ?? null,
          payment: detail.payment ?? null,
          authorId: detail.author?.id ?? null,
        });
        const currentUserId = getUserIdFromToken();
        if (roleOverride) {
          setRole(roleOverride);
        } else if (currentUserId && detail.author?.id && currentUserId === detail.author.id) {
          setRole('employer');
        } else {
          setRole('applicant');
        }
      } catch (err: any) {
        setError(err?.message ?? '공고 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [postIdParam, roleOverride]);

  const infoItems = useMemo(() => {
    return [
      { label: '포지션', value: job?.title ?? '-' },
      { label: '마감일', value: job?.deadline ?? '-' },
      { label: '급여', value: job?.payment ? `${job.payment.toLocaleString()} KRW` : '협의' },
      { label: '시작 예정일', value: '-' },
      { label: '마감 예정일', value: '-' },
    ];
  }, [job]);

  const nowLabel = useMemo(() => new Date().toLocaleString(), []);

  const banner = role === 'applicant' && (
    <div className="rounded-3xl border border-emerald-300/40 bg-emerald-400/10 p-6">
      <p className="text-lg font-semibold text-emerald-300">✨ 지원이 수락되었습니다!</p>
      <p className="mt-2 text-sm text-white/80">테크스타트업에서 귀하의 지원을 수락했습니다.</p>
      <p className="mt-1 text-xs text-white/60">{nowLabel}</p>
    </div>
  );

  const goToReview = () => {
    if (!postIdParam) return;
    const qs = new URLSearchParams({ postId: postIdParam });
    if (roleParam) qs.set('role', roleParam);
    if (applicationIdParam) qs.set('applicationId', applicationIdParam);
    router.push(`/contracts/review?${qs.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background text-white px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 md:flex-row">
        <aside className="w-full rounded-3xl bg-white/5 p-6 md:w-64">
          <h2 className="text-lg font-semibold">Process</h2>
          <ol className="mt-6 space-y-5 text-sm">
            <li className="flex items-center gap-3 text-emerald-300">
              <span className="h-3 w-3 rounded-full bg-emerald-300" /> 계약 진행
            </li>
            <li className="flex items-center gap-3 text-white/60">
              <span className="h-3 w-3 rounded-full border border-white/50" /> 계약서 검토
            </li>
            <li className="flex items-center gap-3 text-white/40">
              <span className="h-3 w-3 rounded-full border border-white/30" /> 계약 완료
            </li>
          </ol>
          <button className="mt-8 w-full rounded-full bg-white/90 py-2 text-sm font-semibold text-background">
            계약 취소
          </button>
        </aside>

        <main className="flex-1 space-y-6 rounded-3xl bg-white/5 p-8">
          <h1 className="text-2xl font-semibold text-center">계약 진행</h1>

          {loading && (
            <div className="rounded-3xl bg-white/5 p-6 text-center text-white/70">공고 정보를 불러오는 중…</div>
          )}
          {error && (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && banner}

          <section className="rounded-3xl border border-white/20 bg-background-card p-6">
            <h2 className="text-lg font-semibold">포지션 상세 정보</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-white/10 pb-2">
                  <dt className="text-white/70">{item.label}</dt>
                  <dd className="font-semibold">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="flex justify-center">
            <button
              onClick={goToReview}
              disabled={!postIdParam}
              className="rounded-full bg-secondary hover:bg-secondary-light px-8 py-3 font-semibold text-white disabled:opacity-50 transition-colors"
            >
              다음단계로 넘어가기 →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
