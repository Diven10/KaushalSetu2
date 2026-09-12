import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function BarChartCard({ data, xKey, bars, height = 240, layout = 'horizontal' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={layout} margin={{ top: 8, right: 12, left: layout === 'vertical' ? 40 : -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--grey-200)" horizontal={layout !== 'vertical'} vertical={layout === 'vertical'} />
        {layout === 'vertical' ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--grey-500)' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey={xKey} tick={{ fontSize: 11, fill: 'var(--charcoal)' }} axisLine={false} tickLine={false} width={130} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'var(--grey-500)' }} axisLine={{ stroke: 'var(--grey-200)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--grey-500)' }} axisLine={false} tickLine={false} width={36} />
          </>
        )}
        <Tooltip contentStyle={{ fontSize: 12.5, borderRadius: 6, border: '1px solid var(--grey-200)' }} />
        {bars.map((b) => (
          <Bar key={b.dataKey} dataKey={b.dataKey} name={b.name || b.dataKey} fill={b.color || 'var(--gov-blue)'} radius={layout === 'vertical' ? [0, 3, 3, 0] : [3, 3, 0, 0]}>
            {b.colorByValue && data.map((entry, i) => <Cell key={i} fill={b.colorByValue(entry)} />)}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
