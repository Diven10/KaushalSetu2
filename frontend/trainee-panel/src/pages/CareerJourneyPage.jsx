import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import TopBar from "../components/layout/TopBar";
import TimelineNode from "../components/journey/TimelineNode";
import WhatIfSimulator from "../components/journey/WhatIfSimulator";
import ProvenanceBadge from "../components/common/ProvenanceBadge";
import { useProfile } from "../context/ProfileContext";
import { useAppData } from "../context/AppDataContext";
import { useLanguage } from "../context/LanguageContext";
import { CAREER_JOURNEY, WAGE_PROGRESSION_DATA, SKILL_GAP_MATRIX } from "../data/mockData";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 text-xs shadow-panel">
      <p className="font-medium text-ink">{label}</p>
      <p className="text-ink-soft">
        {payload[0].value > 0 ? `₹${payload[0].value.toLocaleString("en-IN")} / month` : "Pre-employment"}
      </p>
    </div>
  );
}

// Builds extra timeline entries from live application/assessment activity,
// so the journey reflects what's actually happening instead of only the
// fixed demo narrative.
function buildActivityNodes(applications, assessments) {
  const nodes = [];
  applications.forEach((app) => {
    app.history.forEach((h) => {
      nodes.push({
        key: `app-${app.id}-${h.stage}`,
        title: `${app.employer} — ${h.stage}`,
        status: h.stage === "Hired" ? "complete" : "current",
        date: h.date,
        summary: h.note,
        metric: { label: "Role", value: app.role },
      });
    });
  });
  assessments
    .filter((a) => a.status === "Evaluated" || a.status === "Submitted")
    .forEach((a) => {
      nodes.push({
        key: `assess-${a.id}`,
        title: `${a.title}`,
        status: a.status === "Evaluated" ? "complete" : "current",
        date: a.submittedOn || a.dueDate,
        summary: `${a.employer} · ${a.status === "Evaluated" ? `Scored ${a.score}%` : "Submitted, awaiting review"}`,
        metric: { label: "Type", value: a.type === "test" ? "Test" : "Problem Statement" },
      });
    });
  return nodes.sort((a, b) => new Date(a.date) - new Date(b.date));
}

export default function CareerJourneyPage() {
  const { profile } = useProfile();
  const { applications, assessments } = useAppData();
  const { t } = useLanguage();

  const activityNodes = useMemo(
    () => buildActivityNodes(applications, assessments),
    [applications, assessments]
  );

  const timeline = useMemo(
    () => [...CAREER_JOURNEY.filter((s) => s.status !== "upcoming"), ...activityNodes, ...CAREER_JOURNEY.filter((s) => s.status === "upcoming")],
    [activityNodes]
  );

  const preferredRole = profile.preferences.roles?.[0];
  const gapRows = SKILL_GAP_MATRIX[preferredRole] || SKILL_GAP_MATRIX.default;
  const readiness = Math.round(
    gapRows.reduce((sum, r) => sum + Math.min(r.current / r.required, 1), 0) / gapRows.length * 100
  );
  const baselineWage = WAGE_PROGRESSION_DATA.find((w) => w.wage > 0)?.wage || 16000;

  return (
    <>
      <TopBar title={t("journey_title")} subtitle={t("journey_subtitle")} />
      <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-thin">
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 rounded-lg border border-line bg-surface p-6">
            <h2 className="mb-6 text-base font-semibold text-ink">Timeline</h2>
            <div>
              {timeline.map((item, idx) => (
                <TimelineNode key={item.key} item={item} isLast={idx === timeline.length - 1} />
              ))}
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-5">
            <div className="rounded-lg border border-line bg-surface p-6">
              <div className="mb-0.5 flex items-center gap-2">
                <h2 className="text-base font-semibold text-ink">Wage progression</h2>
                <ProvenanceBadge kind="predicted" />
              </div>
              <p className="mb-4 mt-0.5 text-xs text-ink-soft">Monthly wage tracked against baseline at placement.</p>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <LineChart data={WAGE_PROGRESSION_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="#E3E6EC" vertical={false} />
                    <XAxis
                      dataKey="period"
                      tick={{ fontSize: 10, fill: "#8A93A3" }}
                      axisLine={{ stroke: "#E3E6EC" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#8A93A3" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => (v === 0 ? "₹0" : `₹${v / 1000}k`)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="wage"
                      stroke="#C9762C"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#C9762C" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border border-line bg-surface p-6">
              <h2 className="text-base font-semibold text-ink">What determines progression</h2>
              <ul className="mt-3 flex flex-col gap-3 text-sm text-ink-soft">
                <li className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Retention checkpoints at 3, 6, and 12 months confirm continued employment.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Wage data is self-reported and cross-verified with employer records where available.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  Closing skill gaps early tends to correlate with faster wage growth.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <WhatIfSimulator targetRole={preferredRole || "default"} baselineReadiness={readiness} baselineWage={baselineWage} />
        </div>
      </div>
    </>
  );
}
