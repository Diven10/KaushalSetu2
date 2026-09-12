import { pct, fullNumber } from '../../utils/format';
import DataStatusBadge from '../common/DataStatusBadge';

function MetricRow({ label, from, to, fmt, deltaUnit = '' }) {
  const delta = to - from;
  const positive = delta >= 0;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--grey-100)' }}>
      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</span>
      <div className="figure" style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: 'var(--grey-500)' }}>{fmt(from)}</span>
        <span style={{ color: 'var(--grey-300)' }}>→</span>
        <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{fmt(to)}</span>
        <span style={{ color: positive ? 'var(--green-700)' : 'var(--red-700)', fontWeight: 600, minWidth: 70, textAlign: 'right' }}>
          {positive ? '+' : '-'}{Math.abs(delta).toFixed(deltaUnit === '' ? 0 : 1)}{deltaUnit}
        </span>
      </div>
    </div>
  );
}

export default function SimulationResult({ result }) {
  if (!result) return null;
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 14.5 }}>
          {result.district} — {result.skill} · {result.intervention} (+{result.quantity}) · {result.horizon}
        </h3>
        <DataStatusBadge type="Simulated" />
      </div>

      <MetricRow label="Placement" from={result.placement.from} to={result.placement.to} fmt={pct} deltaUnit=" pp" />
      <MetricRow label="Employment" from={result.employment.from} to={result.employment.to} fmt={pct} deltaUnit=" pp" />
      <MetricRow label="Retention" from={result.retention.from} to={result.retention.to} fmt={pct} deltaUnit=" pp" />
      <MetricRow label="Skill Gap (units)" from={result.skillGap.from} to={result.skillGap.to} fmt={fullNumber} deltaUnit="" />

      <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--grey-500)' }}>Impact Score</div>
          <div className="figure" style={{ fontSize: 24, fontWeight: 700, color: 'var(--gov-blue)' }}>{result.impactScore}<span style={{ fontSize: 13, color: 'var(--grey-500)' }}> / 100</span></div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--grey-500)' }}>Projection Confidence</div>
          <div className="figure" style={{ fontSize: 24, fontWeight: 700, color: 'var(--charcoal)' }}>{result.confidence}%</div>
        </div>
      </div>

      <p style={{ marginTop: 16, marginBottom: 0, fontSize: 12, color: 'var(--grey-500)', fontStyle: 'italic' }}>
        Simulated Projection — Not a Guaranteed Outcome
      </p>
    </div>
  );
}
