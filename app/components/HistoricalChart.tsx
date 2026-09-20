'use client';

import { ArbitrageOpportunity } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HistoricalChartProps {
  history: ArbitrageOpportunity[];
}

export default function HistoricalChart({ history }: HistoricalChartProps) {
  const chartData = history
    .slice(0, 50)
    .reverse()
    .map((opp, idx) => ({
      index: idx,
      netEdge: parseFloat(opp.netEdgeBps.toFixed(2)),
      grossEdge: parseFloat(opp.edgeBps.toFixed(2)),
      fees: parseFloat(opp.feesBps.toFixed(2)),
      pair: opp.symbolPair.split('/')[0],
    }));

  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="index" 
            stroke="#94a3b8"
            label={{ value: 'Recent Opportunities', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
          />
          <YAxis 
            stroke="#94a3b8"
            label={{ value: 'Basis Points (bps)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#f1f5f9'
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Legend 
            wrapperStyle={{ color: '#94a3b8' }}
          />
          <Line 
            type="monotone" 
            dataKey="grossEdge" 
            stroke="#8b5cf6" 
            name="Gross Edge" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="fees" 
            stroke="#ef4444" 
            name="Total Fees" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="netEdge" 
            stroke="#22c55e" 
            name="Net Edge" 
            strokeWidth={3}
            dot={{ fill: '#22c55e', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
