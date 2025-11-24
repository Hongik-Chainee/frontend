'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { fetchJobPostDetail } from '@/services/jobApi';
import { createChainContract } from '@/services/contractChainApi';
import { sendContractRequestNotification } from '@/services/jobContractNotify';

type ChecklistItem = {
  id: string;
  label: string;
  description: string;
};

const CHECKLIST: ChecklistItem[] = [
  {
    id: 'condition',
    label: '근로 조건 및 임의 확인',
    description: '직무, 연차, 근무지, 급여 등 기본 근로조건을 확인했습니다.',
  },
  {
    id: 'extra',
    label: '복리후생 및 추가 규정 확인',
    description: '4대 보험, 연차, 근무지 지원 등 복리후생 내용을 확인했습니다.',
  },
  {
    id: 'privacy',
    label: '개인정보 처리 방침 동의',
    description: '개인정보 수집, 이용, 제공에 관한 사항에 동의합니다.',
  },
  {
    id: 'security',
    label: '보안 서약 동의',
    description: '회사 기밀정보 보호와 보안 규정 준수에 동의합니다.',
  },
  {
    id: 'overall',
    label: '전체 계약 내용 동의',
    description: '계약서 내용을 모두 검토하고 이해했으며, 전체 내용에 동의합니다.',
  },
];

