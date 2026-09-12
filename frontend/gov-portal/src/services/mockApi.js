import {
  STATE_SUMMARY, STATE_HEALTH_SCORE, DISTRICTS, getDistrict, TOP_IMPROVERS, BIGGEST_DECLINES,
  TREND_SUMMARY, STATE_SKILLS, CAREER_FUNNEL, SALARY_PROGRESSION, CAREER_PATHWAYS,
  EARLY_WARNINGS, runSimulation, IMPACT_SCORE, IMPACT_SCORE_COMPONENTS, DISTRICT_IMPACT_RANKING,
  INTERVENTION_EFFECTIVENESS,
} from '../data/mockGovernmentData';

// Simulated network latency so loading states are visible/testable, kept short
// so the 36-district table and charts stay responsive.
const LATENCY = 180;

function resolveAfter(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY));
}

export const mockApi = {
  getStateSummary: () => resolveAfter({ ...STATE_SUMMARY, healthScore: STATE_HEALTH_SCORE }),
  getDistricts: () => resolveAfter(DISTRICTS),
  getDistrict: (idOrName) => resolveAfter(getDistrict(idOrName)),
  getDistrictTrends: () => resolveAfter({ topImprovers: TOP_IMPROVERS, biggestDeclines: BIGGEST_DECLINES, summary: TREND_SUMMARY }),
  getStateSkills: () => resolveAfter(STATE_SKILLS),
  getCareerOutcomes: () => resolveAfter({ funnel: CAREER_FUNNEL, salaryProgression: SALARY_PROGRESSION, pathways: CAREER_PATHWAYS }),
  getEarlyWarnings: () => resolveAfter(EARLY_WARNINGS),
  getEarlyWarning: (id) => resolveAfter(EARLY_WARNINGS.find((w) => w.id === id)),
  runSimulation: (params) => resolveAfter(runSimulation(params)),
  getImpactReport: () => resolveAfter({
    score: IMPACT_SCORE,
    components: IMPACT_SCORE_COMPONENTS,
    ranking: DISTRICT_IMPACT_RANKING,
    interventions: INTERVENTION_EFFECTIVENESS,
  }),
};
