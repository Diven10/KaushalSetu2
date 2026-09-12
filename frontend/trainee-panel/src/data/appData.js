// Extended mock data layer for Applications, Assessments (Test & PS), Skill
// history, course recommendations, peer benchmarking, and DigiLocker.
// Same spirit as mockData.js: static now, isolated so a real backend/API
// layer can replace it without touching components.

// ---------------------------------------------------------------------------
// Opportunities — richer than the dashboard preview cards: adds an id,
// description and required-skill tags so Apply / detail views have something
// to work with.
// ---------------------------------------------------------------------------
export const OPPORTUNITY_DETAILS = {
  "op-1": {
    description:
      "Install, wire and commission rooftop solar arrays for residential and small-commercial clients across Pune district. On-the-job mentoring for the first 60 days.",
    requiredSkills: ["Electrical Wiring", "Panel Installation", "Safety Compliance"],
    postedDaysAgo: 6,
  },
  "op-2": {
    description:
      "Handle residential electrical maintenance, fault diagnosis and new-installation wiring for facility contracts in Nashik.",
    requiredSkills: ["Circuit Diagnosis", "Wiring Standards", "Safety Compliance"],
    postedDaysAgo: 3,
  },
  "op-3": {
    description:
      "Support front-end feature work on internal tools using HTML, CSS and JavaScript. Fully remote, small team, code review on every change.",
    requiredSkills: ["JavaScript", "Responsive Design", "Version Control"],
    postedDaysAgo: 11,
  },
  "op-4": {
    description:
      "Operate and monitor CNC machines producing precision auto components; includes basic quality-check and tooling changeover duties.",
    requiredSkills: ["Tool Handling", "Safety Compliance"],
    postedDaysAgo: 2,
  },
};

// ---------------------------------------------------------------------------
// Applications — the pipeline a job application moves through once a
// trainee taps "Apply". Assessments (below) hang off an application once it
// reaches the "Assessment" stage.
// ---------------------------------------------------------------------------
export const APPLICATION_STAGES = ["Applied", "Shortlisted", "Assessment", "Interview", "Hired"];

// Seed a couple of applications so the Applications page isn't empty on
// first load — mirrors how a real trainee would already have some history.
export const SEED_APPLICATIONS = [
  {
    id: "app-seed-1",
    opportunityId: "op-1",
    role: "Solar Panel Technician",
    employer: "Sunrise Energy Pvt. Ltd.",
    location: "Pune, Maharashtra",
    wage: "₹16,000 – ₹19,000 / month",
    stage: "Assessment",
    rejected: false,
    appliedOn: "2026-08-24",
    history: [
      { stage: "Applied", date: "2026-08-24", note: "Application submitted." },
      { stage: "Shortlisted", date: "2026-08-27", note: "Shortlisted after profile review." },
      { stage: "Assessment", date: "2026-08-29", note: "Employer assigned a pre-hiring assessment." },
    ],
  },
  {
    id: "app-seed-2",
    opportunityId: "op-2",
    role: "Electrician (Residential)",
    employer: "Urban Homes Facility Services",
    location: "Nashik, Maharashtra",
    wage: "₹14,500 – ₹17,000 / month",
    stage: "Applied",
    rejected: false,
    appliedOn: "2026-09-02",
    history: [{ stage: "Applied", date: "2026-09-02", note: "Application submitted." }],
  },
];

