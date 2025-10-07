/**
 * Scheme Analytics Component
 *
 * Displays comprehensive 360° analytics for a scheme:
 * - KPI cards (total claims, volumes, approval rate)
 * - Provider breakdown chart
 * - Monthly trends chart
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, CheckCircle, RefreshCw } from 'lucide-react';
import { ProviderBreakdownChart } from './ProviderBreakdownChart';
import { MonthlyTrendsChart } from './MonthlyTrendsChart';

interface SchemeAnalyticsData {
  scheme_id: number;
  total_claims: number;
  total_invoice_cents: number;
  total_approved_cents: number;
  approval_rate: number;
  top_providers: Array<{
    provider_id: number;
    name: string;
    claims: number;
    volume_cents: number;
  }>;
  monthly_trends: Array<{
    month: string;
    claims: number;
    volume_cents: number;
    approved_cents: number;
  }>;
  last_updated: string;
}

interface SchemeAnalyticsProps {
  schemeId: number;
}

/**
 * Format cents to KES currency
 */
function formatCurrency(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SchemeAnalytics({ schemeId }: SchemeAnalyticsProps) {
  const [analytics, setAnalytics] = useState<SchemeAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/schemes/${schemeId}/analytics`);

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await fetch(`/api/schemes/${schemeId}/analytics`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [schemeId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">Error loading analytics: {error}</p>
        <Button onClick={fetchAnalytics} variant="outline" size="sm" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Analytics Overview</h2>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Claims */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.total_claims.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>

        {/* Total Invoice */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoice</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.total_invoice_cents)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Invoiced amount</p>
          </CardContent>
        </Card>

        {/* Total Approved */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.total_approved_cents)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Approved amount</p>
          </CardContent>
        </Card>

        {/* Approval Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.approval_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {formatCurrency(
                analytics.total_invoice_cents - analytics.total_approved_cents
              )}{' '}
              rejected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Breakdown Chart */}
      {analytics.top_providers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Providers by Volume</CardTitle>
            <p className="text-sm text-slate-500">
              Click on a provider to view their details
            </p>
          </CardHeader>
          <CardContent>
            <ProviderBreakdownChart providers={analytics.top_providers} />
          </CardContent>
        </Card>
      )}

      {/* Monthly Trends Chart */}
      {analytics.monthly_trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <p className="text-sm text-slate-500">
              Claims volume and approval over the last 12 months
            </p>
          </CardHeader>
          <CardContent>
            <MonthlyTrendsChart trends={analytics.monthly_trends} />
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <p className="text-xs text-slate-500 text-center">
        Last updated: {new Date(analytics.last_updated).toLocaleString()}
      </p>
    </div>
  );
}
