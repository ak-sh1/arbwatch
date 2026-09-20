# ArbWatch

**Fee-aware cross-venue price discrepancy monitor for crypto spot (educational)**

> ⚠️ **EDUCATIONAL PURPOSES ONLY** — This application is for learning and demonstration. It does NOT execute trades and is NOT financial advice.

## Overview

ArbWatch monitors real-time price discrepancies across cryptocurrency venues (Binance and Coinbase) and calculates fee-aware arbitrage opportunities. The system accounts for maker/taker fees and provides a realistic view of potential edges after costs.

## Features

- ✅ **Multi-Venue Support**: Binance + Coinbase public APIs
- ✅ **Fee-Aware Calculations**: Accounts for venue-specific maker/taker fees
- ✅ **Real-Time Dashboard**: Live quotes, opportunities, and historical charts
- ✅ **Stale Quote Protection**: Rejects outdated data based on configurable thresholds
- ✅ **Replay Mode**: Works without API keys or database (uses simulated data)
- ✅ **Optional Persistence**: Postgres support via `DATABASE_URL` with graceful fallback
- ✅ **Symbol Normalization**: BTC, ETH, SOL, XRP across different venue formats
- ✅ **Tested**: Fee math, stale gate logic, and symbol normalization

## Why Binance & Coinbase?

These venues were chosen for this educational project because:

1. **Public APIs**: Both provide free, unauthenticated REST APIs for market data
2. **High Liquidity**: Major venues with deep order books
3. **Different Fee Structures**: Binance (10 bps maker/taker) vs. Coinbase (50/60 bps) provides realistic fee-aware scenarios
4. **Popular Assets**: Support for BTC, ETH, SOL, and XRP
5. **No Authentication Required**: Simplifies deployment and demo experience

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Dashboard                 │
│          (App Router + TypeScript + Tailwind)       │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
  /api/quotes   /api/opportunities  /api/history
        │               │               │
        └───────────────┼───────────────┘
                        ▼
            ┌───────────────────────┐
            │  Arbitrage Engine     │
            │  - Fee calculation    │
            │  - Stale gate         │
            │  - Alert logic        │
            └───────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
  Binance API    Coinbase API    Postgres (optional)
```

## Fee-Aware Edge Formula

```
edge_bps = (mid_a - mid_b) / mid * 10000 - (fee_a + fee_b)_bps

Where:
- mid_a, mid_b = mid prices at each venue
- fee_a, fee_b = taker fees (assumed taker execution)
- Binance: 10 bps maker, 10 bps taker
- Coinbase: 50 bps maker, 60 bps taker
```

An alert is triggered only if:
- `net_edge_bps > min_threshold + buffer`
- Opportunity persists ≥ `min_persist_seconds`
- Quotes are not stale (age < `max_quote_age_ms`)

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- (Optional) PostgreSQL database for live persistence

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

### Environment Variables (Optional)

Create a `.env` file (see `.env.example`):

```bash
# Optional: Enable live persistence
DATABASE_URL=postgresql://user:password@host:5432/arbwatch

# Optional: Webhook for alerts
WEBHOOK_URL=https://your-webhook-endpoint.com/alerts
```

**Note**: The app works perfectly in replay mode without any environment variables.

## Modes

### Replay Mode (Default)
- No API keys or database required
- Uses simulated fixture data
- Perfect for demos and development
- Indicated by 🔵 REPLAY MODE banner

### Live Mode
- Set `DATABASE_URL` to enable
- Fetches real-time quotes from Binance and Coinbase
- Persists opportunities to Postgres
- Historical chart with actual data
- Indicated by 🟢 LIVE MODE banner

## API Endpoints

### `GET /api/quotes`
Returns current quotes from all venues and symbols.

```json
{
  "quotes": [
    {
      "venue": "binance",
      "symbol": "BTC",
      "bid": 95800,
      "ask": 95850,
      "mid": 95825,
      "timestamp": 1234567890,
      "age": 1000
    }
  ],
  "mode": "replay",
  "timestamp": 1234567890
}
```

### `GET /api/opportunities`
Returns current arbitrage opportunities with fee calculations.

```json
{
  "opportunities": [
    {
      "symbolPair": "BTC/binance-coinbase",
      "buyVenue": "binance",
      "sellVenue": "coinbase",
      "buyPrice": 95850,
      "sellPrice": 95950,
      "edgeBps": 104.5,
      "netEdgeBps": 34.5,
      "feesBps": 70,
      "timestamp": 1234567890,
      "alerted": false
    }
  ],
  "mode": "replay",
  "timestamp": 1234567890
}
```

### `GET /api/history`
Returns historical opportunities (requires database).

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

Tests cover:
- ✅ Fee-aware edge calculation
- ✅ Stale quote gate logic
- ✅ Symbol normalization across venues
- ✅ Alert threshold logic
- ✅ Multi-symbol opportunity detection

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add `DATABASE_URL` as environment variable (optional)
4. Deploy

The app is production-ready and works immediately in replay mode without any secrets.

### Other Platforms

The app is a standard Next.js application and can be deployed anywhere that supports Node.js:

- Netlify
- Railway
- Render
- AWS/GCP/Azure

## Project Structure

```
arbwatch/
├── app/
│   ├── api/
│   │   ├── quotes/route.ts        # Fetch quotes endpoint
│   │   ├── opportunities/route.ts # Calculate opportunities
│   │   └── history/route.ts       # Historical data
│   ├── components/
│   │   ├── QuotesTable.tsx        # Live quotes display
│   │   ├── OpportunitiesTable.tsx # Opportunities display
│   │   ├── HistoricalChart.tsx    # Chart visualization
│   │   └── StatusBanner.tsx       # Mode indicator
│   ├── layout.tsx
│   ├── page.tsx                   # Main dashboard
│   └── globals.css
├── lib/
│   ├── types.ts                   # TypeScript types
│   ├── constants.ts               # Fees, symbols, configs
│   ├── venues.ts                  # Binance & Coinbase integrations
│   ├── arbitrage.ts               # Edge calculation engine
│   ├── replay.ts                  # Fixture data
│   └── db.ts                      # Optional Postgres persistence
├── __tests__/
│   ├── arbitrage.test.ts          # Fee math & stale gate tests
│   └── normalization.test.ts      # Symbol mapping tests
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

## Educational Disclaimer

⚠️ **IMPORTANT**: This application is for **educational purposes only**.

- **NOT** financial advice
- **NOT** a trading system
- **NOT** guaranteed to be accurate
- **NOT** suitable for live trading

Crypto arbitrage involves significant risks:
- Market volatility
- Execution latency
- Transfer costs and times
- Regulatory considerations
- Exchange risks

Always consult a financial advisor before trading.

## Future Enhancements (Documented, Not Implemented)

The following features are documented for educational purposes but are NOT currently implemented:

### Phase 2: AI Integration (Stubbed)
- LLM-powered anomaly detection
- Natural language alerts
- Pattern recognition for recurring opportunities
- Market sentiment analysis

To implement AI features in the future:
1. Add OpenAI/Anthropic API integration
2. Create `/api/ai/analyze` endpoint
3. Implement prompt engineering for market analysis
4. Add LLM-based alert summarization

## Contributing

This is an educational project. Contributions are welcome for:
- Additional venues (Kraken, Gemini, etc.)
- More sophisticated fee models
- Improved UI/UX
- Additional test coverage

## License

MIT

---

Built with Next.js, TypeScript, and Tailwind CSS. Data from Binance and Coinbase public APIs.
