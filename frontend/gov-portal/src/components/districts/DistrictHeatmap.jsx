import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pct, inr } from '../../utils/format';

const METRICS = [
  { key: 'skillGap', label: 'Skill Gap', fmt: pct, invert: true },
  { key: 'placementRate', label: 'Placement', fmt: pct, invert: false },
  { key: 'retentionRate', label: 'Retention', fmt: pct, invert: false },
  { key: 'demand', label: 'Demand', fmt: (v) => v.toLocaleString('en-IN'), invert: false },
  { key: 'supply', label: 'Supply', fmt: (v) => v.toLocaleString('en-IN'), invert: false },
  { key: 'avgSalary', label: 'Avg Salary', fmt: inr, invert: false },
];

// Maps a 0..1 intensity to a color on a red -> yellow -> green scale (or
// reversed for metrics where "high" is bad, like skill gap).
function colorFor(t, invert) {
  const v = invert ? 1 - t : t;
  if (v < 0.33) return '#f4c7c2';
  if (v < 0.5) return '#f7d9a8';
  if (v < 0.66) return '#fbe79c';
  if (v < 0.82) return '#c7e3c9';
  return '#8fcf9a';
}

export default function DistrictHeatmap({ districts }) {
  const navigate = useNavigate();
  const [metricKey, setMetricKey] = useState('skillGap');
  const [hovered, setHovered] = useState(null);
  const metric = METRICS.find((m) => m.key === metricKey);

  const { min, max } = useMemo(() => {
    const values = districts.map((d) => d[metricKey]);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [districts, metricKey]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetricKey(m.key)}
            style={{
              padding: '5px 12px', fontSize: 12.5, borderRadius: 999, cursor: 'pointer',
              border: `1px solid ${metricKey === m.key ? 'var(--gov-blue)' : 'var(--grey-200)'}`,
              background: metricKey === m.key ? 'var(--gov-blue)' : 'var(--white)',
              color: metricKey === m.key ? 'var(--white)' : 'var(--charcoal-600)',
              fontWeight: 600,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, position: 'relative',
      }}
      >
        {districts.map((d) => {
          const t = max === min ? 0.5 : (d[metricKey] - min) / (max - min);
          const bg = colorFor(t, metric.invert);
          return (
            <button
              key={d.id}
              onClick={() => navigate(`/districts/${d.id}`)}
              onMouseEnter={() => setHovered(d.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: bg, border: '1px solid rgba(10,26,48,0.08)', borderRadius: 5,
                padding: '10px 8px', textAlign: 'left', cursor: 'pointer', position: 'relative',
                transition: 'transform 0.1s ease',
                transform: hovered === d.id ? 'translateY(-1px)' : 'none',
              }}
            >
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--navy-900)', marginBottom: 4, lineHeight: 1.2 }}>
                {d.name}
              </div>
              <div className="figure" style={{ fontSize: 13, fontWeight: 700, color: 'var(--charcoal)' }}>
                {metric.fmt(d[metricKey])}
              </div>

              {hovered === d.id && (
                <div style={{
                  position: 'absolute', zIndex: 5, top: '100%', left: 0, marginTop: 4,
                  background: 'var(--navy-900)', color: 'var(--white)', padding: '8px 10px',
                  borderRadius: 6, fontSize: 12, width: 170, boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
                }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Placement</span><span className="figure">{pct(d.placementRate)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Retention</span><span className="figure">{pct(d.retentionRate)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Skill Gap</span><span className="figure">{pct(d.skillGap)}</span></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 11.5, color: 'var(--grey-500)' }}>
        <span>Low</span>
        {['#f4c7c2', '#f7d9a8', '#fbe79c', '#c7e3c9', '#8fcf9a'].map((c) => (
          <span key={c} style={{ width: 22, height: 10, background: c, borderRadius: 2 }} />
        ))}
        <span>High</span>
        <span style={{ marginLeft: 10 }}>Click a district to open District Intelligence</span>
      </div>
    </div>
  );
}
