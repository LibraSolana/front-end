'use client';

import { useEffect, useRef } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from './useProgram';

export function useAccountSubscription(
  pubkey?: PublicKey,
  onChange?: () => void
) {
  const { connection } = useProgram();
  const subRef = useRef<number | null>(null);

  useEffect(() => {
    if (!pubkey || !onChange) return;
    subRef.current = connection.onAccountChange(
      pubkey,
      () => onChange(),
      'confirmed'
    );
    return () => {
      if (subRef.current !== null)
        connection.removeAccountChangeListener(subRef.current);
    };
  }, [pubkey, onChange, connection]);
}
