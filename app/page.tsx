'use client';

import { useEffect, useState } from 'react';
import { Quote, ArbitrageOpportunity } from '@/lib/types';
import QuotesTable from './components/QuotesTable';
import OpportunitiesTable from './components/OpportunitiesTable';
import HistoricalChart from './components/HistoricalChart';
import StatusBanner from './components/StatusBanner';

export default function Home() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [history, setHistory] = useState<ArbitrageOpportunity[]>([]);
  const [mode, setMode] = useState<'live' | 'replay'>('replay');
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quotesRes, oppsRes, historyRes] = await Promise.all([
          fetch('/api/quotes'),
          fetch('/api/opportunities'),
          fetch('/api/history'),
        ]);

        const quotesData = await quotesRes.json();
        const oppsData = await oppsRes.json();
        const historyData = await historyRes.json();

        setQuotes(quotesData.quotes || []);
        setOpportunities(oppsData.opportunities || []);
        setHistory(historyData.history || []);
        setMode(oppsData.mode || 'replay');
        setLastUpdate(Date.now());
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ArbWatch
          </h1>
          <p className="text-slate-400">
            Fee-aware cross-venue price discrepancy monitor (Educational)
          </p>
        </header>

        <StatusBanner mode={mode} lastUpdate={lastUpdate} />

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-300">
              Arbitrage Opportunities
            </h2>
            <OpportunitiesTable opportunities={opportunities} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-green-300">
              Live Quotes
            </h2>
            <QuotesTable quotes={quotes} />
          </section>

          {history.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-purple-300">
                Historical Edge Analysis
              </h2>
              <HistoricalChart history={history} />
            </section>
          )}
        </div>

        <footer className="mt-16 pt-8 border-t border-slate-700 text-center text-slate-500 text-sm">
          <p className="mb-2">
            ⚠️ <strong>Educational purposes only.</strong> Not financial advice.
          </p>
          <p>
            This tool monitors price discrepancies across venues but does not execute trades.
            All displayed opportunities include maker/taker fees for realistic edge calculation.
          </p>
        </footer>
      </div>
    </main>
  );
}
