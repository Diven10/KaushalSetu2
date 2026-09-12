import { Play } from 'lucide-react';
import DistrictSelector from '../districts/DistrictSelector';

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--charcoal-600)' }}>{label}</label>
      {children}
    </div>
  );
}

const selectStyle = {
  padding: '7px 10px', borderRadius: 6, border: '1px solid var(--grey-200)',
  fontSize: 13, background: 'var(--white)', color: 'var(--charcoal)',
};

export default function SimulationControl({
  districts, skills, interventions, horizons, params, onChange, onRun, running,
}) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 16,
      }}
      >
        <Field label="District">
          <DistrictSelector districts={districts} value={params.district} onChange={(v) => onChange({ ...params, district: v })} />
        </Field>
        <Field label="Skill">
          <select style={selectStyle} value={params.skill} onChange={(e) => onChange({ ...params, skill: e.target.value })}>
            {skills.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Intervention">
          <select style={selectStyle} value={params.intervention} onChange={(e) => onChange({ ...params, intervention: e.target.value })}>
            {interventions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label={`Quantity (${params.intervention.includes('Seats') ? 'seats' : 'units'})`}>
          <input
            type="number"
            min={0}
            step={10}
            value={params.quantity}
            onChange={(e) => onChange({ ...params, quantity: Number(e.target.value) })}
            style={selectStyle}
          />
        </Field>
        <Field label="Time Horizon">
          <select style={selectStyle} value={params.horizon} onChange={(e) => onChange({ ...params, horizon: e.target.value })}>
            {horizons.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <button
        onClick={onRun}
        disabled={running}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
          background: 'var(--gov-blue)', color: 'var(--white)', border: 'none', borderRadius: 6,
          fontSize: 13.5, fontWeight: 700, cursor: running ? 'default' : 'pointer', opacity: running ? 0.7 : 1,
        }}
      >
        <Play size={15} fill="currentColor" />
        {running ? 'RUNNING…' : 'RUN SIMULATION'}
      </button>
    </div>
  );
}
