/**
 * Monthly Trends Chart Component
 *
 * Line chart showing monthly claims volume and approval trends
 */

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyTrendData {
  month: string;
  claims: number;
  volume_cents: number;
  approved_cents: number;
}

interface MonthlyTrendsChartProps {
  trends: MonthlyTrendData[];
}

/**
 * Format cents to KES currency
 */
function formatCurrency(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Custom tooltip for the chart
 */
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
        <p className="font-semibold text-slate-900">{label}</p>
        <div className="mt-2 space-y-1 text-sm">
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}:{' '}
              <span className="font-medium">
                {entry.dataKey === 'claims'
                  ? entry.value.toLocaleString()
                  : formatCurrency(entry.value * 100)}
              </span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export function MonthlyTrendsChart({ trends }: MonthlyTrendsChartProps) {
  // Transform data for the chart
  const chartData = trends.map((trend) => ({
    month: trend.month,
    claims: trend.claims,
    volume: trend.volume_cents / 100, // Convert to KES
    approved: trend.approved_cents / 100, // Convert to KES
  }));

  if (trends.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        No trend data available
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(value) =>
              new Intl.NumberFormat('en-KE', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(value)
            }
            tick={{ fontSize: 12, fill: '#64748b' }}
            label={{
              value: 'Volume (KES)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#64748b' },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: '#64748b' }}
            label={{
              value: 'Claims',
              angle: 90,
              position: 'insideRight',
              style: { fontSize: 12, fill: '#64748b' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="volume"
            name="Invoice Volume (KES)"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="approved"
            name="Approved Volume (KES)"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="claims"
            name="Total Claims"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
