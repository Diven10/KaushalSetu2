import { pct, inr, fullNumber } from '../../utils/format';
import StatusBadge from './StatusBadge';

const ROWS = [
  { key: 'healthScore', label: 'Health Score', fmt: (v) => v },
  { key: 'activeTrainees', label: 'Active Trainees', fmt: fullNumber },
  { key: 'certificationRate', label: 'Certification', fmt: pct },
  { key: 'placementRate', label: 'Placement', fmt: pct },
  { key: 'retentionRate', label: 'Retention', fmt: pct },
  { key: 'skillGap', label: 'Skill Gap', fmt: pct },
  { key: 'avgSalary', label: 'Avg Salary', fmt: inr },
];

export default function ComparisonCard({ districts }) {
  if (!districts?.length) return null;
  return (
    <div className="card scroll-x" style={{ padding: 16 }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 420 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', fontSize: 12, color: 'var(--grey-500)', padding: '6px 10px' }}>Metric</th>
            {districts.map((d) => (
              <th key={d.id} style={{ textAlign: 'left', fontSize: 13, padding: '6px 10px', fontWeight: 600 }}>{d.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '6px 10px', fontSize: 12.5, color: 'var(--grey-500)' }}>Status</td>
            {districts.map((d) => (
              <td key={d.id} style={{ padding: '6px 10px' }}><StatusBadge status={d.status} size="sm" /></td>
            ))}
          </tr>
          {ROWS.map((row) => (
            <tr key={row.key} style={{ borderTop: '1px solid var(--grey-100)' }}>
              <td style={{ padding: '6px 10px', fontSize: 12.5, color: 'var(--grey-500)' }}>{row.label}</td>
              {districts.map((d) => (
                <td key={d.id} className="figure" style={{ padding: '6px 10px', fontSize: 13.5, fontWeight: 600 }}>
                  {row.fmt(d[row.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
