import { mulberry32, hashStringToSeed, randRange, randInt, pick, clamp } from '../utils/seededRandom';

export const DATASET_LABEL = 'Demonstration Data';
export const DATA_COVERAGE = 'Maharashtra';

// ---------------------------------------------------------------------------
// 36 districts, grouped into rough development tiers so generated values
// correlate the way a real skilling ecosystem would (metro districts tend to
// have stronger placement/retention and smaller skill gaps than remote ones).
// ---------------------------------------------------------------------------
const TIER1 = ['Mumbai City', 'Mumbai Suburban', 'Pune', 'Thane', 'Nagpur', 'Nashik', 'Kolhapur'];
const TIER3 = [
  'Gadchiroli', 'Nandurbar', 'Washim', 'Hingoli', 'Gondia', 'Bhandara', 'Chandrapur',
  'Yavatmal', 'Buldhana', 'Beed', 'Dharashiv', 'Parbhani', 'Jalna',
];
const ALL_DISTRICTS = [
  'Ahilyanagar', 'Akola', 'Amravati', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur',
  'Chhatrapati Sambhajinagar', 'Dharashiv', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli',
  'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur',
  'Nanded', 'Nandurbar', 'Nashik', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri',
  'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal',
];

function tierOf(name) {
  if (TIER1.includes(name)) return 1;
  if (TIER3.includes(name)) return 3;
  return 2;
}

const TIER_RANGES = {
  1: { health: [76, 90], placement: [69, 79], retention: [68, 80], skillGap: [8, 15], salary: [26000, 32000] },
  2: { health: [60, 78], placement: [56, 70], retention: [58, 70], skillGap: [14, 24], salary: [21000, 27000] },
  3: { health: [42, 60], placement: [42, 56], retention: [48, 60], skillGap: [22, 32], salary: [17000, 22000] },
};

// Hand-set anchors from the demonstration brief — kept exact, everything else derives from tiers.
const ANCHORS = {
  'Pune': { healthScore: 82, activeTrainees: 18420, certificationRate: 82.7, placementRate: 71.2, retentionRate: 69.4, skillGap: 12.8, avgSalary: 28400 },
  'Mumbai City': { healthScore: 88, activeTrainees: 15200, certificationRate: 86.1, placementRate: 76.8, retentionRate: 78.2, skillGap: 9.4, avgSalary: 31200 },
  'Nashik': { healthScore: 71, activeTrainees: 11340, certificationRate: 78.0, placementRate: 64.1, retentionRate: 67.3, skillGap: 18.9, avgSalary: 23100 },
  'Nagpur': { healthScore: 68, activeTrainees: 12980, certificationRate: 76.4, placementRate: 66.7, retentionRate: 71.1, skillGap: 21.4, avgSalary: 24200 },
  'Kolhapur': { healthScore: 79, activeTrainees: 8760, certificationRate: 80.9, placementRate: 72.4, retentionRate: 75.1, skillGap: 14.2, avgSalary: 26700 },
  'Gadchiroli': { healthScore: 54, activeTrainees: 2140, certificationRate: 63.2, placementRate: 51.8, retentionRate: 59.2, skillGap: 29.7, avgSalary: 19800 },
};

export const SKILL_CATEGORIES = [
  'IT', 'Manufacturing', 'Healthcare', 'EV', 'Construction', 'Logistics', 'Finance', 'Retail', 'Renewable Energy',
];

