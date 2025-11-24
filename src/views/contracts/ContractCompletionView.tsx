'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchJobPostDetail } from '@/services/jobApi';
import { loadChainContract } from '@/services/contractChainApi';

interface SignatureInfo {
  role: 'employer' | 'applicant';
  name: string;
  timestamp?: string;
  completed: boolean;
}

export function ContractCompletionView() {
  const router = useRouter();
  const params = useSearchParams();
  const postId = params?.get('postId');
  const contractAddress = params?.get('contract');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('계약');
  const [payment, setPayment] = useState<string>('-');
  const [deadline, setDeadline] = useState<string>('-');

  const [signatures, setSignatures] = useState<SignatureInfo[]>([
    { role: 'applicant', name: '홍길동 (근로자)', completed: false },
    { role: 'employer', name: '테크스타트업 (대표이사 김대표)', completed: false },
  ]);
  const [chainInfo, setChainInfo] = useState<any>(null);
  const [chainError, setChainError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    const numeric = Number(postId);
    if (Number.isNaN(numeric)) {
      setError('잘못된 공고 ID입니다.');
      return;
    }
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const detail = await fetchJobPostDetail(numeric);
        setJobTitle(detail.title);
        setPayment(detail.payment ? `${detail.payment.toLocaleString()} KRW` : '협의');
        setDeadline(detail.deadline ?? '-');
      } catch (err: any) {
        setError(err?.message ?? '계약 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  const signatureStatus = useMemo(() => {
    const pending = signatures.filter((sig) => !sig.completed);
    const waitingApplicant = pending.some((sig) => sig.role === 'applicant');
    const waitingEmployer = pending.some((sig) => sig.role === 'employer');
    if (pending.length === 0) {
      return {
        headline: `${jobTitle} 계약이 완료되었습니다!`,
        heroTitle: '🎉 계약이 완료되었습니다!',
        heroDescription: '모든 계약 절차가 성공적으로 완료되었습니다. 곧 담당자가 연락드릴 예정입니다.',
        badgeText: '계약 완료',
        badgeClass: 'bg-emerald-500/30 text-emerald-200',
        iconBg: 'bg-emerald-500',
        icon: '✔',
      };
    }

    const waitingRole = waitingApplicant ? 'applicant' : waitingEmployer ? 'employer' : pending[0]?.role ?? 'employer';
    const waitingLabel = waitingRole === 'applicant' ? '구직자' : '구인자';
    return {
      headline: `${jobTitle} 계약이 진행 중입니다.`,
      heroTitle: `${waitingLabel} 서명을 기다리고 있습니다.`,
      heroDescription:
        waitingRole === 'applicant'
          ? '구직자 서명이 완료되면 구인자에게 알림이 전송됩니다.'
          : '구인자 최종 서명이 완료되면 계약이 확정됩니다.',
      badgeText: `${waitingLabel} 서명 대기`,
      badgeClass: 'bg-amber-500/20 text-amber-200',
      iconBg: 'bg-amber-500',
      icon: '⏳',
    };
  }, [jobTitle, signatures]);

  useEffect(() => {
    if (!contractAddress) return;
    (async () => {
      try {
        setChainError(null);
        const data = await loadChainContract(contractAddress);
        setChainInfo(data);
        setSignatures((prev) =>
          prev.map((sig) => {
            const key = sig.role === 'employer' ? 'employer' : 'employee';
            const signed =
              data?.[`${key}Signed`] ??
              data?.signatures?.[key]?.signed ??
              data?.signatures?.[key]?.completed ??
              sig.completed;
            const tsRaw =
              data?.[`${key}SignedAt`] ??
              data?.signatures?.[key]?.timestamp ??
              data?.signatures?.[key]?.signedAt;
            const ts =
              typeof tsRaw === 'number'
                ? new Date(tsRaw * 1000).toLocaleString()
                : typeof tsRaw === 'string'
                  ? tsRaw
                  : sig.timestamp;
            return { ...sig, completed: Boolean(signed), timestamp: ts || sig.timestamp };
          })
        );
      } catch (err: any) {
        setChainError(err?.message ?? '온체인 계약 정보를 불러오지 못했습니다.');
      }
    })();
  }, [contractAddress]);

  const { headline, heroTitle, heroDescription, badgeText, badgeClass, iconBg, icon } = signatureStatus;

  return (
    <div className="min-h-screen bg-background text-white px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 md:flex-row">
        <aside className="w-full rounded-3xl bg-white/5 p-6 md:w-64">
          <h2 className="text-lg font-semibold">Process</h2>
          <ol className="mt-6 space-y-5 text-sm">
            <li className="flex items-center gap-3 text-white/60">
              <span className="h-3 w-3 rounded-full border border-white/50" /> 계약 진행
            </li>
            <li className="flex items-center gap-3 text-white/60">
              <span className="h-3 w-3 rounded-full border border-white/50" /> 계약서 검토
            </li>
            <li className="flex items-center gap-3 text-emerald-300">
              <span className="h-3 w-3 rounded-full bg-emerald-300" /> 계약 완료
            </li>
          </ol>
          <button className="mt-8 w-full rounded-full bg-white/90 py-2 text-sm font-semibold text-background">
            계약 취소
          </button>
        </aside>

        <main className="flex-1 space-y-6 rounded-3xl bg-white/5 p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${iconBg}`}>{icon}</div>
            <h1 className="text-2xl font-semibold">{heroTitle}</h1>
            <p className="text-sm text-white/70">{heroDescription}</p>
          </div>

          {loading && (
            <div className="rounded-3xl bg-white/5 p-6 text-center text-white/70">계약서를 불러오는 중…</div>
          )}
          {error && (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
          )}
          {chainError && (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {chainError}
            </div>
          )}

          <section className="rounded-3xl border border-white/20 bg-background-card p-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-white/70">근로계약서</p>
                <p className="text-lg font-semibold">{headline}</p>
              </div>
              <span className={`rounded-full px-4 py-1 text-sm font-semibold ${badgeClass}`}>{badgeText}</span>
            </header>

            <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <dt className="text-white/60">포지션</dt>
                <dd className="text-white font-semibold">{jobTitle}</dd>
              </div>
              <div>
                <dt className="text-white/60">payment</dt>
                <dd className="text-white font-semibold">{payment}</dd>
              </div>
              <div>
                <dt className="text-white/60">근무 시작일</dt>
                <dd className="text-white font-semibold">2024년 2월 1일</dd>
              </div>
              <div>
                <dt className="text-white/60">계약 체결일</dt>
                <dd className="text-white font-semibold">{deadline || '-'}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <p className="text-sm font-semibold text-white/80">전자서명 정보</p>
              <div className="mt-3 space-y-3">
                {signatures.map((sig) => (
                  <div key={sig.role} className="flex items-center justify-between rounded-3xl bg-background-card p-4 text-sm">
                    <div>
                      <p className="font-semibold">{sig.name}</p>
                      <p className="text-xs text-white/60">서명일자: {sig.timestamp ?? '대기중'}</p>
                    </div>
                    <span className={`rounded-full px-4 py-1 text-xs font-semibold ${sig.completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/70'}`}>
                      {sig.completed ? '서명 완료' : '대기중'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/20 bg-background-card p-6">
            <h2 className="text-lg font-semibold">다음 단계</h2>
            <ol className="mt-4 space-y-3 text-sm text-white/80">
              <li>입사 준비 안내 – 담당자가 연락하여 향후 일정을 안내합니다.</li>
              <li>첫 출근일 확정 – 필요한 서류와 세부 일정은 이메일로 발송될 수 있습니다.</li>
              <li>온보딩 프로세스 – 첫 근무 시 회사 소개, 보안 교육, 조직 투어 등이 진행됩니다.</li>
            </ol>
          </section>

          <div className="flex flex-wrap justify-center gap-3">
            <button className="rounded-full border border-white/20 px-6 py-2 text-sm text-white hover:bg-white/10">
              계약서 다운로드
            </button>
            <button
              onClick={() => router.push('/')}
              className="rounded-full bg-background px-6 py-2 text-sm font-semibold text-white"
            >
              홈으로 가기
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
