# ArbWatch ⚡

**Cross-venue cryptocurrency arbitrage monitor** — Educational tool for tracking fee-aware price discrepancies across exchanges.

Built for Akash's trading-tech internship portfolio.

## 🎯 Features

- **Real-time monitoring** of BTC, ETH, SOL, and XRP across Coinbase and Binance
- **Fee-aware edge calculation**: `edge_bps = (mid_a - mid_b) / mid * 10000 - (fee_a + fee_b)_bps`
- **Stale quote detection**: Never alerts on outdated data
- **Persistence threshold**: Alerts only if opportunity persists ≥ 3 seconds
- **Venue health monitoring**: Track exchange connectivity and data freshness
- **Replay mode**: Offline demo using fixture data (no API keys required)
- **Clean UI**: Modern dashboard with live updates

## 🚀 2-Minute Demo Path

### Prerequisites

- Node.js 18+ installed
- Git installed

### Quick Start (Replay Mode)

```bash
# Clone and enter the repository
git clone <repo-url>
cd arbwatch

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**What you'll see:**
1. Live dashboard showing arbitrage opportunities
2. Venue health indicators (Coinbase, Binance)
3. Active opportunities with raw and fee-adjusted edge calculations
4. Real-time updates as replay data cycles through market scenarios

The app runs in **REPLAY MODE** by default, using pre-recorded market data fixtures. This means:
- ✅ Works offline
- ✅ No API keys needed
- ✅ Consistent, repeatable demo
- ✅ Shows realistic arbitrage scenarios

## 📊 Understanding the Dashboard

### Venue Health
Shows connection status for each exchange:
- 🟢 **Healthy**: Receiving fresh quotes
- 🔴 **Degraded**: Connection issues or stale data

### Opportunity Cards

Each card shows:
- **Symbol**: Trading pair (e.g., BTC/USD)
- **Route**: Direction of arbitrage (e.g., Coinbase → Binance)
- **Raw Edge**: Price difference before fees (in basis points)
- **Fee-Adjusted Edge**: Profit potential after trading fees
- **Quote Age**: How fresh the data is (milliseconds)
- **Badges**:
  - 🚨 **Alert**: Profitable opportunity that has persisted ≥ 3 seconds
  - ⏸️ **Stale**: Data is outdated (> 5 seconds old)

### Edge Calculation Details

```typescript
// Formula used:
edge_bps = (mid_a - mid_b) / avg_mid * 10000 - (fee_a + fee_b)_bps

// Example:
// Coinbase BTC mid: $65,025
// Binance BTC mid: $65,025
// Coinbase taker fee: 0.60% (60 bps)
// Binance taker fee: 0.10% (10 bps)
//
// Raw edge = 0 bps
// Fee-adjusted edge = 0 - 70 = -70 bps (unprofitable)
```

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **Testing**: Jest

### Project Structure

```
arbwatch/
├── app/
│   ├── api/monitor/route.ts    # API endpoint for monitoring data
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main dashboard page
├── components/
│   ├── Dashboard.tsx           # Main dashboard component
│   ├── OpportunityCard.tsx     # Individual opportunity display
│   └── VenueHealthCard.tsx     # Venue status display
├── lib/
│   ├── arbitrage.ts            # Core arbitrage logic
│   ├── config.ts               # Configuration and fees
│   ├── exchange-connector.ts   # Exchange data connectors
│   ├── monitor.ts              # Main monitoring service
│   └── types.ts                # TypeScript definitions
├── fixtures/
│   └── replay-data.json        # Mock market data
└── __tests__/
    └── arbitrage.test.ts       # Unit tests
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Tests cover:
- ✅ Fee-aware edge calculation
- ✅ Stale quote detection
- ✅ Alert persistence logic
- ✅ Edge cases and boundary conditions

## 🛠️ Development

### Build for Production

```bash
npm run build
```

The build must complete without errors before deployment.

### Run Production Build Locally

```bash
npm run build
npm start
```

## 📝 Configuration

Key parameters in `lib/config.ts`:

```typescript
{
  symbols: ['BTC', 'ETH', 'SOL', 'XRP'],
  venues: ['coinbase', 'binance'],
  staleThresholdMs: 5000,           // 5 seconds
  alertPersistenceThresholdMs: 3000, // 3 seconds
  fees: {
    coinbase: { makerBps: 40, takerBps: 60 },
    binance: { makerBps: 10, takerBps: 10 }
  }
}
```

## ⚠️ Disclaimer

**This tool is for educational and monitoring purposes only.**

- No actual trading is performed
- Displayed opportunities are informational
- Does not constitute financial advice
- Past patterns do not guarantee future opportunities
- Always consider slippage, market impact, and operational risks

## 🚢 Deployment

This app is designed to deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## 📄 License

MIT License - Built as a portfolio project for educational purposes.

---

**Built with** ⚡ by Akash for trading tech interview preparation.
