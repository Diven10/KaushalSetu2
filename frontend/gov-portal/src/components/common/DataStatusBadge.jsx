const STYLES = {
  Observed: { bg: 'var(--grey-100)', fg: 'var(--charcoal-600)' },
  Predicted: { bg: 'var(--blue-100)', fg: 'var(--blue-700)' },
  Recommended: { bg: '#f0e9fb', fg: '#5b3ea6' },
  Simulated: { bg: '#f0e9fb', fg: '#5b3ea6' },
  Projected: { bg: 'var(--blue-100)', fg: 'var(--blue-700)' },
};

export default function DataStatusBadge({ type = 'Observed' }) {
  const s = STYLES[type] || STYLES.Observed;
  return (
    <span
      style={{
        display: 'inline-block', background: s.bg, color: s.fg,
        padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
        letterSpacing: 0.2,
      }}
    >
      {type}
    </span>
  );
}
