'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createJobPost, type CreateJobPostPayload } from "@/services/jobApi";

type FormState = {
  title: string;
  description: string;
  duration: string;
  deadline: string;
  payment: string;
};

const INITIAL_STATE: FormState = {
  title: "",
  description: "",
  duration: "",
  deadline: "",
  payment: "",
};

export function JobPostForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    setSkills((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setSkillInput("");
  };

  const removeSkill = (target: string) => {
    setSkills((prev) => prev.filter((skill) => skill !== target));
  };

  const canSubmit =
    form.title.trim().length > 0 &&
    form.description.trim().length >= 20 &&
    !submitting;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) {
      setError("Enter a title and at least 20 characters of description.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const paymentValue = form.payment
      ? Number(form.payment.replace(/[^\d]/g, ""))
      : undefined;

    if (form.payment && (!paymentValue || paymentValue <= 0)) {
      setSubmitting(false);
      setError("Compensation must be a positive number.");
      return;
    }

    const payload: CreateJobPostPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      requiredSkills: skills.length ? skills : undefined,
      duration: form.duration.trim() || undefined,
      deadline: form.deadline || undefined,
      payment: paymentValue,
    };

    try {
      const { postId } = await createJobPost(payload);
      setSuccess(`Job post created (ID: ${postId}).`);
      setTimeout(() => {
        const encoded = encodeURIComponent(postId);
        router.push(`/profile?newJob=${encoded}`);
      }, 600);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to create job post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-white/70">
        <Link href="/profile" className="hover:text-white">
          ← Back to profile
        </Link>
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-widest text-purple-400">
          Job posting
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Share what you are building and find collaborators
        </h1>
        <p className="mt-2 text-white/70">
          Describe the role, highlight the stack, and let the community know how
          to reach you. You can edit or close the posting later.
        </p>
      </div>

      <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        )}

        <section className="rounded-2xl bg-[#141621] px-6 py-6 ring-1 ring-white/10">
          <div className="space-y-6">
            <div>
              <label className="text-sm text-white/70">Job title *</label>
              <input
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-purple-500"
                placeholder="e.g. Senior Solidity Engineer"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/70">Description *</label>
                <span className="text-xs text-white/40">
                  {form.description.trim().length}/20+
                </span>
              </div>
              <textarea
                className="mt-2 h-40 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                placeholder="What problem are you solving? What will the teammate own?"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm text-white/70">Duration</label>
                <input
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-purple-500"
                  placeholder="e.g. 6 months, ongoing"
                  value={form.duration}
                  onChange={(e) => handleChange("duration", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-white/70">Deadline</label>
                <input
                  type="date"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-purple-500"
                  value={form.deadline}
                  onChange={(e) => handleChange("deadline", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-white/70">Compensation (KRW)</label>
                <input
                  type="number"
                  min="0"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="3000000"
                  value={form.payment}
                  onChange={(e) => handleChange("payment", e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-[#141621] px-6 py-6 ring-1 ring-white/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Required skills</h2>
              <p className="text-sm text-white/60">
                Share up to 8 key stacks. Press Enter to add.
              </p>
            </div>
            <div className="flex w-full max-w-md gap-3">
              <input
                className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-purple-500"
                placeholder="Solidity, Rust, DeFi..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={addSkill}
                className="rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                Add
              </button>
            </div>
          </div>

          {skills.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="group flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-sm text-white/80"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-xs text-white/40 group-hover:text-white/80"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/40">
              No skills added yet.
            </p>
          )}
        </section>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white/70 hover:border-white/30 hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
          >
            {submitting ? "Publishing..." : "Publish job post"}
          </button>
        </div>
      </form>
    </div>
  );
}
