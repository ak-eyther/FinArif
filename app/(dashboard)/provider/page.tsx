/**
 * Provider Dashboard Page
 *
 * Shows provider-specific claims statistics, discount settings, and analytics
 */

'use client';

import React, { useState, useMemo } from 'react';
import { getProviders, getClaimsByProviderId } from '@/lib/provider-data';
import { calculateProviderStats, calculateUnpaidClaimsAging } from '@/lib/calculations/provider-stats';
import { formatCents } from '@/lib/utils/format';
import { sanitizeCsvField } from '@/lib/utils/csv';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingDown,
  Download,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

/**
 * Provider Dashboard Page
 */
export default function ProviderDashboardPage(): React.ReactElement {
  const providers = getProviders();
  const [selectedProviderId, setSelectedProviderId] = useState<string>(providers[0]?.id || '');
  const [dateRange, setDateRange] = useState<number>(180);

  // Get filtered claims based on selected provider and date range
  const filteredClaims = useMemo(() => {
    if (!selectedProviderId) return [];
    const allClaims = getClaimsByProviderId(selectedProviderId);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    return allClaims.filter(
      claim => claim.serviceDate >= startDate && claim.serviceDate <= endDate
    );
  }, [selectedProviderId, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => calculateProviderStats(filteredClaims), [filteredClaims]);
  const unpaidAging = useMemo(() => calculateUnpaidClaimsAging(filteredClaims), [filteredClaims]);

  const selectedProvider = providers.find(p => p.id === selectedProviderId);

  // Chart data
  const claimsTypeData = [
    { name: 'OPD Paid', value: stats.paidOPDClaims },
    { name: 'OPD Unpaid', value: stats.unpaidOPDClaims },
    { name: 'IPD Paid', value: stats.paidIPDClaims },
    { name: 'IPD Unpaid', value: stats.unpaidIPDClaims },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Visit Number', 'Type', 'Amount (KES)', 'Service Date', 'Submission Date', 'Status', 'Insurer'].join(','),
      ...filteredClaims.map(claim => [
        sanitizeCsvField(claim.visitNumber),
        sanitizeCsvField(claim.claimType),
        sanitizeCsvField((claim.claimAmountCents / 100).toFixed(2)),
        sanitizeCsvField(claim.serviceDate.toISOString().split('T')[0]),
        sanitizeCsvField(claim.submissionDate.toISOString().split('T')[0]),
        sanitizeCsvField(claim.status),
        sanitizeCsvField(claim.insuranceName),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `claims_${selectedProvider?.name}_${dateRange}days.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Provider Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Claims analytics and performance metrics
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Export Data
        </button>
      </div>

      {/* Provider Selector and Date Range */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="provider-select" className="mb-2 block text-sm font-medium text-slate-700">
            Select Provider
          </label>
          <select
            id="provider-select"
            value={selectedProviderId}
            onChange={e => setSelectedProviderId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="date-range-select" className="mb-2 block text-sm font-medium text-slate-700">
            Date Range
          </label>
          <select
            id="date-range-select"
            value={dateRange}
            onChange={e => setDateRange(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 180 days</option>
          </select>
        </div>
      </div>

      {/* Discount Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="discount-percentage" className="mb-2 block text-sm font-medium text-slate-700">
                Global Discount Percentage (OPD & IPD)
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="discount-percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={selectedProvider?.discountPercentage || 0}
                  readOnly
                  className="w-32 rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm"
                />
                <span className="text-sm text-slate-600">
                  Current discount: {selectedProvider?.discountPercentage}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* OPD Claims */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OPD Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOPDClaims}</div>
            <p className="text-xs text-muted-foreground">
              {stats.paidOPDClaims} paid, {stats.unpaidOPDClaims} unpaid
            </p>
            <p className="text-xs font-medium text-slate-700 mt-2">
              {formatCents(stats.opdClaimAmountCents)}
            </p>
          </CardContent>
        </Card>

        {/* IPD Claims */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPD Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIPDClaims}</div>
            <p className="text-xs text-muted-foreground">
              {stats.paidIPDClaims} paid, {stats.unpaidIPDClaims} unpaid
            </p>
            <p className="text-xs font-medium text-slate-700 mt-2">
              {formatCents(stats.ipdClaimAmountCents)}
            </p>
          </CardContent>
        </Card>

        {/* Unpaid Claims */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Claims</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnpaidClaims}</div>
            <p className="text-xs text-muted-foreground">
              Total unpaid amount
            </p>
            <p className="text-xs font-medium text-red-600 mt-2">
              {formatCents(stats.totalUnpaidAmountCents)}
            </p>
          </CardContent>
        </Card>

        {/* Average Submission Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Submission Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSubmissionDays}</div>
            <p className="text-xs text-muted-foreground">
              Days from service to submission
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rejected Claims & AI Fraud Flags */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Rejected Claims */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Rejected Claims (Post-AI Validation)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{stats.rejectedAfterAIClaims}</div>
            {stats.rejectedReasons.length > 0 ? (
              <div className="space-y-2">
                {stats.rejectedReasons.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.reason}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No rejected claims</p>
            )}
          </CardContent>
        </Card>

        {/* AI Fraud Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              AI Fraud Detection Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{stats.aiFraudFlaggedClaims}</div>
            {stats.fraudReasons.length > 0 ? (
              <div className="space-y-2">
                {stats.fraudReasons.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.reason}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No fraud flags</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Claims Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Claims Distribution (OPD vs IPD)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={claimsTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={entry => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {claimsTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Unpaid Claims Aging */}
      <Card>
        <CardHeader>
          <CardTitle>Unpaid Claims Aging Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={unpaidAging}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis />
              <Tooltip formatter={(value) => `${value} claims`} />
              <Legend />
              <Bar dataKey="count" fill="#ef4444" name="Number of Claims" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Unpaid Claims Table */}
      <Card>
        <CardHeader>
          <CardTitle>Unpaid Claims Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visit Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Insurer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Service Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims
                .filter(c => c.status === 'unpaid' || c.status === 'pending')
                .slice(0, 10)
                .map(claim => (
                  <TableRow key={claim.visitNumber}>
                    <TableCell className="font-medium">{claim.visitNumber}</TableCell>
                    <TableCell>
                      <Badge variant={claim.claimType === 'OPD' ? 'default' : 'secondary'}>
                        {claim.claimType}
                      </Badge>
                    </TableCell>
                    <TableCell>{claim.insuranceName}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCents(claim.claimAmountCents)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {claim.serviceDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={claim.status === 'pending' ? 'default' : 'destructive'}>
                        {claim.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {filteredClaims.filter(c => c.status === 'unpaid' || c.status === 'pending').length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No unpaid claims found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
