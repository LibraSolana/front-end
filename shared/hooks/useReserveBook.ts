'use client';

import { useCallback, useState } from 'react';
import { SystemProgram, PublicKey, Transaction } from '@solana/web3.js';
import { useProgram } from './useProgram';
import { usePDADerivation } from './usePDADerivation';
import { useTokenAccounts } from './useTokenAccounts';
import { useTransactionBuilder } from './useTransactionBuilder';
import * as anchor from '@coral-xyz/anchor';

export function useReserveBook() {
  const { program, wallet, isReady } = useProgram();
  const { deriveReservationPDA, deriveMemberPDA } = usePDADerivation();
  const { getOrCreateATAIx } = useTokenAccounts();
  const { send } = useTransactionBuilder();
  const [loading, setLoading] = useState(false);

  const reserveBook = useCallback(
    async (params: {
      library: string;
      book: string;
      paymentMint: string;
      priorityFee: number;
    }) => {
      if (!isReady() || !wallet?.publicKey || !program)
        throw new Error('Wallet/program not ready');
      setLoading(true);
      try {
        const lib = new PublicKey(params.library);
        const bookPk = new PublicKey(params.book);
        const mint = new PublicKey(params.paymentMint);

        const [memberPDA] = deriveMemberPDA(lib, wallet.publicKey);
        const [resPDA] = deriveReservationPDA(bookPk, wallet.publicKey);

        const { ata: userATA, ix: userATAIx } = await getOrCreateATAIx(
          wallet.publicKey,
          mint
        );
        const { ata: libATA, ix: libATAIx } = await getOrCreateATAIx(lib, mint);

        const tx = new Transaction();
        if (userATAIx) tx.add(userATAIx);
        if (libATAIx) tx.add(libATAIx);

        const ix = await program.methods
          .reserveBook(new anchor.BN(params.priorityFee))
          .accounts({
            reservation: resPDA,
            book: bookPk,
            member: memberPDA,
            library: lib,
            user: wallet.publicKey,
            userTokenAccount: userATA,
            libraryTokenAccount: libATA,
            tokenProgram: (await import('@solana/spl-token')).TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .instruction();

        tx.add(ix);
        const sig = await send(tx);
        return { sig, reservationPDA: resPDA };
      } finally {
        setLoading(false);
      }
    },
    [
      program,
      wallet,
      isReady,
      deriveMemberPDA,
      deriveReservationPDA,
      getOrCreateATAIx,
      send,
    ]
  );

  return { reserveBook, loading };
}
