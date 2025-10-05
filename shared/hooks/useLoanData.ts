'use client';

import { useCallback, useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from './useProgram';
import { Loan } from 'shared/utils/solana/types';

export function useLoanData(loanAddress?: string) {
  const { program, isReady } = useProgram();
  const [data, setData] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLoan = useCallback(
    async (address?: string) => {
      if (!isReady() || !program) throw new Error('Program not ready');
      if (!address) throw new Error('Loan address required');
      setLoading(true);
      try {
        const data = await program.account.loan.fetch(new PublicKey(address));
        setData(data as Loan);
        return data as Loan;
      } finally {
        setLoading(false);
      }
    },
    [program, isReady]
  );

  useEffect(() => {
    if (loanAddress && isReady()) fetchLoan(loanAddress);
  }, [loanAddress, isReady, fetchLoan]);

  return { data, loading, fetchLoan };
}
