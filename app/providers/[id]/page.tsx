'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Provider } from '@/lib/types/provider-360';
import { ProviderAnalytics } from '@/components/providers/ProviderAnalytics';

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/providers/${params.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch provider');
        }

        const data = await response.json();
        setProvider(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProvider();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="h-96 animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/providers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Providers
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-800">{error || 'Provider not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/providers')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Providers
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">{provider.name}</h1>
          <div className="mt-2 flex gap-3 text-sm text-slate-600">
            {provider.type && <span>Type: {provider.type}</span>}
            {provider.location && <span>Location: {provider.location}</span>}
          </div>
        </div>
      </div>

      {/* Analytics */}
      <ProviderAnalytics providerId={provider.id} />
    </div>
  );
}
