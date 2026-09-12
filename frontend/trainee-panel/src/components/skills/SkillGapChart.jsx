import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 text-xs shadow-panel">
      <p className="mb-1 font-medium text-ink">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function SkillGapChart({ data }) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid stroke="#E3E6EC" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#8A93A3" }} axisLine={{ stroke: "#E3E6EC" }} tickLine={false} />
          <YAxis
            type="category"
            dataKey="skill"
            width={130}
            tick={{ fontSize: 11, fill: "#14213D" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F6F7FA" }} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#5B6472" }}
            formatter={(value) => (value === "current" ? "Your level" : "Required")}
          />
          <Bar dataKey="required" name="required" fill="#E3E6EC" radius={[0, 4, 4, 0]} barSize={10} />
          <Bar dataKey="current" name="current" fill="#C9762C" radius={[0, 4, 4, 0]} barSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
