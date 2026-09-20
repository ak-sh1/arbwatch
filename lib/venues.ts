import { Symbol, Venue, Quote } from './types';
import { VENUE_SYMBOL_MAP } from './constants';

export async function fetchBinanceQuote(symbol: Symbol): Promise<Quote | null> {
  try {
    const binanceSymbol = VENUE_SYMBOL_MAP.binance[symbol];
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/bookTicker?symbol=${binanceSymbol}`,
      { next: { revalidate: 0 } }
    );

    if (!response.ok) {
      console.error(`Binance API error for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const timestamp = Date.now();
    const bid = parseFloat(data.bidPrice);
    const ask = parseFloat(data.askPrice);

    return {
      venue: 'binance',
      symbol,
      bid,
      ask,
      mid: (bid + ask) / 2,
      timestamp,
      age: 0,
    };
  } catch (error) {
    console.error(`Failed to fetch Binance quote for ${symbol}:`, error);
    return null;
  }
}

export async function fetchCoinbaseQuote(symbol: Symbol): Promise<Quote | null> {
  try {
    const coinbaseSymbol = VENUE_SYMBOL_MAP.coinbase[symbol];
    const response = await fetch(
      `https://api.coinbase.com/v2/prices/${coinbaseSymbol}/spot`,
      { next: { revalidate: 0 } }
    );

    if (!response.ok) {
      console.error(`Coinbase API error for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const timestamp = Date.now();
    const mid = parseFloat(data.data.amount);
    const spread = mid * 0.001;

    return {
      venue: 'coinbase',
      symbol,
      bid: mid - spread / 2,
      ask: mid + spread / 2,
      mid,
      timestamp,
      age: 0,
    };
  } catch (error) {
    console.error(`Failed to fetch Coinbase quote for ${symbol}:`, error);
    return null;
  }
}

export async function fetchVenueQuote(
  venue: Venue,
  symbol: Symbol
): Promise<Quote | null> {
  if (venue === 'binance') {
    return fetchBinanceQuote(symbol);
  } else if (venue === 'coinbase') {
    return fetchCoinbaseQuote(symbol);
  }
  return null;
}

export async function fetchAllQuotes(): Promise<Quote[]> {
  const symbols: Symbol[] = ['BTC', 'ETH', 'SOL', 'XRP'];
  const venues: Venue[] = ['binance', 'coinbase'];

  const promises = symbols.flatMap((symbol) =>
    venues.map((venue) => fetchVenueQuote(venue, symbol))
  );

  const results = await Promise.all(promises);
  return results.filter((quote): quote is Quote => quote !== null);
}