const SKILLS = [
  { name: 'Data Analytics', category: 'IT' },
  { name: 'Full Stack Development', category: 'IT' },
  { name: 'Cloud Computing', category: 'IT' },
  { name: 'Cybersecurity Basics', category: 'IT' },
  { name: 'CNC Manufacturing', category: 'Manufacturing' },
  { name: 'Industrial Automation', category: 'Manufacturing' },
  { name: 'Quality Control (Six Sigma)', category: 'Manufacturing' },
  { name: 'Nursing Assistance', category: 'Healthcare' },
  { name: 'Medical Lab Technician', category: 'Healthcare' },
  { name: 'EV Technician', category: 'EV' },
  { name: 'EV Battery Systems', category: 'EV' },
  { name: 'Solar Panel Installation', category: 'Renewable Energy' },
  { name: 'Wind Turbine Maintenance', category: 'Renewable Energy' },
  { name: 'Site Supervision', category: 'Construction' },
  { name: 'Plumbing & Fitting', category: 'Construction' },
  { name: 'Warehouse Operations', category: 'Logistics' },
  { name: 'Fleet & Logistics Management', category: 'Logistics' },
  { name: 'Retail Sales Associate', category: 'Retail' },
  { name: 'E-commerce Operations', category: 'Retail' },
  { name: 'Financial Bookkeeping', category: 'Finance' },
  { name: 'Digital Payments Operations', category: 'Finance' },
];

// ---------------------------------------------------------------------------
// District generation
// ---------------------------------------------------------------------------
function buildDistrict(name) {
  const tier = tierOf(name);
  const ranges = TIER_RANGES[tier];
  const rng = mulberry32(hashStringToSeed(name));
  const anchor = ANCHORS[name];

  const healthScore = anchor ? anchor.healthScore : Math.round(randRange(rng, ...ranges.health));
  const certificationRate = anchor ? anchor.certificationRate : +randRange(rng, 66, 88).toFixed(1);
  const placementRate = anchor ? anchor.placementRate : +randRange(rng, ...ranges.placement).toFixed(1);
  const retentionRate = anchor ? anchor.retentionRate : +randRange(rng, ...ranges.retention).toFixed(1);
  const skillGap = anchor ? anchor.skillGap : +randRange(rng, ...ranges.skillGap).toFixed(1);
  const avgSalary = anchor ? anchor.avgSalary : Math.round(randRange(rng, ...ranges.salary) / 100) * 100;
  const activeTrainees = anchor ? anchor.activeTrainees : randInt(rng, tier === 1 ? 6000 : tier === 2 ? 2500 : 900, tier === 1 ? 19000 : tier === 2 ? 9000 : 3200);

  const certified = Math.round(activeTrainees * (certificationRate / 100));
  const placed = Math.round(certified * (placementRate / 100));
  const employed = Math.round(placed * randRange(rng, 0.9, 0.97));
  const retained = Math.round(employed * (retentionRate / 100));

  // 8-quarter trend ending at current health score, mildly noisy random walk.
  const trendSeries = [];
  let cur = healthScore - randRange(rng, 4, 10) * (tier === 3 ? -1 : 1);
  for (let i = 0; i < 8; i++) {
    cur += randRange(rng, -2.2, tier === 3 ? -1.4 : 2.6);
    trendSeries.push(clamp(+cur.toFixed(1), 30, 96));
  }
  trendSeries[7] = healthScore;
  const qoqDelta = +(trendSeries[7] - trendSeries[6]).toFixed(1);
  const yoyDelta = +(trendSeries[7] - trendSeries[0]).toFixed(1);

  const demand = Math.round(certified * randRange(rng, 1.05, 1.35));
  const supply = certified;

  const districtSkills = SKILLS.map((s) => {
    const gapBase = skillGap + randRange(rng, -8, 8);
    const gap = clamp(+gapBase.toFixed(1), 3, 45);
    const skDemand = randInt(rng, 200, 3200);
    return {
      skill: s.name,
      category: s.category,
      demand: skDemand,
      supply: Math.round(skDemand * (1 - gap / 100)),
      gap,
      placement: clamp(+(placementRate + randRange(rng, -10, 10)).toFixed(1), 30, 92),
      avgSalary: Math.round(avgSalary * randRange(rng, 0.85, 1.25) / 100) * 100,
    };
  });

  const providers = Array.from({ length: randInt(rng, 3, 6) }, (_, i) => ({
    name: `${name} ${pick(rng, ['Skill Center', 'ITI', 'Polytechnic', 'Training Institute', 'Vocational Academy'])} ${i + 1}`,
    trainees: randInt(rng, 300, 3200),
    placementRate: clamp(+(placementRate + randRange(rng, -14, 12)).toFixed(1), 25, 95),
    rating: clamp(+randRange(rng, 2.6, 4.9).toFixed(1), 1, 5),
  }));

  const employers = Array.from({ length: randInt(rng, 3, 5) }, (_, i) => ({
    name: `${pick(rng, ['Bharat', 'Sahyadri', 'Vidarbha', 'Konkan', 'Deccan', 'Metro'])} ${pick(rng, ['Manufacturing', 'Logistics', 'Technologies', 'Healthcare Group', 'Energy', 'Retail'])} ${i + 1}`,
    vacancies: randInt(rng, 20, 400),
    hires: randInt(rng, 10, 250),
    reliabilityScore: clamp(+randRange(rng, 55, 96).toFixed(0), 40, 99),
  }));

  const recommendations = [];
  if (skillGap > 20) recommendations.push('Expand training seats in high-gap skill categories.');
  if (retentionRate < 65) recommendations.push('Strengthen employer retention partnerships and post-placement support.');
  if (placementRate < 60) recommendations.push('Increase employer engagement drives and placement cells.');
  if (recommendations.length === 0) recommendations.push('Maintain current training-to-placement pipeline; monitor emerging skill demand.');

  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    tier,
    healthScore,
    status: healthScore >= 80 ? 'HEALTHY' : healthScore >= 65 ? 'WATCH' : healthScore >= 50 ? 'AT RISK' : 'CRITICAL',
    activeTrainees,
    certificationRate,
    placementRate,
    retentionRate,
    skillGap,
    avgSalary,
    certified,
    placed,
    employed,
    retained,
    demand,
    supply,
    trendSeries,
    qoqDelta,
    yoyDelta,
    trendCategory: yoyDelta >= 4 ? 'Improving' : yoyDelta >= -1 ? 'Stable' : yoyDelta >= -6 ? 'Declining' : 'Significant Decline',
    skills: districtSkills.sort((a, b) => b.gap - a.gap),
    providers,
    employers,
    recommendations,
  };
}

