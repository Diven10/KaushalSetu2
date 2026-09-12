// Demo data for everything EXCEPT the live trainee-application link (see
// services/api.js — fetchApplicants/fetchCandidateMatches/updateApplicationStatus
// always hit your real backend, since those represent actual trainees
// applying, not a demo). Everything here is a self-contained starting point
// so the rest of the panel works the moment you open it, no backend required
// — same idea as the Government Portal's mockGovernmentData.js and the
// Trainee Panel's appData.js.

export const MOCK_USER = {
  id: "emp-user-1",
  name: "Aditya Sharma",
  email: "aditya@sunriseenergy.example",
  role: "employer",
};

export const MOCK_EMPLOYER_PROFILE = {
  id: "emp-1",
  company_name: "Sunrise Energy Pvt. Ltd.",
  email: "aditya@sunriseenergy.example",
  industry: "Renewable Energy",
  location: "Pune, Maharashtra",
  verification: { status: "pending" },
};

export const SEED_JOBS = [
  {
    id: "job-1",
    title: "Junior Solar Panel Technician",
    type: "job",
    status: "open",
    description:
      "Install, wire and commission rooftop solar arrays for residential and small-commercial clients across Pune district.",
    required_skills: ["Electrical Wiring", "Panel Installation", "Safety Compliance"],
    preferred_skills: ["Multimeter Testing", "Customer Handling"],
    education_requirement: "ITI / Diploma in Electrical",
    experience_requirement: "0-1 years",
    salary: "₹16,000 – ₹19,000 / month",
    location: "Pune, Maharashtra",
    work_mode: "on-site",
    application_deadline: "2026-09-25",
    openings: 3,
    applicant_count: 9,
    strong_match_count: 3,
  },
  {
    id: "job-2",
    title: "Residential Electrician",
    type: "job",
    status: "open",
    description: "Handle residential electrical maintenance, fault diagnosis and new-installation wiring.",
    required_skills: ["Circuit Diagnosis", "Wiring Standards", "Safety Compliance"],
    preferred_skills: ["Client Communication"],
    education_requirement: "ITI Electrician",
    experience_requirement: "1-2 years",
    salary: "₹14,500 – ₹17,000 / month",
    location: "Nashik, Maharashtra",
    work_mode: "on-site",
    application_deadline: "2026-09-14",
    openings: 2,
    applicant_count: 1,
    strong_match_count: 0,
  },
  {
    id: "job-3",
    title: "Junior Web Developer",
    type: "internship",
    status: "open",
    description: "Support front-end feature work on internal tools using HTML, CSS and JavaScript.",
    required_skills: ["JavaScript", "Responsive Design", "Version Control"],
    preferred_skills: ["Git", "Testing"],
    education_requirement: "Diploma / Graduate",
    experience_requirement: "0 years",
    salary: "₹18,000 – ₹24,000 / month",
    location: "Remote",
    work_mode: "remote",
    application_deadline: "2026-10-02",
    openings: 1,
    applicant_count: 0,
    strong_match_count: 0,
  },
  {
    id: "job-4",
    title: "CNC Machine Operator",
    type: "job",
    status: "closed",
    description: "Operate and monitor CNC machines producing precision auto components.",
    required_skills: ["Tool Handling", "Safety Compliance"],
    preferred_skills: [],
    education_requirement: "ITI",
    experience_requirement: "1+ years",
    salary: "₹15,000 – ₹18,500 / month",
    location: "Aurangabad, Maharashtra",
    work_mode: "on-site",
    application_deadline: "2026-08-20",
    openings: 2,
    applicant_count: 14,
    strong_match_count: 6,
  },
];

export const SEED_ANALYTICS = {
  total_hires: 11,
  avg_time_to_hire_days: 21,
  retention_30_day: 88,
  retention_90_day: 74,
  funnel: { applied: 62, shortlisted: 27, assessment: 15, interview: 10, hired: 6 },
};

export const SEED_SKILL_DEMAND = [
  { skill: "Safety Compliance", required_count: 3, coverage_percentage: 81 },
  { skill: "Electrical Wiring", required_count: 1, coverage_percentage: 74 },
  { skill: "Circuit Diagnosis", required_count: 1, coverage_percentage: 62 },
  { skill: "JavaScript", required_count: 1, coverage_percentage: 55 },
  { skill: "Panel Installation", required_count: 1, coverage_percentage: 68 },
  { skill: "Tool Handling", required_count: 1, coverage_percentage: 70 },
];

export const SEED_ASSESSMENTS = [
  {
    id: "assess-1",
    job_id: "job-1",
    job_title: "Junior Solar Panel Technician",
    title: "Solar Installation Safety & Fundamentals Test",
    type: "test",
    skills_tested: ["Safety Compliance", "Electrical Wiring", "Panel Installation"],
    due_date: "2026-09-20",
    duration_minutes: 20,
    pass_threshold: 60,
    questions: [
      {
        prompt: "Before working on a rooftop solar array, what is the FIRST safety step?",
        options: [
          "Start wiring the panels immediately to save time",
          "Isolate and lock out the DC/AC supply, then verify with a meter",
          "Ask a colleague to hold the ladder",
          "Check the weather forecast for next week",
        ],
        correct_index: 1,
      },
    ],
    submissions: [
      { id: "sub-1", application_id: "app-seed-1", candidate_name: "Rohit Kadam", status: "evaluated", score: 84, verified: true },
      { id: "sub-2", application_id: "app-seed-2", candidate_name: "Sneha Patil", status: "submitted", score: null, verified: false },
    ],
  },
  {
    id: "assess-2",
    job_id: "job-3",
    job_title: "Junior Web Developer",
    title: "Landing Page Build — Problem Statement",
    type: "ps",
    skills_tested: ["JavaScript", "Responsive Design"],
    due_date: "2026-09-22",
    pass_threshold: null,
    brief:
      "Build a small responsive landing page (HTML/CSS/JS only) for a fictional tuition service, with a working contact form.",
    submissions: [
      {
        id: "sub-3",
        application_id: "app-seed-3",
        candidate_name: "Aman Verma",
        status: "submitted",
        score: null,
        verified: true,
        submission_text: "Built with vanilla JS, flexbox layout, validated the form with a regex check.\nLink: (mock) github.com/amanv/landing-demo",
      },
    ],
  },
];
