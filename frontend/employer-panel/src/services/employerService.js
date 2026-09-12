import { apiRequest } from "../lib/apiClient";
import { ENDPOINTS } from "../config/api";

// --- auth ---

export function login(email, password) {
  return apiRequest(ENDPOINTS.login, { method: "POST", auth: false, body: { email, password } });
}

export function register(payload) {
  // payload: { email, password, role, company_name, district_id }
  return apiRequest(ENDPOINTS.register, { method: "POST", auth: false, body: payload });
}

export function fetchDistricts() {
  return apiRequest(ENDPOINTS.districts, { auth: false });
}

export function fetchCurrentUser() {
  return apiRequest(ENDPOINTS.me);
}

export function fetchEmployerProfile() {
  return apiRequest(ENDPOINTS.employerProfile);
}

// --- verification ---
// The consent/document-fetch UI is simulated client-side (same rationale as
// the trainee panel's DigiLocker card: real integration requires onboarding
// as a Requester via the DigiLocker/API Setu partner programme). Once the
// simulated fetch completes, the result IS persisted for real, through this
// endpoint — so verification status genuinely survives a reload once your
// backend implements it, unlike the rest of the simulated UI state.
export function verifyEmployerViaDigiLocker(documents) {
  return apiRequest(ENDPOINTS.employerVerificationDigilocker, { method: "POST", body: { documents } });
}

// --- postings ---

export function fetchJobs() {
  return apiRequest(ENDPOINTS.jobs);
}

export function fetchJob(jobId) {
  return apiRequest(ENDPOINTS.job(jobId));
}

export function createJob(payload) {
  return apiRequest(ENDPOINTS.jobs, { method: "POST", body: payload });
}

export function updateJob(jobId, payload) {
  return apiRequest(ENDPOINTS.job(jobId), { method: "PUT", body: payload });
}

export function closeJob(jobId) {
  return apiRequest(ENDPOINTS.closeJob(jobId), { method: "PATCH" });
}

// --- applicants & matching ---

export function fetchApplicants(jobId) {
  return apiRequest(ENDPOINTS.applicants(jobId));
}

export function fetchCandidateMatches(jobId) {
  return apiRequest(ENDPOINTS.candidateMatches(jobId));
}

export function updateApplicationStatus(applicationId, status) {
  return apiRequest(ENDPOINTS.applicationStatus(applicationId), {
    method: "PATCH",
    body: { status },
  });
}

// --- analytics ---

export function fetchAnalytics() {
  return apiRequest(ENDPOINTS.analytics);
}

export function fetchSkillDemand() {
  return apiRequest(ENDPOINTS.skillDemand);
}

// --- Test & PS assessments ---

export function fetchAllAssessments() {
  return apiRequest(ENDPOINTS.assessments);
}

export function fetchAssessmentsForJob(jobId) {
  return apiRequest(ENDPOINTS.assessmentsForJob(jobId));
}

export function fetchAssessment(assessmentId) {
  return apiRequest(ENDPOINTS.assessment(assessmentId));
}

export function createAssessment(payload) {
  // payload: { job_id, title, type: "test"|"ps", skills_tested: [...],
  //            due_date, pass_threshold, duration_minutes, questions | brief }
  return apiRequest(ENDPOINTS.assessments, { method: "POST", body: payload });
}

export function assignAssessment(assessmentId, applicationIds) {
  return apiRequest(ENDPOINTS.assessmentAssign(assessmentId), {
    method: "POST",
    body: { application_ids: applicationIds },
  });
}

export function fetchAssessmentSubmissions(assessmentId) {
  return apiRequest(ENDPOINTS.assessmentSubmissions(assessmentId));
}

export function reviewSubmission(submissionId, payload) {
  // payload: { score, status: "evaluated"|"rejected", feedback }
  return apiRequest(ENDPOINTS.submissionReview(submissionId), { method: "PATCH", body: payload });
}

export function fetchAssessmentsSummary() {
  return apiRequest(ENDPOINTS.assessmentsSummary);
}
