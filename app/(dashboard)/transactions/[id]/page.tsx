/**
 * Transaction Detail Page
 *
 * Displays complete transaction information including:
 * - Transaction summary
 * - Complete P&L breakdown with waterfall
 * - Risk details with scoring breakdown
 */

import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getTransactionById } from '@/lib/mock-data';
import { calculatePL } from '@/lib/calculations/profit-loss';
import { formatCents, formatPercentage, formatDate, formatDays } from '@/lib/utils/format';
import type { RiskLevel } from '@/lib/types';

/**
 * Page props with dynamic route params
 * Next.js 15: params are now async
 */
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Get badge variant based on transaction status
 */
function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'active':
      return 'default';
    case 'collected':
      return 'secondary';
    case 'defaulted':
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * Get badge variant based on risk level
 */
function getRiskBadgeVariant(level: RiskLevel): 'default' | 'secondary' | 'destructive' {
  switch (level) {
    case 'low':
      return 'secondary';
    case 'medium':
      return 'default';
    case 'high':
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * Transaction Detail Page Component
 */
export default async function TransactionDetailPage({ params }: PageProps): Promise<React.ReactElement> {
  // Get transaction by ID (await params in Next.js 15)
  const { id } = await params;
  const transaction = getTransactionById(id);

  // Handle not found case
  if (!transaction) {
    notFound();
  }

  // Calculate P&L breakdown
  const pl = calculatePL(
    transaction.claimAmountCents,
    transaction.riskScore,
    transaction.capitalAnnualRate,
    transaction.daysToCollection
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction Details</h1>
          <p className="text-muted-foreground mt-1">
            Transaction ID: {transaction.id}
          </p>
        </div>
        <Badge variant={getStatusBadgeVariant(transaction.status)} className="text-sm">
          {transaction.status.toUpperCase()}
        </Badge>
      </div>

      {/* Transaction Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Provider</p>
                <p className="text-lg font-semibold">{transaction.providerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Insurance Company</p>
                <p className="text-lg font-semibold">{transaction.insuranceName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Claim Amount</p>
                <p className="text-2xl font-bold">{formatCents(transaction.claimAmountCents)}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-lg font-semibold">{transaction.riskScore}/100</p>
                  <Badge variant={getRiskBadgeVariant(transaction.riskLevel)}>
                    {transaction.riskLevel.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disbursement Date</p>
                <p className="text-lg font-semibold">{formatDate(transaction.disbursementDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Collection</p>
                <p className="text-lg font-semibold">
                  {formatDate(transaction.expectedCollectionDate)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ({formatDays(transaction.daysToCollection)})
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* P&L Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profit &amp; Loss Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete financial analysis with all cost components
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Claim Amount */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Claim Amount</p>
              <p className="text-sm text-muted-foreground">Original claim value</p>
            </div>
            <p className="text-xl font-bold">{formatCents(pl.claimAmountCents)}</p>
          </div>

          <Separator />

          {/* Revenue */}
          <div className="flex items-center justify-between py-3 bg-green-50 dark:bg-green-950/20 px-4 rounded-lg">
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">Revenue</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Discount fee ({formatPercentage(transaction.feeRate)})
              </p>
            </div>
            <p className="text-xl font-bold text-green-900 dark:text-green-100">
              +{formatCents(pl.revenueCents)}
            </p>
          </div>

          <Separator />

          {/* Costs Section Header */}
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Costs
            </p>
          </div>

          {/* Capital Cost */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Capital Cost</p>
              <p className="text-sm text-muted-foreground">
                {formatPercentage(transaction.capitalAnnualRate)} × {formatDays(transaction.daysToCollection)} ({transaction.capitalSourceName})
              </p>
            </div>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              -{formatCents(pl.capitalCostCents)}
            </p>
          </div>

          {/* Operating Cost */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Operating Cost</p>
              <p className="text-sm text-muted-foreground">
                Platform costs, servicing, admin (0.5%)
              </p>
            </div>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              -{formatCents(pl.operatingCostCents)}
            </p>
          </div>

          {/* Default Provision */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Default Provision</p>
              <p className="text-sm text-muted-foreground">
                Risk-based provision ({transaction.riskScore} × 2%)
              </p>
            </div>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              -{formatCents(pl.defaultProvisionCents)}
            </p>
          </div>

          <Separator className="my-2" />

          {/* Total Costs */}
          <div className="flex items-center justify-between py-3 bg-red-50 dark:bg-red-950/20 px-4 rounded-lg">
            <div>
              <p className="font-medium text-red-900 dark:text-red-100">Total Costs</p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Sum of all cost components
              </p>
            </div>
            <p className="text-xl font-bold text-red-900 dark:text-red-100">
              -{formatCents(pl.totalCostsCents)}
            </p>
          </div>

          <Separator className="my-4" />

          {/* Net Profit */}
          <div className="flex items-center justify-between py-4 bg-blue-50 dark:bg-blue-950/20 px-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">Net Profit</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Revenue minus all costs
              </p>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCents(pl.netProfitCents)}
            </p>
          </div>

          <Separator className="my-4" />

          {/* Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Margin %</p>
              <p className="text-2xl font-bold">
                {formatPercentage(pl.marginRate, 2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Net Profit ÷ Claim Amount
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">NIM %</p>
              <p className="text-2xl font-bold">
                {formatPercentage(pl.nimRate, 2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Revenue - Capital Cost) ÷ Claim Amount
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
          <p className="text-sm text-muted-foreground">
            Detailed risk scoring breakdown
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Provider Risk */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Provider Risk Score</p>
                <Badge variant={getRiskBadgeVariant(
                  transaction.providerRiskScore <= 30 ? 'low' :
                  transaction.providerRiskScore <= 60 ? 'medium' : 'high'
                )}>
                  {transaction.providerRiskScore}/100
                </Badge>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    transaction.providerRiskScore <= 30
                      ? 'bg-green-500'
                      : transaction.providerRiskScore <= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${transaction.providerRiskScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on historical performance, claim quality, and concentration
              </p>
            </div>

            {/* Insurance Risk */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Insurance Risk Score</p>
                <Badge variant={getRiskBadgeVariant(
                  transaction.insuranceRiskScore <= 30 ? 'low' :
                  transaction.insuranceRiskScore <= 60 ? 'medium' : 'high'
                )}>
                  {transaction.insuranceRiskScore}/100
                </Badge>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    transaction.insuranceRiskScore <= 30
                      ? 'bg-green-500'
                      : transaction.insuranceRiskScore <= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${transaction.insuranceRiskScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on payment delays and default history
              </p>
            </div>
          </div>

          <Separator />

          {/* Combined Risk */}
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-semibold">Combined Risk Score</p>
                <p className="text-sm text-muted-foreground">
                  Average of provider and insurance risk
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold">{transaction.riskScore}/100</p>
                <Badge variant={getRiskBadgeVariant(transaction.riskLevel)} className="text-base">
                  {transaction.riskLevel.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  transaction.riskLevel === 'low'
                    ? 'bg-green-500'
                    : transaction.riskLevel === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${transaction.riskScore}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Fee rate applied: {formatPercentage(transaction.feeRate)} ({transaction.riskLevel} risk tier)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
