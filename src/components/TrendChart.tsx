/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency } from '../lib/utils';

interface TrendChartProps {
  data: { month: string; value: number }[];
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  return (
    <div id="trend-chart-container" className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#171717" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#171717" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#737373' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value) => {
              if (value >= 10000000) return `₹${(value/10000000).toFixed(1)}Cr`;
              if (value >= 100000) return `₹${(value/100000).toFixed(1)}L`;
              return `₹${value/1000}k`;
            }}
            tick={{ fontSize: 11, fill: '#737373' }} 
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-neutral-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl font-mono">
                    <p className="opacity-60">{payload[0].payload.month}</p>
                    <p className="font-bold">{formatCurrency(payload[0].value as number)}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#171717" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
