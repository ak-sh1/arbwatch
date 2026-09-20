import { Quote, ArbitrageOpportunity, AlertConfig, Venue, Symbol } from './types';
import { VENUE_FEES } from './constants';

export function calculateEdge(
  quote1: Quote,
  quote2: Quote,
  config: AlertConfig
): ArbitrageOpportunity | null {
  const now = Date.now();
  quote1.age = now - quote1.timestamp;
  quote2.age = now - quote2.timestamp;

  if (quote1.age > config.maxQuoteAgeMs || quote2.age > config.maxQuoteAgeMs) {
    return null;
  }

  if (quote1.symbol !== quote2.symbol) {
    return null;
  }

  let buyVenue: Venue;
  let sellVenue: Venue;
  let buyPrice: number;
  let sellPrice: number;

  if (quote1.mid < quote2.mid) {
    buyVenue = quote1.venue;
    sellVenue = quote2.venue;
    buyPrice = quote1.ask;
    sellPrice = quote2.bid;
  } else {
    buyVenue = quote2.venue;
    sellVenue = quote1.venue;
    buyPrice = quote2.ask;
    sellPrice = quote1.bid;
  }

  const midPrice = (quote1.mid + quote2.mid) / 2;
  const grossEdgeBps = ((sellPrice - buyPrice) / midPrice) * 10000;

  const buyFee = VENUE_FEES[buyVenue].takerBps;
  const sellFee = VENUE_FEES[sellVenue].takerBps;
  const totalFeesBps = buyFee + sellFee;

  const netEdgeBps = grossEdgeBps - totalFeesBps;

  const symbolPair = `${quote1.symbol}/${buyVenue}-${sellVenue}`;

  return {
    symbolPair,
    buyVenue,
    sellVenue,
    buyPrice,
    sellPrice,
    edgeBps: grossEdgeBps,
    netEdgeBps,
    feesBps: totalFeesBps,
    timestamp: now,
    persistedSeconds: 0,
    alerted: false,
  };
}

export function shouldAlert(
  opportunity: ArbitrageOpportunity,
  config: AlertConfig
): boolean {
  return (
    opportunity.netEdgeBps > config.minEdgeBps + config.feeBufferBps &&
    opportunity.persistedSeconds >= config.minPersistSeconds
  );
}

export function findArbitrageOpportunities(
  quotes: Quote[],
  config: AlertConfig
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = [];
  const symbols = ['BTC', 'ETH', 'SOL', 'XRP'] as Symbol[];

  for (const symbol of symbols) {
    const symbolQuotes = quotes.filter((q) => q.symbol === symbol);

    for (let i = 0; i < symbolQuotes.length; i++) {
      for (let j = i + 1; j < symbolQuotes.length; j++) {
        const opp = calculateEdge(symbolQuotes[i], symbolQuotes[j], config);
        if (opp && opp.netEdgeBps > 0) {
          opportunities.push(opp);
        }
      }
    }
  }

  return opportunities.sort((a, b) => b.netEdgeBps - a.netEdgeBps);
}
