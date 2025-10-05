'use client';

import { useCallback } from 'react';
import {
  Transaction,
  VersionedTransaction,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import { useProgram } from './useProgram';

export function useTransactionBuilder() {
  const { connection, wallet } = useProgram();

  const send = useCallback(
    async (tx: Transaction, priorityMicroLamports?: number) => {
      if (!wallet?.publicKey || !wallet.signTransaction)
        throw new Error('Wallet not ready');
      if (priorityMicroLamports) {
        tx.add(
          ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: priorityMicroLamports,
          })
        );
      }
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      const signed = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
      });
      await connection.confirmTransaction(sig, 'confirmed');
      return sig;
    },
    [connection, wallet]
  );

  const sendV0 = useCallback(
    async (vtx: VersionedTransaction) => {
      const sig = await connection.sendTransaction(vtx);
      await connection.confirmTransaction(sig, 'confirmed');
      return sig;
    },
    [connection]
  );

  return { send, sendV0 };
}
