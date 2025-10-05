'use client';

import { Button } from '@/components/ui/button';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AddBookForm } from 'shared/forms/book/CreateBookForm';
import useModal from 'shared/modals';
import CreateBookModal from 'shared/modals/Book/Create/CreateBookModal';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useLibrariesByAuthority } from 'shared/hooks/useBatchQueries';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Homepage = () => {
  const wallet = useAnchorWallet();
  const { show: showCreateBookModal } = useModal(CreateBookModal);
  const { fetchLibraries, loading } = useLibrariesByAuthority();

  const [libraries, setLibraries] = useState<any[]>([]);
  const [library, setLibrary] = useState<PublicKey | null>(null);

  const loadLibraries = useCallback(async () => {
    if (!wallet?.publicKey) return;
    const libs = await fetchLibraries(wallet.publicKey.toBase58());
    setLibraries(libs);
    if (libs.length > 0) {
      setLibrary(libs[0].pubkey); // mặc định chọn cái đầu
    } else {
      setLibrary(null);
    }
  }, [wallet?.publicKey, fetchLibraries]);

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  const canCreate = useMemo(
    () => !!wallet?.publicKey && !!library && !loading,
    [wallet?.publicKey, library, loading]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select
            value={library?.toBase58() ?? ''}
            onValueChange={(val) => setLibrary(new PublicKey(val))}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a library" />
            </SelectTrigger>
            <SelectContent>
              {libraries.map((lib) => (
                <SelectItem
                  key={lib.pubkey.toBase58()}
                  value={lib.pubkey.toBase58()}
                >
                  {lib.data?.name ?? lib.pubkey.toBase58()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => {
            if (wallet?.publicKey && library) {
              showCreateBookModal({
                library,
                librarian: wallet.publicKey,
              });
            }
          }}
          disabled={!canCreate}
        >
          Create new book
        </Button>
      </div>

      {library && (
        <span className="text-sm text-muted-foreground">
          Using library: {library.toBase58()}
        </span>
      )}

      {canCreate && <AddBookForm library={library!} />}
    </div>
  );
};

export default Homepage;
