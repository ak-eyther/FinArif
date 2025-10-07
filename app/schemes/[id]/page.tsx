/**
 * Scheme Detail Page
 *
 * Displays comprehensive scheme information and analytics
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Calendar, Building2 } from 'lucide-react';
import { SchemeAnalytics } from '@/components/schemes/SchemeAnalytics';
import { Scheme } from '@/lib/queries/schemes';

interface SchemeDetailPageProps {
  params: {
    id: string;
  };
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

export default function SchemeDetailPage({ params }: SchemeDetailPageProps) {
  const router = useRouter();
  const schemeId = parseInt(params.id);
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/schemes/${schemeId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Scheme not found');
          }
          throw new Error('Failed to fetch scheme');
        }

        const data = await response.json();
        setScheme(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(schemeId)) {
      fetchScheme();
    } else {
      setError('Invalid scheme ID');
      setLoading(false);
    }
  }, [schemeId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-64 animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-800">{error || 'Scheme not found'}</p>
          <Button
            onClick={() => router.push('/schemes')}
            variant="outline"
            className="mt-4"
          >
            Back to Schemes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Scheme Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">{scheme.name}</CardTitle>
                <div className="mt-2 flex items-center gap-2">
                  {scheme.scheme_code && (
                    <Badge variant="outline">{scheme.scheme_code}</Badge>
                  )}
                  {scheme.payer_name && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-blue-600"
                      onClick={() => router.push(`/payers/${scheme.payer_id}`)}
                    >
                      <Building2 className="mr-1 h-3 w-3" />
                      {scheme.payer_name}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-slate-500">Total Claims</p>
              <p className="text-2xl font-bold text-slate-900">
                {scheme.total_claims.toLocaleString()}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-500">Total Volume</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(scheme.total_volume_cents)}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-500">Average Claim Value</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(scheme.avg_claim_value_cents)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Created: {new Date(scheme.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Updated: {new Date(scheme.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section */}
      <SchemeAnalytics schemeId={schemeId} />
    </div>
  );
}
