const STYLES = {
  HEALTHY: { bg: 'var(--green-100)', fg: 'var(--green-700)', label: 'Healthy' },
  WATCH: { bg: 'var(--yellow-100)', fg: 'var(--yellow-700)', label: 'Watch' },
  'AT RISK': { bg: 'var(--orange-100)', fg: 'var(--orange-700)', label: 'At Risk' },
  CRITICAL: { bg: 'var(--red-100)', fg: 'var(--red-700)', label: 'Critical' },
};

export default function StatusBadge({ status, size = 'md' }) {
  const s = STYLES[status] || STYLES.WATCH;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: s.bg, color: s.fg,
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        borderRadius: 999, fontSize: size === 'sm' ? 11 : 12.5, fontWeight: 600,
        whiteSpace: 'nowrap', lineHeight: 1.4,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.fg, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}
