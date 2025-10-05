'use client';

import { useCallback, useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from './useProgram';
import { Library, LibraryCounter } from 'shared/utils/solana/types';

export function useLibraryData(libraryAddress?: PublicKey | string) {
  const { program, isReady } = useProgram();
  const [data, setData] = useState<Library | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLibrary = useCallback(
    async (address?: PublicKey | string) => {
      if (!isReady() || !program) throw new Error('Program not ready');
      setLoading(true);
      try {
        const pubkey =
          typeof address === 'string' ? new PublicKey(address) : address;
        if (!pubkey) throw new Error('Library address is required');
        const libraryData = await program.account.library.fetch(pubkey);
        setData(libraryData as Library);
        return libraryData as Library;
      } finally {
        setLoading(false);
      }
    },
    [program, isReady]
  );

  useEffect(() => {
    if (libraryAddress && isReady()) fetchLibrary(libraryAddress);
  }, [libraryAddress, isReady, fetchLibrary]);

  return { data, loading, fetchLibrary };
}

export function useLibraryCounter(authority?: PublicKey | string) {
  const { program, isReady } = useProgram();
  const [data, setData] = useState<LibraryCounter | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCounter = useCallback(
    async (authorityPubkey?: PublicKey | string) => {
      if (!isReady() || !program) throw new Error('Program not ready');
      setLoading(true);
      try {
        const pubkey =
          typeof authorityPubkey === 'string'
            ? new PublicKey(authorityPubkey)
            : authorityPubkey;
        if (!pubkey) throw new Error('Authority address is required');
        const [counterPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('library_counter'), pubkey.toBuffer()],
          program.programId
        );
        const counterData =
          await program.account.libraryCounter.fetch(counterPDA);
        setData(counterData as LibraryCounter);
        return counterData as LibraryCounter;
      } finally {
        setLoading(false);
      }
    },
    [program, isReady]
  );

  useEffect(() => {
    if (authority && isReady()) fetchCounter(authority);
  }, [authority, isReady, fetchCounter]);

  return { data, loading, fetchCounter };
}
