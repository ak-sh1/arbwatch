import { ArbitrageOpportunity } from '@/lib/types';

interface OpportunityCardProps {
  opportunity: ArbitrageOpportunity;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const {
    symbol,
    venueA,
    venueB,
    midA,
    midB,
    edgeBps,
    feeAdjustedEdgeBps,
    quoteAgeMs,
    isStale,
    shouldAlert,
  } = opportunity;

  const cardClass = `opportunity-card ${shouldAlert ? 'alert' : ''} ${
    isStale ? 'stale' : ''
  }`;

  const edgeClass =
    feeAdjustedEdgeBps > 0
      ? 'positive'
      : feeAdjustedEdgeBps < 0
      ? 'negative'
      : 'neutral';

  return (
    <div className={cardClass}>
      <div className="opportunity-header">
        <div>
          <div className="opportunity-symbol">{symbol}/USD</div>
          <div className="opportunity-route">
            {venueA.toUpperCase()} → {venueB.toUpperCase()}
          </div>
        </div>
        <div>
          {shouldAlert && <span className="badge alert">Alert</span>}
          {isStale && <span className="badge stale">Stale</span>}
        </div>
      </div>

      <div className="opportunity-metrics">
        <div className="metric">
          <div className="metric-label">Raw Edge</div>
          <div className={`metric-value ${edgeClass}`}>
            {edgeBps >= 0 ? '+' : ''}
            {edgeBps.toFixed(2)} bps
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">Fee-Adjusted Edge</div>
          <div className={`metric-value ${edgeClass}`}>
            {feeAdjustedEdgeBps >= 0 ? '+' : ''}
            {feeAdjustedEdgeBps.toFixed(2)} bps
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">{venueA.toUpperCase()} Mid</div>
          <div className="metric-value neutral">
            ${midA.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">{venueB.toUpperCase()} Mid</div>
          <div className="metric-value neutral">
            ${midB.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="metric">
          <div className="metric-label">Quote Age</div>
          <div className="metric-value neutral">{quoteAgeMs.toFixed(0)}ms</div>
        </div>
      </div>
    </div>
  );
}
