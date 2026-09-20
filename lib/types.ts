export type Symbol = 'BTC' | 'ETH' | 'SOL' | 'XRP';
export type Venue = 'coinbase' | 'binance';

export interface Quote {
  symbol: Symbol;
  venue: Venue;
  bid: number;
  ask: number;
  mid: number;
  timestamp: number;
}

export interface VenueHealth {
  venue: Venue;
  healthy: boolean;
  lastUpdate: number;
  errorCount: number;
}

export interface ArbitrageOpportunity {
  symbol: Symbol;
  venueA: Venue;
  venueB: Venue;
  midA: number;
  midB: number;
  edgeBps: number;
  feeAdjustedEdgeBps: number;
  quoteAgeMs: number;
  firstDetectedAt: number;
  isStale: boolean;
  shouldAlert: boolean;
}

export interface VenueFees {
  venue: Venue;
  makerBps: number;
  takerBps: number;
}

export interface Config {
  symbols: Symbol[];
  venues: Venue[];
  staleThresholdMs: number;
  alertPersistenceThresholdMs: number;
  fees: Record<Venue, { makerBps: number; takerBps: number }>;
}
