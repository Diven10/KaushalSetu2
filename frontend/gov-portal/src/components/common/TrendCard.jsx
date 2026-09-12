import { pp } from '../../utils/format';

export default function TrendCard({ title, items, positive }) {
  return (
    <div className="card" style={{ padding: 16, flex: 1, minWidth: 240 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 13.5, fontWeight: 600, color: 'var(--navy-900)' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((d) => (
          <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5 }}>
            <span>{d.name}</span>
            <span className="figure" style={{ fontWeight: 600, color: positive ? 'var(--green-700)' : 'var(--red-700)' }}>
              {pp(d.yoyDelta)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
