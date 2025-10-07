'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProviderAnalyticsProps {
  providerId: number;
}

interface Analytics {
  total_claims: number;
  total_invoice_cents: number;
  total_approved_cents: number;
  approval_rate: number;
  top_payers: Array<{
    payer_id: number;
    name: string;
    claims: number;
    volume_cents: number;
  }>;
  top_schemes: Array<{
    scheme_id: number;
    name: string;
    claims: number;
    volume_cents: number;
  }>;
  monthly_trends: Array<{
    month: string;
    claims: number;
    volume_cents: number;
  }>;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function ProviderAnalytics({ providerId }: ProviderAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/providers/${providerId}/analytics`);

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const data = await response.json();
        setAnalytics(data.data.analytics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [providerId]);

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Error loading analytics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analytics.total_claims.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(analytics.total_invoice_cents)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(analytics.total_approved_cents)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Approval Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analytics.approval_rate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Payers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Payers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.top_payers.slice(0, 5).map((payer) => (
              <div key={payer.payer_id} className="flex justify-between items-center p-2 rounded hover:bg-slate-50">
                <span className="font-medium">{payer.name}</span>
                <div className="text-right">
                  <div className="text-sm">{payer.claims} claims</div>
                  <div className="text-xs text-slate-600">{formatCurrency(payer.volume_cents)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Schemes */}
      <Card>
        <CardHeader>
          <CardTitle>Top Schemes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.top_schemes.slice(0, 5).map((scheme) => (
              <div key={scheme.scheme_id} className="flex justify-between items-center p-2 rounded hover:bg-slate-50">
                <span className="font-medium">{scheme.name}</span>
                <div className="text-right">
                  <div className="text-sm">{scheme.claims} claims</div>
                  <div className="text-xs text-slate-600">{formatCurrency(scheme.volume_cents)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
