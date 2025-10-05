/**
 * Risk Analysis Dashboard Page
 *
 * Displays risk analysis for active transactions including:
 * - Risk heat map (scatter chart)
 * - Risk distribution cards
 * - Concentration metrics by provider and insurer
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getActiveTransactions } from '@/lib/mock-data';
import { formatCentsCompact, formatPercentage } from '@/lib/utils/format';
import type { Transaction, RiskLevel, Cents } from '@/lib/types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useMemo } from 'react';
import { centsToKes } from '@/lib/constants';

/**
 * Risk heat map data point
 */
interface RiskDataPoint {
  providerRisk: number;
  insuranceRisk: number;
  riskLevel: RiskLevel;
  amount: number;
  providerName: string;
  insuranceName: string;
  id: string;
}

/**
 * Risk distribution summary
 */
interface RiskDistribution {
  low: { count: number; percentage: number };
  medium: { count: number; percentage: number };
  high: { count: number; percentage: number };
}

/**
 * Concentration metric for provider/insurer
 */
interface ConcentrationItem {
  name: string;
  exposureCents: Cents;
  percentage: number;
}

/**
 * Get color for risk level
 */
function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return '#22c55e'; // green-500
    case 'medium':
      return '#eab308'; // yellow-500
    case 'high':
      return '#ef4444'; // red-500
  }
}

/**
 * Custom tooltip for scatter chart
 */
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: RiskDataPoint }> }): JSX.Element | null {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-sm mb-2">{data.providerName}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{data.insuranceName}</p>
      <div className="space-y-1 text-xs">
        <p>Provider Risk: <span className="font-medium">{data.providerRisk}</span></p>
        <p>Insurance Risk: <span className="font-medium">{data.insuranceRisk}</span></p>
        <p>Amount: <span className="font-medium">{formatCentsCompact(data.amount as Cents)}</span></p>
        <p>
          Risk Level:{' '}
          <Badge
            variant={data.riskLevel === 'low' ? 'default' : data.riskLevel === 'medium' ? 'secondary' : 'destructive'}
            className="ml-1"
          >
            {data.riskLevel}
          </Badge>
        </p>
      </div>
    </div>
  );
}

/**
 * Calculate risk distribution from transactions
 */
function calculateRiskDistribution(transactions: Transaction[]): RiskDistribution {
  const total = transactions.length;

  const counts = transactions.reduce(
    (acc, tx) => {
      acc[tx.riskLevel] = (acc[tx.riskLevel] || 0) + 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0 } as Record<RiskLevel, number>
  );

  return {
    low: {
      count: counts.low,
      percentage: total > 0 ? counts.low / total : 0
    },
    medium: {
      count: counts.medium,
      percentage: total > 0 ? counts.medium / total : 0
    },
    high: {
      count: counts.high,
      percentage: total > 0 ? counts.high / total : 0
    }
  };
}

/**
 * Calculate top concentrations by provider
 */
function calculateProviderConcentration(transactions: Transaction[]): ConcentrationItem[] {
  const providerMap = new Map<string, Cents>();
  let totalExposure: Cents = 0 as Cents;

  // Sum exposure by provider
  transactions.forEach(tx => {
    const current = providerMap.get(tx.providerName) || (0 as Cents);
    providerMap.set(tx.providerName, (current + tx.claimAmountCents) as Cents);
    totalExposure = (totalExposure + tx.claimAmountCents) as Cents;
  });

  // Convert to array and sort by exposure
  const items: ConcentrationItem[] = Array.from(providerMap.entries())
    .map(([name, exposureCents]) => ({
      name,
      exposureCents,
      percentage: totalExposure > 0 ? exposureCents / totalExposure : 0
    }))
    .sort((a, b) => b.exposureCents - a.exposureCents)
    .slice(0, 3); // Top 3

  return items;
}

/**
 * Calculate top concentrations by insurer
 */
function calculateInsurerConcentration(transactions: Transaction[]): ConcentrationItem[] {
  const insurerMap = new Map<string, Cents>();
  let totalExposure: Cents = 0 as Cents;

  // Sum exposure by insurer
  transactions.forEach(tx => {
    const current = insurerMap.get(tx.insuranceName) || (0 as Cents);
    insurerMap.set(tx.insuranceName, (current + tx.claimAmountCents) as Cents);
    totalExposure = (totalExposure + tx.claimAmountCents) as Cents;
  });

  // Convert to array and sort by exposure
  const items: ConcentrationItem[] = Array.from(insurerMap.entries())
    .map(([name, exposureCents]) => ({
      name,
      exposureCents,
      percentage: totalExposure > 0 ? exposureCents / totalExposure : 0
    }))
    .sort((a, b) => b.exposureCents - a.exposureCents)
    .slice(0, 3); // Top 3

  return items;
}

