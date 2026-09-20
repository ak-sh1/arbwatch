import { Config } from './types';

export const DEFAULT_CONFIG: Config = {
  symbols: ['BTC', 'ETH', 'SOL', 'XRP'],
  venues: ['coinbase', 'binance'],
  staleThresholdMs: 5000, // 5 seconds
  alertPersistenceThresholdMs: 3000, // 3 seconds - alert only if edge persists
  fees: {
    coinbase: {
      makerBps: 40, // 0.40%
      takerBps: 60, // 0.60%
    },
    binance: {
      makerBps: 10, // 0.10%
      takerBps: 10, // 0.10%
    },
  },
};
