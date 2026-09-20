import { SupportedSymbol, VenuePrice } from './types';
import { recordVenueSuccess, recordVenueError } from './venue-health';

/**
 * Abstract base class for exchange adapters
 */
export abstract class ExchangeAdapter {
  abstract name: string;
  
  /**
   * Fetch current price for a symbol
   */
  abstract fetchPrice(symbol: SupportedSymbol): Promise<VenuePrice>;
  
  /**
   * Normalize exchange-specific symbol to our standard format
   */
  abstract normalizeSymbol(symbol: SupportedSymbol): string;
}

/**
 * Binance exchange adapter
 * Uses public REST API: https://api.binance.us/api/v3/ticker/price
 * No authentication required for public endpoints
 */
export class BinanceAdapter extends ExchangeAdapter {
  name = 'Binance';
  private baseUrl = 'https://api.binance.us/api/v3';

  normalizeSymbol(symbol: SupportedSymbol): string {
    // BTC-USD -> BTCUSD
    return symbol.replace('-', '');
  }

  async fetchPrice(symbol: SupportedSymbol): Promise<VenuePrice> {
    const binanceSymbol = this.normalizeSymbol(symbol);
    
    try {
      const response = await fetch(
        `${this.baseUrl}/ticker/price?symbol=${binanceSymbol}`,
        {
          headers: { 'Content-Type': 'application/json' },
          next: { revalidate: 0 }, // No caching for real-time data
        }
      );

      if (!response.ok) {
        const errorMsg = `Binance API error: ${response.status}`;
        recordVenueError(this.name, errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      recordVenueSuccess(this.name);
      
      return {
        venue: this.name,
        price: parseFloat(data.price),
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      recordVenueError(this.name, errorMsg);
      console.error(`Binance fetch error for ${symbol}:`, error);
      throw error;
    }
  }
}

/**
 * Coinbase exchange adapter
 * Uses public REST API: https://api.coinbase.com/v2/prices/{pair}/spot
 * No authentication required for public endpoints
 */
export class CoinbaseAdapter extends ExchangeAdapter {
  name = 'Coinbase';
  private baseUrl = 'https://api.coinbase.com/v2';

  normalizeSymbol(symbol: SupportedSymbol): string {
    // Already in correct format: BTC-USD
    return symbol;
  }

  async fetchPrice(symbol: SupportedSymbol): Promise<VenuePrice> {
    const coinbaseSymbol = this.normalizeSymbol(symbol);
    
    try {
      const response = await fetch(
        `${this.baseUrl}/prices/${coinbaseSymbol}/spot`,
        {
          headers: { 'Content-Type': 'application/json' },
          next: { revalidate: 0 },
        }
      );

      if (!response.ok) {
        const errorMsg = `Coinbase API error: ${response.status}`;
        recordVenueError(this.name, errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      recordVenueSuccess(this.name);
      
      return {
        venue: this.name,
        price: parseFloat(data.data.amount),
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      recordVenueError(this.name, errorMsg);
      console.error(`Coinbase fetch error for ${symbol}:`, error);
      throw error;
    }
  }
}

/**
 * Factory function to create exchange adapters
 */
export const getExchangeAdapter = (venue: string): ExchangeAdapter => {
  switch (venue) {
    case 'Binance':
      return new BinanceAdapter();
    case 'Coinbase':
      return new CoinbaseAdapter();
    default:
      throw new Error(`Unsupported venue: ${venue}`);
  }
};

/**
 * Fetch prices from multiple venues in parallel
 */
export const fetchPricesFromVenues = async (
  symbol: SupportedSymbol,
  venues: string[]
): Promise<VenuePrice[]> => {
  const promises = venues.map(venue => {
    const adapter = getExchangeAdapter(venue);
    return adapter.fetchPrice(symbol);
  });

  return Promise.all(promises);
};
