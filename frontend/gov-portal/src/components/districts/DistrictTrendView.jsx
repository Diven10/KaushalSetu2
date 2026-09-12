import { useState } from 'react';
import PerformanceMatrix from './PerformanceMatrix';
import TrendCard from '../common/TrendCard';

export default function DistrictTrendView({ districts, topImprovers, biggestDeclines, summary }) {
  const [view, setView] = useState('table');

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {['table', 'trend'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '6px 14px', fontSize: 13, borderRadius: 6, cursor: 'pointer', fontWeight: 600,
              border: `1px solid ${view === v ? 'var(--gov-blue)' : 'var(--grey-200)'}`,
              background: view === v ? 'var(--gov-blue)' : 'var(--white)',
              color: view === v ? 'var(--white)' : 'var(--charcoal-600)',
            }}
          >
            {v === 'table' ? 'Table View' : 'Trend View'}
          </button>
        ))}
      </div>

      {view === 'table' ? (
        <PerformanceMatrix districts={districts} />
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <TrendCard title="Top 5 Improvers" items={topImprovers} positive />
            <TrendCard title="Biggest Declines" items={biggestDeclines} positive={false} />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Improving', value: summary.improving, color: 'var(--green-700)' },
              { label: 'Stable', value: summary.stable, color: 'var(--blue-700)' },
              { label: 'Needs Attention', value: summary.declining, color: 'var(--orange-700)' },
              { label: 'High Risk', value: summary.significantDecline, color: 'var(--red-700)' },
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: '12px 18px', flex: '1 1 150px' }}>
                <div className="figure" style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12.5, color: 'var(--grey-500)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
