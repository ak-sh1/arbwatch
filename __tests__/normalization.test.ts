import { VENUE_SYMBOL_MAP } from '../lib/constants';

describe('Symbol Normalization', () => {
  it('should correctly map BTC to venue-specific symbols', () => {
    expect(VENUE_SYMBOL_MAP.binance.BTC).toBe('BTCUSDT');
    expect(VENUE_SYMBOL_MAP.coinbase.BTC).toBe('BTC-USD');
  });

  it('should correctly map ETH to venue-specific symbols', () => {
    expect(VENUE_SYMBOL_MAP.binance.ETH).toBe('ETHUSDT');
    expect(VENUE_SYMBOL_MAP.coinbase.ETH).toBe('ETH-USD');
  });

  it('should correctly map SOL to venue-specific symbols', () => {
    expect(VENUE_SYMBOL_MAP.binance.SOL).toBe('SOLUSDT');
    expect(VENUE_SYMBOL_MAP.coinbase.SOL).toBe('SOL-USD');
  });

  it('should correctly map XRP to venue-specific symbols', () => {
    expect(VENUE_SYMBOL_MAP.binance.XRP).toBe('XRPUSDT');
    expect(VENUE_SYMBOL_MAP.coinbase.XRP).toBe('XRP-USD');
  });

  it('should support all required symbols', () => {
    const requiredSymbols = ['BTC', 'ETH', 'SOL', 'XRP'];
    const venues = ['binance', 'coinbase'];

    venues.forEach((venue) => {
      requiredSymbols.forEach((symbol) => {
        expect(VENUE_SYMBOL_MAP[venue as keyof typeof VENUE_SYMBOL_MAP][symbol as 'BTC' | 'ETH' | 'SOL' | 'XRP']).toBeDefined();
      });
    });
  });
});
