'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLibrariesByAuthority } from 'shared/hooks/useBatchQueries';
import { LibrarySummary } from '@/domains/LibraryPage/components/LibrarySumary';

type LibrariesByAuthorityProps = {
  authority?: string; // optional prop
};

export function LibrariesByAuthority({
  authority: initialAuthority,
}: LibrariesByAuthorityProps) {
  const [authority, setAuthority] = useState(initialAuthority ?? '');
  const [items, setItems] = useState<any[]>([]);
  const { fetchLibraries, loading } = useLibrariesByAuthority();

  // auto fetch if authority is passed as prop
  useEffect(() => {
    if (initialAuthority) {
      (async () => {
        try {
          const list = await fetchLibraries(initialAuthority);
          setItems(
            list.map((x) => ({
              pubkey: x.pubkey.toBase58(),
              ...x.data, // spread data fields nếu muốn đầy đủ
            }))
          );
        } catch {}
      })();
    }
  }, [initialAuthority, fetchLibraries]);

  const handleFetch = async () => {
    try {
      const list = await fetchLibraries(authority);
      setItems(
        list.map((x) => ({
          pubkey: x.pubkey.toBase58(),
          ...x.data,
        }))
      );
    } catch {}
  };

  return (
    <div className="space-y-3">
      {!initialAuthority && (
        <div className="flex gap-2">
          <Input
            placeholder="Authority Pubkey"
            value={authority}
            onChange={(e) => setAuthority(e.target.value)}
          />
          <Button onClick={handleFetch} disabled={loading || !authority}>
            {loading ? 'Loading...' : 'Fetch'}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((it, idx) => (
          <LibrarySummary library={it} libraryKey={it.key} key={idx} />
        ))}
      </div>
    </div>
  );
}
