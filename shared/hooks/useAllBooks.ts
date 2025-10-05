import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

export function useAllBooks(
  programId: PublicKey,
  idl: any,
  connection: Connection,
  wallet?: anchor.Wallet,
  libraryFilter?: PublicKey
) {
  const [books, setBooks] = useState<{ pubkey: string; data: any }[] | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!connection) return;
    let canceled = false;
    const provider = new anchor.AnchorProvider(connection, wallet as any, {});
    const program = new anchor.Program(idl, programId, provider);

    const fetchAll = async () => {
      setLoading(true);
      try {
        const filters = libraryFilter
          ? [{ memcmp: { offset: 8, bytes: libraryFilter.toBase58() } }]
          : undefined; // Book.library ở offset 8
        const raw = await connection.getProgramAccounts(programId, {
          commitment: 'confirmed',
          filters,
        });
        const out: { pubkey: string; data: any }[] = [];
        for (const a of raw) {
          try {
            const d = program.coder.accounts.decode('book', a.account.data);
            out.push({ pubkey: a.pubkey.toBase58(), data: d });
          } catch {}
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
  }, [connection, programId, idl, wallet, libraryFilter?.toBase58()]);

  return { books, loading, err };
}
