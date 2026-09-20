import { calculateEdgeBps, areQuotesStale, detectArbitrage } from '@/lib/arbitrage';
import { Quote, Config } from '@/lib/types';

describe('Arbitrage Calculations', () => {
  describe('calculateEdgeBps', () => {
    it('should calculate positive edge correctly', () => {
      const quoteA: Quote = {
        symbol: 'BTC',
        venue: 'coinbase',
        bid: 65000,
        ask: 65050,
        mid: 65025,
        timestamp: Date.now(),
      };

      const quoteB: Quote = {
        symbol: 'BTC',
        venue: 'binance',
        bid: 64950,
        ask: 65000,
        mid: 64975,
        timestamp: Date.now(),
      };

      const feeA = 60; // 0.60% taker fee
      const feeB = 10; // 0.10% taker fee

      const result = calculateEdgeBps(quoteA, quoteB, feeA, feeB);

      // Raw edge: (65025 - 64975) / 65000 * 10000 = 7.69 bps (approx)
      // Fee-adjusted: 7.69 - 70 = -62.31 bps (approx)
      expect(result.edgeBps).toBeGreaterThan(0);
      expect(result.feeAdjustedEdgeBps).toBeLessThan(result.edgeBps);
      expect(result.feeAdjustedEdgeBps).toBe(result.edgeBps - feeA - feeB);
    });

    it('should calculate negative edge correctly', () => {
      const quoteA: Quote = {
        symbol: 'ETH',
        venue: 'coinbase',
        bid: 2500,
        ask: 2505,
        mid: 2502.5,
        timestamp: Date.now(),
      };

      const quoteB: Quote = {
        symbol: 'ETH',
        venue: 'binance',
        bid: 2510,
        ask: 2515,
        mid: 2512.5,
        timestamp: Date.now(),
      };

      const feeA = 60;
      const feeB = 10;

      const result = calculateEdgeBps(quoteA, quoteB, feeA, feeB);

      // Raw edge should be negative since quoteA.mid < quoteB.mid
      expect(result.edgeBps).toBeLessThan(0);
      expect(result.feeAdjustedEdgeBps).toBeLessThan(result.edgeBps);
    });

    it('should properly account for fees', () => {
      const quoteA: Quote = {
        symbol: 'SOL',
        venue: 'coinbase',
        bid: 100,
        ask: 101,
        mid: 100.5,
        timestamp: Date.now(),
      };

      const quoteB: Quote = {
        symbol: 'SOL',
        venue: 'binance',
        bid: 99,
        ask: 100,
        mid: 99.5,
        timestamp: Date.now(),
      };

      const feeA = 50;
      const feeB = 20;

      const result = calculateEdgeBps(quoteA, quoteB, feeA, feeB);

      // Fee impact should be exactly feeA + feeB
      expect(result.edgeBps - result.feeAdjustedEdgeBps).toBe(feeA + feeB);
    });
  });

  describe('areQuotesStale', () => {
    it('should detect stale quotes based on age', () => {
      const currentTime = Date.now();
      const staleThresholdMs = 5000;

      const freshQuote: Quote = {
        symbol: 'BTC',
        venue: 'coinbase',
        bid: 65000,
        ask: 65050,
        mid: 65025,
        timestamp: currentTime - 1000, // 1 second old
      };

      const staleQuote: Quote = {
        symbol: 'BTC',
        venue: 'binance',
        bid: 64950,
        ask: 65000,
        mid: 64975,
        timestamp: currentTime - 6000, // 6 seconds old
      };

      // Both fresh quotes
      expect(areQuotesStale(freshQuote, freshQuote, staleThresholdMs, currentTime)).toBe(
        false
      );

      // One stale quote
      expect(areQuotesStale(freshQuote, staleQuote, staleThresholdMs, currentTime)).toBe(
        true
      );

      // Both stale quotes
      expect(areQuotesStale(staleQuote, staleQuote, staleThresholdMs, currentTime)).toBe(
        true
      );
    });

    it('should use current time when not provided', () => {
      const staleThresholdMs = 5000;

      const oldQuote: Quote = {
        symbol: 'BTC',
        venue: 'coinbase',
        bid: 65000,
        ask: 65050,
        mid: 65025,
        timestamp: Date.now() - 10000, // 10 seconds old
      };

      const freshQuote: Quote = {
        symbol: 'BTC',
        venue: 'binance',
        bid: 64950,
        ask: 65000,
        mid: 64975,
        timestamp: Date.now() - 1000, // 1 second old
      };

      // Should detect staleness using current time
      expect(areQuotesStale(oldQuote, freshQuote, staleThresholdMs)).toBe(true);
    });
  });

  describe('detectArbitrage', () => {
    const config: Config = {
      symbols: ['BTC', 'ETH', 'SOL', 'XRP'],
      venues: ['coinbase', 'binance'],
      staleThresholdMs: 5000,
      alertPersistenceThresholdMs: 3000,
      fees: {
        coinbase: { makerBps: 40, takerBps: 60 },
        binance: { makerBps: 10, takerBps: 10 },
      },
    };

    it('should not alert on stale quotes', () => {
      const currentTime = Date.now();

      const freshQuote: Quote = {
        symbol: 'BTC',
        venue: 'coinbase',
        bid: 65000,
        ask: 65050,
        mid: 65025,
        timestamp: currentTime - 1000,
      };

      const staleQuote: Quote = {
        symbol: 'BTC',
        venue: 'binance',
        bid: 64000,
        ask: 64050,
        mid: 64025,
        timestamp: currentTime - 10000, // 10 seconds old
      };

      const result = detectArbitrage(freshQuote, staleQuote, config);

      expect(result).not.toBeNull();
      expect(result?.isStale).toBe(true);
      expect(result?.shouldAlert).toBe(false);
    });

    it('should not alert if opportunity has not persisted long enough', () => {
      const currentTime = Date.now();

      const quoteA: Quote = {
        symbol: 'BTC',
        venue: 'coinbase',
        bid: 66000,
        ask: 66050,
        mid: 66025,
        timestamp: currentTime - 100,
      };

      const quoteB: Quote = {
        symbol: 'BTC',
        venue: 'binance',
        bid: 65000,
        ask: 65050,
        mid: 65025,
        timestamp: currentTime - 100,
      };

      // First detection (no persistence)
      const result = detectArbitrage(quoteA, quoteB, config);

      expect(result).not.toBeNull();
      expect(result?.isStale).toBe(false);
      
      // Even if there's a positive fee-adjusted edge, it shouldn't alert immediately
      // because it hasn't persisted long enough
      if (result?.feeAdjustedEdgeBps > 0) {
        expect(result?.shouldAlert).toBe(false);
      }
    });

    it('should alert if opportunity persists and is profitable after fees', () => {
      const currentTime = Date.now();
      const firstDetectedAt = currentTime - 5000; // 5 seconds ago

      const quoteA: Quote = {
        symbol: 'BTC',
        venue: 'coinbase',
        bid: 66000,
        ask: 66050,
        mid: 66025,
        timestamp: currentTime - 100,
      };

      const quoteB: Quote = {
        symbol: 'BTC',
        venue: 'binance',
        bid: 65000,
        ask: 65050,
        mid: 65025,
        timestamp: currentTime - 100,
      };

      const result = detectArbitrage(quoteA, quoteB, config, firstDetectedAt);

      expect(result).not.toBeNull();
      expect(result?.isStale).toBe(false);
      
      // With such a large spread, even after fees it should be profitable
      expect(result?.feeAdjustedEdgeBps).toBeGreaterThan(0);
      expect(result?.shouldAlert).toBe(true);
    });

    it('should not alert if edge is negative after fees', () => {
      const currentTime = Date.now();
      const firstDetectedAt = currentTime - 5000;

      const quoteA: Quote = {
        symbol: 'BTC',
        venue: 'coinbase',
        bid: 65030,
        ask: 65080,
        mid: 65055,
        timestamp: currentTime - 100,
      };

      const quoteB: Quote = {
        symbol: 'BTC',
        venue: 'binance',
        bid: 65000,
        ask: 65050,
        mid: 65025,
        timestamp: currentTime - 100,
      };

      const result = detectArbitrage(quoteA, quoteB, config, firstDetectedAt);

      expect(result).not.toBeNull();
      
      // Small spread likely eaten by fees
      if (result?.feeAdjustedEdgeBps <= 0) {
        expect(result?.shouldAlert).toBe(false);
      }
    });
  });
});
