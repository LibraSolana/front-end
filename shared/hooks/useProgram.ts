'use client';

import { useCallback, useMemo } from 'react';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { IDL } from 'shared/types/enhanced_decentralized_library';
import { PROGRAM_ID } from 'shared/utils/solana/config';

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const provider = useMemo(() => {
    if (!wallet) return null;
    return new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(IDL as any, PROGRAM_ID, provider);
  }, [provider]);

  const isReady = useCallback(
    () => !!program && !!provider && !!wallet,
    [program, provider, wallet]
  );

  return { program, provider, wallet, connection, isReady };
}
