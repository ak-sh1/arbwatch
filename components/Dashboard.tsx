import { ArbitrageOpportunity, VenueHealth } from '@/lib/types';
import OpportunityCard from './OpportunityCard';
import VenueHealthCard from './VenueHealthCard';

interface DashboardProps {
  opportunities: ArbitrageOpportunity[];
  venueHealth: VenueHealth[];
}

export default function Dashboard({ opportunities, venueHealth }: DashboardProps) {
  const alertOpportunities = opportunities.filter((opp) => opp.shouldAlert);
  const activeOpportunities = opportunities.filter(
    (opp) => !opp.isStale && opp.feeAdjustedEdgeBps > 0
  );

  return (
    <div className="dashboard">
      <VenueHealthCard venueHealth={venueHealth} />

      {alertOpportunities.length > 0 && (
        <div className="card">
          <h2>🚨 Alert Opportunities ({alertOpportunities.length})</h2>
          <div className="opportunities-grid">
            {alertOpportunities.map((opp, idx) => (
              <OpportunityCard key={idx} opportunity={opp} />
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2>📊 Active Opportunities ({activeOpportunities.length})</h2>
        {activeOpportunities.length === 0 ? (
          <div className="no-opportunities">
            No profitable arbitrage opportunities detected at this time.
          </div>
        ) : (
          <div className="opportunities-grid">
            {activeOpportunities.map((opp, idx) => (
              <OpportunityCard key={idx} opportunity={opp} />
            ))}
          </div>
        )}
      </div>

      {opportunities.length > activeOpportunities.length && (
        <div className="card">
          <h2>⏸️ Inactive/Stale Opportunities</h2>
          <div className="opportunities-grid">
            {opportunities
              .filter((opp) => opp.isStale || opp.feeAdjustedEdgeBps <= 0)
              .map((opp, idx) => (
                <OpportunityCard key={idx} opportunity={opp} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
