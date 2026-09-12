import { api } from '../services/api';
import { useApiData } from '../hooks/useApiData';
import KpiCard from '../components/common/KpiCard';
import SectionHeader from '../components/common/SectionHeader';
import DataStatusBadge from '../components/common/DataStatusBadge';
import DistrictHeatmap from '../components/districts/DistrictHeatmap';
import DistrictTrendView from '../components/districts/DistrictTrendView';
import { pct, inr, pp, fullNumber, statusFromScore } from '../utils/format';
import { DATASET_LABEL as DATASET_TAG } from '../data/mockGovernmentData';

export default function Overview() {
  const { data: summary, loading: loadingSummary } = useApiData(() => api.getStateSummary(), []);
  const { data: districts, loading: loadingDistricts } = useApiData(() => api.getDistricts(), []);
  const { data: trends, loading: loadingTrends } = useApiData(() => api.getDistrictTrends(), []);

  if (loadingSummary || loadingDistricts || loadingTrends) {
    return <div style={{ padding: 40, color: 'var(--grey-500)' }}>Loading government overview…</div>;
  }

  const status = statusFromScore(summary.healthScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--grey-500)' }}>
          Data Coverage: Maharashtra · Dataset: {DATASET_TAG}
        </p>
        <DataStatusBadge type="Observed" />
      </div>

      <section>
        <SectionHeader title="State KPIs" subtitle="Statewide skilling metrics for the current quarter" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
          <KpiCard label="Total Trainees" value={fullNumber(summary.totalTrainees)} deltaLabel={pp(summary.qoq.totalTrainees)} comparison="vs previous quarter" delta={summary.qoq.totalTrainees} goodDirection="up" />
          <KpiCard label="Certification Rate" value={pct(summary.certificationRate)} deltaLabel={pp(summary.qoq.certificationRate)} comparison="vs previous quarter" delta={summary.qoq.certificationRate} goodDirection="up" />
          <KpiCard label="Placement Rate" value={pct(summary.placementRate)} deltaLabel={pp(summary.qoq.placementRate)} comparison="vs previous quarter" delta={summary.qoq.placementRate} goodDirection="up" />
          <KpiCard label="12-Month Retention" value={pct(summary.retentionRate)} deltaLabel={pp(summary.qoq.retentionRate)} comparison="vs previous quarter" delta={summary.qoq.retentionRate} goodDirection="up" />
          <KpiCard label="Average Salary" value={inr(summary.avgSalary)} deltaLabel={pp(summary.qoq.avgSalary)} comparison="vs previous quarter" delta={summary.qoq.avgSalary} goodDirection="up" />
          <KpiCard label="Overall Skill Gap" value={pct(summary.skillGap)} deltaLabel={pp(summary.qoq.skillGap)} comparison="vs previous quarter" delta={summary.qoq.skillGap} goodDirection="down" />
        </div>
      </section>

      <section className="card" style={{ padding: 20 }}>
        <SectionHeader title="State Skill Health" subtitle="Composite health across all 36 districts" />
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div className="figure" style={{ fontSize: 40, fontWeight: 700, color: 'var(--gov-blue)' }}>{summary.healthScore}</div>
            <div style={{
              display: 'inline-block', marginTop: 4, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
              background: status === 'HEALTHY' ? 'var(--green-100)' : status === 'WATCH' ? 'var(--yellow-100)' : status === 'AT RISK' ? 'var(--orange-100)' : 'var(--red-100)',
              color: status === 'HEALTHY' ? 'var(--green-700)' : status === 'WATCH' ? 'var(--yellow-700)' : status === 'AT RISK' ? 'var(--orange-700)' : 'var(--red-700)',
            }}
            >
              {status}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px,1fr))', gap: 18, flex: 1 }}>
            {[
              { label: 'Placement', value: pct(summary.placementRate) },
              { label: 'Retention', value: pct(summary.retentionRate) },
              { label: 'Certification', value: pct(summary.certificationRate) },
              { label: 'Skill Gap', value: pct(summary.skillGap) },
              { label: 'Avg Salary', value: inr(summary.avgSalary) },
            ].map((m) => (
              <div key={m.label}>
                <div className="figure" style={{ fontSize: 17, fontWeight: 700 }}>{m.value}</div>
                <div style={{ fontSize: 12, color: 'var(--grey-500)' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card" style={{ padding: 20 }}>
        <SectionHeader title="Maharashtra Skill Heatmap" subtitle="Where is the problem? Select a metric, then click a district to drill in." />
        <DistrictHeatmap districts={districts} />
      </section>

      <section className="card" style={{ padding: 20 }}>
        <SectionHeader title="District Performance Matrix" subtitle="All 36 districts — search, sort and filter" />
        <DistrictTrendView
          districts={districts}
          topImprovers={trends.topImprovers}
          biggestDeclines={trends.biggestDeclines}
          summary={trends.summary}
        />
      </section>
    </div>
  );
}
