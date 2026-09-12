import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import DataStatusBadge from './DataStatusBadge';

export default function KpiCard({ label, value, deltaLabel, delta, comparison, dataType = 'Observed', goodDirection = 'up' }) {
  const direction = delta > 0.05 ? 'up' : delta < -0.05 ? 'down' : 'flat';
  const isGood = direction === 'flat' ? null : direction === goodDirection;
  const color = direction === 'flat' ? 'var(--grey-500)' : isGood ? 'var(--green-700)' : 'var(--red-700)';
  const Icon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus;

  return (
    <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--charcoal-600)' }}>{label}</span>
        <DataStatusBadge type={dataType} />
      </div>
      <div className="figure" style={{ fontSize: 26, fontWeight: 600, color: 'var(--navy-900)', lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color }}>
          <Icon size={14} />
          {deltaLabel}
        </span>
        {comparison && <span style={{ color: 'var(--grey-500)' }}>{comparison}</span>}
      </div>
    </div>
  );
}