// ---------------------------------------------------------------------------
// Assessments — the "Test & PS" module. type: "test" (auto-graded MCQ) or
// "ps" (Problem Statement — free-text / file submission, manually reviewed).
// ---------------------------------------------------------------------------
export const SEED_ASSESSMENTS = [
  {
    id: "assess-1",
    applicationId: "app-seed-1",
    employer: "Sunrise Energy Pvt. Ltd.",
    role: "Solar Panel Technician",
    title: "Solar Installation Safety & Fundamentals Test",
    type: "test",
    skillsTested: ["Safety Compliance", "Electrical Wiring", "Panel Installation"],
    durationMinutes: 20,
    dueDate: "2026-09-14",
    passThreshold: 60,
    status: "Assigned", // Assigned -> In Progress -> Submitted -> Evaluated
    score: null,
    questions: [
      {
        id: "q1",
        prompt: "Before working on a rooftop solar array, what is the FIRST safety step?",
        options: [
          "Start wiring the panels immediately to save time",
          "Isolate and lock out the DC/AC supply, then verify with a meter",
          "Ask a colleague to hold the ladder",
          "Check the weather forecast for next week",
        ],
        correctIndex: 1,
      },
      {
        id: "q2",
        prompt: "A multimeter reads open-circuit voltage far below the panel's rated Voc. This most likely indicates:",
        options: [
          "The panel is fully shaded and working correctly",
          "A loose or faulty connection / cell damage",
          "The multimeter needs new batteries only",
          "This is always normal at midday",
        ],
        correctIndex: 1,
      },
      {
        id: "q3",
        prompt: "Which mounting practice is correct for a sloped tin roof installation?",
        options: [
          "Drill anywhere convenient and seal with tape",
          "Use roof-appropriate flashed mounts aligned to rafters, then seal",
          "Rest panels directly on the roof without fixings",
          "Mount panels facing north in the northern hemisphere",
        ],
        correctIndex: 1,
      },
      {
        id: "q4",
        prompt: "A customer asks why their panel output dropped 15% after 2 years. Best first response:",
        options: [
          "Tell them solar panels always fail after 2 years",
          "Offer to inspect for soiling, shading changes, or connection issues before assuming degradation",
          "Refuse to discuss it",
          "Immediately recommend full replacement",
        ],
        correctIndex: 1,
      },
      {
        id: "q5",
        prompt: "Which PPE is essential for rooftop panel installation work?",
        options: [
          "None, since panels are lightweight",
          "Fall-arrest harness, insulated gloves, non-slip footwear",
          "A raincoat only",
          "Sunglasses only",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "assess-2",
    applicationId: null,
    employer: "NextGen Softworks",
    role: "Junior Web Developer",
    title: "Landing Page Build — Problem Statement",
    type: "ps",
    skillsTested: ["JavaScript", "Responsive Design"],
    durationMinutes: null,
    dueDate: "2026-09-20",
    passThreshold: null,
    status: "Assigned",
    score: null,
    brief:
      "Build a small responsive landing page (HTML/CSS/JS only, no frameworks) for a fictional tuition service. It should work on both mobile and desktop widths and include a working contact form with client-side validation. Submit a short write-up of your approach and a link or pasted code below.",
  },
];

// Notifications are derived (not persisted) from profile + application +
// assessment state inside AppDataContext — see buildNotifications() there.

// ---------------------------------------------------------------------------
// Course recommendations — one or two short, named options per skill so a
// critical skill-gap badge has somewhere to send the trainee.
// ---------------------------------------------------------------------------
export const COURSES_BY_SKILL = {
  "Electrical Wiring": [{ name: "Advanced Residential Wiring (PMKVY bridge module)", hours: 24 }],
  "Panel Installation": [{ name: "Rooftop Solar Mounting & Commissioning", hours: 16 }],
  "Multimeter Testing": [{ name: "Electrical Testing & Diagnostics Basics", hours: 10 }],
  "Customer Handling": [{ name: "Field Service Communication Skills", hours: 6 }],
  JavaScript: [{ name: "JavaScript for the Web — Intermediate", hours: 20 }],
  "Version Control": [{ name: "Git & GitHub Essentials", hours: 5 }],
  "Responsive Design": [{ name: "Responsive Layouts with CSS", hours: 12 }],
  "Client Communication": [{ name: "Field Service Communication Skills", hours: 6 }],
  "Digital Literacy": [{ name: "Basic Digital Literacy Bridge Course", hours: 8 }],
  Communication: [{ name: "Workplace Communication Foundations", hours: 6 }],
  "Problem Solving": [{ name: "Applied Problem Solving for Technicians", hours: 8 }],
};

// ---------------------------------------------------------------------------
// Peer benchmarking — small, keyed by role. In production this would come
// from an anonymized aggregate query over other trainees, the same way the
// government portal aggregates across districts.
// ---------------------------------------------------------------------------
export const ROLE_BENCHMARKS = {
  "Solar Panel Technician": { avgWage: 17200, avgDaysToPlacement: 34, sampleSize: 412 },
  "Web Developer": { avgWage: 19800, avgDaysToPlacement: 51, sampleSize: 168 },
  Electrician: { avgWage: 15600, avgDaysToPlacement: 29, sampleSize: 588 },
  default: { avgWage: 15900, avgDaysToPlacement: 38, sampleSize: 950 },
};

// ---------------------------------------------------------------------------
// Readiness history — used for the small trend line on Skills &
// Opportunities, so a single snapshot isn't the only view of progress.
// ---------------------------------------------------------------------------
export const READINESS_HISTORY = [
  { period: "Jun", readiness: 48 },
  { period: "Jul", readiness: 55 },
  { period: "Aug", readiness: 63 },
  { period: "Sep", readiness: 68 },
];

// ---------------------------------------------------------------------------
// DigiLocker — mocked document fetch. Real integration requires onboarding
// as a Requester via the DigiLocker / API Setu partner ecosystem; this
// stands in behind the same swappable-facade pattern as the rest of the app.
// ---------------------------------------------------------------------------
export const DIGILOCKER_DOCUMENT_TYPES = [
  { key: "aadhaar", label: "Aadhaar e-KYC", issuer: "UIDAI" },
  { key: "marksheet", label: "Highest Qualification Marksheet", issuer: "State Education Board" },
  { key: "certificate", label: "Training Certificate", issuer: "Skill Council / NSDC" },
];