/**
 * Risk Analysis Dashboard Page Component
 */
export default function RiskPage(): JSX.Element {
  const transactions = getActiveTransactions();

  // Prepare heat map data
  const heatMapData = useMemo<RiskDataPoint[]>(() => {
    return transactions.map(tx => ({
      providerRisk: tx.providerRiskScore,
      insuranceRisk: tx.insuranceRiskScore,
      riskLevel: tx.riskLevel,
      amount: tx.claimAmountCents,
      providerName: tx.providerName,
      insuranceName: tx.insuranceName,
      id: tx.id
    }));
  }, [transactions]);

  // Calculate risk distribution
  const riskDistribution = useMemo<RiskDistribution>(() => {
    return calculateRiskDistribution(transactions);
  }, [transactions]);

  // Calculate concentrations
  const providerConcentration = useMemo<ConcentrationItem[]>(() => {
    return calculateProviderConcentration(transactions);
  }, [transactions]);

  const insurerConcentration = useMemo<ConcentrationItem[]>(() => {
    return calculateInsurerConcentration(transactions);
  }, [transactions]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Risk Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Risk assessment and concentration analysis for active transactions
        </p>
      </div>

      {/* Risk Distribution Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Low Risk Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskDistribution.low.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(riskDistribution.low.percentage)} of portfolio
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Risk Score: 0-30
            </p>
          </CardContent>
        </Card>

        {/* Medium Risk Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskDistribution.medium.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(riskDistribution.medium.percentage)} of portfolio
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Risk Score: 31-60
            </p>
          </CardContent>
        </Card>

        {/* High Risk Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <div className="h-4 w-4 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskDistribution.high.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(riskDistribution.high.percentage)} of portfolio
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Risk Score: 61-100
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Heat Map */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Heat Map</CardTitle>
          <CardDescription>
            Provider risk vs. insurance risk visualization. Point size represents claim amount.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="providerRisk"
                name="Provider Risk Score"
                domain={[0, 100]}
                label={{ value: 'Provider Risk Score', position: 'bottom', offset: 0 }}
              />
              <YAxis
                type="number"
                dataKey="insuranceRisk"
                name="Insurance Risk Score"
                domain={[0, 100]}
                label={{ value: 'Insurance Risk Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value: string) => {
                  if (value === 'low') return 'Low Risk (0-30)';
                  if (value === 'medium') return 'Medium Risk (31-60)';
                  if (value === 'high') return 'High Risk (61-100)';
                  return value;
                }}
              />
              <Scatter name="low" data={heatMapData.filter(d => d.riskLevel === 'low')} fill="#22c55e">
                {heatMapData
                  .filter(d => d.riskLevel === 'low')
                  .map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={getRiskColor(entry.riskLevel)}
                      r={Math.max(5, Math.min(20, centsToKes(entry.amount as Cents) / 100000))}
                    />
                  ))}
              </Scatter>
              <Scatter name="medium" data={heatMapData.filter(d => d.riskLevel === 'medium')} fill="#eab308">
                {heatMapData
                  .filter(d => d.riskLevel === 'medium')
                  .map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={getRiskColor(entry.riskLevel)}
                      r={Math.max(5, Math.min(20, centsToKes(entry.amount as Cents) / 100000))}
                    />
                  ))}
              </Scatter>
              <Scatter name="high" data={heatMapData.filter(d => d.riskLevel === 'high')} fill="#ef4444">
                {heatMapData
                  .filter(d => d.riskLevel === 'high')
                  .map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={getRiskColor(entry.riskLevel)}
                      r={Math.max(5, Math.min(20, centsToKes(entry.amount as Cents) / 100000))}
                    />
                  ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Concentration Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Provider Concentration */}
        <Card>
          <CardHeader>
            <CardTitle>Top Providers by Exposure</CardTitle>
            <CardDescription>
              Largest concentration of exposure by healthcare provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {providerConcentration.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{item.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCentsCompact(item.exposureCents)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPercentage(item.percentage)}</p>
                    <p className="text-xs text-muted-foreground">of portfolio</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insurer Concentration */}
        <Card>
          <CardHeader>
            <CardTitle>Top Insurers by Exposure</CardTitle>
            <CardDescription>
              Largest concentration of exposure by insurance company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insurerConcentration.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{item.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCentsCompact(item.exposureCents)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPercentage(item.percentage)}</p>
                    <p className="text-xs text-muted-foreground">of portfolio</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
