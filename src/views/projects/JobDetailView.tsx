'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { JobPost } from '@/models/job';
import type { Resume } from '@/models/profile';
import { fetchJobPostDetail, applyToJobPost } from '@/services/jobApi';
import { fetchMyResumes } from '@/services/resumeApi';

type Props = {
  postId: string;
};

export function JobDetailView({ postId }: Props) {
  const router = useRouter();
  const [post, setPost] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(false);
  const [resumesError, setResumesError] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJobPostDetail(postId);
      setPost(data);
    } catch (err: any) {
      setError(err?.message ?? '공고 정보를 불러오지 못했습니다.');
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  const loadResumes = useCallback(async () => {
    setResumesLoading(true);
    setResumesError(null);
    try {
      const list = await fetchMyResumes();
      setResumes(list);
      setSelectedResumeId((prev) => {
        if (prev) return prev;
        return list.length > 0 ? list[0].id : null;
      });
    } catch (err: any) {
      setResumesError(err?.message ?? '이력서를 불러오지 못했습니다.');
    } finally {
      setResumesLoading(false);
    }
  }, []);

  const openApplyModal = () => {
    setApplyModalOpen(true);
    setApplyError(null);
    setApplySuccess(false);
    if (!resumes.length) {
      loadResumes();
    }
  };

  const closeApplyModal = () => {
    setApplyModalOpen(false);
    setApplyError(null);
    setApplying(false);
  };

  const submitApplication = async () => {
    if (!post) return;
    if (!selectedResumeId) {
      setApplyError('이력서를 선택해 주세요.');
      return;
    }
    setApplying(true);
    setApplyError(null);
    try {
      await applyToJobPost(post.id, selectedResumeId);
      setApplySuccess(true);
    } catch (err: any) {
      setApplyError(err?.message ?? '지원에 실패했습니다.');
    } finally {
      setApplying(false);
    }
  };

  const paymentLabel = useMemo(() => {
    if (!post?.payment) return '협의 후 결정';
    return `${post.payment.toLocaleString()} KRW`;
  }, [post]);

  const deadlineLabel = useMemo(() => formatDate(post?.deadline), [post?.deadline]);
  const postedLabel = useMemo(() => formatDate(post?.createdAt), [post?.createdAt]);
  const durationLabel = useMemo(() => post?.duration || '협의 가능', [post?.duration]);

  const ddayBadge = useMemo(() => {
    if (!post?.deadline) return null;
    const today = new Date();
    const target = new Date(post.deadline);
    if (Number.isNaN(target.getTime())) return null;
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? `D-${diff}` : 'Closed';
  }, [post?.deadline]);

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

        {loading ? (
          <DetailSkeleton />
        ) : error ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
            <p>{error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-4 rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-400"
            >
              Retry
            </button>
          </div>
        ) : post ? (
          <article className="rounded-3xl border border-white/10 bg-[#11121A] p-6 md:p-10">
            <header className="space-y-4">
              <p className="text-sm text-white/50">
                Join our project: <span className="text-white">{post.title}</span>
              </p>
              <h1 className="text-3xl font-semibold md:text-4xl">{post.title}</h1>
              <div className="flex flex-wrap gap-3">
                {ddayBadge && <Chip>{ddayBadge}</Chip>}
                <Chip tone="primary">Active</Chip>
                {post.requiredSkills?.map((skill, idx) => (
                  <Chip key={idx}>{skill}</Chip>
                ))}
              </div>
            </header>

            <section className="mt-8 grid gap-4 rounded-2xl bg-white/5 p-6 text-sm sm:grid-cols-2 md:grid-cols-4">
              <InfoItem label="Compensation" value={paymentLabel} />
              <InfoItem label="Date posted" value={postedLabel} />
              <InfoItem label="Deadline" value={deadlineLabel} />
              <InfoItem label="Duration" value={durationLabel} />
            </section>

            <section className="mt-10 space-y-4 text-sm leading-6 text-white/80">
              <h2 className="text-lg font-semibold text-primary-light">Project Introduction</h2>
              <p className="whitespace-pre-line">
                {post.description?.trim() || '상세 설명이 아직 등록되지 않았습니다.'}
              </p>
            </section>

            <section className="mt-10 flex flex-wrap gap-4">
              <button className="rounded-full bg-white/10 px-6 py-3 text-sm font-medium hover:bg-white/20">
                Contact
              </button>
              <button
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
                onClick={openApplyModal}
              >
                Apply
              </button>
            </section>

            <section className="mt-12 rounded-2xl bg-white/5 p-6 md:p-8">
              <p className="text-sm font-semibold text-primary-light">Posted by</p>
              {post.author ? (
                <AuthorCard author={post.author} />
              ) : (
                <p className="mt-3 text-sm text-white/60">작성자 정보가 없습니다.</p>
              )}
            </section>
          </article>
        ) : null}
      </div>
      {applyModalOpen && post && (
        <ResumeApplyModal
          resumes={resumes}
          loading={resumesLoading}
          error={resumesError}
          selectedId={selectedResumeId}
          onSelect={setSelectedResumeId}
          onClose={closeApplyModal}
          onSubmit={submitApplication}
          submitting={applying}
          submitError={applyError}
          success={applySuccess}
          onRefresh={loadResumes}
          onNewResume={() => {
            closeApplyModal();
            router.push('/profile');
          }}
          postId={post.id}
          onGoToContract={() => {
            closeApplyModal();
            router.push(`/contracts/progress?postId=${post.id}&role=applicant`);
          }}
        />
      )}
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function Chip({ children, tone }: { children: ReactNode; tone?: 'default' | 'primary' }) {
  const base = 'rounded-full px-4 py-1.5 text-xs font-semibold';
  const palette =
    tone === 'primary'
      ? 'bg-primary/20 text-primary'
      : 'bg-white/10 text-white/80';
  return <span className={`${base} ${palette}`}>{children}</span>;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function AuthorCard({ author }: { author: NonNullable<JobPost['author']> }) {
  const positions = author.positions ?? [];
  return (
    <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-center">
      <div className="flex items-center gap-4">
        <Avatar author={author} />
        <div>
          <p className="text-lg font-semibold">{author.name ?? 'Anonymous'}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {positions.length > 0 ? (
              positions.map((pos, idx) => (
                <Chip key={idx}>{pos}</Chip>
              ))
            ) : (
              <span className="text-xs text-white/50">No role info</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 text-sm text-white/70">
        <div className="flex flex-wrap gap-6">
          {author.from && (
            <div>
              <p className="text-xs uppercase text-white/30">from</p>
              <p>{author.from}</p>
            </div>
          )}
          {author.in && (
            <div>
              <p className="text-xs uppercase text-white/30">in</p>
              <p>{author.in}</p>
            </div>
          )}
          {author.website && (
            <div>
              <p className="text-xs uppercase text-white/30">web</p>
              <a
                href={author.website}
                target="_blank"
                rel="noreferrer"
                className="text-primary-light underline"
              >
                {author.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span>Followers {author.followerCount ?? 0}</span>
          <span>Following {author.followingCount ?? 0}</span>
          <button className="rounded-full bg-primary/20 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/30">
            Follow +
          </button>
          <button className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}

function Avatar({ author }: { author: NonNullable<JobPost['author']> }) {
  if (author.profileImageUrl) {
    return (
      <img
        src={author.profileImageUrl}
        alt={author.name ?? 'author avatar'}
        className="h-16 w-16 rounded-full object-cover"
      />
    );
  }
  const initial = author.name?.[0]?.toUpperCase() ?? '?';
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-xl font-semibold">
      {initial}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-white/5 bg-white/5 p-6 md:p-10">
      <div className="h-4 w-1/3 rounded bg-white/10" />
      <div className="mt-4 h-8 w-2/3 rounded bg-white/10" />
      <div className="mt-6 flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="h-6 w-24 rounded-full bg-white/10" />
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-16 rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="mt-10 h-32 rounded-2xl bg-white/5" />
      <div className="mt-10 h-24 rounded-2xl bg-white/5" />
    </div>
  );
}

function ResumeApplyModal({
  resumes,
  loading,
  error,
  selectedId,
  onSelect,
  onClose,
  onSubmit,
  submitting,
  submitError,
  success,
  onRefresh,
  onNewResume,
  postId,
  onGoToContract,
}: {
  resumes: Resume[];
  loading: boolean;
  error: string | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
  success: boolean;
  onRefresh: () => void;
  onNewResume: () => void;
  postId?: number;
  onGoToContract?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl bg-[#16192a] p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">지원할 이력서 선택</p>
          <button onClick={onClose} className="text-white/70 hover:text-white" aria-label="Close apply modal">
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {loading && (
            <div className="rounded-2xl bg-white/5 p-4 text-center text-sm text-white/70">이력서를 불러오는 중…</div>
          )}
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
              <button
                type="button"
                onClick={onRefresh}
                className="mt-3 rounded-full bg-red-500/70 px-3 py-1 text-xs font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && resumes.length === 0 && (
            <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/70">
              등록된 이력서가 없습니다. 아래 버튼을 눌러 새로 작성할 수 있습니다.
            </div>
          )}

          {resumes.map((resume) => (
            <button
              key={resume.id}
              type="button"
              onClick={() => onSelect(resume.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                selectedId === resume.id ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{resume.title}</p>
                  <p className="text-xs text-white/60">
                    업데이트: {resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : '알 수 없음'}
                  </p>
                </div>
                <span className="rounded-full bg-primary/30 px-3 py-1 text-xs font-semibold text-primary">OPEN</span>
              </div>
              {resume.skills?.length ? (
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/70">
                  {resume.skills.slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="rounded-full bg-white/10 px-2 py-1">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : null}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onNewResume}
          className="mt-4 w-full rounded-2xl border border-dashed border-white/20 px-4 py-3 text-sm text-white/70 hover:bg-white/5"
        >
          + 새 이력서 등록하기
        </button>

        {submitError && <p className="mt-3 text-sm text-red-300">{submitError}</p>}
        {success && (
          <div className="mt-3 space-y-3 text-sm text-emerald-300">
            <p>지원이 완료되었습니다.</p>
            {postId && onGoToContract && (
              <button
                type="button"
                onClick={onGoToContract}
                className="w-full rounded-full border border-emerald-300/40 bg-emerald-500/10 px-4 py-2 text-emerald-200 hover:bg-emerald-500/20"
              >
                계약 진행 단계로 이동
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || !selectedId}
          className="mt-4 w-full rounded-full bg-emerald-400 px-6 py-3 text-center text-base font-semibold text-black disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : success ? 'Applied' : 'Apply'}
        </button>
      </div>
    </div>
  );
}
