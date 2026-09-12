import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import { api } from '../services/api';
import { useApiData } from '../hooks/useApiData';
import SectionHeader from '../components/common/SectionHeader';
import KpiCard from '../components/common/KpiCard';
import StatusBadge from '../components/common/StatusBadge';
import DistrictSelector from '../components/districts/DistrictSelector';
import ComparisonCard from '../components/common/ComparisonCard';
import LineChartCard from '../components/common/charts/LineChartCard';
import BarChartCard from '../components/common/charts/BarChartCard';
import EmploymentFunnel from '../components/career/EmploymentFunnel';
import RiskBadge from '../components/common/RiskBadge';
import { pct, inr, pp, fullNumber } from '../utils/format';

export default function DistrictIntelligence() {
  const { district: districtId } = useParams();
  const navigate = useNavigate();
  const { data: districts, loading: loadingAll } = useApiData(() => api.getDistricts(), []);
  const { data: district, loading } = useApiData(() => api.getDistrict(districtId), [districtId]);
  const [compareIds, setCompareIds] = useState([]);

  const compareDistricts = useMemo(() => {
    if (!districts) return [];
    return [districtId, ...compareIds].filter(Boolean).map((id) => districts.find((d) => d.id === id)).filter(Boolean);
  }, [districts, districtId, compareIds]);

  if (!districtId) {
    return (
      <div style={{ maxWidth: 420 }}>
        <SectionHeader title="District Intelligence" subtitle="Select a district to view its full profile" />
        {districts && (
          <DistrictSelector districts={districts} onChange={(id) => navigate(`/districts/${id}`)} />
        )}
      </div>
    );
  }

  if (loading || loadingAll || !district) {
    return <div style={{ padding: 40, color: 'var(--grey-500)' }}>Loading district profile…</div>;
  }

  const trendData = district.trendSeries.map((v, i) => ({ quarter: `Q${i + 1}`, health: v }));
  const topGapSkills = district.skills.slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <DistrictSelector districts={districts} value={districtId} onChange={(id) => navigate(`/districts/${id}`)} />
          <StatusBadge status={district.status} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: 'var(--grey-500)' }}>Compare with:</span>
          {[0, 1].map((slot) => (
            <DistrictSelector
              key={slot}
              districts={districts}
              value={compareIds[slot]}
              exclude={[districtId, ...compareIds]}
              onChange={(id) => {
                const next = [...compareIds];
                next[slot] = id;
                setCompareIds(next.filter(Boolean));
              }}
            />
          ))}
        </div>
      </div>

      <section>
        <SectionHeader title={`${district.name} — Health Score ${district.healthScore}`} subtitle="District vs Maharashtra average" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <KpiCard label="Active Trainees" value={fullNumber(district.activeTrainees)} deltaLabel={pp(district.qoqDelta)} comparison="health score, QoQ" delta={district.qoqDelta} goodDirection="up" />
          <KpiCard label="Certification" value={pct(district.certificationRate)} deltaLabel={pp(district.yoyDelta)} comparison="health score, YoY" delta={district.yoyDelta} goodDirection="up" />
          <KpiCard label="Placement" value={pct(district.placementRate)} deltaLabel={pp(district.qoqDelta)} comparison="health score, QoQ" delta={district.qoqDelta} goodDirection="up" />
          <KpiCard label="Retention" value={pct(district.retentionRate)} deltaLabel={pp(district.yoyDelta)} comparison="health score, YoY" delta={district.yoyDelta} goodDirection="up" />
          <KpiCard label="Skill Gap" value={pct(district.skillGap)} deltaLabel={pp(-district.qoqDelta / 2)} comparison="approx., QoQ" delta={-district.qoqDelta / 2} goodDirection="up" />
          <KpiCard label="Avg Salary" value={inr(district.avgSalary)} deltaLabel={pp(district.qoqDelta / 3)} comparison="approx., QoQ" delta={district.qoqDelta / 3} goodDirection="up" />
        </div>
      </section>

      {compareDistricts.length > 1 && (
        <section>
          <SectionHeader title="District Comparison" subtitle="Up to 3 districts side by side" />
          <ComparisonCard districts={compareDistricts} />
        </section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.1fr) minmax(280px, 0.9fr)', gap: 20 }}>
        <section className="card" style={{ padding: 18 }}>
          <SectionHeader title="8-Quarter Health Trend" />
          <LineChartCard data={trendData} xKey="quarter" lines={[{ dataKey: 'health', name: 'Health Score', color: 'var(--gov-blue)' }]} />
        </section>
        <section className="card" style={{ padding: 18 }}>
          <SectionHeader title="Employment Funnel" />
          <EmploymentFunnel funnel={{
            training: district.activeTrainees,
            certification: district.certified,
            placement: district.placed,
            employment: district.employed,
            retention: district.retained,
            progression: Math.round(district.retained * 0.55),
          }}
          />
        </section>
      </div>

      <section className="card" style={{ padding: 18 }}>
        <SectionHeader title="Demand vs Supply & Skill Gap Matrix" subtitle="Top skill categories by gap in this district" />
        <BarChartCard
          data={topGapSkills}
          xKey="skill"
          layout="vertical"
          height={280}
          bars={[
            { dataKey: 'demand', name: 'Demand', color: 'var(--gov-blue)' },
            { dataKey: 'supply', name: 'Supply', color: '#9fbfe0' },
          ]}
        />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <section className="card" style={{ padding: 18 }}>
          <SectionHeader title="Training Provider Performance" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {district.providers.map((p) => (
              <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--grey-100)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--grey-500)' }}>{fullNumber(p.trainees)} trainees</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="figure">{pct(p.placementRate)} placement</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', color: 'var(--yellow-700)', fontSize: 11.5 }}>
                    <Star size={11} fill="currentColor" /> {p.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ padding: 18 }}>
          <SectionHeader title="Employer Intelligence" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {district.employers.map((e) => (
              <div key={e.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--grey-100)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{e.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--grey-500)' }}>{e.hires} hires / {e.vacancies} vacancies</div>
                </div>
                <RiskBadge level={e.reliabilityScore >= 80 ? 'Improving' : e.reliabilityScore >= 60 ? 'Low' : 'Medium'} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card" style={{ padding: 18 }}>
        <SectionHeader title="Recommendations" subtitle="System-generated, based on current signals" />
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {district.recommendations.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </section>
    </div>
  );
}
