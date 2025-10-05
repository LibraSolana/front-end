'use client';

import { useEffect, useState } from 'react';

import { useWallet } from '@solana/wallet-adapter-react'; // nếu bạn đang dùng wallet adapter

import { Library } from 'shared/utils/solana/types';
import { useLibrariesByAuthority } from 'shared/hooks/useBatchQueries';
import { LibrarySummary } from '@/domains/LibraryPage/components/LibrarySumary';

const LibraryPage = () => {
  const { publicKey } = useWallet();
  const { fetchLibraries, loading } = useLibrariesByAuthority();
  const [libraries, setLibraries] = useState<
    { pubkey: string; data: Library }[]
  >([]);

  useEffect(() => {
    if (!publicKey) return;
    (async () => {
      const libs = await fetchLibraries(publicKey.toString());
      setLibraries(
        libs.map((x) => ({
          pubkey: x.pubkey.toBase58(),
          data: x.data,
        }))
      );
    })();
  }, [publicKey, fetchLibraries]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Library Management</h1>

      {loading && <p className="text-muted-foreground">Loading libraries...</p>}

      {!loading && libraries.length === 0 && (
        <p className="text-muted-foreground">No libraries found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {libraries.map((lib) => (
          //@ts-ignore
          <LibrarySummary
            key={lib.pubkey}
            libraryKey={lib.pubkey}
            library={lib.data}
          />
        ))}
      </div>
    </div>
  );
};

export default LibraryPage;
