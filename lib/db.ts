import { Pool } from 'pg';
import { ArbitrageOpportunity } from './types';

let pool: Pool | null = null;
let dbAvailable = false;

export function initDb() {
  if (process.env.DATABASE_URL) {
    try {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
      dbAvailable = true;
      console.log('✅ Database connection initialized');
    } catch (error) {
      console.warn('⚠️  Database connection failed, using in-memory mode:', error);
      dbAvailable = false;
    }
  } else {
    console.log('ℹ️  No DATABASE_URL found, using in-memory mode');
    dbAvailable = false;
  }
}

export async function createTablesIfNeeded() {
  if (!pool || !dbAvailable) return;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id SERIAL PRIMARY KEY,
        symbol_pair VARCHAR(50) NOT NULL,
        buy_venue VARCHAR(20) NOT NULL,
        sell_venue VARCHAR(20) NOT NULL,
        buy_price NUMERIC NOT NULL,
        sell_price NUMERIC NOT NULL,
        edge_bps NUMERIC NOT NULL,
        net_edge_bps NUMERIC NOT NULL,
        fees_bps NUMERIC NOT NULL,
        timestamp BIGINT NOT NULL,
        alerted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_opportunities_timestamp 
      ON opportunities(timestamp DESC);
    `);

    console.log('✅ Database tables verified');
  } catch (error) {
    console.error('Failed to create tables:', error);
    dbAvailable = false;
  }
}

export async function saveOpportunity(
  opp: ArbitrageOpportunity
): Promise<void> {
  if (!pool || !dbAvailable) return;

  try {
    await pool.query(
      `INSERT INTO opportunities 
       (symbol_pair, buy_venue, sell_venue, buy_price, sell_price, 
        edge_bps, net_edge_bps, fees_bps, timestamp, alerted)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        opp.symbolPair,
        opp.buyVenue,
        opp.sellVenue,
        opp.buyPrice,
        opp.sellPrice,
        opp.edgeBps,
        opp.netEdgeBps,
        opp.feesBps,
        opp.timestamp,
        opp.alerted,
      ]
    );
  } catch (error) {
    console.error('Failed to save opportunity:', error);
  }
}

export async function getRecentOpportunities(
  limit: number = 100
): Promise<ArbitrageOpportunity[]> {
  if (!pool || !dbAvailable) return [];

  try {
    const result = await pool.query(
      `SELECT * FROM opportunities 
       ORDER BY timestamp DESC 
       LIMIT $1`,
      [limit]
    );

    return result.rows.map((row) => ({
      symbolPair: row.symbol_pair,
      buyVenue: row.buy_venue,
      sellVenue: row.sell_venue,
      buyPrice: parseFloat(row.buy_price),
      sellPrice: parseFloat(row.sell_price),
      edgeBps: parseFloat(row.edge_bps),
      netEdgeBps: parseFloat(row.net_edge_bps),
      feesBps: parseFloat(row.fees_bps),
      timestamp: parseInt(row.timestamp),
      persistedSeconds: 0,
      alerted: row.alerted,
    }));
  } catch (error) {
    console.error('Failed to fetch opportunities:', error);
    return [];
  }
}

export function isDatabaseAvailable(): boolean {
  return dbAvailable;
}

initDb();
