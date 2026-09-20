import { Quote, ArbitrageOpportunity, Config } from './types';

/**
 * Calculate fee-aware arbitrage edge in basis points
 * Formula: edge_bps = (mid_a - mid_b) / mid * 10000 - (fee_a + fee_b)_bps
 */
export function calculateEdgeBps(
  quoteA: Quote,
  quoteB: Quote,
  feeABps: number,
  feeBBps: number
): { edgeBps: number; feeAdjustedEdgeBps: number } {
  const avgMid = (quoteA.mid + quoteB.mid) / 2;
  const rawEdgeBps = ((quoteA.mid - quoteB.mid) / avgMid) * 10000;
  const totalFeeBps = feeABps + feeBBps;
  const feeAdjustedEdgeBps = rawEdgeBps - totalFeeBps;

  return {
    edgeBps: rawEdgeBps,
    feeAdjustedEdgeBps,
  };
}

/**
 * Check if quotes are stale based on timestamp
 */
export function areQuotesStale(
  quoteA: Quote,
  quoteB: Quote,
  staleThresholdMs: number,
  currentTime: number = Date.now()
): boolean {
  const ageA = currentTime - quoteA.timestamp;
  const ageB = currentTime - quoteB.timestamp;
  return ageA > staleThresholdMs || ageB > staleThresholdMs;
}

/**
 * Calculate max quote age between two quotes
 */
export function getMaxQuoteAge(
  quoteA: Quote,
  quoteB: Quote,
  currentTime: number = Date.now()
): number {
  const ageA = currentTime - quoteA.timestamp;
  const ageB = currentTime - quoteB.timestamp;
  return Math.max(ageA, ageB);
}

/**
 * Detect arbitrage opportunities between two quotes
 */
export function detectArbitrage(
  quoteA: Quote,
  quoteB: Quote,
  config: Config,
  firstDetectedAt?: number
): ArbitrageOpportunity | null {
  if (quoteA.symbol !== quoteB.symbol) {
    return null;
  }

  const currentTime = Date.now();
  const isStale = areQuotesStale(quoteA, quoteB, config.staleThresholdMs, currentTime);
  const quoteAgeMs = getMaxQuoteAge(quoteA, quoteB, currentTime);

  // Use taker fees for conservative calculation (worst case)
  const feeA = config.fees[quoteA.venue].takerBps;
  const feeB = config.fees[quoteB.venue].takerBps;

  const { edgeBps, feeAdjustedEdgeBps } = calculateEdgeBps(quoteA, quoteB, feeA, feeB);

  const detectedAt = firstDetectedAt || currentTime;
  const persistenceDuration = currentTime - detectedAt;
  const shouldAlert =
    !isStale &&
    feeAdjustedEdgeBps > 0 &&
    persistenceDuration >= config.alertPersistenceThresholdMs;

  return {
    symbol: quoteA.symbol,
    venueA: quoteA.venue,
    venueB: quoteB.venue,
    midA: quoteA.mid,
    midB: quoteB.mid,
    edgeBps,
    feeAdjustedEdgeBps,
    quoteAgeMs,
    firstDetectedAt: detectedAt,
    isStale,
    shouldAlert,
  };
}
