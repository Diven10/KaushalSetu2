import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LineChartCard({ data, xKey, lines, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--grey-200)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'var(--grey-500)' }} axisLine={{ stroke: 'var(--grey-200)' }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--grey-500)' }} axisLine={false} tickLine={false} width={36} />
        <Tooltip
          contentStyle={{ fontSize: 12.5, borderRadius: 6, border: '1px solid var(--grey-200)' }}
          labelStyle={{ fontWeight: 600 }}
        />
        {lines.map((l) => (
          <Line key={l.dataKey} type="monotone" dataKey={l.dataKey} name={l.name || l.dataKey} stroke={l.color || 'var(--gov-blue)'} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
