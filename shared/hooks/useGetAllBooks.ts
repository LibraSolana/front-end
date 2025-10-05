import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { useProgram } from 'shared/hooks/useProgram'; // nếu bạn dùng provider

export function useAllBooks(
  programId: PublicKey,
  idl: any,
  libraryFilter?: PublicKey
) {
  const { connection, wallet, isReady } = useProgram();
  const [books, setBooks] = useState<{ pubkey: string; data: any }[] | null>(
    null
  );
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
        // filters for library
        const filters = libraryFilter
          ? [{ memcmp: { offset: 8, bytes: libraryFilter.toBase58() } }]
          : undefined;

        const raw = await connection.getProgramAccounts(programId, {
          commitment: 'confirmed',
          filters,
        });

        const out: { pubkey: string; data: any }[] = [];
        for (const a of raw) {
          try {
            const data = program.coder.accounts.decode('book', a.account.data);
            out.push({ pubkey: a.pubkey.toBase58(), data });
          } catch {
            // skip if not a book account
          }
        }

        if (!canceled) setBooks(out);
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
  }, [connection, isReady, programId, libraryFilter?.toBase58()]);

  return { books, loading, err };
}
