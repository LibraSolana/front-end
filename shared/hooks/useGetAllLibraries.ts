// hooks/useAllLibraries.ts (client-side SHOULD be server-side for heavy fetch)
import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { useProgram } from 'shared/hooks/useProgram'; // nếu bạn có provider

export function useAllLibraries(programId: PublicKey, idl: any) {
  const { connection, wallet, isReady } = useProgram();
  const [libs, setLibs] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!connection || !isReady()) return;

    let canceled = false;
    const program = new anchor.Program(
      idl,
      programId,
      new anchor.AnchorProvider(connection, wallet!, {})
    );

    const fetchAll = async () => {
      setLoading(true);
      try {
        const raw = await connection.getProgramAccounts(programId, {
          commitment: 'confirmed',
        });
        const out = [];
        for (const a of raw) {
          try {
            const d = program.coder.accounts.decode('library', a.account.data);
            out.push({ pubkey: a.pubkey.toBase58(), data: d });
          } catch {
            // skip if not library
          }
        }
        if (!canceled) setLibs(out);
      } catch (e: any) {
        if (!canceled) setErr(e.message);
      } finally {
        if (!canceled) setLoading(false);
      }
    };

    fetchAll();
    return () => {
      canceled = true;
    };
  }, [connection, isReady, programId]);

  return { libs, loading, err };
}
