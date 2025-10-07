'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TopScheme } from '@/lib/queries/payer-analytics';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SchemeBreakdownChartProps {
  schemes: TopScheme[];
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

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
  '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'
];

export function SchemeBreakdownChart({ schemes }: SchemeBreakdownChartProps) {
  const router = useRouter();

  // Prepare data for pie chart
  const chartData = schemes.map((scheme, index) => ({
    ...scheme,
    // Use name for pie chart label
    displayName: scheme.name.length > 25 ? scheme.name.substring(0, 25) + '...' : scheme.name,
    color: COLORS[index % COLORS.length],
  }));

  // Calculate total for percentages
  const totalClaims = schemes.reduce((sum, scheme) => sum + scheme.claims, 0);

  // Handle pie slice click to navigate to scheme detail
  const handlePieClick = (data: TopScheme) => {
    router.push(`/schemes/${data.scheme_id}`);
  };

  // Custom label renderer for pie chart
  const renderCustomLabel = (entry: typeof chartData[0]) => {
    const percentage = ((entry.claims / totalClaims) * 100).toFixed(1);
    return `${percentage}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Schemes</CardTitle>
        <CardDescription>
          Schemes by claim distribution (click to view details)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Pie Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="claims"
                nameKey="displayName"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={renderCustomLabel}
                onClick={handlePieClick}
                style={{ cursor: 'pointer' }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: typeof chartData[0]) => {
                  const scheme = schemes.find(s => s.scheme_id === props.payload.scheme_id);
                  if (!scheme) return [value, name];

                  const percentage = ((scheme.claims / totalClaims) * 100).toFixed(1);
                  return [
                    `${value.toLocaleString()} claims (${percentage}%)`,
                    scheme.name
                  ];
                }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => {
                  const scheme = chartData.find(s => s.displayName === value);
                  return scheme ? scheme.displayName : value;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Scheme Table */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Scheme Details</h4>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium">Scheme</th>
                  <th className="p-2 text-right font-medium">Claims</th>
                  <th className="p-2 text-right font-medium">Volume</th>
                  <th className="p-2 text-right font-medium">Share</th>
                </tr>
              </thead>
              <tbody>
                {schemes.map((scheme, index) => {
                  const percentage = ((scheme.claims / totalClaims) * 100).toFixed(1);
                  return (
                    <tr key={scheme.scheme_id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <Link
                            href={`/schemes/${scheme.scheme_id}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {scheme.name}
                          </Link>
                        </div>
                      </td>
                      <td className="p-2 text-right">{scheme.claims.toLocaleString()}</td>
                      <td className="p-2 text-right">{formatCurrency(scheme.volume_cents)}</td>
                      <td className="p-2 text-right font-medium">{percentage}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
