'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, FileText, CheckCircle, DollarSign } from 'lucide-react';
import { PayerAnalytics as PayerAnalyticsType } from '@/lib/queries/payer-analytics';
import { Payer } from '@/lib/queries/payers';
import { ProviderBreakdownChart } from './ProviderBreakdownChart';
import { SchemeBreakdownChart } from './SchemeBreakdownChart';
import { MonthlyTrendsChart } from './MonthlyTrendsChart';

interface PayerAnalyticsProps {
  payer: Payer;
  initialAnalytics?: PayerAnalyticsType;
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

export function PayerAnalytics({ payer, initialAnalytics }: PayerAnalyticsProps) {
  const [analytics, setAnalytics] = useState<PayerAnalyticsType | null>(initialAnalytics || null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch analytics on mount if not provided
  useEffect(() => {
    if (!initialAnalytics) {
      fetchAnalytics();
    }
  }, [payer.id]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/payers/${payer.id}/analytics`);
      const result = await response.json();
      if (result.success && result.data.analytics) {
        setAnalytics(result.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/payers/${payer.id}/analytics`, {
        method: 'POST',
      });
      const result = await response.json();
      if (result.success && result.data.analytics) {
        setAnalytics(result.data.analytics);
      }
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-muted-foreground">No analytics data available</p>
            <Button onClick={fetchAnalytics} className="mt-4">
              Load Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payer Analytics</h2>
          <p className="text-muted-foreground">
            Last updated: {new Date(analytics.last_updated).toLocaleString()}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_claims.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Claims processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoice</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.total_invoice_cents)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Invoice amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.total_approved_cents)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Approved amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.approval_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Approval percentage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Provider Breakdown Chart */}
        {analytics.top_providers && analytics.top_providers.length > 0 && (
          <ProviderBreakdownChart providers={analytics.top_providers} />
        )}

        {/* Scheme Breakdown Chart */}
        {analytics.top_schemes && analytics.top_schemes.length > 0 && (
          <SchemeBreakdownChart schemes={analytics.top_schemes} />
        )}
      </div>

      {/* Monthly Trends Chart */}
      {analytics.monthly_trends && analytics.monthly_trends.length > 0 && (
        <MonthlyTrendsChart trends={analytics.monthly_trends} />
      )}
    </div>
  );
}
