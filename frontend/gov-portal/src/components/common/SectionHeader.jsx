export default function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      marginBottom: 14, gap: 16, flexWrap: 'wrap',
    }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--navy-900)' }}>{title}</h2>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--grey-500)' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
