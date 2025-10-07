import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Payer } from '@/lib/queries/payers';

interface PayerCardProps {
  payer: Payer;
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

export function PayerCard({ payer }: PayerCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                <Link
                  href={`/payers/${payer.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {payer.name}
                </Link>
              </CardTitle>
              {payer.type && (
                <CardDescription className="mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {payer.type}
                  </Badge>
                </CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Claims</p>
            <p className="text-2xl font-bold">{payer.total_claims}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-bold">{formatCurrency(payer.total_volume_cents)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg Claim</p>
            <p className="text-2xl font-bold">{formatCurrency(payer.avg_claim_value_cents)}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Link href={`/payers/${payer.id}`}>
            <Button variant="ghost" size="sm">
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
