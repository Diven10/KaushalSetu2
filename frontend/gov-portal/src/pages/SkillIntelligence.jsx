import { useMemo, useState } from 'react';
import { api } from '../services/api';
import { useApiData } from '../hooks/useApiData';
import SectionHeader from '../components/common/SectionHeader';
import RiskBadge from '../components/common/RiskBadge';
import BarChartCard from '../components/common/charts/BarChartCard';
import { pct, inr, fullNumber } from '../utils/format';
import { SKILL_CATEGORIES } from '../data/mockGovernmentData';

export default function SkillIntelligence() {
  const { data: skills, loading } = useApiData(() => api.getStateSkills(), []);
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    if (!skills) return [];
    return category === 'All' ? skills : skills.filter((s) => s.category === category);
  }, [skills, category]);

  if (loading) return <div style={{ padding: 40, color: 'var(--grey-500)' }}>Loading skill intelligence…</div>;

  const topGap = [...filtered].sort((a, b) => b.gap - a.gap).slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SectionHeader title="Skill Intelligence" subtitle="Statewide demand, supply and skill-gap by category" />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['All', ...SKILL_CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              padding: '6px 13px', fontSize: 12.5, borderRadius: 999, cursor: 'pointer', fontWeight: 600,
              border: `1px solid ${category === c ? 'var(--gov-blue)' : 'var(--grey-200)'}`,
              background: category === c ? 'var(--gov-blue)' : 'var(--white)',
              color: category === c ? 'var(--white)' : 'var(--charcoal-600)',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <section className="card" style={{ padding: 18 }}>
        <SectionHeader title="Highest Skill-Gap Areas" subtitle="Top 8 in current filter" />
        <BarChartCard
          data={topGap}
          xKey="skill"
          layout="vertical"
          height={280}
          bars={[{ dataKey: 'gap', name: 'Skill Gap %', colorByValue: (d) => (d.gap > 24 ? 'var(--red-700)' : d.gap > 14 ? 'var(--orange-700)' : 'var(--green-700)') }]}
        />
      </section>

      <section className="card scroll-x" style={{ padding: 0 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 760 }}>
          <thead>
            <tr style={{ background: 'var(--grey-50)' }}>
              {['Skill', 'Category', 'Demand', 'Supply', 'Gap', 'Growth', 'Placement', 'Salary', 'Risk'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11.5, fontWeight: 700, color: 'var(--charcoal-600)', borderBottom: '1px solid var(--grey-200)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.skill} style={{ borderBottom: '1px solid var(--grey-100)' }}>
                <td style={{ padding: '9px 14px', fontSize: 13, fontWeight: 600 }}>{s.skill}</td>
                <td style={{ padding: '9px 14px', fontSize: 12.5, color: 'var(--grey-500)' }}>{s.category}</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13 }}>{fullNumber(s.demand)}</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13 }}>{fullNumber(s.supply)}</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13 }}>{pct(s.gap)}</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13, color: s.growth >= 0 ? 'var(--green-700)' : 'var(--red-700)' }}>{s.growth >= 0 ? '+' : ''}{s.growth}%</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13 }}>{pct(s.placement)}</td>
                <td className="figure" style={{ padding: '9px 14px', fontSize: 13 }}>{inr(s.salary)}</td>
                <td style={{ padding: '9px 14px' }}><RiskBadge level={s.risk} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
