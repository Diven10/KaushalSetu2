const TABS = ['All', 'High Risk', 'Medium Risk', 'Low Risk', 'Improving'];

export default function RiskFilterTabs({ active, onChange, counts }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {TABS.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            padding: '6px 13px', fontSize: 12.5, borderRadius: 999, cursor: 'pointer', fontWeight: 600,
            border: `1px solid ${active === t ? 'var(--gov-blue)' : 'var(--grey-200)'}`,
            background: active === t ? 'var(--gov-blue)' : 'var(--white)',
            color: active === t ? 'var(--white)' : 'var(--charcoal-600)',
          }}
        >
          {t}{counts?.[t] != null ? ` (${counts[t]})` : ''}
        </button>
      ))}
    </div>
  );
}
