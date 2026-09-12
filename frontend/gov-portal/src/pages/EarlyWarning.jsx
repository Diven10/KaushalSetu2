import { useMemo, useState } from 'react';
import { api } from '../services/api';
import { useApiData } from '../hooks/useApiData';
import SectionHeader from '../components/common/SectionHeader';
import AlertCard from '../components/earlyWarning/AlertCard';
import RiskFilterTabs from '../components/earlyWarning/RiskFilterTabs';

const TAB_TO_SEVERITY = {
  'High Risk': 'High', 'Medium Risk': 'Medium', 'Low Risk': 'Low', Improving: 'Improving',
};

export default function EarlyWarning() {
  const { data: warnings, loading } = useApiData(() => api.getEarlyWarnings(), []);
  const [tab, setTab] = useState('All');

  const counts = useMemo(() => {
    if (!warnings) return {};
    const c = { All: warnings.length };
    Object.entries(TAB_TO_SEVERITY).forEach(([tabName, sev]) => {
      c[tabName] = warnings.filter((w) => w.severity === sev).length;
    });
    return c;
  }, [warnings]);

  const filtered = useMemo(() => {
    if (!warnings) return [];
    if (tab === 'All') return warnings;
    return warnings.filter((w) => w.severity === TAB_TO_SEVERITY[tab]);
  }, [warnings, tab]);

  if (loading) return <div style={{ padding: 40, color: 'var(--grey-500)' }}>Loading early warnings…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionHeader title="Employment Early Warning" subtitle="Identify, explain, and act on emerging skilling risks" />
      <RiskFilterTabs active={tab} onChange={setTab} counts={counts} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map((w) => <AlertCard key={w.id} warning={w} />)}
      </div>
      {filtered.length === 0 && <p style={{ color: 'var(--grey-500)', fontSize: 13.5 }}>No warnings in this category right now.</p>}
    </div>
  );
}
