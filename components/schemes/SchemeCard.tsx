/**
 * Scheme Card Component
 *
 * Displays scheme information in a card format
 * Used in list views and detail pages
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, TrendingUp, DollarSign } from 'lucide-react';
import { Scheme } from '@/lib/queries/schemes';

interface SchemeCardProps {
  scheme: Scheme;
  onClick?: () => void;
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

export function SchemeCard({ scheme, onClick }: SchemeCardProps) {
  return (
    <Card
      className={`transition-all hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{scheme.name}</CardTitle>
              {scheme.scheme_code && (
                <Badge variant="outline" className="mt-1">
                  {scheme.scheme_code}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {scheme.payer_name && (
            <div className="text-sm text-slate-600">
              Payer: <span className="font-medium">{scheme.payer_name}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <TrendingUp className="h-3 w-3" />
                <span>Total Claims</span>
              </div>
              <p className="text-xl font-semibold text-slate-900">
                {scheme.total_claims.toLocaleString()}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <DollarSign className="h-3 w-3" />
                <span>Total Volume</span>
              </div>
              <p className="text-xl font-semibold text-slate-900">
                {formatCurrency(scheme.total_volume_cents)}
              </p>
            </div>
          </div>

          {scheme.avg_claim_value_cents > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">Average Claim Value</p>
              <p className="text-sm font-medium text-slate-700">
                {formatCurrency(scheme.avg_claim_value_cents)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
