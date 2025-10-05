'use client';

import { useCallback, useState } from 'react';
import { SystemProgram } from '@solana/web3.js';
import { useProgram } from './useProgram';
import { PDAUtils } from 'shared/utils/solana/pda';

export function useInitializeCounter() {
  const { program, wallet, isReady } = useProgram();
  const [loading, setLoading] = useState(false);

  const initializeCounter = useCallback(async () => {
    if (!isReady() || !wallet?.publicKey || !program)
      throw new Error('Wallet not connected or program not ready');
    setLoading(true);
    try {
      const [counterPDA] = await PDAUtils.deriveLibraryCounterPDA(
        wallet.publicKey
      );
      const tx = await program.methods
        .initializeCounter()
        .accounts({
          counter: counterPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      return { tx, counterPDA };
    } finally {
      setLoading(false);
    }
  }, [program, wallet, isReady]);

  return { initializeCounter, loading };
}
