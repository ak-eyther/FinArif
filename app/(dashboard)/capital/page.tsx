/**
 * Capital Management Page
 *
 * Shows capital sources, utilization, and performance metrics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getActiveTransactions } from '@/lib/mock-data';
import type { Cents, CapitalSource, PeriodType, DateRange } from '@/lib/types';
import { formatCentsIndian, formatPercentage } from '@/lib/utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AddCapitalSourceDialog } from '@/components/capital/AddCapitalSourceDialog';
import { PeriodSelector } from '@/components/capital/PeriodSelector';
import { WACCTrendChart } from '@/components/capital/WACCTrendChart';
import type { WACCTrendDataPoint } from '@/components/capital/WACCTrendChart';
import { getCapitalHistory, initializeCapitalHistory, getActiveCapitalSources } from '@/lib/data/capital-history-store';
import { calculateWACCAtDate, calculatePeriodWACC, getWACCTrendData } from '@/lib/calculations/wacc';
import { getPeriodDates, subtractDays } from '@/lib/utils/date-period';

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

  // Get active capital sources from history store (not static constant)
  const activeSources = getActiveCapitalSources();

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
  return activeSources.map((source) => {
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
  // State for dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State for forcing re-render when capital sources change
  const [refreshKey, setRefreshKey] = useState(0);

  // State for period selection
  const [selectedPeriod, setSelectedPeriod] = useState<{
    periodType: PeriodType;
    dateRange: DateRange;
  }>({
    periodType: 'monthly',
    dateRange: getPeriodDates('monthly', new Date()),
  });

  // Initialize capital history on mount
  useEffect(() => {
    initializeCapitalHistory();
    setRefreshKey((prev) => prev + 1);
  }, []);

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

  // Get capital history for WACC calculations
  const capitalHistory = getCapitalHistory();

  // Calculate current WACC
  const currentWACCSnapshot = calculateWACCAtDate(new Date(), capitalHistory);
  const currentWACC = currentWACCSnapshot.wacc;

  // Calculate period WACC metrics
  const periodWACC = calculatePeriodWACC(
    selectedPeriod.periodType,
    selectedPeriod.dateRange.startDate,
    capitalHistory
  );

  // Generate trend data based on period type
  const generateTrendData = (): WACCTrendDataPoint[] => {
    const now = new Date();
    let periods: DateRange[] = [];

    switch (selectedPeriod.periodType) {
      case 'monthly': {
        // Show last 12 months
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        for (let i = 11; i >= 0; i--) {
          const date = new Date(currentYear, currentMonth - i, 1);
          const monthPeriod = getPeriodDates('monthly', date);
          periods.push(monthPeriod);
        }
        break;
      }

      case 'quarterly': {
        // Show last 4 quarters
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3);

        for (let i = 3; i >= 0; i--) {
          const quarterOffset = currentQuarter - i;
          const year = currentYear + Math.floor(quarterOffset / 4);
          const quarter = ((quarterOffset % 4) + 4) % 4;
          const date = new Date(year, quarter * 3, 1);
          const quarterPeriod = getPeriodDates('quarterly', date);
          periods.push(quarterPeriod);
        }
        break;
      }

      case 'yearly': {
        // Show last 3 years
        const currentYear = now.getFullYear();

        for (let i = 2; i >= 0; i--) {
          const date = new Date(currentYear - i, 0, 1);
          const yearPeriod = getPeriodDates('yearly', date);
          periods.push(yearPeriod);
        }
        break;
      }

      case '60-day':
      case '90-day': {
        // Show last 6 rolling periods
        const days = selectedPeriod.periodType === '60-day' ? 60 : 90;

        for (let i = 5; i >= 0; i--) {
          const startDate = subtractDays(now, days * (i + 1));
          const period = getPeriodDates(selectedPeriod.periodType, startDate);
          periods.push(period);
        }
        break;
      }

      case 'custom': {
        // Show just the selected period
        periods = [selectedPeriod.dateRange];
        break;
      }
    }

    // Generate trend data from periods
    const trendData = getWACCTrendData(periods, capitalHistory);

    // Convert to WACCTrendDataPoint format
    return trendData.map((point) => ({
      period: point.period,
      wacc: point.wacc,
      totalCapital: point.totalCapital,
    }));
  };

  const trendData = generateTrendData();

  // Handler for successful capital source addition
  const handleCapitalSourceAdded = () => {
    // Force re-render to pick up the new source from history
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col gap-6" key={refreshKey}>
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Capital Management</h1>
          <AddCapitalSourceDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSuccess={handleCapitalSourceAdded}
          />
        </div>
        <p className="text-muted-foreground">
          Monitor capital sources and utilization across your portfolio
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCentsIndian(totalAvailable)}</div>
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
            <div className="text-2xl font-bold">{formatCentsIndian(totalUsed)}</div>
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
            <div className="text-2xl font-bold">{formatCentsIndian(totalRemaining)}</div>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current WACC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(currentWACC)}
            </div>
            <p className="text-xs text-muted-foreground">
              Weighted average cost
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

      {/* WACC Analysis Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>WACC Analysis Over Time</CardTitle>
          <CardDescription>
            Weighted Average Cost of Capital trends across different time periods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Period Selector */}
          <PeriodSelector
            value={selectedPeriod}
            onChange={setSelectedPeriod}
          />

          {/* Period Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Start WACC
              </div>
              <div className="mt-2 text-2xl font-bold">
                {formatPercentage(periodWACC.start)}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                End WACC
              </div>
              <div className="mt-2 text-2xl font-bold">
                {formatPercentage(periodWACC.end)}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Average WACC
              </div>
              <div className="mt-2 text-2xl font-bold">
                {formatPercentage(periodWACC.average)}
              </div>
            </div>
          </div>

          {/* WACC Trend Chart */}
          <div className="mt-6">
            <WACCTrendChart data={trendData} height={350} />
          </div>
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
                    {formatCentsIndian(source.availableCents)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCentsIndian(source.usedCents)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCentsIndian(source.remainingCents)}
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
