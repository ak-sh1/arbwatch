import { Quote, ArbitrageOpportunity, Symbol, Venue, VenueHealth, Config } from './types';
import { detectArbitrage } from './arbitrage';
import { ExchangeConnector } from './exchange-connector';

export class ArbitrageMonitor {
  private connectors: Map<Venue, ExchangeConnector> = new Map();
  private config: Config;
  private opportunities: Map<string, ArbitrageOpportunity> = new Map();
  private maxEdges: Map<string, number> = new Map();
  private venueHealth: Map<Venue, VenueHealth> = new Map();
  private quotes: Map<string, Quote> = new Map();

  constructor(config: Config, connectors: Map<Venue, ExchangeConnector>) {
    this.config = config;
    this.connectors = connectors;
    
    // Initialize venue health
    for (const venue of config.venues) {
      this.venueHealth.set(venue, {
        venue,
        healthy: true,
        lastUpdate: Date.now(),
        errorCount: 0,
      });
    }
  }

  private getOpportunityKey(symbol: Symbol, venueA: Venue, venueB: Venue): string {
    return `${symbol}-${venueA}-${venueB}`;
  }

  private getQuoteKey(symbol: Symbol, venue: Venue): string {
    return `${symbol}-${venue}`;
  }

  async fetchQuotes(): Promise<void> {
    const currentTime = Date.now();

    for (const [venue, connector] of this.connectors) {
      try {
        for (const symbol of this.config.symbols) {
          const quote = await connector.getQuote(symbol);
          if (quote) {
            this.quotes.set(this.getQuoteKey(symbol, venue), quote);
          }
        }

        // Update health status
        const health = this.venueHealth.get(venue);
        if (health) {
          health.healthy = connector.isHealthy();
          health.lastUpdate = currentTime;
          health.errorCount = 0;
        }
      } catch (error) {
        console.error(`Error fetching quotes from ${venue}:`, error);
        const health = this.venueHealth.get(venue);
        if (health) {
          health.errorCount++;
          health.healthy = false;
          health.lastUpdate = currentTime;
        }
      }
    }
  }

  detectOpportunities(): void {
    const symbols = this.config.symbols;
    const venues = this.config.venues;

    for (const symbol of symbols) {
      // Check all venue pairs
      for (let i = 0; i < venues.length; i++) {
        for (let j = i + 1; j < venues.length; j++) {
          const venueA = venues[i];
          const venueB = venues[j];

          const quoteA = this.quotes.get(this.getQuoteKey(symbol, venueA));
          const quoteB = this.quotes.get(this.getQuoteKey(symbol, venueB));

          if (!quoteA || !quoteB) continue;

          const key = this.getOpportunityKey(symbol, venueA, venueB);
          const existingOpp = this.opportunities.get(key);

          const opp = detectArbitrage(
            quoteA,
            quoteB,
            this.config,
            existingOpp?.firstDetectedAt
          );

          if (opp) {
            this.opportunities.set(key, opp);

            // Track max edge
            const maxKey = `${symbol}-${venueA}-${venueB}`;
            const currentMax = this.maxEdges.get(maxKey) || 0;
            if (Math.abs(opp.feeAdjustedEdgeBps) > Math.abs(currentMax)) {
              this.maxEdges.set(maxKey, opp.feeAdjustedEdgeBps);
            }
          }

          // Also check reverse direction
          const reverseKey = this.getOpportunityKey(symbol, venueB, venueA);
          const reverseExisting = this.opportunities.get(reverseKey);

          const reverseOpp = detectArbitrage(
            quoteB,
            quoteA,
            this.config,
            reverseExisting?.firstDetectedAt
          );

          if (reverseOpp) {
            this.opportunities.set(reverseKey, reverseOpp);

            const reverseMaxKey = `${symbol}-${venueB}-${venueA}`;
            const reverseCurrentMax = this.maxEdges.get(reverseMaxKey) || 0;
            if (Math.abs(reverseOpp.feeAdjustedEdgeBps) > Math.abs(reverseCurrentMax)) {
              this.maxEdges.set(reverseMaxKey, reverseOpp.feeAdjustedEdgeBps);
            }
          }
        }
      }
    }
  }

  getOpportunities(): ArbitrageOpportunity[] {
    return Array.from(this.opportunities.values());
  }

  getMaxEdge(symbol: Symbol, venueA: Venue, venueB: Venue): number {
    const key = `${symbol}-${venueA}-${venueB}`;
    return this.maxEdges.get(key) || 0;
  }

  getVenueHealth(): VenueHealth[] {
    return Array.from(this.venueHealth.values());
  }

  getQuotes(): Quote[] {
    return Array.from(this.quotes.values());
  }

  async update(): Promise<void> {
    await this.fetchQuotes();
    this.detectOpportunities();
  }
}
