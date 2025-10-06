/**
 * WACC Trend Chart Component
 *
 * Visualizes Weighted Average Cost of Capital (WACC) trends over time periods
 */

'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatPercentage, formatCentsIndian } from '@/lib/utils/format';
import type { Cents } from '@/lib/types';
import type { WACCTrendDataPoint } from '@/lib/utils/trend-data';

/**
 * Component props
 */
export interface WACCTrendChartProps {
  data: WACCTrendDataPoint[];
  height?: number;
}

/**
 * Custom tooltip for WACC trend chart
 */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: WACCTrendDataPoint }>;
}): React.ReactElement | null {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="grid gap-2">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground">
            {data.period}
          </span>
          <span className="text-lg font-bold">
            {formatPercentage(data.wacc)}
          </span>
          <span className="text-xs text-muted-foreground">
            Total Capital: {formatCentsIndian(data.totalCapital as Cents)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * WACC Trend Chart Component
 *
 * Displays a line chart showing WACC trends over time periods
 *
 * @param props - Component props
 * @returns React component
 */
export function WACCTrendChart({
  data,
  height = 300,
}: WACCTrendChartProps): React.ReactElement {
  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height: `${height}px` }}
      >
        <p>No data available</p>
      </div>
    );
  }

  // Convert WACC to percentage for display
  const chartData = data.map((point) => ({
    ...point,
    waccPercentage: point.wacc * 100, // Convert to percentage
  }));

  // Calculate dynamic Y-axis domain based on data
  // Extract all WACC percentage values, filtering out invalid entries
  const waccValues = chartData
    .map((point) => point.waccPercentage)
    .filter((value) => typeof value === 'number' && !isNaN(value) && isFinite(value));

  // Calculate max WACC with 10% headroom
  const maxWACC = waccValues.length > 0 ? Math.max(...waccValues) : 0;
  const headroomFactor = 1.1; // 10% headroom above max value
  const maxWithHeadroom = maxWACC * headroomFactor;

  // Use sensible minimum (10%) to avoid tiny charts for low WACC values
  const minDomainCeiling = 10;
  const dynamicMax = Math.max(maxWithHeadroom, minDomainCeiling);

  // Round up to nearest 5 for cleaner axis labels
  const roundedMax = Math.ceil(dynamicMax / 5) * 5;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="period"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          className="fill-muted-foreground"
        />
        <YAxis
          fontSize={12}
          tickLine={false}
          axisLine={false}
          domain={[0, roundedMax]}
          tickFormatter={(value: number) => `${value}%`}
          className="fill-muted-foreground"
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="waccPercentage"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={{
            fill: 'hsl(var(--chart-1))',
            strokeWidth: 2,
            r: 4,
          }}
          activeDot={{
            r: 6,
            strokeWidth: 2,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
