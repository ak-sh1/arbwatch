export type Symbol = 'BTC' | 'ETH' | 'SOL' | 'XRP';
export type Venue = 'binance' | 'coinbase';

export interface Quote {
  venue: Venue;
  symbol: Symbol;
  bid: number;
  ask: number;
  mid: number;
  timestamp: number;
  age: number;
}

export interface VenueHealth {
  venue: Venue;
  healthy: boolean;
  lastSuccessfulFetch: number;
  consecutiveFailures: number;
}

export interface ArbitrageOpportunity {
  symbolPair: string;
  buyVenue: Venue;
  sellVenue: Venue;
  buyPrice: number;
  sellPrice: number;
  edgeBps: number;
  netEdgeBps: number;
  feesBps: number;
  timestamp: number;
  persistedSeconds: number;
  alerted: boolean;
}

export interface AlertConfig {
  minEdgeBps: number;
  minPersistSeconds: number;
  maxQuoteAgeMs: number;
  feeBufferBps: number;
}

export interface VenueFees {
  venue: Venue;
  makerBps: number;
  takerBps: number;
}
