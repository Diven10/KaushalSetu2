import { ArrowRight } from 'lucide-react';

export default function CareerPathways({ pathways }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {pathways.map((p) => (
        <div
          key={p.from + p.to}
          className="card"
          style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600 }}>
            <span>{p.from}</span>
            <ArrowRight size={15} color="var(--grey-500)" />
            <span>{p.to}</span>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: 'var(--grey-500)' }}>
            <span>Avg {p.avgYears} yrs</span>
            <span style={{ color: 'var(--green-700)', fontWeight: 600 }} className="figure">+{p.salaryUplift}% salary</span>
          </div>
        </div>
      ))}
    </div>
  );
}