export const DISTRICTS = ALL_DISTRICTS.map(buildDistrict);

export function getDistrict(idOrName) {
  return DISTRICTS.find((d) => d.id === idOrName || d.name === idOrName);
}

export const TOP_IMPROVERS = [...DISTRICTS].sort((a, b) => b.yoyDelta - a.yoyDelta).slice(0, 5);
export const BIGGEST_DECLINES = [...DISTRICTS].sort((a, b) => a.yoyDelta - b.yoyDelta).slice(0, 5);

export const TREND_SUMMARY = {
  improving: DISTRICTS.filter((d) => d.trendCategory === 'Improving').length,
  stable: DISTRICTS.filter((d) => d.trendCategory === 'Stable').length,
  declining: DISTRICTS.filter((d) => d.trendCategory === 'Declining').length,
  significantDecline: DISTRICTS.filter((d) => d.trendCategory === 'Significant Decline').length,
};

// ---------------------------------------------------------------------------
// State-level KPIs (fixed per the demonstration brief)
// ---------------------------------------------------------------------------
export const STATE_SUMMARY = {
  totalTrainees: 247860,
  certificationRate: 81.5,
  placementRate: 68.4,
  retentionRate: 74.2,
  avgSalary: 24680,
  skillGap: 18.7,
  qoq: {
    totalTrainees: 2.1,
    certificationRate: 1.4,
    placementRate: 3.2,
    retentionRate: -0.8,
    avgSalary: 2.6,
    skillGap: -1.1,
  },
};

export const STATE_HEALTH_SCORE = Math.round(DISTRICTS.reduce((s, d) => s + d.healthScore, 0) / DISTRICTS.length);

// ---------------------------------------------------------------------------
// Skill Intelligence (state-level rollup)
// ---------------------------------------------------------------------------
export const STATE_SKILLS = SKILLS.map((s) => {
  const rng = mulberry32(hashStringToSeed(`state-${s.name}`));
  const demand = randInt(rng, 15000, 62000);
  const gap = +randRange(rng, 6, 34).toFixed(1);
  const supply = Math.round(demand * (1 - gap / 100));
  return {
    skill: s.name,
    category: s.category,
    demand,
    supply,
    gap,
    growth: +randRange(rng, -6, 28).toFixed(1),
    placement: clamp(+randRange(rng, 42, 88).toFixed(1), 30, 95),
    salary: Math.round(randRange(rng, 17000, 36000) / 100) * 100,
    risk: gap > 24 ? 'High' : gap > 14 ? 'Medium' : 'Low',
  };
}).sort((a, b) => b.gap - a.gap);

