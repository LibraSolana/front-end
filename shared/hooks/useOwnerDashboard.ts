// src/hooks/useOwnerDashboard.ts
'use client';

import { PublicKey } from '@solana/web3.js';
import { getMint, getAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BN } from '@coral-xyz/anchor';
import { useGetProgram } from './useGetProgram';

function asNumber(u64Like: any, fallback = 0): number {
  try {
    if (typeof u64Like === 'number') return u64Like;
    if (typeof u64Like === 'bigint') return Number(u64Like);
    if (u64Like instanceof BN) return u64Like.toNumber();
    const s = u64Like?.toString?.(10) ?? '0';
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

export type OwnerOverview = {
  libraryPk: string;
  authority: string;
  name: string;
  description: string;
  isActive: boolean;
  paymentMint: string;
  membershipFeeLamports: number;
  lateFeePerDayLamports: number;
  maxBorrowDays: number;
  createdAt: number;

  totalBooks: number;
  totalMembers: number;
  totalRevenue: number;

  mintSymbol: string;
  mintDecimals: number;
  libraryTokenAccount: string;
  authorityTokenAccount: string;
  balanceRaw: bigint;
  balanceUi: number;
};

async function findFirstTokenAccountByOwnerAndMint(
  connection: any,
  owner: PublicKey,
  mint: PublicKey
) {
  const res = await connection.getTokenAccountsByOwner(owner, { mint });
  return res.value[0]?.pubkey ?? null;
}

export function useOwnerOverview(libraryPk?: string) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { program, isReady } = useGetProgram();
  const [data, setData] = useState<OwnerOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    async function run() {
      if (!libraryPk) return;
      if (!isReady || !program) return;

      setLoading(true);
      setError(null);

      try {
        const libPk = new PublicKey(libraryPk);

        // 1) Fetch account
        let libraryAcc: any;
        try {
          if (!(program.account as any)?.library) {
            throw new Error('IDL không có account "library" hoặc tên khác.');
          }
          libraryAcc = await (program.account as any).library.fetch(libPk);
        } catch (e: any) {
          console.error('[useOwnerOverview] fetch library failed:', e);
          throw e;
        }

        const authority = new PublicKey(libraryAcc.authority);
        const paymentMintPk = new PublicKey(libraryAcc.paymentMint);

        // 2) Mint meta
        let mintDecimals = 6;
        let mintSymbol = 'TOK';
        try {
          const mintInfo = await getMint(connection, paymentMintPk);
          mintDecimals = mintInfo.decimals;
          // Optional: symbol map ở client nếu muốn
        } catch (e) {
          console.warn(
            '[useOwnerOverview] getMint failed, fallback decimals=6'
          );
        }

        // 3) Library token account
        let libTA: PublicKey | null = null;
        try {
          libTA = await findFirstTokenAccountByOwnerAndMint(
            connection,
            libPk,
            paymentMintPk
          );
        } catch (e) {
          console.warn(
            '[useOwnerOverview] getTokenAccountsByOwner(library) failed'
          );
        }

        // 4) Balance
        let balanceRaw = 0n;
        try {
          if (libTA) {
            const ai = await getAccount(connection, libTA);
            balanceRaw = BigInt(ai.amount.toString());
          }
        } catch (e) {
          console.warn('[useOwnerOverview] getAccount(libraryTA) failed');
        }

        // 5) Owner token account
        let authorityTA: PublicKey | null = null;
        try {
          if (publicKey) {
            authorityTA = await findFirstTokenAccountByOwnerAndMint(
              connection,
              publicKey,
              paymentMintPk
            );
          }
        } catch (e) {
          console.warn(
            '[useOwnerOverview] getTokenAccountsByOwner(owner) failed'
          );
        }

        const ov: OwnerOverview = {
          libraryPk: libPk.toBase58(),
          authority: authority.toBase58(),
          name: libraryAcc.name ?? '',
          description: libraryAcc.description ?? '',
          isActive: !!libraryAcc.isActive,
          paymentMint: paymentMintPk.toBase58(),
          membershipFeeLamports: asNumber(libraryAcc.membershipFee),
          lateFeePerDayLamports: asNumber(libraryAcc.lateFeePerDay),
          maxBorrowDays: asNumber(libraryAcc.maxBorrowDays),
          createdAt: asNumber(libraryAcc.createdAt),

          totalBooks: asNumber(libraryAcc.totalBooks),
          totalMembers: asNumber(libraryAcc.totalMembers),
          totalRevenue: asNumber(libraryAcc.totalRevenue),

          mintSymbol,
          mintDecimals,
          libraryTokenAccount: libTA ? libTA.toBase58() : '',
          authorityTokenAccount: authorityTA ? authorityTA.toBase58() : '',
          balanceRaw,
          balanceUi: Number(balanceRaw) / 10 ** mintDecimals,
        };

        if (!aborted) setData(ov);
      } catch (e: any) {
        if (!aborted) setError(e?.message ?? 'Load overview failed');
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    run();
    return () => {
      aborted = true;
    };
  }, [connection, program, isReady, libraryPk, publicKey]);

  const isOwner = useMemo(() => {
    if (!data || !publicKey) return false;
    return new PublicKey(data.authority).equals(publicKey);
  }, [data, publicKey]);

  return { data, loading, error, isOwner };
}

export function useWithdrawFunds() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { program, isReady, isWritable } = useGetProgram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txSig, setTxSig] = useState<string | null>(null);

  const withdraw = useCallback(
    async (params: {
      libraryPk: string;
      amountRaw: number;
      libraryTokenAccount?: string;
      authorityTokenAccount?: string;
    }) => {
      setLoading(true);
      setError(null);
      setTxSig(null);
      try {
        if (!publicKey) throw new Error('Wallet not connected');
        if (!isReady || !program) throw new Error('Program not ready');
        if (!isWritable)
          throw new Error('Read-only mode, cannot send transaction');

        const libPk = new PublicKey(params.libraryPk);

        // Fetch để xác thực owner và lấy mint
        const libraryAcc: any = await (program.account as any).library.fetch(
          libPk
        );
        const authorityPk = new PublicKey(libraryAcc.authority);
        if (!authorityPk.equals(publicKey))
          throw new Error('Not library owner');
        const mintPk = new PublicKey(libraryAcc.paymentMint);

        // Resolve token accounts
        let libTA = params.libraryTokenAccount
          ? new PublicKey(params.libraryTokenAccount)
          : null;
        if (!libTA)
          libTA = await findFirstTokenAccountByOwnerAndMint(
            connection,
            libPk,
            mintPk
          );
        if (!libTA) throw new Error('Library token account not found');

        let authTA = params.authorityTokenAccount
          ? new PublicKey(params.authorityTokenAccount)
          : null;
        if (!authTA)
          authTA = await findFirstTokenAccountByOwnerAndMint(
            connection,
            publicKey,
            mintPk
          );
        if (!authTA) throw new Error('Owner token account not found');

        const amount = new BN(params.amountRaw);

        const tx = await program.methods
          .withdrawFunds(amount)
          .accounts({
            library: libPk,
            authority: publicKey,
            libraryTokenAccount: libTA,
            authorityTokenAccount: authTA,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .transaction();

        const sig = await sendTransaction(tx, connection);
        setTxSig(sig);
        return sig;
      } catch (e: any) {
        console.error('[useWithdrawFunds] withdraw failed:', e);
        setError(e?.message ?? 'Withdraw failed');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [connection, program, isReady, isWritable, publicKey, sendTransaction]
  );

  return { withdraw, loading, error, txSig };
}
