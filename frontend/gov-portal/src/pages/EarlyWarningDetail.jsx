import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useApiData } from '../hooks/useApiData';
import RiskBadge from '../components/common/RiskBadge';
import DataStatusBadge from '../components/common/DataStatusBadge';

function FieldLabel({ children }) {
  return <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--navy-900)' }}>{children}</h3>;
}

export default function EarlyWarningDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: warning, loading } = useApiData(() => api.getEarlyWarning(id), [id]);

  if (loading) return <div style={{ padding: 40, color: 'var(--grey-500)' }}>Loading warning detail…</div>;
  if (!warning) return <div style={{ padding: 40, color: 'var(--grey-500)' }}>Warning not found.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
      <button
        onClick={() => navigate('/early-warning')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--gov-blue)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0, width: 'fit-content' }}
      >
        <ArrowLeft size={15} /> Back to Early Warning
      </button>

      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12.5, color: 'var(--grey-500)', marginBottom: 4 }}>{warning.district} — {warning.skill}</div>
            <h1 style={{ margin: 0, fontSize: 19, color: 'var(--navy-900)' }}>{warning.reason}</h1>
          </div>
          <RiskBadge level={warning.severity} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <FieldLabel>Observed Signal</FieldLabel>
              <DataStatusBadge type="Observed" />
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--charcoal-600)' }}>{warning.observedSignal}</p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <FieldLabel>Predicted Risk</FieldLabel>
              <DataStatusBadge type="Predicted" />
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--charcoal-600)' }}>{warning.predictedRisk}</p>
          </div>

          <div>
            <FieldLabel>Contributing Factors</FieldLabel>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: 'var(--charcoal-600)', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {warning.contributingFactors.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <FieldLabel>Recommended Intervention</FieldLabel>
              <DataStatusBadge type="Recommended" />
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--charcoal-600)' }}>{warning.recommendedAction}</p>
          </div>
        </div>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--grey-100)' }}>
          <Link
            to="/policy-simulator"
            style={{
              display: 'inline-block', padding: '9px 16px', background: 'var(--gov-blue)', color: 'var(--white)',
              borderRadius: 6, fontSize: 13, fontWeight: 700,
            }}
          >
            Open in Policy Simulator
          </Link>
        </div>
      </div>
    </div>
  );
}
