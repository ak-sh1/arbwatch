'use client';

import { useEffect, useState } from 'react';
import { ArbitrageOpportunity, VenueHealth } from '@/lib/types';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [venueHealth, setVenueHealth] = useState<VenueHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/monitor');
        if (response.ok) {
          const data = await response.json();
          setOpportunities(data.opportunities || []);
          setVenueHealth(data.venueHealth || []);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching monitor data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1>⚡ ArbWatch</h1>
        <p>Real-time cross-venue arbitrage monitoring | Coinbase ↔ Binance</p>
      </header>

      <div className="disclaimer">
        <strong>⚠️ Educational Purpose Only:</strong> This tool is for monitoring and
        educational purposes. No actual trading is performed. All displayed opportunities
        are informational and do not constitute financial advice.
      </div>

      {loading ? (
        <div className="loading">Loading market data...</div>
      ) : (
        <Dashboard opportunities={opportunities} venueHealth={venueHealth} />
      )}
    </div>
  );
}
