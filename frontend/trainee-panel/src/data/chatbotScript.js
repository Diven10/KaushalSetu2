// Scripted conversation flow for the simulated AI assistant.
// Each step declares the bot's message(s), the kind of input it expects,
// where the captured answer should be written in the profile object,
// and which step comes next (optionally branching on the answer).
//
// inputType: "text" | "chips" | "multiChips"
// target: dot-path into the profile object, e.g. "identity.fullName"

import {
  QUALIFICATIONS,
  SCHEMES,
  JOB_ROLES,
  SALARY_BANDS,
  STATES,
  EMPLOYMENT_STATUS_CHIPS,
} from "./mockData";

export const CHAT_SCRIPT = [
  {
    id: "welcome",
    stage: "identity",
    bot: [
      "Hi, I'm Saathi — your KaushalSetu assistant. I'll ask a few quick questions to build your career profile, one step at a time.",
      "Let's start with your name. What should I call you?",
    ],
    inputType: "text",
    placeholder: "Enter your full name",
    target: "identity.fullName",
    next: "dob",
  },
  {
    id: "dob",
    stage: "identity",
    bot: (v) => `Good to meet you, ${firstName(v)}. What's your date of birth? (DD/MM/YYYY)`,
    inputType: "text",
    placeholder: "e.g. 14/08/2005",
    target: "identity.dob",
    next: "gender",
  },
  {
    id: "gender",
    stage: "identity",
    bot: "Which gender would you like on record?",
    inputType: "chips",
    options: ["Male", "Female", "Other", "Prefer not to say"],
    target: "identity.gender",
    next: "state",
  },
  {
    id: "state",
    stage: "identity",
    bot: "Which state are you currently based in?",
    inputType: "chips",
    options: STATES,
    target: "identity.state",
    next: "district",
  },
  {
    id: "district",
    stage: "identity",
    bot: "And your district or city?",
    inputType: "text",
    placeholder: "e.g. Pune",
    target: "identity.district",
    next: "qualification",
  },
  {
    id: "qualification",
    stage: "education",
    bot: "Now, let's cover your education. What's the highest qualification you've completed?",
    inputType: "chips",
    options: QUALIFICATIONS,
    target: "education.qualification",
    next: "fieldOfStudy",
  },
  {
    id: "fieldOfStudy",
    stage: "education",
    bot: "What field or stream was that in?",
    inputType: "text",
    placeholder: "e.g. Science, Commerce, Mechanical",
    target: "education.field",
    next: "yearCompleted",
  },
  {
    id: "yearCompleted",
    stage: "education",
    bot: "Which year did you complete it?",
    inputType: "text",
    placeholder: "e.g. 2023",
    target: "education.yearCompleted",
    next: "scheme",
  },
  {
    id: "scheme",
    stage: "training",
    bot: "Great, moving on to your skilling journey. Which scheme or program did you train under?",
    inputType: "chips",
    options: SCHEMES,
    target: "training.scheme",
    next: "courseName",
  },
  {
    id: "courseName",
    stage: "training",
    bot: "Which course or trade did you train in?",
    inputType: "text",
    placeholder: "e.g. Solar Panel Technician",
    target: "training.courseName",
    next: "trainingStatus",
  },
  {
    id: "trainingStatus",
    stage: "training",
    bot: "What's the current status of this training?",
    inputType: "chips",
    options: ["Completed", "Ongoing", "Dropped out"],
    target: "training.status",
    next: "trainingScore",
  },
  {
    id: "trainingScore",
    stage: "training",
    bot: "Do you know your final assessment score or grade? You can skip this if you're not sure.",
    inputType: "text",
    placeholder: "e.g. 82% or Grade A",
    optional: true,
    target: "training.score",
    next: "employmentStatus",
  },
  {
    id: "employmentStatus",
    stage: "employment",
    bot: "Let's talk about employment. Are you currently working?",
    inputType: "chips",
    options: EMPLOYMENT_STATUS_CHIPS,
    target: "employment.status",
    next: (answer) => (answer === "No, still seeking" ? "preferredRoles" : "employerName"),
  },
  {
    id: "employerName",
    stage: "employment",
    bot: "Who is your current employer (or client, if self-employed)?",
    inputType: "text",
    placeholder: "e.g. Sunrise Energy Pvt. Ltd.",
    target: "employment.employer",
    next: "currentWage",
  },
  {
    id: "currentWage",
    stage: "employment",
    bot: "What is your current monthly wage, approximately?",
    inputType: "chips",
    options: SALARY_BANDS,
    target: "employment.wageBand",
    next: "preferredRoles",
  },
  {
    id: "preferredRoles",
    stage: "preferences",
    bot: "Now for your preferences, so we can match you with better opportunities. Which job roles interest you most? You can pick more than one.",
    inputType: "multiChips",
    options: JOB_ROLES,
    target: "preferences.roles",
    next: "preferredLocation",
  },
  {
    id: "preferredLocation",
    stage: "preferences",
    bot: "Where would you prefer to work?",
    inputType: "chips",
    options: [...STATES, "Remote / Work from home"],
    target: "preferences.location",
    next: "expectedSalary",
  },
  {
    id: "expectedSalary",
    stage: "preferences",
    bot: "What monthly wage are you expecting in your next role?",
    inputType: "chips",
    options: SALARY_BANDS,
    target: "preferences.expectedSalary",
    next: "relocate",
  },
  {
    id: "relocate",
    stage: "preferences",
    bot: "Would you be willing to relocate for the right opportunity?",
    inputType: "chips",
    options: ["Yes, anywhere in India", "Only within my state", "No, local opportunities only"],
    target: "preferences.relocate",
    next: "verifyIdentity",
  },
  {
    id: "verifyIdentity",
    stage: "verification",
    bot: "Almost done. Let's verify your identity so employers can trust your profile. This is simulated for now — tap to confirm.",
    inputType: "chips",
    options: ["Verify with Aadhaar-linked ID"],
    target: "verification.identity",
    resultValue: "Verified",
    next: "verifyCertificate",
  },
  {
    id: "verifyCertificate",
    stage: "verification",
    bot: "Last step — let's confirm your training certificate.",
    inputType: "chips",
    options: ["Upload & verify certificate"],
    target: "verification.certificate",
    resultValue: "Verified",
    next: "complete",
  },
  {
    id: "complete",
    stage: "verification",
    bot: (v, profile) =>
      `That's everything, ${firstName(
        profile?.identity?.fullName
      )}! Your career profile is complete and verified. Head to your Dashboard to see your readiness score, or check Skills & Opportunities for roles matched to you.`,
    inputType: "done",
    target: null,
    next: null,
  },
];

export function firstName(fullName) {
  if (!fullName) return "there";
  return fullName.trim().split(" ")[0];
}

export function getStepById(id) {
  return CHAT_SCRIPT.find((s) => s.id === id);
}

export const FIRST_STEP_ID = CHAT_SCRIPT[0].id;
