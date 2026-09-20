import { VenueHealth } from '@/lib/types';

interface VenueHealthCardProps {
  venueHealth: VenueHealth[];
}

export default function VenueHealthCard({ venueHealth }: VenueHealthCardProps) {
  return (
    <div className="card">
      <h2>🏥 Venue Health</h2>
      <div className="venue-health">
        {venueHealth.map((health) => (
          <div key={health.venue} className="venue-status">
            <h3>{health.venue.toUpperCase()}</h3>
            <div className="status-indicator">
              <span
                className={`status-dot ${health.healthy ? 'healthy' : 'unhealthy'}`}
              />
              <span>{health.healthy ? 'Healthy' : 'Degraded'}</span>
            </div>
            {health.errorCount > 0 && (
              <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#f85149' }}>
                {health.errorCount} error(s)
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
