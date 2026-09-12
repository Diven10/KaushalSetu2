import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const inputClass =
  "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none";

function Field({ label, children, hint }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-soft">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-ink-faint">{hint}</span>}
    </label>
  );
}

function emptyQuestion() {
  return { prompt: "", options: ["", "", "", ""], correct_index: 0 };
}

// Tied to a posting: `jobSkills` (that posting's required_skills) drives the
// skill checkboxes, so a Test or PS is always explicitly scoped to what the
// role actually needs — not a generic quiz.
export default function AssessmentForm({ job, onSubmit, submitting, error }) {
  const jobSkills = job?.required_skills || job?.requiredSkills || [];

  const [type, setType] = useState("test");
  const [title, setTitle] = useState("");
  const [skillsTested, setSkillsTested] = useState(jobSkills.slice(0, 3));
  const [dueDate, setDueDate] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [passThreshold, setPassThreshold] = useState(60);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [brief, setBrief] = useState("");

  const toggleSkill = (skill) => {
    setSkillsTested((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
  };

  const updateQuestion = (idx, patch) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, options: q.options.map((o, oi) => (oi === optIdx ? value : o)) } : q))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      job_id: job.id,
      title,
      type,
      skills_tested: skillsTested,
      due_date: dueDate,
      ...(type === "test"
        ? { duration_minutes: Number(durationMinutes), pass_threshold: Number(passThreshold), questions }
        : { brief }),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-6">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Title">
          <input
            required
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === "test" ? "e.g. Frontend Fundamentals Test" : "e.g. Landing Page Build — Problem Statement"}
          />
        </Field>
        <Field label="Type">
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="test">Test (auto-graded MCQ)</option>
            <option value="ps">Problem Statement (manually reviewed)</option>
          </select>
        </Field>
      </div>

      <Field label="Skills tested" hint={`Pulled from ${job?.title || "this posting"}'s required skills`}>
        <div className="flex flex-wrap gap-2">
          {jobSkills.length === 0 && (
            <p className="text-xs text-ink-faint">This posting has no required skills listed yet.</p>
          )}
          {jobSkills.map((skill) => (
            <button
              type="button"
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={`rounded-sm px-2.5 py-1 text-xs font-medium transition-colors ${
                skillsTested.includes(skill) ? "bg-ink text-paper" : "border border-line text-ink-soft hover:bg-paper"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Due date">
          <input type="date" required className={inputClass} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
        {type === "test" ? (
          <Field label="Duration (minutes)">
            <input type="number" min="5" className={inputClass} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
          </Field>
        ) : (
          <div />
        )}
      </div>

      {type === "test" ? (
        <>
          <Field label="Pass threshold (%)">
            <input type="number" min="0" max="100" className={inputClass} value={passThreshold} onChange={(e) => setPassThreshold(e.target.value)} />
          </Field>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-soft">Questions</span>
              <button
                type="button"
                onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
                className="flex items-center gap-1 text-xs font-medium text-accent-dark hover:underline"
              >
                <Plus size={13} /> Add question
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div key={qIdx} className="rounded-md border border-line-soft p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-ink-faint">Question {qIdx + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qIdx))}
                      className="text-ink-faint hover:text-warn"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <input
                  required
                  className={`${inputClass} mb-2`}
                  placeholder="Question prompt"
                  value={q.prompt}
                  onChange={(e) => updateQuestion(qIdx, { prompt: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => (
                    <label key={optIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correct_index === optIdx}
                        onChange={() => updateQuestion(qIdx, { correct_index: optIdx })}
                      />
                      <input
                        required
                        className={inputClass}
                        placeholder={`Option ${optIdx + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <Field label="Problem statement brief" hint="What the trainee needs to build/solve, and what to submit.">
          <textarea
            required
            rows={6}
            className={inputClass}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Describe the problem, constraints, and what a good submission includes…"
          />
        </Field>
      )}

      {error && <p className="rounded-md bg-warn-soft px-3 py-2 text-sm text-warn">{error.message}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-ink/90 disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create assessment"}
        </button>
      </div>
    </form>
  );
}
