import React, { useState } from "react";

const EMPTY = {
  title: "",
  type: "job",
  description: "",
  responsibilities: "",
  required_skills: "",
  preferred_skills: "",
  education_requirement: "",
  experience_requirement: "",
  salary: "",
  location: "",
  work_mode: "on-site",
  application_deadline: "",
  openings: 1,
};

function Field({ label, children, hint }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-ink-faint">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none";

export default function JobPostingForm({ initialValue, onSubmit, submitLabel = "Publish posting" }) {
  const [values, setValues] = useState({ ...EMPTY, ...initialValue });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        openings: Number(values.openings) || 1,
        required_skills: values.required_skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        preferred_skills: values.preferred_skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-6">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Title">
          <input required className={inputClass} value={values.title} onChange={set("title")} placeholder="e.g. Junior Frontend Developer" />
        </Field>
        <Field label="Type">
          <select className={inputClass} value={values.type} onChange={set("type")}>
            <option value="job">Job</option>
            <option value="internship">Internship</option>
          </select>
        </Field>
      </div>

      <Field label="Description">
        <textarea required rows={3} className={inputClass} value={values.description} onChange={set("description")} />
      </Field>

      <Field label="Responsibilities" hint="One per line">
        <textarea rows={3} className={inputClass} value={values.responsibilities} onChange={set("responsibilities")} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Required skills" hint="Comma separated">
          <input className={inputClass} value={values.required_skills} onChange={set("required_skills")} placeholder="React, Git, REST APIs" />
        </Field>
        <Field label="Preferred skills" hint="Comma separated">
          <input className={inputClass} value={values.preferred_skills} onChange={set("preferred_skills")} placeholder="TypeScript, Testing" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Education requirement">
          <input className={inputClass} value={values.education_requirement} onChange={set("education_requirement")} />
        </Field>
        <Field label="Experience requirement">
          <input className={inputClass} value={values.experience_requirement} onChange={set("experience_requirement")} placeholder="e.g. 0-1 years" />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label={values.type === "internship" ? "Stipend" : "Salary"}>
          <input className={inputClass} value={values.salary} onChange={set("salary")} placeholder="₹ per annum" />
        </Field>
        <Field label="Location">
          <input required className={inputClass} value={values.location} onChange={set("location")} />
        </Field>
        <Field label="Work mode">
          <select className={inputClass} value={values.work_mode} onChange={set("work_mode")}>
            <option value="on-site">On-site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Application deadline">
          <input type="date" className={inputClass} value={values.application_deadline} onChange={set("application_deadline")} />
        </Field>
        <Field label="Number of openings">
          <input type="number" min="1" className={inputClass} value={values.openings} onChange={set("openings")} />
        </Field>
      </div>

      {error && (
        <p className="rounded-md bg-warn-soft px-3 py-2 text-sm text-warn">{error.message}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
