import { fullNumber } from '../../utils/format';

const STAGES = [
  { key: 'training', label: 'Training' },
  { key: 'certification', label: 'Certification' },
  { key: 'placement', label: 'Placement' },
  { key: 'employment', label: 'Employment' },
  { key: 'retention', label: 'Retention' },
  { key: 'progression', label: 'Career Progression' },
];

export default function EmploymentFunnel({ funnel }) {
  const max = funnel.training;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {STAGES.map((s, i) => {
        const value = funnel[s.key];
        const widthPct = Math.max(8, (value / max) * 100);
        const prevValue = i === 0 ? value : funnel[STAGES[i - 1].key];
        const conversion = i === 0 ? null : ((value / prevValue) * 100).toFixed(1);
        return (
          <div key={s.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>{s.label}</span>
              <span className="figure" style={{ color: 'var(--grey-500)' }}>
                {fullNumber(value)}{conversion && <span> · {conversion}% of prior stage</span>}
              </span>
            </div>
            <div style={{ background: 'var(--grey-100)', borderRadius: 4, height: 22 }}>
              <div
                style={{
                  width: `${widthPct}%`, height: '100%', borderRadius: 4,
                  background: 'linear-gradient(90deg, var(--gov-blue-dark), var(--gov-blue))',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
