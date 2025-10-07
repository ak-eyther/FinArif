/**
 * Provider Card Component
 *
 * Displays provider information in a card format
 * Used in list views and detail pages
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, TrendingUp, DollarSign } from 'lucide-react';
import { Provider } from '@/lib/queries/providers';

interface ProviderCardProps {
  provider: Provider;
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

export function ProviderCard({ provider, onClick }: ProviderCardProps) {
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{provider.name}</CardTitle>
              {provider.type && (
                <Badge variant="outline" className="mt-1">
                  {provider.type}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {provider.location && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4" />
              <span>{provider.location}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <TrendingUp className="h-3 w-3" />
                <span>Total Claims</span>
              </div>
              <p className="text-xl font-semibold text-slate-900">
                {provider.total_claims.toLocaleString()}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <DollarSign className="h-3 w-3" />
                <span>Total Volume</span>
              </div>
              <p className="text-xl font-semibold text-slate-900">
                {formatCurrency(provider.total_volume_cents)}
              </p>
            </div>
          </div>

          {provider.avg_claim_value_cents > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">Average Claim Value</p>
              <p className="text-sm font-medium text-slate-700">
                {formatCurrency(provider.avg_claim_value_cents)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
