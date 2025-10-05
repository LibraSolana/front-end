'use client';

import { useCallback, useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useProgram } from './useProgram';
import { Reservation } from 'shared/utils/solana/types';

export function useReservationData(address?: string) {
  const { program, isReady } = useProgram();
  const [data, setData] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReservation = useCallback(
    async (addr?: string) => {
      if (!isReady() || !program) throw new Error('Program not ready');
      if (!addr) throw new Error('Reservation address required');
      setLoading(true);
      try {
        const data = await program.account.reservation.fetch(
          new PublicKey(addr)
        );
        setData(data as Reservation);
        return data as Reservation;
      } finally {
        setLoading(false);
      }
    },
    [program, isReady]
  );

  useEffect(() => {
    if (address && isReady()) fetchReservation(address);
  }, [address, isReady, fetchReservation]);

  return { data, loading, fetchReservation };
}
