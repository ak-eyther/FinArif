/**
 * Capital Management Page
 *
 * Shows capital sources, utilization, and performance metrics
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CAPITAL_SOURCES } from '@/lib/constants';
import { getActiveTransactions } from '@/lib/mock-data';
import type { Cents, CapitalSource } from '@/lib/types';
import { formatCents, formatPercentage } from '@/lib/utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * Extended capital source with calculated utilization
 */
interface CapitalSourceWithUtilization extends CapitalSource {
  utilizationRate: number; // Decimal (e.g., 0.75 for 75%)
}

/**
 * Calculate capital utilization from active transactions
 *
 * @returns Array of capital sources with current utilization
 */
function calculateCapitalUtilization(): CapitalSourceWithUtilization[] {
  const activeTransactions = getActiveTransactions();

  // Group active transactions by capital source and sum amounts
  const usedBySource = new Map<string, number>();

  activeTransactions.forEach((transaction) => {
    const current = usedBySource.get(transaction.capitalSourceName) || 0;
    usedBySource.set(
      transaction.capitalSourceName,
      current + transaction.claimAmountCents
    );
  });

  // Create new capital sources with updated usage
  return CAPITAL_SOURCES.map((source) => {
    const usedCents = (usedBySource.get(source.name) || 0) as Cents;
    const remainingCents = (source.availableCents - usedCents) as Cents;
    const utilizationRate = source.availableCents > 0
      ? usedCents / source.availableCents
      : 0;

    return {
      ...source,
      usedCents,
      remainingCents,
      utilizationRate,
    };
  });
}

/**
 * Get color based on annual rate (cheaper = green, expensive = red)
 *
 * @param rate - Annual rate as decimal
 * @returns Tailwind color class
 */
function getRateColor(rate: number): string {
  if (rate === 0) return '#10b981'; // green-500 (equity - no interest)
  if (rate <= 0.05) return '#22c55e'; // green-500 (grant - 5%)
  if (rate <= 0.14) return '#f59e0b'; // amber-500 (bank - 14%)
  return '#ef4444'; // red-500 (investor debt - 20%)
}

/**
 * Data point for utilization chart
 */
interface ChartDataPoint {
  name: string;
  utilization: number; // Percentage (0-100)
  rate: number; // Annual rate as decimal
}

/**
 * Prepare data for utilization bar chart
 *
 * @param sources - Capital sources with utilization
 * @returns Chart data points
 */
function prepareChartData(sources: CapitalSourceWithUtilization[]): ChartDataPoint[] {
  return sources.map((source) => ({
    name: source.name,
    utilization: Math.round(source.utilizationRate * 100),
    rate: source.annualRate,
  }));
}

/**
 * Custom tooltip for bar chart
 */
function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ value: number; payload: ChartDataPoint }>;
}): React.ReactElement | null {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">
            {data.name}
          </span>
          <span className="font-bold text-muted-foreground">
            {data.utilization}% utilized
          </span>
          <span className="text-[0.70rem] text-muted-foreground">
            Rate: {formatPercentage(data.rate)}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Capital Management Page Component
 */
export default function CapitalPage(): React.ReactElement {
  const capitalSources = calculateCapitalUtilization();
  const chartData = prepareChartData(capitalSources);

  // Calculate total metrics
  const totalAvailable = capitalSources.reduce(
    (sum, source) => sum + source.availableCents,
    0
  ) as Cents;

  const totalUsed = capitalSources.reduce(
    (sum, source) => sum + source.usedCents,
    0
  ) as Cents;

  const totalRemaining = (totalAvailable - totalUsed) as Cents;
  const overallUtilization = totalAvailable > 0 ? totalUsed / totalAvailable : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Capital Management</h1>
        <p className="text-muted-foreground">
          Monitor capital sources and utilization across your portfolio
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCents(totalAvailable)}</div>
            <p className="text-xs text-muted-foreground">
              Across {capitalSources.length} sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCents(totalUsed)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(overallUtilization)} of available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Capital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCents(totalRemaining)}</div>
            <p className="text-xs text-muted-foreground">
              Available for deployment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(overallUtilization)}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall portfolio utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Capital Utilization by Source</CardTitle>
          <CardDescription>
            Color-coded by cost: green (cheapest) to red (most expensive)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="utilization" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getRateColor(entry.rate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Capital Sources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Capital Sources Detail</CardTitle>
          <CardDescription>
            Detailed breakdown of each capital source and its current utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Name</TableHead>
                <TableHead className="text-right">Annual Rate</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Used</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="text-right">Utilization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {capitalSources.map((source) => (
                <TableRow key={source.name}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell className="text-right">
                    {formatPercentage(source.annualRate)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCents(source.availableCents)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCents(source.usedCents)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCents(source.remainingCents)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        source.utilizationRate > 0.8
                          ? 'font-semibold text-red-600'
                          : source.utilizationRate > 0.5
                          ? 'font-semibold text-yellow-600'
                          : 'font-semibold text-green-600'
                      }
                    >
                      {formatPercentage(source.utilizationRate)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
