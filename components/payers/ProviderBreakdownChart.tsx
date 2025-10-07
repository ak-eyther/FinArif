'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TopProvider } from '@/lib/queries/payer-analytics';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProviderBreakdownChartProps {
  providers: TopProvider[];
}

// Format cents to KES currency
function formatCurrency(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Compact currency formatter for chart
function formatCompactCurrency(cents: number): string {
  const amount = cents / 100;
  if (amount >= 1000000) {
    return `KES ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `KES ${(amount / 1000).toFixed(0)}K`;
  }
  return formatCurrency(cents);
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
  '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'
];

export function ProviderBreakdownChart({ providers }: ProviderBreakdownChartProps) {
  const router = useRouter();

  // Prepare data for chart
  const chartData = providers.map((provider, index) => ({
    ...provider,
    // Truncate long names for display
    displayName: provider.name.length > 20 ? provider.name.substring(0, 20) + '...' : provider.name,
    color: COLORS[index % COLORS.length],
  }));

  // Handle bar click to navigate to provider detail
  const handleBarClick = (data: any) => {
    if (data && data.provider_id) {
      router.push(`/providers/${data.provider_id}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Providers</CardTitle>
        <CardDescription>
          Providers by claim volume (click to view details)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Bar Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="displayName"
                angle={-45}
                textAnchor="end"
                height={100}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                tickFormatter={(value) => formatCompactCurrency(value)}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'volume_cents') {
                    return [formatCurrency(value), 'Volume'];
                  }
                  return [value, 'Claims'];
                }}
                labelFormatter={(label) => {
                  const provider = chartData.find(p => p.displayName === label);
                  return provider ? provider.name : label;
                }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Legend />
              <Bar
                dataKey="volume_cents"
                name="Volume"
                onClick={(data: any) => data?.payer_id || data?.provider_id || data?.scheme_id ? handleBarClick(data) : null}
                style={{ cursor: 'pointer' }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Provider Table */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Provider Details</h4>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium">Provider</th>
                  <th className="p-2 text-right font-medium">Claims</th>
                  <th className="p-2 text-right font-medium">Volume</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider, index) => (
                  <tr key={provider.provider_id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-2">
                      <Link
                        href={`/providers/${provider.provider_id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {provider.name}
                      </Link>
                    </td>
                    <td className="p-2 text-right">{provider.claims.toLocaleString()}</td>
                    <td className="p-2 text-right">{formatCurrency(provider.volume_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