// ---------------------------------------------------------------------------
// Career Outcomes funnel (state-level)
// ---------------------------------------------------------------------------
export const CAREER_FUNNEL = (() => {
  const training = STATE_SUMMARY.totalTrainees;
  const certification = Math.round(training * (STATE_SUMMARY.certificationRate / 100));
  const placement = Math.round(certification * (STATE_SUMMARY.placementRate / 100));
  const employment = Math.round(placement * 0.93);
  const retention = Math.round(employment * (STATE_SUMMARY.retentionRate / 100));
  const progression = Math.round(retention * 0.61);
  return { training, certification, placement, employment, retention, progression };
})();

export const SALARY_PROGRESSION = [
  { stage: 'Entry (Yr 1)', salary: 16800 },
  { stage: 'Yr 2', salary: 19400 },
  { stage: 'Yr 3', salary: 22600 },
  { stage: 'Yr 4', salary: 26100 },
  { stage: 'Yr 5+', salary: 30800 },
];

export const CAREER_PATHWAYS = [
  { from: 'CNC Operator', to: 'Senior CNC Technician', avgYears: 2.4, salaryUplift: 34 },
  { from: 'Data Analytics Trainee', to: 'Junior Data Analyst', avgYears: 1.6, salaryUplift: 41 },
  { from: 'EV Technician', to: 'EV Service Lead', avgYears: 2.1, salaryUplift: 38 },
  { from: 'Retail Associate', to: 'Store Supervisor', avgYears: 2.8, salaryUplift: 29 },
  { from: 'Nursing Assistant', to: 'Staff Nurse (Bridge Program)', avgYears: 3.2, salaryUplift: 46 },
];

