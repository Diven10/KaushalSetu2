import React, { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import ProvenanceBadge from "../common/ProvenanceBadge";
import { SKILL_GAP_MATRIX } from "../../data/mockData";

// A transparent, formula-driven projection — same spirit as the government
// portal's Policy Simulator: pick parameters, run it, see baseline vs
// projected, clearly labelled as not a guaranteed outcome.
export default function WhatIfSimulator({ targetRole, baselineReadiness, baselineWage }) {
  const gapRows = SKILL_GAP_MATRIX[targetRole] || SKILL_GAP_MATRIX.default;
  const [skill, setSkill] = useState(gapRows[0]?.skill);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  const selectedGap = useMemo(() => gapRows.find((g) => g.skill === skill), [gapRows, skill]);

  function runSimulation() {
    setRunning(true);
    setTimeout(() => {
      const closeAmount = Math.min(100, selectedGap.current + 20) - selectedGap.current;
      const readinessLift = Math.round((closeAmount / selectedGap.required) * 15);
      const wageLift = Math.round(baselineWage * (readinessLift / 100) * 1.2);
      setResult({
        readiness: Math.min(100, baselineReadiness + readinessLift),
        wage: baselineWage + wageLift,
        readinessLift,
        wageLift,
      });
      setRunning(false);
    }, 500);
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-6">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles size={16} className="text-accent-dark" />
        <h2 className="text-base font-semibold text-ink">What if I close a skill gap?</h2>
      </div>
      <p className="mb-4 text-xs text-ink-soft">
        Pick a skill you're behind on and see the projected effect on your readiness and wage — not a guaranteed outcome.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-ink-soft">Skill to improve</span>
          <select
            value={skill}
            onChange={(e) => {
              setSkill(e.target.value);
              setResult(null);
            }}
            className="rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
          >
            {gapRows.map((g) => (
              <option key={g.skill} value={g.skill}>
                {g.skill}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={runSimulation}
          disabled={running}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-50"
        >
          {running ? "Running…" : "Run simulation"}
        </button>
      </div>

      {result && (
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line-soft pt-4">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-ink-faint">Readiness</p>
              <ProvenanceBadge kind="predicted" />
            </div>
            <p className="mt-1 text-lg font-semibold text-ink">
              {baselineReadiness}% → {result.readiness}%
              <span className="ml-1.5 text-sm font-normal text-success">+{result.readinessLift}pp</span>
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-ink-faint">Est. monthly wage</p>
              <ProvenanceBadge kind="predicted" />
            </div>
            <p className="mt-1 text-lg font-semibold text-ink">
              ₹{baselineWage.toLocaleString("en-IN")} → ₹{result.wage.toLocaleString("en-IN")}
              <span className="ml-1.5 text-sm font-normal text-success">+₹{result.wageLift.toLocaleString("en-IN")}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
