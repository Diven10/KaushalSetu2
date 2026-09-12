import { api } from '../services/api';
import { useApiData } from '../hooks/useApiData';
import SectionHeader from '../components/common/SectionHeader';
import DonutChartCard from '../components/common/charts/DonutChartCard';
import BarChartCard from '../components/common/charts/BarChartCard';
import DataStatusBadge from '../components/common/DataStatusBadge';

export default function ImpactReports() {
  const { data, loading } = useApiData(() => api.getImpactReport(), []);

  if (loading) return <div style={{ padding: 40, color: 'var(--grey-500)' }}>Loading impact report…</div>;

  const donutData = data.components.map((c) => ({ name: c.label, value: c.weight }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHeader title="Impact & Reports" subtitle="Skilling Impact Score and intervention effectiveness" action={<DataStatusBadge type="Observed" />} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 0.8fr) minmax(280px, 1.2fr)', gap: 20 }}>
        <section className="card" style={{ padding: 18 }}>
          <SectionHeader title="Skilling Impact Score" subtitle="Weighted composite" />
          <DonutChartCard
            data={donutData}
            nameKey="name"
            valueKey="value"
            centerLabel={(
              <>
                <div className="figure" style={{ fontSize: 28, fontWeight: 700, color: 'var(--gov-blue)' }}>{data.score}</div>
                <div style={{ fontSize: 11, color: 'var(--grey-500)' }}>/ 100</div>
              </>
            )}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {data.components.map((c) => (
              <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span>{c.label} <span style={{ color: 'var(--grey-500)' }}>({c.weight}%)</span></span>
                <span className="figure" style={{ fontWeight: 600 }}>{c.score}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ padding: 18 }}>
          <SectionHeader title="District Impact Ranking" subtitle="Top 10 districts by impact score" />
          <BarChartCard
            data={data.ranking.slice(0, 10)}
            xKey="district"
            layout="vertical"
            height={340}
            bars={[{ dataKey: 'impactScore', name: 'Impact Score', color: 'var(--gov-blue)' }]}
          />
        </section>
      </div>

      <section className="card scroll-x" style={{ padding: 0 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 640 }}>
          <thead>
            <tr style={{ background: 'var(--grey-50)' }}>
              {['Intervention', 'Avg Placement Lift', 'Avg Retention Lift', 'Deployments'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11.5, fontWeight: 700, color: 'var(--charcoal-600)', borderBottom: '1px solid var(--grey-200)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.interventions.map((row) => (
              <tr key={row.intervention} style={{ borderBottom: '1px solid var(--grey-100)' }}>
                <td style={{ padding: '9px 14px', fontSize: 13, fontWeight: 600 }}>{row.intervention}</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13, color: 'var(--green-700)' }}>+{row.avgPlacementLift} pp</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13, color: 'var(--green-700)' }}>+{row.avgRetentionLift} pp</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13 }}>{row.deployments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
