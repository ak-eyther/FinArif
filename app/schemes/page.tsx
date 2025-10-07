/**
 * Schemes List Page
 *
 * Displays all schemes with search and filtering
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { SchemeCard } from '@/components/schemes/SchemeCard';
import { Scheme } from '@/lib/queries/schemes';

export default function SchemesPage() {
  const router = useRouter();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const response = await fetch(`/api/schemes?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch schemes');
      }

      const data = await response.json();
      setSchemes(data.schemes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Schemes</h1>
          <p className="text-slate-600 mt-1">
            Manage insurance schemes and plans
          </p>
        </div>
        <Button onClick={() => router.push('/schemes/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Scheme
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Search schemes..."
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
          <Button onClick={fetchSchemes} variant="outline" size="sm" className="mt-2">
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

      {/* Schemes Grid */}
      {!loading && !error && (
        <>
          {schemes.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
              <p className="text-slate-600">
                {search
                  ? 'No schemes found matching your search'
                  : 'No schemes yet. Add your first scheme to get started.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {schemes.map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  onClick={() => router.push(`/schemes/${scheme.id}`)}
                />
              ))}
            </div>
          )}

          {schemes.length > 0 && (
            <div className="text-center text-sm text-slate-500">
              Showing {schemes.length} scheme{schemes.length !== 1 ? 's' : ''}
            </div>
          )}
        </>
      )}
    </div>
  );
}