export function ContractReviewView() {
  const router = useRouter();
  const params = useSearchParams();
  const postId = params?.get('postId');
  const roleParam = params?.get('role');
  const applicationId = params?.get('applicationId');
  const initialContract = params?.get('contract') ?? null;
  const initialEscrow = params?.get('escrow') ?? null;
  const applicantSignedParam = params?.get('applicantSigned') === 'true';

  const { publicKey, signTransaction } = useWallet();

  const [jobTitle, setJobTitle] = useState('계약서 검토 및 서명');
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);
  const [contractSubmitting, setContractSubmitting] = useState(false);
  const [agreements, setAgreements] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CHECKLIST.forEach((item) => {
      initial[item.id] = item.id === 'condition' || item.id === 'extra';
    });
    return initial;
  });

  const [employeeWallet, setEmployeeWallet] = useState('');
  const [contractAddress, setContractAddress] = useState<string | null>(initialContract);
  const [escrowAddress, setEscrowAddress] = useState<string | null>(initialEscrow);
  const [applicantSigned, setApplicantSigned] = useState<boolean>(applicantSignedParam);
  const [applicantSignedAt, setApplicantSignedAt] = useState<string | null>(null);
  const [employerSigned, setEmployerSigned] = useState<boolean>(Boolean(initialContract));
  const [employerSignedAt, setEmployerSignedAt] = useState<string | null>(null);

  const isEmployer = roleParam === 'employer';

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
        setJobTitle(`${detail.title} 계약서 검토`);
        setPaymentAmount(detail.payment ?? null);
      } catch (err: any) {
        setError(err?.message ?? '계약서를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  const allChecked = useMemo(() => Object.values(agreements).every(Boolean), [agreements]);

  const toggle = (id: string) => {
    setAgreements((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEmployerCreateContract = async () => {
    if (!isEmployer) return;
    if (!publicKey) {
      setContractError('지갑을 연결해 주세요.');
      return;
    }
    if (!signTransaction) {
      setContractError('선택한 지갑은 트랜잭션 서명을 지원하지 않습니다.');
      return;
    }
    if (!employeeWallet.trim()) {
      setContractError('지원자 지갑 주소를 입력해 주세요.');
      return;
    }
    if (!paymentAmount || paymentAmount <= 0) {
      setContractError('급여 정보를 불러올 수 없어 계약을 생성할 수 없습니다.');
      return;
    }

    setContractError(null);
    setContractSubmitting(true);

    try {
      const startDate = Math.floor(Date.now() / 1000);
      const dueDate = startDate + 3 * 24 * 60 * 60;
      const response = await createChainContract({
        employer: publicKey.toBase58(),
        employee: employeeWallet.trim(),
        salary: String(paymentAmount),
        startDate,
        dueDate,
      });

      const txPayload = response?.transaction ?? {
        chain: response?.chain ?? 'solana',
        network: response?.network ?? 'devnet',
        tx: response?.tx ?? response?.txB64,
      };
      const txBase64 = txPayload?.tx;
      if (!txBase64) {
        throw new Error('CONTRACT_TX_MISSING');
      }

      const newContract =
        response?.contract ?? response?.contractAddress ?? contractAddress ?? null;
      const newEscrow = response?.escrow ?? response?.escrowAddress ?? escrowAddress ?? null;

      const contractLink =
        postId && applicationId
          ? (() => {
            const qs = new URLSearchParams({
              postId,
              role: 'applicant',
            });
            qs.set('applicationId', String(applicationId));
            if (newContract) qs.set('contract', newContract);
            if (newEscrow) qs.set('escrow', newEscrow);
            qs.set('applicantSigned', 'false');
            return `/contracts/review?${qs.toString()}`;
          })()
          : null;

      if (applicationId && postId) {
        await sendContractRequestNotification(
          applicationId,
          txPayload,
          contractLink ?? undefined,
          {
            postId,
            contract: newContract || undefined,
            escrow: newEscrow || undefined,
            jobTitle,
          }
        );
      } else {
        console.warn('[ContractReview] applicationId or postId is missing; notification skipped');
      }

      setContractAddress(newContract);
      setEscrowAddress(newEscrow);
    } catch (err: any) {
      setContractError(err?.message ?? '계약 생성에 실패했습니다.');
    } finally {
      setContractSubmitting(false);
    }
  };

  const handleApplicantSign = async () => {
    if (isEmployer) return;
    if (!publicKey) {
      setContractError('지갑을 연결해 주세요.');
      return;
    }
    if (!signTransaction) {
      setContractError('선택한 지갑은 트랜잭션 서명을 지원하지 않습니다.');
      return;
    }

    setContractError(null);
    setContractSubmitting(true);

    try {
      // TODO: 지원자 서명 로직 구현
      // 서버에서 받은 트랜잭션에 서명하고 다시 고용주에게 전송
      setApplicantSigned(true);
      setApplicantSignedAt(new Date().toLocaleString());
    } catch (err: any) {
      setContractError(err?.message ?? '서명에 실패했습니다.');
    } finally {
      setContractSubmitting(false);
    }
  };

  const handleEmployerFinalSign = async () => {
    if (!isEmployer) return;
    if (!applicantSigned) {
      setContractError('지원자의 서명이 완료되어야 합니다.');
      return;
    }
    if (!publicKey) {
      setContractError('지갑을 연결해 주세요.');
      return;
    }
    if (!signTransaction) {
      setContractError('선택한 지갑은 트랜잭션 서명을 지원하지 않습니다.');
      return;
    }

    setContractError(null);
    setContractSubmitting(true);

    try {
      // TODO: 고용주 최종 서명 로직 구현
      setEmployerSigned(true);
      setEmployerSignedAt(new Date().toLocaleString());
    } catch (err: any) {
      setContractError(err?.message ?? '서명에 실패했습니다.');
    } finally {
      setContractSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!postId || !contractAddress) return;
    const qs = new URLSearchParams({ postId, contract: contractAddress });
    if (escrowAddress) qs.set('escrow', escrowAddress);
    router.push(`/contracts/complete?${qs.toString()}`);
  };

  const salaryDisplay = paymentAmount ? `${paymentAmount.toLocaleString()} KRW` : '협의';
  const disableNext = !postId || !contractAddress || !allChecked || contractSubmitting || !applicantSigned || !employerSigned;

  return (
    <div className="min-h-screen bg-background text-white px-4 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 md:flex-row">
        <aside className="w-full rounded-3xl bg-white/5 p-6 md:w-64">
          <h2 className="text-lg font-semibold">Process</h2>
          <ol className="mt-6 space-y-5 text-sm">
            <li className="flex items-center gap-3 text-white/60">
              <span className="h-3 w-3 rounded-full border border-white/50" /> 계약 진행
            </li>
            <li className="flex items-center gap-3 text-emerald-300">
              <span className="h-3 w-3 rounded-full bg-emerald-300" /> 계약서 검토
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
          <h1 className="text-2xl font-semibold text-center">{jobTitle}</h1>

          {loading && (
            <div className="rounded-3xl bg-white/5 p-6 text-center text-white/70">계약서를 불러오는 중…</div>
          )}
          {error && (
            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <section className="rounded-3xl border border-white/20 bg-background-card p-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-white/70">근로계약서</p>
                <p className="text-lg font-semibold">테크스타트업</p>
              </div>
              <div className="flex gap-2 text-sm">
                <button className="rounded-full border border-white/20 px-4 py-2 text-white/80 hover:bg-white/10">
                  다운로드
                </button>
                <button className="rounded-full border border-white/20 px-4 py-2 text-white/80 hover:bg-white/10">
                  인쇄
                </button>
              </div>
            </header>

            <div className="mt-4 rounded-3xl bg-background p-4 text-sm leading-6 text-white/80">
              <p>
                제1조 (계약의 목적)
                <br />본 계약은 테크스타트업(이하 "회사")과 홍길동(이하 "근로자") 간의 근로관계를 명확히 하고, 상호 권리와
                의무를 정함을 목적으로 한다.
              </p>
              <p className="mt-4">
                제2조 (근로조건)
                <br />1. 직무: 프론트엔드 개발자
                <br />2. 근무지: 서울특별시 강남구 테헤란로 123
                <br />3. 근무시간: 오전 9시 ~ 오후 6시 (주 40시간)
                <br />4. 휴게시간: 오후 12시 ~ 오후 1시 (1시간)
              </p>
              <p className="mt-4">
                제3조 (급여)
                <br />1. 연봉: {salaryDisplay}
                <br />2. 지급일: 매월 25일
                <br />3. 성과급: 분기별 20% (성과에 따라 조정 가능)
              </p>
              <p className="mt-4 text-center text-xs text-white/50">1 / 5</p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/20 bg-background-card p-6">
            <h2 className="text-lg font-semibold">계약 내용 확인</h2>
            <p className="mt-2 text-sm text-white/70">아래 항목들을 확인하고 체크해 주세요. 모든 항목에 동의해야 서명이 가능합니다.</p>

            <div className="mt-4 space-y-3">
              {CHECKLIST.map((item) => (
                <label
                  key={item.id}
                  className="flex cursor-pointer items-start gap-3 rounded-3xl bg-background p-4"
                >
                  <input
                    type="checkbox"
                    checked={agreements[item.id]}
                    onChange={() => toggle(item.id)}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span>
                    <span className="font-semibold">{item.label}</span>
                    <br />
                    <span className="text-sm text-white/70">{item.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/20 bg-background-card p-6">
            <h2 className="text-lg font-semibold">전자 서명 진행</h2>
            <p className="mt-2 text-sm text-white/70">서명 순서: ① 구인자가 계약 생성 → ② 구직자 서명 → ③ 구인자 최종 서명</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {/* 1단계: 구인자 계약 생성 */}
              <SignatureCard
                title="① 구인자 계약 생성"
                description="구인자가 계약서를 생성하고 구직자에게 전송합니다."
                signed={Boolean(contractAddress)}
                timestamp={contractAddress ? '생성 완료' : undefined}
              >
                {isEmployer && !contractAddress && (
                  <div className="space-y-3">
                    <input
                      value={employeeWallet}
                      onChange={(e) => setEmployeeWallet(e.target.value)}
                      placeholder="지원자 지갑 주소를 입력하세요"
                      className="w-full rounded-lg bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-white/60">
                      지원자의 Solana 지갑 주소를 입력하고 계약을 생성해 주세요.
                    </p>
                    <button
                      onClick={handleEmployerCreateContract}
                      disabled={contractSubmitting}
                      className="w-full rounded-full bg-background-dark px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {contractSubmitting ? '생성 중…' : '계약 생성하기'}
                    </button>
                  </div>
                )}
                {contractAddress && (
                  <p className="text-sm text-emerald-300">
                    계약 생성 완료 · 지원자에게 알림 전송됨
                  </p>
                )}
              </SignatureCard>

              {/* 2단계: 구직자 서명 */}
              <SignatureCard
                title="② 구직자 서명"
                description="구직자가 계약서를 검토하고 서명합니다."
                signed={applicantSigned}
                timestamp={applicantSignedAt}
              >
                {!isEmployer && contractAddress && !applicantSigned && (
                  <div className="space-y-3">
                    {!publicKey ? (
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                        <p className="text-xs text-amber-200 font-semibold">⚠️ 지갑 연결 필요</p>
                        <p className="text-xs text-amber-100/80 mt-1">
                          계약서에 서명하려면 먼저 Solana 지갑을 연결해 주세요.
                          상단의 "지갑 연결" 버튼을 클릭하세요.
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-white/60">
                          계약서를 검토하고 동의하시면 서명해 주세요.
                        </p>
                        <button
                          onClick={handleApplicantSign}
                          disabled={contractSubmitting || !allChecked}
                          className="w-full rounded-full bg-background-dark px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {contractSubmitting ? '서명 중…' : '서명하기'}
                        </button>
                        {!allChecked && (
                          <p className="text-xs text-amber-200">
                            ⚠️ 모든 체크리스트 항목에 동의해야 서명할 수 있습니다.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
                {!contractAddress && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                    <p className="text-xs text-amber-200 font-semibold">⚠️ 계약 정보를 불러올 수 없습니다</p>
                    <p className="text-xs text-amber-100/80 mt-1">
                      {isEmployer
                        ? '계약을 생성하려면 위의 "계약 생성하기" 버튼을 클릭하세요.'
                        : '계약 정보가 아직 전달되지 않았습니다. 구인자가 계약을 생성했다면 알림의 링크를 다시 확인하거나, 구인자에게 문의해 주세요.'}
                    </p>
                  </div>
                )}
                {contractAddress && !applicantSigned && isEmployer && (
                  <p className="text-sm text-white/70">
                    지원자의 서명을 기다리고 있습니다.
                  </p>
                )}
                {applicantSigned && (
                  <p className="text-sm text-emerald-300">
                    서명 완료 {applicantSignedAt ? `· ${applicantSignedAt}` : ''}
                  </p>
                )}
              </SignatureCard>
            </div>

            {/* 3단계: 구인자 최종 서명 */}
            {applicantSigned && (
              <div className="mt-4">
                <SignatureCard
                  title="③ 구인자 최종 서명"
                  description="구직자의 서명이 완료되었습니다. 구인자가 최종 서명하여 계약을 확정합니다."
                  signed={employerSigned}
                  timestamp={employerSignedAt}
                >
                  {isEmployer && !employerSigned && (
                    <div className="space-y-3">
                      {!publicKey ? (
                        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                          <p className="text-xs text-amber-200 font-semibold">⚠️ 지갑 연결 필요</p>
                          <p className="text-xs text-amber-100/80 mt-1">
                            최종 서명하려면 먼저 Solana 지갑을 연결해 주세요.
                            상단의 "지갑 연결" 버튼을 클릭하세요.
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs text-white/60">
                            지원자의 서명이 완료되었습니다. 최종 서명하여 계약을 확정해 주세요.
                          </p>
                          <button
                            onClick={handleEmployerFinalSign}
                            disabled={contractSubmitting}
                            className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            {contractSubmitting ? '서명 중…' : '최종 서명하기'}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {!isEmployer && !employerSigned && (
                    <p className="text-sm text-white/70">
                      고용주의 최종 서명을 기다리고 있습니다.
                    </p>
                  )}
                  {employerSigned && (
                    <p className="text-sm text-emerald-300">
                      서명 완료 {employerSignedAt ? `· ${employerSignedAt}` : ''}
                    </p>
                  )}
                </SignatureCard>
              </div>
            )}
          </section>

          {contractError && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {contractError}
            </p>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleNext}
              disabled={disableNext}
              className="rounded-full bg-background hover:bg-background-light px-8 py-3 font-semibold text-white disabled:opacity-50 transition-colors"
            >
              다음단계로 넘어가기 →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function SignatureCard({
  title,
  description,
  signed,
  timestamp,
  children,
}: {
  title: string;
  description: string;
  signed: boolean;
  timestamp?: string | null;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-3xl bg-background p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-white/60">{description}</p>
          <p className="text-lg font-semibold text-white">{title}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${signed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/60'
            }`}
        >
          {signed ? '서명 완료' : '서명 대기'}
        </span>
      </div>
      {timestamp && signed && (
        <p className="text-xs text-white/60">서명 시각: {timestamp}</p>
      )}
      {children}
    </div>
  );
}
