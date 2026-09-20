import { Symbol, Venue, Quote } from './types';

export const VENUE_FEES = {
  binance: { makerBps: 10, takerBps: 10 },
  coinbase: { makerBps: 50, takerBps: 60 },
} as const;

export const DEFAULT_ALERT_CONFIG = {
  minEdgeBps: 5,
  minPersistSeconds: 3,
  maxQuoteAgeMs: 5000,
  feeBufferBps: 2,
} as const;

export const SYMBOLS: Symbol[] = ['BTC', 'ETH', 'SOL', 'XRP'];
export const VENUES: Venue[] = ['binance', 'coinbase'];

export const VENUE_SYMBOL_MAP = {
  binance: {
    BTC: 'BTCUSDT',
    ETH: 'ETHUSDT',
    SOL: 'SOLUSDT',
    XRP: 'XRPUSDT',
  },
  coinbase: {
    BTC: 'BTC-USD',
    ETH: 'ETH-USD',
    SOL: 'SOL-USD',
    XRP: 'XRP-USD',
  },
} as const;
