import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Resume as ResumeModel } from '@/models/profile';
import { createResume, fetchMyResumes, updateResume, type ResumePayload } from '@/services/resumeApi';

interface ResumeProps {
  resumes: ResumeModel[];
}

type ResumeFormState = {
  title: string;
  name: string;
  introduction: string;
  desiredPosition: string;
  skillsText: string;
  careerLevel: string;
  portfolioUrl: string;
};

const defaultForm: ResumeFormState = {
  title: '',
  name: '',
  introduction: '',
  desiredPosition: '',
  skillsText: '',
  careerLevel: '',
  portfolioUrl: '',
};

export function Resume({ resumes: initialResumes }: ResumeProps) {
  const [resumes, setResumes] = useState<ResumeModel[]>(initialResumes ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ResumeModel | null>(null);
  const [form, setForm] = useState<ResumeFormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    setResumes(initialResumes ?? []);
  }, [initialResumes]);

  const loadResumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchMyResumes();
      setResumes(list);
    } catch (err: any) {
      setError(err?.message ?? '이력서를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const openCreateModal = () => {
    setEditing(null);
    setForm(defaultForm);
    setModalError(null);
    setModalOpen(true);
  };

  const openEditModal = (resume: ResumeModel) => {
    setEditing(resume);
    setForm({
      title: resume.title ?? '',
      name: resume.name ?? '',
      introduction: resume.introduction ?? '',
      desiredPosition: resume.desiredPosition ?? '',
      skillsText: resume.skills?.join(', ') ?? '',
      careerLevel: resume.careerLevel ?? '',
      portfolioUrl: resume.portfolioUrl ?? '',
    });
    setModalError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalError(null);
    setSubmitting(false);
  };

  const handleChange = (field: keyof ResumeFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const payload: ResumePayload = {
      title: form.title.trim(),
      name: form.name.trim(),
      introduction: form.introduction.trim(),
      desiredPosition: form.desiredPosition.trim(),
      skills: form.skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      careerLevel: form.careerLevel.trim(),
      portfolioUrl: form.portfolioUrl.trim(),
    };

    if (!payload.title || !payload.name) {
      setModalError('이름과 제목을 입력하세요.');
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      if (editing) {
        const updated = await updateResume(editing.id, payload);
        setResumes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      } else {
        await createResume(payload);
        await loadResumes();
      }
      closeModal();
    } catch (err: any) {
      setModalError(err?.message ?? '저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const emptyState = !loading && resumes.length === 0;

  return (
    <section className="mt-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-purple-400">Résumé</h2>
          <p className="text-sm text-gray-500">Only you can see this</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-400"
        >
          + Add résumé
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map((key) => (
            <div key={key} className="animate-pulse rounded-xl bg-[#1b1f2a] p-4">
              <div className="h-4 w-1/3 rounded bg-[#2a2f3b]" />
              <div className="mt-3 h-3 w-1/2 rounded bg-[#2a2f3b]" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {emptyState ? (
        <div className="rounded-xl border border-dashed border-gray-600 bg-[#1b1f2a] p-6 text-center text-gray-400">
          아직 작성한 이력서가 없습니다. 상단 버튼을 눌러 새로 만들어 보세요.
        </div>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => (
            <div
              key={resume.id || resume.title}
              className="flex flex-col gap-4 rounded-2xl bg-[#1b1f2a] p-5 text-white md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-lg font-semibold">{resume.title}</p>
                <p className="text-sm text-white/70">{resume.desiredPosition || resume.name}</p>
                <p className="mt-2 text-xs text-white/50">
                  {resume.updatedAt ? `Last update: ${new Date(resume.updatedAt).toLocaleDateString()}` : ''}
                </p>
                {resume.skills?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/80">
                    {resume.skills.map((skill, idx) => (
                      <span key={idx} className="rounded-full bg-white/10 px-3 py-1">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-3">
                {resume.portfolioUrl && (
                  <a
                    href={resume.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
                  >
                    Portfolio
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => openEditModal(resume)}
                  className="rounded-lg bg-purple-500/80 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-400"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ResumeModal
          editing={!!editing}
          form={form}
          onChange={handleChange}
          onClose={closeModal}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={modalError}
        />
      )}
    </section>
  );
}

function ResumeModal({
  editing,
  form,
  onChange,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  editing: boolean;
  form: ResumeFormState;
  onChange: (field: keyof ResumeFormState, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const title = editing ? 'Edit résumé' : 'Create résumé';

  const Field = useMemo(
    () =>
      function FieldComponent({
        label,
        children,
      }: {
        label: string;
        children: ReactNode;
      }) {
        return (
          <label className="text-sm text-white/70">
            <span className="mb-1 block font-medium text-white">{label}</span>
            {children}
          </label>
        );
      },
    []
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl bg-[#11121a] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 transition hover:text-white"
            aria-label="Close resume modal"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <Field label="Title">
            <input
              className="w-full rounded-lg bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
              value={form.title}
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="예: 프론트엔드 개발자 이력서"
            />
          </Field>

          <Field label="Name">
            <input
              className="w-full rounded-lg bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
              value={form.name}
              onChange={(e) => onChange('name', e.target.value)}
            />
          </Field>

          <Field label="Self introduction">
            <textarea
              className="h-28 w-full rounded-lg bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
              value={form.introduction}
              onChange={(e) => onChange('introduction', e.target.value)}
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Desired position">
              <input
                className="w-full rounded-lg bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
                value={form.desiredPosition}
                onChange={(e) => onChange('desiredPosition', e.target.value)}
              />
            </Field>

            <Field label="Career level">
              <input
                className="w-full rounded-lg bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
                value={form.careerLevel}
                onChange={(e) => onChange('careerLevel', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Skills (comma separated)">
            <input
              className="w-full rounded-lg bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
              value={form.skillsText}
              onChange={(e) => onChange('skillsText', e.target.value)}
              placeholder="React, TypeScript, TailwindCSS"
            />
          </Field>

          <Field label="Portfolio URL">
            <input
              className="w-full rounded-lg bg-white/10 px-4 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
              value={form.portfolioUrl}
              onChange={(e) => onChange('portfolioUrl', e.target.value)}
              placeholder="https://example.com"
            />
          </Field>
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="rounded-lg bg-purple-500 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-400 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : editing ? 'Save changes' : 'Create resume'}
          </button>
        </div>
      </div>
    </div>
  );
}
