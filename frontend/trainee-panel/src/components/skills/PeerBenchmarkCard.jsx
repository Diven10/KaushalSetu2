import React from "react";
import { Users } from "lucide-react";
import ProvenanceBadge from "../common/ProvenanceBadge";
import { ROLE_BENCHMARKS } from "../../data/appData";

export default function PeerBenchmarkCard({ role, district }) {
  const bench = ROLE_BENCHMARKS[role] || ROLE_BENCHMARKS.default;

  return (
    <div className="rounded-lg border border-line bg-surface p-6">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-accent-dark" />
          <h2 className="text-base font-semibold text-ink">How you compare</h2>
        </div>
        <ProvenanceBadge kind="predicted" />
      </div>
      <p className="mb-4 text-xs text-ink-soft">
        Anonymised average across {bench.sampleSize.toLocaleString("en-IN")} trainees pursuing{" "}
        <span className="font-medium text-ink">{role}</span>{district ? ` in ${district}` : ""}.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-lg font-semibold text-ink">₹{bench.avgWage.toLocaleString("en-IN")}</p>
          <p className="text-xs text-ink-faint">Average starting wage</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-ink">{bench.avgDaysToPlacement} days</p>
          <p className="text-xs text-ink-faint">Average time to placement</p>
        </div>
      </div>
    </div>
  );
}
