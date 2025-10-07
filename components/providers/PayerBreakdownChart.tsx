'use client';

/**
 * Payer Breakdown Bar Chart Component
 * Shows top payers by claims volume with clickable bars
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatKES } from '@/lib/utils/analytics-calculator';
import { useRouter } from 'next/navigation';

interface PayerData {
  payer_id: number;
  name: string;
  claims: number;
  invoice_cents: number;
  approved_cents: number;
}

interface PayerBreakdownChartProps {
  data: PayerData[];
  title?: string;
}

export function PayerBreakdownChart({
  data,
  title = 'Top Payers by Claims Volume',
}: PayerBreakdownChartProps) {
  const router = useRouter();

  // Transform data for chart
  const chartData = data.map((item) => ({
    ...item,
    value: item.claims,
    displayName: item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name,
  }));

  const handleBarClick = (data: any) => {
    router.push(`/payers/${data.payer_id}`);
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: PayerData }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Claims: {data.claims}</p>
          <p className="text-sm text-gray-600">Invoice: {formatKES(data.invoice_cents)}</p>
          <p className="text-sm text-gray-600">Approved: {formatKES(data.approved_cents)}</p>
          <p className="text-xs text-blue-600 mt-2">Click to view details</p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            No payer data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="displayName"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: 'Claims', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              cursor="pointer"
              onClick={(data: any) => data?.payer_id || data?.provider_id || data?.scheme_id ? handleBarClick(data) : null}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(${210 + index * 10}, 70%, ${50 + index * 5}%)`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-500 text-center">
          Click on any bar to view payer details
        </div>
      </CardContent>
    </Card>
  );
}
