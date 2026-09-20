import { calculateEdge, shouldAlert, findArbitrageOpportunities } from '../lib/arbitrage';
import { Quote, AlertConfig } from '../lib/types';
import { DEFAULT_ALERT_CONFIG } from '../lib/constants';

describe('Arbitrage Engine', () => {
  const now = Date.now();

  const createQuote = (
    venue: 'binance' | 'coinbase',
    symbol: 'BTC' | 'ETH' | 'SOL' | 'XRP',
    mid: number,
    spread: number = 0.001,
    ageMs: number = 1000
  ): Quote => ({
    venue,
    symbol,
    bid: mid - (mid * spread) / 2,
    ask: mid + (mid * spread) / 2,
    mid,
    timestamp: now - ageMs,
    age: ageMs,
  });

  describe('calculateEdge', () => {
    it('should calculate positive net edge when price difference exceeds fees', () => {
      const binanceQuote = createQuote('binance', 'BTC', 95000, 0.001, 1000);
      const coinbaseQuote = createQuote('coinbase', 'BTC', 96000, 0.001, 1000);

      const result = calculateEdge(binanceQuote, coinbaseQuote, DEFAULT_ALERT_CONFIG);

      expect(result).not.toBeNull();
      expect(result!.buyVenue).toBe('binance');
      expect(result!.sellVenue).toBe('coinbase');
      expect(result!.netEdgeBps).toBeGreaterThan(0);
      expect(result!.feesBps).toBe(70);
    });

    it('should calculate negative net edge when fees exceed price difference', () => {
      const binanceQuote = createQuote('binance', 'BTC', 95000, 0.001, 1000);
      const coinbaseQuote = createQuote('coinbase', 'BTC', 95010, 0.001, 1000);

      const result = calculateEdge(binanceQuote, coinbaseQuote, DEFAULT_ALERT_CONFIG);

      expect(result).not.toBeNull();
      expect(result!.netEdgeBps).toBeLessThan(0);
    });

    it('should reject stale quotes based on maxQuoteAgeMs', () => {
      const freshQuote = createQuote('binance', 'BTC', 95000, 0.001, 1000);
      const staleQuote = createQuote('coinbase', 'BTC', 96000, 0.001, 10000);

      const config: AlertConfig = {
        ...DEFAULT_ALERT_CONFIG,
        maxQuoteAgeMs: 5000,
      };

      const result = calculateEdge(freshQuote, staleQuote, config);

      expect(result).toBeNull();
    });

    it('should only compare quotes for the same symbol', () => {
      const btcQuote = createQuote('binance', 'BTC', 95000, 0.001, 1000);
      const ethQuote = createQuote('coinbase', 'ETH', 3500, 0.001, 1000);

      const result = calculateEdge(btcQuote, ethQuote, DEFAULT_ALERT_CONFIG);

      expect(result).toBeNull();
    });

    it('should correctly apply venue-specific fees (Binance 10+10, Coinbase 60+50)', () => {
      const binanceQuote = createQuote('binance', 'BTC', 95000, 0.001, 1000);
      const coinbaseQuote = createQuote('coinbase', 'BTC', 96000, 0.001, 1000);

      const result = calculateEdge(binanceQuote, coinbaseQuote, DEFAULT_ALERT_CONFIG);

      expect(result).not.toBeNull();
      expect(result!.buyVenue).toBe('binance');
      expect(result!.feesBps).toBe(10 + 60);
    });
  });

  describe('shouldAlert', () => {
    it('should alert when net edge exceeds threshold and persistence requirement', () => {
      const opp = {
        symbolPair: 'BTC/binance-coinbase',
        buyVenue: 'binance' as const,
        sellVenue: 'coinbase' as const,
        buyPrice: 95000,
        sellPrice: 96000,
        edgeBps: 100,
        netEdgeBps: 30,
        feesBps: 70,
        timestamp: now,
        persistedSeconds: 5,
        alerted: false,
      };

      const result = shouldAlert(opp, DEFAULT_ALERT_CONFIG);

      expect(result).toBe(true);
    });

    it('should not alert when net edge is below threshold', () => {
      const opp = {
        symbolPair: 'BTC/binance-coinbase',
        buyVenue: 'binance' as const,
        sellVenue: 'coinbase' as const,
        buyPrice: 95000,
        sellPrice: 95050,
        edgeBps: 10,
        netEdgeBps: 3,
        feesBps: 70,
        timestamp: now,
        persistedSeconds: 5,
        alerted: false,
      };

      const result = shouldAlert(opp, DEFAULT_ALERT_CONFIG);

      expect(result).toBe(false);
    });

    it('should not alert when persistence requirement not met', () => {
      const opp = {
        symbolPair: 'BTC/binance-coinbase',
        buyVenue: 'binance' as const,
        sellVenue: 'coinbase' as const,
        buyPrice: 95000,
        sellPrice: 96000,
        edgeBps: 100,
        netEdgeBps: 30,
        feesBps: 70,
        timestamp: now,
        persistedSeconds: 1,
        alerted: false,
      };

      const result = shouldAlert(opp, DEFAULT_ALERT_CONFIG);

      expect(result).toBe(false);
    });
  });

  describe('findArbitrageOpportunities', () => {
    it('should find multiple opportunities across different symbols', () => {
      const quotes: Quote[] = [
        createQuote('binance', 'BTC', 95000, 0.001, 1000),
        createQuote('coinbase', 'BTC', 96000, 0.001, 1000),
        createQuote('binance', 'ETH', 3400, 0.001, 1000),
        createQuote('coinbase', 'ETH', 3500, 0.001, 1000),
      ];

      const opportunities = findArbitrageOpportunities(quotes, DEFAULT_ALERT_CONFIG);

      expect(opportunities.length).toBeGreaterThan(0);
      const btcOpp = opportunities.find((o) => o.symbolPair.startsWith('BTC'));
      const ethOpp = opportunities.find((o) => o.symbolPair.startsWith('ETH'));

      expect(btcOpp).toBeDefined();
      expect(ethOpp).toBeDefined();
    });

    it('should sort opportunities by net edge (highest first)', () => {
      const quotes: Quote[] = [
        createQuote('binance', 'BTC', 95000, 0.001, 1000),
        createQuote('coinbase', 'BTC', 96000, 0.001, 1000),
        createQuote('binance', 'ETH', 3400, 0.001, 1000),
        createQuote('coinbase', 'ETH', 3420, 0.001, 1000),
      ];

      const opportunities = findArbitrageOpportunities(quotes, DEFAULT_ALERT_CONFIG);

      for (let i = 1; i < opportunities.length; i++) {
        expect(opportunities[i - 1].netEdgeBps).toBeGreaterThanOrEqual(
          opportunities[i].netEdgeBps
        );
      }
    });

    it('should only return opportunities with positive net edge', () => {
      const quotes: Quote[] = [
        createQuote('binance', 'BTC', 95000, 0.001, 1000),
        createQuote('coinbase', 'BTC', 95010, 0.001, 1000),
      ];

      const opportunities = findArbitrageOpportunities(quotes, DEFAULT_ALERT_CONFIG);

      opportunities.forEach((opp) => {
        expect(opp.netEdgeBps).toBeGreaterThan(0);
      });
    });
  });
});