// ---------------------------------------------------------------------------
// Early Warning
// ---------------------------------------------------------------------------
export const EARLY_WARNINGS = [
  {
    id: 'ew-pune-data-analytics',
    severity: 'High',
    district: 'Pune',
    skill: 'Data Analytics',
    reason: '12-month retention down 17%',
    signal: 'Retention decline',
    trend: 'declining',
    observedSignal: 'Retention among Data Analytics placements in Pune fell from 74% to 61% over the last three quarters.',
    predictedRisk: 'If unaddressed, projected 12-month retention could fall below 55% within two quarters.',
    contributingFactors: ['Wage growth lagging comparable IT roles', 'Limited career progression paths reported by trainees', 'Two large employer partners reduced retention support programs'],
    recommendedAction: 'Review employer retention partnerships and introduce a 6-month post-placement mentoring checkpoint.',
  },
  {
    id: 'ew-nashik-cnc',
    severity: 'Medium',
    district: 'Nashik',
    skill: 'CNC Manufacturing',
    reason: 'Skill gap increased 21%',
    signal: 'Demand outpacing training supply',
    trend: 'declining',
    observedSignal: 'Employer demand for CNC-certified operators rose 24% while certified supply grew only 3%.',
    predictedRisk: 'Skill gap projected to widen to ~24% within two quarters absent seat expansion.',
    contributingFactors: ['New manufacturing units onboarding in the district', 'Training seat capacity unchanged for 3 quarters', 'Equipment access constraints at 2 training centers'],
    recommendedAction: 'Increase CNC training seats and prioritize equipment upgrades at capacity-constrained centers.',
  },
  {
    id: 'ew-nagpur-ev',
    severity: 'Medium',
    district: 'Nagpur',
    skill: 'EV Technician',
    reason: 'Demand increased 19%',
    signal: 'Emerging capacity constraint',
    trend: 'watch',
    observedSignal: 'EV Technician job postings in Nagpur grew 19% quarter-on-quarter, outpacing enrollment growth of 6%.',
    predictedRisk: 'Training capacity may become insufficient within 2-3 quarters as EV manufacturing investment continues.',
    contributingFactors: ['New EV assembly plant announcement in the district', 'Limited certified EV trainers', 'Long lead time to certify new training centers'],
    recommendedAction: 'Fast-track EV trainer certification and evaluate a new training center in the district.',
  },
  {
    id: 'ew-gadchiroli-general',
    severity: 'High',
    district: 'Gadchiroli',
    skill: 'General Vocational',
    reason: 'Placement rate 20 pp below state average',
    signal: 'Persistent placement shortfall',
    trend: 'declining',
    observedSignal: 'Placement rate has remained below 55% for four consecutive quarters, against a state average of 68.4%.',
    predictedRisk: 'Continued shortfall risks trainee attrition from the program and reduced enrollment next intake cycle.',
    contributingFactors: ['Low local employer density', 'Limited transport connectivity to industrial clusters', 'Narrow skill-category mix offered locally'],
    recommendedAction: 'Introduce placement camps linking trainees to employers in neighbouring industrial districts.',
  },
  {
    id: 'ew-solapur-textile',
    severity: 'Low',
    district: 'Solapur',
    skill: 'Textile Manufacturing',
    reason: 'Mild placement softening',
    signal: 'Early softening in placement rate',
    trend: 'watch',
    observedSignal: 'Placement rate for Textile Manufacturing trainees eased 4 pp over two quarters.',
    predictedRisk: 'Low near-term risk; likely seasonal, but worth monitoring for one more quarter.',
    contributingFactors: ['Seasonal order slowdown reported by 3 employer partners'],
    recommendedAction: 'Monitor next-quarter placement data before recommending intervention.',
  },
  {
    id: 'ew-kolhapur-improving',
    severity: 'Improving',
    district: 'Kolhapur',
    skill: 'Industrial Automation',
    reason: 'Placement up 8.4 pp year-on-year',
    signal: 'Sustained improvement',
    trend: 'improving',
    observedSignal: 'Placement rate for Industrial Automation trainees rose from 64% to 72.4% over four quarters.',
    predictedRisk: 'Low risk; trajectory expected to hold if current employer partnerships continue.',
    contributingFactors: ['New employer MoUs signed in the last two quarters', 'Curriculum updated to match employer-specified tooling'],
    recommendedAction: 'Document and replicate the employer-partnership model in comparable districts.',
  },
];

// ---------------------------------------------------------------------------
// Policy Simulator
// ---------------------------------------------------------------------------
export const SIMULATOR_SKILLS = ['Data Analytics', 'CNC Manufacturing', 'EV Technician', 'Nursing Assistance', 'Solar Panel Installation', 'Warehouse Operations'];
export const SIMULATOR_INTERVENTIONS = [
  'Increase Training Seats',
  'Improve Certification',
  'Improve Placement',
  'Improve Retention',
  'Increase Employer Participation',
];
export const SIMULATOR_HORIZONS = ['6 months', '12 months', '24 months'];

export const DEMO_SIMULATION = {
  district: 'Pune',
  skill: 'Data Analytics',
  intervention: 'Increase Training Seats',
  quantity: 250,
  horizon: '12 months',
  results: {
    placement: { from: 68.4, to: 76.2 },
    employment: { from: 61.7, to: 69.4 },
    retention: { from: 74.2, to: 78.1 },
    skillGap: { from: 32900, to: 27800 },
    impactScore: 82,
    confidence: 78,
  },
};

