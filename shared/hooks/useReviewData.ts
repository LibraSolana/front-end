'use client';

import { useCallback, useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from './useProgram';
import { Review } from 'shared/utils/solana/types';

export function useReviewData(address?: string) {
  const { program, isReady } = useProgram();
  const [data, setData] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReview = useCallback(
    async (addr?: string) => {
      if (!isReady() || !program) throw new Error('Program not ready');
      if (!addr) throw new Error('Review address required');
      setLoading(true);
      try {
        const data = await program.account.review.fetch(new PublicKey(addr));
        setData(data as Review);
        return data as Review;
      } finally {
        setLoading(false);
      }
    },
    [program, isReady]
  );

  useEffect(() => {
    if (address && isReady()) fetchReview(address);
  }, [address, isReady, fetchReview]);

  return { data, loading, fetchReview };
}
