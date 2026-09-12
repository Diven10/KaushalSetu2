import { api } from '../services/api';
import { useApiData } from '../hooks/useApiData';
import SectionHeader from '../components/common/SectionHeader';
import EmploymentFunnel from '../components/career/EmploymentFunnel';
import CareerPathways from '../components/career/CareerPathways';
import LineChartCard from '../components/common/charts/LineChartCard';
import DataStatusBadge from '../components/common/DataStatusBadge';

export default function CareerOutcomes() {
  const { data, loading } = useApiData(() => api.getCareerOutcomes(), []);

  if (loading) return <div style={{ padding: 40, color: 'var(--grey-500)' }}>Loading career outcomes…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHeader title="Career Outcomes" subtitle="Career Digital Twin — statewide trainee journey" action={<DataStatusBadge type="Observed" />} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,1.1fr) minmax(280px,0.9fr)', gap: 20 }}>
        <section className="card" style={{ padding: 18 }}>
          <SectionHeader title="Employment Funnel" subtitle="Training → Certification → Placement → Employment → Retention → Progression" />
          <EmploymentFunnel funnel={data.funnel} />
        </section>

        <section className="card" style={{ padding: 18 }}>
          <SectionHeader title="Salary Progression" subtitle="Average salary by years since placement" action={<DataStatusBadge type="Predicted" />} />
          <LineChartCard data={data.salaryProgression} xKey="stage" lines={[{ dataKey: 'salary', name: 'Avg Salary (₹)', color: 'var(--gov-blue)' }]} />
        </section>
      </div>

      <section className="card" style={{ padding: 18 }}>
        <SectionHeader title="Career Pathways" subtitle="Common role transitions and typical salary uplift" />
        <CareerPathways pathways={data.pathways} />
      </section>

      <section className="card" style={{ padding: 18 }}>
        <SectionHeader title="Certification → Employment Relationship" subtitle="Higher certification completion correlates with stronger employment outcomes at the district level" />
        <p style={{ fontSize: 13.5, color: 'var(--charcoal-600)', margin: 0 }}>
          Districts with certification rates above 80% show an average placement rate roughly 9 percentage points
          higher than districts below 70% certification — visible in the District Intelligence view for each district.
        </p>
      </section>
    </div>
  );
}
