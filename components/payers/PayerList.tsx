'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PayerCard } from './PayerCard';
import { Payer } from '@/lib/queries/payers';

interface PayerListProps {
  initialPayers: Payer[];
}

export function PayerList({ initialPayers }: PayerListProps) {
  const [payers, setPayers] = useState<Payer[]>(initialPayers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setPayers(initialPayers);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/payers?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success) {
        setPayers(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search payers by name or type..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {isSearching && (
          <span className="text-sm text-muted-foreground">Searching...</span>
        )}
      </div>

      {payers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            {searchQuery ? 'No payers found matching your search.' : 'No payers found.'}
          </p>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            Showing {payers.length} payer{payers.length !== 1 ? 's' : ''}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {payers.map((payer) => (
              <PayerCard key={payer.id} payer={payer} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