// A lightweight, transparent (non-ML) projection function — this stands in for
// the FastAPI /simulate endpoint. It nudges baseline metrics in the direction
// implied by the chosen intervention, scaled by quantity and horizon.
export function runSimulation({ district, skill, intervention, quantity, horizon }) {
  const d = getDistrict(district) || DISTRICTS[0];
  const horizonFactor = horizon === '6 months' ? 0.55 : horizon === '24 months' ? 1.35 : 1;
  const qtyFactor = clamp(quantity / 250, 0.3, 2.2);

  const weights = {
    'Increase Training Seats': { placement: 0.55, employment: 0.5, retention: 0.1, gapReduction: 0.6 },
    'Improve Certification': { placement: 0.35, employment: 0.3, retention: 0.15, gapReduction: 0.3 },
    'Improve Placement': { placement: 0.9, employment: 0.75, retention: 0.2, gapReduction: 0.25 },
    'Improve Retention': { placement: 0.1, employment: 0.15, retention: 0.85, gapReduction: 0.1 },
    'Increase Employer Participation': { placement: 0.7, employment: 0.65, retention: 0.4, gapReduction: 0.35 },
  }[intervention] || { placement: 0.4, employment: 0.4, retention: 0.2, gapReduction: 0.3 };

  const magnitude = 9.2 * horizonFactor * qtyFactor;

  const placementFrom = d.placementRate;
  const placementTo = clamp(placementFrom + magnitude * weights.placement, placementFrom, 96);
  const employmentBase = d.placed > 0 ? (d.employed / d.placed) * 100 : 90;
  const employmentFrom = +employmentBase.toFixed(1);
  const employmentTo = clamp(employmentFrom + magnitude * weights.employment, employmentFrom, 96);
  const retentionFrom = d.retentionRate;
  const retentionTo = clamp(retentionFrom + magnitude * weights.retention, retentionFrom, 92);

  const gapUnitsFrom = Math.round(d.demand * (d.skillGap / 100) * 10);
  const gapUnitsTo = Math.round(gapUnitsFrom * (1 - clamp(weights.gapReduction * horizonFactor * qtyFactor * 0.28, 0.03, 0.55)));

  const impactScore = clamp(
    Math.round(50 + (placementTo - placementFrom) * 1.6 + (retentionTo - retentionFrom) * 1.3 + qtyFactor * 4),
    30, 98,
  );
  const confidence = clamp(Math.round(85 - horizonFactor * 10 - qtyFactor * 4), 45, 92);

  return {
    district: d.name,
    skill,
    intervention,
    quantity,
    horizon,
    placement: { from: +placementFrom.toFixed(1), to: +placementTo.toFixed(1) },
    employment: { from: employmentFrom, to: +employmentTo.toFixed(1) },
    retention: { from: +retentionFrom.toFixed(1), to: +retentionTo.toFixed(1) },
    skillGap: { from: gapUnitsFrom, to: gapUnitsTo },
    impactScore,
    confidence,
  };
}

// ---------------------------------------------------------------------------
// Impact & Reports
// ---------------------------------------------------------------------------
export const IMPACT_SCORE_COMPONENTS = [
  { label: 'Placement', weight: 30, score: 74 },
  { label: 'Retention', weight: 25, score: 71 },
  { label: 'Skill Alignment', weight: 20, score: 66 },
  { label: 'Employment', weight: 15, score: 78 },
  { label: 'Salary Growth', weight: 10, score: 69 },
];

export const IMPACT_SCORE = Math.round(
  IMPACT_SCORE_COMPONENTS.reduce((s, c) => s + c.score * (c.weight / 100), 0),
);

export const DISTRICT_IMPACT_RANKING = [...DISTRICTS]
  .sort((a, b) => b.healthScore - a.healthScore)
  .map((d, i) => ({ rank: i + 1, district: d.name, impactScore: clamp(d.healthScore - randInt(mulberry32(hashStringToSeed('impact-' + d.name)), 0, 6), 30, 99) }));

export const INTERVENTION_EFFECTIVENESS = [
  { intervention: 'Increase Training Seats', avgPlacementLift: 6.8, avgRetentionLift: 1.2, deployments: 14 },
  { intervention: 'Improve Certification', avgPlacementLift: 4.1, avgRetentionLift: 1.9, deployments: 9 },
  { intervention: 'Improve Placement', avgPlacementLift: 8.9, avgRetentionLift: 2.4, deployments: 11 },
  { intervention: 'Improve Retention', avgPlacementLift: 1.4, avgRetentionLift: 7.6, deployments: 7 },
  { intervention: 'Increase Employer Participation', avgPlacementLift: 7.2, avgRetentionLift: 4.5, deployments: 12 },
];
