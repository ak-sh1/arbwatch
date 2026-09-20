import { Quote } from './types';

export const REPLAY_QUOTES: Quote[] = [
  {
    venue: 'binance',
    symbol: 'BTC',
    bid: 95800,
    ask: 95850,
    mid: 95825,
    timestamp: Date.now() - 1000,
    age: 1000,
  },
  {
    venue: 'coinbase',
    symbol: 'BTC',
    bid: 95950,
    ask: 96000,
    mid: 95975,
    timestamp: Date.now() - 1000,
    age: 1000,
  },
  {
    venue: 'binance',
    symbol: 'ETH',
    bid: 3420,
    ask: 3425,
    mid: 3422.5,
    timestamp: Date.now() - 1200,
    age: 1200,
  },
  {
    venue: 'coinbase',
    symbol: 'ETH',
    bid: 3450,
    ask: 3455,
    mid: 3452.5,
    timestamp: Date.now() - 1200,
    age: 1200,
  },
  {
    venue: 'binance',
    symbol: 'SOL',
    bid: 198.5,
    ask: 198.8,
    mid: 198.65,
    timestamp: Date.now() - 800,
    age: 800,
  },
  {
    venue: 'coinbase',
    symbol: 'SOL',
    bid: 199.2,
    ask: 199.5,
    mid: 199.35,
    timestamp: Date.now() - 800,
    age: 800,
  },
  {
    venue: 'binance',
    symbol: 'XRP',
    bid: 2.145,
    ask: 2.148,
    mid: 2.1465,
    timestamp: Date.now() - 1500,
    age: 1500,
  },
  {
    venue: 'coinbase',
    symbol: 'XRP',
    bid: 2.155,
    ask: 2.158,
    mid: 2.1565,
    timestamp: Date.now() - 1500,
    age: 1500,
  },
];

export function getReplayQuotes(): Quote[] {
  const now = Date.now();
  return REPLAY_QUOTES.map((quote) => ({
    ...quote,
    timestamp: now - quote.age,
    age: quote.age,
  }));
}
