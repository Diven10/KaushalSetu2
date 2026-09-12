export default function DistrictSelector({ districts, value, onChange, exclude = [] }) {
  const options = districts.filter((d) => !exclude.includes(d.id) || d.id === value);
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '7px 10px', borderRadius: 6, border: '1px solid var(--grey-200)',
        fontSize: 13, background: 'var(--white)', minWidth: 160, color: 'var(--charcoal)',
      }}
    >
      <option value="" disabled>Select district…</option>
      {options.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
    </select>
  );
}
