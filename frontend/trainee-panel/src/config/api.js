// Every backend path this panel uses lives here and only here. If your
// FastAPI routes are named differently, this is the only file to edit.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const ENDPOINTS = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  me: "/api/auth/me",
  districts: "/api/districts",

  profile: "/api/trainee/profile",
  skills: "/api/trainee/skills",
  occupations: "/api/trainee/occupations",
  skillGap: "/api/trainee/skill-gap",
  opportunities: "/api/trainee/opportunities",
  applications: "/api/trainee/applications",
  notifications: "/api/trainee/notifications",
  peerBenchmark: "/api/trainee/peer-benchmark",

  assessments: "/api/trainee/assessments",
  submitAssessment: (submissionId) => `/api/trainee/assessments/${submissionId}/submit`,

  verification: "/api/trainee/verification/digilocker",
};
