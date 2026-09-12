import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUp, ArrowDown } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { pct, inr, fullNumber, pp } from '../../utils/format';

const COLUMNS = [
  { key: 'name', label: 'District' },
  { key: 'healthScore', label: 'Health Score' },
  { key: 'activeTrainees', label: 'Trainees', fmt: fullNumber },
  { key: 'certificationRate', label: 'Certification', fmt: pct },
  { key: 'placementRate', label: 'Placement', fmt: pct },
  { key: 'retentionRate', label: 'Retention', fmt: pct },
  { key: 'skillGap', label: 'Skill Gap', fmt: pct },
  { key: 'avgSalary', label: 'Avg Salary', fmt: inr },
  { key: 'yoyDelta', label: 'Trend', fmt: pp },
  { key: 'status', label: 'Status' },
];

const TREND_FILTERS = ['All Districts', 'Improving', 'Stable', 'Declining', 'Significant Decline'];

export default function PerformanceMatrix({ districts }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [trendFilter, setTrendFilter] = useState('All Districts');
  const [sortKey, setSortKey] = useState('healthScore');
  const [sortDir, setSortDir] = useState('desc');

  const rows = useMemo(() => {
    let list = districts;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }
    if (trendFilter !== 'All Districts') {
      list = list.filter((d) => d.trendCategory === trendFilter);
    }
    return [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [districts, query, trendFilter, sortKey, sortDir]);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--grey-200)',
          borderRadius: 6, padding: '6px 10px', background: 'var(--white)', minWidth: 220,
        }}
        >
          <Search size={15} color="var(--grey-500)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search districts…"
            aria-label="Search districts"
            style={{ border: 'none', outline: 'none', fontSize: 13, width: '100%' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TREND_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setTrendFilter(f)}
              style={{
                padding: '5px 11px', fontSize: 12, borderRadius: 999, cursor: 'pointer',
                border: `1px solid ${trendFilter === f ? 'var(--gov-blue)' : 'var(--grey-200)'}`,
                background: trendFilter === f ? 'var(--gov-blue-light)' : 'var(--white)',
                color: trendFilter === f ? 'var(--gov-blue-dark)' : 'var(--charcoal-600)', fontWeight: 600,
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12.5, color: 'var(--grey-500)', marginLeft: 'auto' }}>{rows.length} of {districts.length} districts</span>
      </div>

      <div className="card scroll-x" style={{ maxHeight: 460, overflowY: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 860 }}>
          <thead>
            <tr style={{ position: 'sticky', top: 0, background: 'var(--grey-50)', zIndex: 1 }}>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  style={{
                    textAlign: 'left', padding: '10px 14px', fontSize: 11.5, fontWeight: 700,
                    color: 'var(--charcoal-600)', cursor: 'pointer', userSelect: 'none',
                    borderBottom: '1px solid var(--grey-200)', whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {c.label}
                    {sortKey === c.key && (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr
                key={d.id}
                onClick={() => navigate(`/districts/${d.id}`)}
                style={{ cursor: 'pointer', borderBottom: '1px solid var(--grey-100)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--grey-50)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: '9px 14px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{d.name}</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13 }}>{d.healthScore}</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13 }}>{fullNumber(d.activeTrainees)}</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13 }}>{pct(d.certificationRate)}</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13 }}>{pct(d.placementRate)}</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13 }}>{pct(d.retentionRate)}</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13 }}>{pct(d.skillGap)}</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13 }}>{inr(d.avgSalary)}</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13, color: d.yoyDelta >= 0 ? 'var(--green-700)' : 'var(--red-700)' }}>{pp(d.yoyDelta)}</td>
                <td style={{ padding: '9px 14px' }}><StatusBadge status={d.status} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
