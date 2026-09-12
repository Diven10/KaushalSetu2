const STYLES = {
  High: { bg: 'var(--red-100)', fg: 'var(--red-700)' },
  Medium: { bg: 'var(--orange-100)', fg: 'var(--orange-700)' },
  Low: { bg: 'var(--yellow-100)', fg: 'var(--yellow-700)' },
  Improving: { bg: 'var(--green-100)', fg: 'var(--green-700)' },
};

export default function RiskBadge({ level }) {
  const s = STYLES[level] || STYLES.Low;
  const label = level === 'Improving' ? 'Improving' : `${level} Risk`;
  return (
    <span
      style={{
        display: 'inline-block', background: s.bg, color: s.fg,
        padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}
