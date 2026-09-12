import {
  MOCK_USER,
  MOCK_EMPLOYER_PROFILE,
  SEED_JOBS,
  SEED_ANALYTICS,
  SEED_SKILL_DEMAND,
  SEED_ASSESSMENTS,
} from "../data/mockEmployerData";

// Mutable, in-memory copies so create/update/assign/review actually persist
// for the rest of the session (resets on reload) — the same trade-off the
// Trainee Panel's AppDataContext makes, just implemented as a service module
// here instead of a React context, to match this app's existing service-
// layer pattern.
let jobs = SEED_JOBS.map((j) => ({ ...j }));
let assessments = SEED_ASSESSMENTS.map((a) => ({ ...a, submissions: a.submissions.map((s) => ({ ...s })) }));
let employerProfile = { ...MOCK_EMPLOYER_PROFILE };

let idCounter = 100;
const nextId = (prefix) => `${prefix}-${++idCounter}`;

const delay = (value, ms = 350) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

// --- auth ---

export function login() {
  return delay({ access_token: "mock-token" });
}

export function fetchCurrentUser() {
  return delay({ ...MOCK_USER });
}

export function fetchEmployerProfile() {
  return delay({ ...employerProfile });
}

export function verifyEmployerViaDigiLocker(documents) {
  employerProfile = { ...employerProfile, verification: { status: "verified", documents } };
  return delay({ ...employerProfile });
}

// --- postings ---

export function fetchJobs() {
  return delay(jobs.map((j) => ({ ...j })));
}

export function fetchJob(jobId) {
  const job = jobs.find((j) => String(j.id) === String(jobId));
  return job ? delay({ ...job }) : Promise.reject(new Error(`No mock posting with id ${jobId}`));
}

export function createJob(payload) {
  const job = { id: nextId("job"), status: "open", applicant_count: 0, strong_match_count: 0, ...payload };
  jobs = [job, ...jobs];
  return delay({ ...job });
}

export function updateJob(jobId, payload) {
  jobs = jobs.map((j) => (String(j.id) === String(jobId) ? { ...j, ...payload } : j));
  return delay(jobs.find((j) => String(j.id) === String(jobId)));
}

export function closeJob(jobId) {
  jobs = jobs.map((j) => (String(j.id) === String(jobId) ? { ...j, status: "closed" } : j));
  return delay(null);
}

// --- analytics ---

export function fetchAnalytics() {
  return delay({ ...SEED_ANALYTICS });
}

export function fetchSkillDemand() {
  return delay(SEED_SKILL_DEMAND.map((s) => ({ ...s })));
}

// --- Test & PS assessments ---

export function fetchAllAssessments() {
  return delay(
    assessments.map((a) => ({
      ...a,
      assigned_count: a.submissions.length,
      pending_review_count: a.submissions.filter((s) => s.status === "submitted").length,
      average_score: averageScore(a.submissions),
    }))
  );
}

export function fetchAssessmentsForJob(jobId) {
  return fetchAllAssessments().then((all) => all.filter((a) => String(a.job_id) === String(jobId)));
}

export function fetchAssessment(assessmentId) {
  const a = assessments.find((x) => String(x.id) === String(assessmentId));
  return a ? delay({ ...a }) : Promise.reject(new Error(`No mock assessment with id ${assessmentId}`));
}

export function createAssessment(payload) {
  const job = jobs.find((j) => String(j.id) === String(payload.job_id));
  const assessment = {
    id: nextId("assess"),
    job_title: job?.title,
    submissions: [],
    ...payload,
  };
  assessments = [assessment, ...assessments];
  return delay({ ...assessment });
}

export function assignAssessment(assessmentId, applicationIds) {
  assessments = assessments.map((a) => {
    if (String(a.id) !== String(assessmentId)) return a;
    const newSubs = applicationIds
      .filter((id) => !a.submissions.some((s) => String(s.application_id) === String(id)))
      .map((id) => ({
        id: nextId("sub"),
        application_id: id,
        candidate_name: `Applicant #${id}`,
        status: "assigned",
        score: null,
        verified: false,
      }));
    return { ...a, submissions: [...a.submissions, ...newSubs] };
  });
  return delay(null);
}

export function fetchAssessmentSubmissions(assessmentId) {
  const a = assessments.find((x) => String(x.id) === String(assessmentId));
  return delay((a?.submissions || []).map((s) => ({ ...s })));
}

export function reviewSubmission(submissionId, payload) {
  assessments = assessments.map((a) => ({
    ...a,
    submissions: a.submissions.map((s) => (String(s.id) === String(submissionId) ? { ...s, ...payload } : s)),
  }));
  return delay(null);
}

export function fetchAssessmentsSummary() {
  const allSubs = assessments.flatMap((a) => a.submissions);
  return delay({
    total_assessments: assessments.length,
    pending_review_count: allSubs.filter((s) => s.status === "submitted").length,
    awaiting_submission_count: allSubs.filter((s) => s.status === "assigned" || s.status === "in_progress").length,
    average_score: averageScore(allSubs),
    completion_rate:
      allSubs.length === 0 ? 0 : Math.round((allSubs.filter((s) => s.status === "evaluated").length / allSubs.length) * 100),
  });
}

function averageScore(submissions) {
  const scored = submissions.filter((s) => s.score != null);
  if (scored.length === 0) return null;
  return scored.reduce((sum, s) => sum + s.score, 0) / scored.length;
}
