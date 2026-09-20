import { NextResponse } from 'next/server';
import { ArbitrageMonitor } from '@/lib/monitor';
import { DEFAULT_CONFIG } from '@/lib/config';
import { createConnector } from '@/lib/exchange-connector';

let monitor: ArbitrageMonitor | null = null;

function getMonitor(): ArbitrageMonitor {
  if (!monitor) {
    const connectors = new Map();
    for (const venue of DEFAULT_CONFIG.venues) {
      connectors.set(venue, createConnector(venue, 'replay'));
    }
    monitor = new ArbitrageMonitor(DEFAULT_CONFIG, connectors);
  }
  return monitor;
}

export async function GET() {
  try {
    const monitor = getMonitor();
    await monitor.update();

    const opportunities = monitor.getOpportunities();
    const venueHealth = monitor.getVenueHealth();

    return NextResponse.json({
      opportunities,
      venueHealth,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error in monitor API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monitor data' },
      { status: 500 }
    );
  }
}
