import React, { useEffect, useMemo, useState } from "react";
import TopBar from "../components/layout/TopBar";
import SkillGapChart from "../components/skills/SkillGapChart";
import OpportunityCard from "../components/skills/OpportunityCard";
import ReadinessTrendChart from "../components/skills/ReadinessTrendChart";
import CourseSuggestionCard from "../components/skills/CourseSuggestionCard";
import PeerBenchmarkCard from "../components/skills/PeerBenchmarkCard";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import { useProfile } from "../context/ProfileContext";
import { useAppData } from "../context/AppDataContext";
import { useLanguage } from "../context/LanguageContext";
import { SKILL_GAP_MATRIX, JOB_ROLES } from "../data/mockData";
import { fetchOccupations, fetchSkillGap } from "../services/api";
import { READINESS_HISTORY } from "../data/appData";
import { SlidersHorizontal } from "lucide-react";

const WAGE_FILTERS = ["Any wage", "Under ₹15,000", "₹15,000 – ₹20,000", "Above ₹20,000"];
const TYPE_FILTERS = ["Any type", "Full-time", "Contract"];

function wageMidpoint(wageStr) {
  const nums = wageStr.replace(/[₹,]/g, "").match(/\d+/g);
  if (!nums) return 0;
  const values = nums.map(Number);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export default function SkillsOpportunitiesPage() {
  const { profile } = useProfile();
  const { opportunities } = useAppData();
  const { t } = useLanguage();
  const defaultRole = profile.preferences.roles?.[0] || JOB_ROLES[0];
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [locationFilter, setLocationFilter] = useState("");
  const [wageFilter, setWageFilter] = useState(WAGE_FILTERS[0]);
  const [typeFilter, setTypeFilter] = useState(TYPE_FILTERS[0]);

  // Roles come from the platform's occupation list when the backend is up,
  // and the gap itself is measured against that occupation's real demand
  // profile. Both fall back to the bundled matrix if the backend is down.
  const [roleOptions, setRoleOptions] = useState(JOB_ROLES);
  const [gapData, setGapData] = useState(
    () => SKILL_GAP_MATRIX[defaultRole] || SKILL_GAP_MATRIX.default
  );
  const [matchScore, setMatchScore] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchOccupations().then((list) => {
      if (!cancelled && Array.isArray(list) && list.length) {
        setRoleOptions(list.map((o) => o.name));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchSkillGap(targetRole).then((result) => {
      if (cancelled) return;
      const rows = result?.rows?.length
        ? result.rows
        : SKILL_GAP_MATRIX[targetRole] || SKILL_GAP_MATRIX.default;
      setGapData(rows);
      setMatchScore(result?.matchScore ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [targetRole]);

  const criticalGaps = gapData.filter((r) => r.required - r.current >= 10);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((op) => {
      if (locationFilter && !op.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      if (typeFilter !== "Any type" && op.type !== typeFilter) return false;
      if (wageFilter !== "Any wage") {
        const mid = wageMidpoint(op.wage);
        if (wageFilter === "Under ₹15,000" && mid >= 15000) return false;
        if (wageFilter === "₹15,000 – ₹20,000" && (mid < 15000 || mid > 20000)) return false;
        if (wageFilter === "Above ₹20,000" && mid <= 20000) return false;
      }
      return true;
    });
  }, [opportunities, locationFilter, wageFilter, typeFilter]);

  return (
    <>
      <TopBar title={t("skills_title")} subtitle={t("skills_subtitle")} />
      <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 rounded-lg border border-line bg-surface p-6">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">Skill gap analysis</h2>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Comparing your current proficiency to what employers expect
                  {matchScore !== null ? ` — you currently match ${matchScore}% of this role.` : "."}
                </p>
              </div>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <SkillGapChart data={gapData} />

            {criticalGaps.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {criticalGaps.map((g) => (
                  <Badge key={g.skill} tone="warn">
                    {g.skill}: {g.required - g.current} pts to close
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-line bg-surface p-6">
            <h2 className="mb-1 text-base font-semibold text-ink">Readiness trend</h2>
            <p className="mb-2 text-xs text-ink-soft">Overall readiness across the last 4 months.</p>
            <ReadinessTrendChart data={READINESS_HISTORY} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-5">
          <CourseSuggestionCard criticalGaps={criticalGaps} />
          <PeerBenchmarkCard role={targetRole} district={profile.identity.district} />
        </div>

        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-ink">Recommended opportunities</h2>
            <span className="text-xs text-ink-faint">{filteredOpportunities.length} of {opportunities.length} matches</span>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-line bg-surface p-3.5">
            <SlidersHorizontal size={14} className="text-ink-faint" />
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Filter by location…"
              className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none"
            />
            <select
              value={wageFilter}
              onChange={(e) => setWageFilter(e.target.value)}
              className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs text-ink focus:border-ink focus:outline-none"
            >
              {WAGE_FILTERS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs text-ink focus:border-ink focus:outline-none"
            >
              {TYPE_FILTERS.map((tp) => (
                <option key={tp} value={tp}>{tp}</option>
              ))}
            </select>
          </div>

          {filteredOpportunities.length === 0 ? (
            <EmptyState title="No opportunities match these filters" description="Try widening your location or wage filter." />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredOpportunities.map((op) => (
                <OpportunityCard key={op.id} opportunity={op} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
