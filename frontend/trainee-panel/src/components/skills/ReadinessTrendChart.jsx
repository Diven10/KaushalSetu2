import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ReadinessTrendChart({ data }) {
  return (
    <div style={{ width: "100%", height: 120 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="period" tick={{ fontSize: 10, fill: "#8A93A3" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#8A93A3" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            formatter={(v) => [`${v}%`, "Readiness"]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E3E6EC" }}
          />
          <Line type="monotone" dataKey="readiness" stroke="#14213D" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
