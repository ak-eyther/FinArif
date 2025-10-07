/**
 * Provider Breakdown Chart Component
 *
 * Bar chart showing top providers by volume with clickable bars
 * Clicking a bar navigates to the provider detail page
 */

'use client';

import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ProviderData {
  provider_id: number;
  name: string;
  claims: number;
  volume_cents: number;
}

interface ProviderBreakdownChartProps {
  providers: ProviderData[];
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
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
        <p className="font-semibold text-slate-900">{data.name}</p>
        <div className="mt-2 space-y-1 text-sm">
          <p className="text-slate-600">
            Claims: <span className="font-medium">{data.claims}</span>
          </p>
          <p className="text-slate-600">
            Volume: <span className="font-medium">{formatCurrency(data.volume_cents)}</span>
          </p>
        </div>
        <p className="mt-2 text-xs text-blue-600">Click to view provider details</p>
      </div>
    );
  }
  return null;
}

export function ProviderBreakdownChart({ providers }: ProviderBreakdownChartProps) {
  const router = useRouter();

  // Transform data for the chart
  const chartData = providers.map((provider) => ({
    name: provider.name,
    volume: provider.volume_cents / 100, // Convert to KES
    claims: provider.claims,
    provider_id: provider.provider_id,
    volume_cents: provider.volume_cents,
  }));

  // Handle bar click
  const handleBarClick = (data: any) => {
    if (data && data.provider_id) {
      router.push(`/providers/${data.provider_id}`);
    }
  };

  if (providers.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        No provider data available
      </div>
    );
  }

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <YAxis
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
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar
            dataKey="volume"
            name="Volume (KES)"
            fill="#3b82f6"
            radius={[8, 8, 0, 0]}
            onClick={handleBarClick}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill="#3b82f6"
                className="hover:fill-blue-700 transition-colors"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
