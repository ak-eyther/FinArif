/**
 * Provider List Component
 *
 * Displays a list of providers with search and filter functionality
 * Client component for interactivity
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Provider } from '@/lib/queries/providers';
import { ProviderCard } from './ProviderCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProviderListProps {
  initialProviders: Provider[];
  initialTotal: number;
}

const PROVIDER_TYPES = ['Hospital', 'Clinic', 'Pharmacy', 'Lab'];

export function ProviderList({ initialProviders, initialTotal }: ProviderListProps) {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>(initialProviders);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (type !== 'all') params.set('type', type);
      params.set('limit', limit.toString());
      params.set('offset', offset.toString());

      const response = await fetch(`/api/providers?${params.toString()}`);
      const data = await response.json();

      setProviders(data.providers);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProviders();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, type, offset]);

  const handleProviderClick = (providerId: number) => {
    router.push(`/providers/${providerId}`);
  };

  const handleCreateProvider = () => {
    router.push('/providers/new');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Providers</h1>
          <p className="mt-1 text-sm text-slate-600">
            {total} provider{total !== 1 ? 's' : ''} registered
          </p>
        </div>
        <Button onClick={handleCreateProvider}>
          <Plus className="mr-2 h-4 w-4" />
          Add Provider
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {PROVIDER_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Provider Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[240px]" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-slate-300">
          <div className="text-center">
            <p className="text-lg font-medium text-slate-900">No providers found</p>
            <p className="mt-1 text-sm text-slate-600">
              {search || type !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first provider'}
            </p>
            {!search && type === 'all' && (
              <Button onClick={handleCreateProvider} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Provider
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onClick={() => handleProviderClick(provider.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-600">
                Showing {offset + 1} to {Math.min(offset + limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
                  disabled={offset === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOffset((prev) => prev + limit)}
                  disabled={offset + limit >= total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
