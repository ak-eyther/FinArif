/**
 * Main Dashboard Page
 *
 * Displays 4 key metrics and recent transactions table
 */

import { getTransactions } from '@/lib/mock-data';
import { calculateDashboardMetrics } from '@/lib/calculations/dashboard';
import { formatCentsIndian, formatPercentage, formatDateShort } from '@/lib/utils/format';
import { MetricCard } from '@/components/dashboard/metric-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RiskLevel } from '@/lib/types/index';
import { DollarSign, TrendingUp, AlertCircle, Percent } from 'lucide-react';

/**
 * Get badge variant for risk level
 */
function getRiskBadgeVariant(
  riskLevel: RiskLevel
): 'default' | 'secondary' | 'destructive' {
  switch (riskLevel) {
    case 'low':
      return 'secondary';
    case 'medium':
      return 'default';
    case 'high':
      return 'destructive';
  }
}

/**
 * Get badge variant for transaction status
 */
function getStatusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' {
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
 * Main Dashboard Page
 */
export default function DashboardPage(): React.ReactElement {
  // Get all transactions
  const transactions = getTransactions();

  // Calculate dashboard metrics
  const metrics = calculateDashboardMetrics(transactions);

  // Get 10 most recent transactions (sorted by disbursement date)
  const recentTransactions = [...transactions]
    .sort((a, b) => b.disbursementDate.getTime() - a.disbursementDate.getTime())
    .slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your portfolio performance and recent activity
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Outstanding to Providers */}
        <MetricCard
          title="Total Outstanding to Providers"
          value={formatCentsIndian(metrics.totalOutstandingCents)}
          trend={metrics.trendOutstanding}
          icon={DollarSign}
          description="Active claims financed"
        />

        {/* Metric 2: Total Expected from Insurers */}
        <MetricCard
          title="Total Expected from Insurers"
          value={formatCentsIndian(metrics.totalExpectedCents)}
          trend={metrics.trendExpected}
          icon={TrendingUp}
          description="Expected collections + fees"
        />

        {/* Metric 3: Net Exposure */}
        <MetricCard
          title="Net Exposure"
          value={formatCentsIndian(metrics.netExposureCents)}
          trend={metrics.trendExposure}
          icon={AlertCircle}
          description="Expected profit from active claims"
        />

        {/* Metric 4: Portfolio NIM */}
        <MetricCard
          title="Portfolio NIM"
          value={formatPercentage(metrics.portfolioNIM)}
          trend={metrics.trendNIM}
          icon={Percent}
          description="Net interest margin after capital costs"
        />
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Insurer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map(tx => (
                <TableRow key={tx.id}>
                  {/* Transaction ID */}
                  <TableCell className="font-medium">{tx.id}</TableCell>

                  {/* Provider Name */}
                  <TableCell>{tx.providerName}</TableCell>

                  {/* Insurer Name */}
                  <TableCell>{tx.insuranceName}</TableCell>

                  {/* Claim Amount */}
                  <TableCell className="text-right font-medium">
                    {formatCentsIndian(tx.claimAmountCents)}
                  </TableCell>

                  {/* Disbursement Date */}
                  <TableCell className="text-muted-foreground">
                    {formatDateShort(tx.disbursementDate)}
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(tx.status)}>
                      {tx.status}
                    </Badge>
                  </TableCell>

                  {/* Risk Level Badge */}
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(tx.riskLevel)}>
                      {tx.riskLevel}
                    </Badge>
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
