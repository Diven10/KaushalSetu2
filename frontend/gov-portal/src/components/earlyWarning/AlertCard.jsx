import { useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin } from 'lucide-react';
import RiskBadge from '../common/RiskBadge';

export default function AlertCard({ warning }) {
  const navigate = useNavigate();
  return (
    <div
      className="card"
      onClick={() => navigate(`/early-warning/${warning.id}`)}
      style={{ padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/early-warning/${warning.id}`)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--grey-500)', marginBottom: 4 }}>
            <MapPin size={13} />
            {warning.district} — {warning.skill}
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--navy-900)' }}>{warning.reason}</div>
        </div>
        <RiskBadge level={warning.severity} />
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--charcoal-600)' }}>
        <strong>Signal:</strong> {warning.signal}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--charcoal-600)' }}>
        <strong>Suggested Action:</strong> {warning.recommendedAction}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--gov-blue)', fontSize: 12.5, fontWeight: 600, alignItems: 'center', gap: 2 }}>
        View detail <ChevronRight size={14} />
      </div>
    </div>
  );
}
