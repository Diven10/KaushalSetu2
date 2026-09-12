// Static mock data used across the trainee panel.
// In production this would be served by the KaushalSetu backend / ML services.

export const STAGES = [
  { key: "identity", label: "Identity" },
  { key: "education", label: "Education" },
  { key: "training", label: "Training" },
  { key: "employment", label: "Employment" },
  { key: "preferences", label: "Preferences" },
  { key: "verification", label: "Verification" },
];

export const QUALIFICATIONS = ["10th Pass", "12th Pass", "ITI", "Diploma", "Graduate", "Postgraduate"];

export const SCHEMES = ["PMKVY 4.0", "NSDC Partner Program", "State Skill Mission", "DDU-GKY", "Other"];

export const JOB_ROLES = [
  "Electrician",
  "Solar Panel Technician",
  "Welder (Fabrication)",
  "Beautician & Wellness",
  "Web Developer",
  "Data Entry Operator",
  "Tailoring & Apparel",
  "CNC Machine Operator",
  "Field Sales Associate",
];

export const SALARY_BANDS = ["Under ₹10,000", "₹10,000 – ₹15,000", "₹15,000 – ₹22,000", "₹22,000 – ₹30,000", "Above ₹30,000"];

export const STATES = ["Maharashtra", "Uttar Pradesh", "Karnataka", "Gujarat", "Rajasthan", "Tamil Nadu", "Bihar", "West Bengal"];

// Skill requirement matrix per target role: current proficiency (mock, from training records)
// vs the proficiency required by employers hiring for that role, 0-100 scale.
export const SKILL_GAP_MATRIX = {
  "Solar Panel Technician": [
    { skill: "Electrical Wiring", current: 72, required: 85 },
    { skill: "Panel Installation", current: 65, required: 80 },
    { skill: "Safety Compliance", current: 80, required: 90 },
    { skill: "Multimeter Testing", current: 55, required: 75 },
    { skill: "Customer Handling", current: 40, required: 60 },
  ],
  "Web Developer": [
    { skill: "HTML/CSS", current: 78, required: 80 },
    { skill: "JavaScript", current: 60, required: 85 },
    { skill: "Version Control", current: 45, required: 70 },
    { skill: "Responsive Design", current: 55, required: 75 },
    { skill: "Communication", current: 68, required: 65 },
  ],
  Electrician: [
    { skill: "Circuit Diagnosis", current: 70, required: 82 },
    { skill: "Wiring Standards", current: 74, required: 80 },
    { skill: "Safety Compliance", current: 82, required: 90 },
    { skill: "Tool Handling", current: 76, required: 75 },
    { skill: "Client Communication", current: 42, required: 60 },
  ],
  default: [
    { skill: "Core Trade Skill", current: 68, required: 82 },
    { skill: "Digital Literacy", current: 50, required: 65 },
    { skill: "Workplace Safety", current: 74, required: 85 },
    { skill: "Communication", current: 45, required: 60 },
    { skill: "Problem Solving", current: 58, required: 70 },
  ],
};

export const RECOMMENDED_OPPORTUNITIES = [
  {
    id: "op-1",
    role: "Solar Panel Technician",
    employer: "Sunrise Energy Pvt. Ltd.",
    location: "Pune, Maharashtra",
    wage: "₹16,000 – ₹19,000 / month",
    match: 84,
    type: "Full-time",
  },
  {
    id: "op-2",
    role: "Electrician (Residential)",
    employer: "Urban Homes Facility Services",
    location: "Nashik, Maharashtra",
    wage: "₹14,500 – ₹17,000 / month",
    match: 76,
    type: "Full-time",
  },
  {
    id: "op-3",
    role: "Junior Web Developer",
    employer: "NextGen Softworks",
    location: "Remote",
    wage: "₹18,000 – ₹24,000 / month",
    match: 62,
    type: "Contract",
  },
  {
    id: "op-4",
    role: "CNC Machine Operator",
    employer: "Precision Auto Components",
    location: "Aurangabad, Maharashtra",
    wage: "₹15,000 – ₹18,500 / month",
    match: 58,
    type: "Full-time",
  },
];

// Career journey timeline — populated as the trainee progresses through the program.
export const CAREER_JOURNEY = [
  {
    key: "training",
    title: "Training",
    status: "complete",
    date: "Jan – Apr 2026",
    summary: "Completed 320-hour Solar Panel Technician course under PMKVY 4.0 at Pune Skill Centre.",
    metric: { label: "Course score", value: "82%" },
  },
  {
    key: "placement",
    title: "Placement",
    status: "complete",
    date: "May 2026",
    summary: "Placed through campus placement drive with Sunrise Energy Pvt. Ltd. after 2 interview rounds.",
    metric: { label: "Offers received", value: "2" },
  },
  {
    key: "employment",
    title: "Employment",
    status: "current",
    date: "Jun 2026 – Present",
    summary: "Working as a Junior Solar Technician. 3-month probation period in progress.",
    metric: { label: "Tenure", value: "3 months" },
  },
  {
    key: "retention",
    title: "Retention",
    status: "upcoming",
    date: "Expected Sep 2026",
    summary: "6-month retention check-in scheduled to confirm continued employment and role fit.",
    metric: { label: "Target", value: "6 months" },
  },
  {
    key: "wage",
    title: "Wage Progression",
    status: "upcoming",
    date: "Projected FY 2026–27",
    summary: "Wage growth tracked against baseline starting salary at placement.",
    metric: { label: "Projected growth", value: "+18%" },
  },
];

export const WAGE_PROGRESSION_DATA = [
  { period: "At Training", wage: 0 },
  { period: "At Placement", wage: 16000 },
  { period: "Month 3", wage: 16000 },
  { period: "Month 6 (proj.)", wage: 17500 },
  { period: "Month 12 (proj.)", wage: 18900 },
];

export const EMPLOYMENT_STATUS_CHIPS = ["Yes, employed", "No, still seeking", "Working as freelancer / self-employed"];
