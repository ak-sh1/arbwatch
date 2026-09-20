import { Quote, Symbol, Venue } from './types';
import replayData from '../fixtures/replay-data.json';

export interface ExchangeConnector {
  getQuote(symbol: Symbol): Promise<Quote | null>;
  isHealthy(): boolean;
}

export class ReplayConnector implements ExchangeConnector {
  private venue: Venue;
  private currentIndex: number = 0;
  private startTime: number;
  private speed: number; // playback speed multiplier

  constructor(venue: Venue, speed: number = 1) {
    this.venue = venue;
    this.speed = speed;
    this.startTime = Date.now();
  }

  async getQuote(symbol: Symbol): Promise<Quote | null> {
    const data = replayData[symbol]?.[this.venue];
    if (!data || data.length === 0) {
      return null;
    }

    // Calculate which index to use based on elapsed time and speed
    const elapsed = Date.now() - this.startTime;
    const adjustedElapsed = elapsed * this.speed;
    const index = Math.floor(adjustedElapsed / 1000) % data.length;

    const quote = data[index];
    if (!quote) {
      return null;
    }

    const mid = (quote.bid + quote.ask) / 2;
    const timestamp = Date.now() - (adjustedElapsed % 1000); // Simulate recent quotes

    return {
      symbol,
      venue: this.venue,
      bid: quote.bid,
      ask: quote.ask,
      mid,
      timestamp,
    };
  }

  isHealthy(): boolean {
    return true;
  }

  reset(): void {
    this.startTime = Date.now();
    this.currentIndex = 0;
  }
}

// Placeholder for live connector (not implemented for demo)
export class LiveConnector implements ExchangeConnector {
  private venue: Venue;
  private healthy: boolean = true;

  constructor(venue: Venue) {
    this.venue = venue;
  }

  async getQuote(symbol: Symbol): Promise<Quote | null> {
    // In a real implementation, this would fetch from the actual exchange API
    // For now, fall back to replay mode
    console.warn(`Live mode not implemented for ${this.venue}, using replay data`);
    const replayConnector = new ReplayConnector(this.venue);
    return replayConnector.getQuote(symbol);
  }

  isHealthy(): boolean {
    return this.healthy;
  }
}

export function createConnector(venue: Venue, mode: 'replay' | 'live' = 'replay'): ExchangeConnector {
  if (mode === 'replay') {
    return new ReplayConnector(venue);
  }
  return new LiveConnector(venue);
}
