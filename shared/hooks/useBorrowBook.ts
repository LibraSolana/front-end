'use client';

import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from 'shared/hooks/useProgram';
import { getBookByAddress } from './useGetDataByAddress';

export type BookWire = {
  pubkey: string;
  data: any;
};

export function useGetBook(bookPubkey?: string) {
  const { program, wallet, connection, isReady } = useProgram();
  const [book, setBook] = useState<BookWire | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookPubkey) return;
    if (!isReady()) return;

    let canceled = false;

    const fetchBook = async () => {
      setLoading(true);
      setError(null);

      try {
        const pub = new PublicKey(bookPubkey);
        const data = await getBookByAddress(connection, wallet, pub);

        if (canceled) return;

        setBook({ pubkey: bookPubkey, data });
      } catch (e: any) {
        if (canceled) return;
        setError(e.message || 'Failed to fetch book');
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    fetchBook();

    return () => {
      canceled = true;
    };
  }, [bookPubkey, wallet, connection, program, isReady]);

  return { book, loading, error };
}
