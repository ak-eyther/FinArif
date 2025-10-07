'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { PayerCard } from '@/components/payers/PayerCard';
import { Payer } from '@/lib/types/provider-360';

export default function PayersPage() {
  const router = useRouter();
  const [payers, setPayers] = useState<Payer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchPayers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.append('q', search);

      const response = await fetch(`/api/payers?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch payers');
      }

      const data = await response.json();
      setPayers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayers();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payers</h1>
          <p className="text-slate-600 mt-1">
            Manage insurance companies and payers
          </p>
        </div>
        <Button onClick={() => router.push('/payers/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Payer
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search payers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">Error: {error}</p>
          <Button onClick={fetchPayers} variant="outline" size="sm" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      )}

      {/* Payers Grid */}
      {!loading && !error && (
        <>
          {payers.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
              <p className="text-slate-600">
                {search
                  ? 'No payers found matching your search'
                  : 'No payers yet. Add your first payer to get started.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {payers.map((payer) => (
                <PayerCard
                  key={payer.id}
                  payer={payer}
                />
              ))}
            </div>
          )}

          {payers.length > 0 && (
            <div className="text-center text-sm text-slate-500">
              Showing {payers.length} payer{payers.length !== 1 ? 's' : ''}
            </div>
          )}
        </>
      )}
    </div>
  );
}
