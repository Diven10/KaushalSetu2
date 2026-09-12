import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PALETTE = ['#1e56a0', '#1c7a4c', '#b5560f', '#7c5cbf', '#c9a227', '#b32424'];

export default function DonutChartCard({ data, nameKey, valueKey, height = 220, centerLabel }) {
  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius="62%" outerRadius="90%" paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 12.5, borderRadius: 6, border: '1px solid var(--grey-200)' }} />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
        }}
        >
          {centerLabel}
        </div>
      )}
    </div>
  );
}
