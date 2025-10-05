'use client';

import { useCallback, useState } from 'react';
import { SystemProgram, PublicKey, Transaction } from '@solana/web3.js';
import { useProgram } from './useProgram';
import { useTokenAccounts } from './useTokenAccounts';
import { useTransactionBuilder } from './useTransactionBuilder';

export function useRenewMembership() {
  const { program, wallet, isReady } = useProgram();
  const { getOrCreateATAIx } = useTokenAccounts();
  const { send } = useTransactionBuilder();
  const [loading, setLoading] = useState(false);

  const renewMembership = useCallback(
    async ({
      library,
      member,
      paymentMint,
      extensionMonths,
    }: {
      library: string;
      member: string;
      paymentMint: string;
      extensionMonths: number;
    }) => {
      if (!isReady() || !wallet?.publicKey || !program)
        throw new Error('Wallet/program not ready');
      setLoading(true);
      try {
        const lib = new PublicKey(library);
        const mem = new PublicKey(member);
        const mint = new PublicKey(paymentMint);

        const { ata: userATA, ix: userATAIx } = await getOrCreateATAIx(
          wallet.publicKey,
          mint
        );
        const { ata: libATA, ix: libATAIx } = await getOrCreateATAIx(lib, mint);

        const tx = new Transaction();
        if (userATAIx) tx.add(userATAIx);
        if (libATAIx) tx.add(libATAIx);

        const ix = await program.methods
          .renewMembership(extensionMonths)
          .accounts({
            member: mem,
            library: lib,
            user: wallet.publicKey,
            userTokenAccount: userATA,
            libraryTokenAccount: libATA,
            tokenProgram: (await import('@solana/spl-token')).TOKEN_PROGRAM_ID,
          })
          .instruction();

        tx.add(ix);
        const sig = await send(tx);
        return { sig };
      } finally {
        setLoading(false);
      }
    },
    [program, wallet, isReady, getOrCreateATAIx, send]
  );

  return { renewMembership, loading };
}
