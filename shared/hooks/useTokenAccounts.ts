'use client';

import { useCallback } from 'react';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { useProgram } from './useProgram';

export function useTokenAccounts() {
  const { connection, wallet } = useProgram();

  const getOrCreateATAIx = useCallback(
    async (owner: PublicKey, mint: PublicKey) => {
      if (!wallet?.publicKey) throw new Error('Wallet not connected');
      const ata = await getAssociatedTokenAddress(mint, owner, true);
      const info = await connection.getAccountInfo(ata);
      if (info) return { ata, ix: null as TransactionInstruction | null };
      const ix = createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        ata,
        owner,
        mint
      );
      return { ata, ix };
    },
    [wallet, connection]
  );

  const getATA = useCallback(async (owner: PublicKey, mint: PublicKey) => {
    return await getAssociatedTokenAddress(mint, owner, true);
  }, []);

  return { getOrCreateATAIx, getATA, TOKEN_PROGRAM_ID };
}
