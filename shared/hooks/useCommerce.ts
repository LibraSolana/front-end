// shared/hooks/useCommerce.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  getAssociatedTokenAddressSync,
  getMint,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { useGetProgram } from './useGetProgram';
import { toast } from 'react-hot-toast';

type AutoParams = {
  pcoinMint: string;
  libraryOwner: string; // base58 owner của ATA thư viện (PDA thư viện hoặc ví)
};

export function useAutoTokenAccounts({ pcoinMint, libraryOwner }: AutoParams) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { program, isReady, isWritable } = useGetProgram();

  const [mintPk, setMintPk] = useState<PublicKey | null>(null);
  const [decimals, setDecimals] = useState<number>(6);
  const [tokenProgram, setTokenProgram] = useState(TOKEN_PROGRAM_ID);
  const [userAta, setUserAta] = useState('');
  const [libraryAta, setLibraryAta] = useState('');

  // Resolve mint/decimals/program id
  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const mint = new PublicKey(pcoinMint);
        const info = await connection.getAccountInfo(mint);
        const prog =
          info && info.owner.equals(TOKEN_2022_PROGRAM_ID)
            ? TOKEN_2022_PROGRAM_ID
            : TOKEN_PROGRAM_ID;
        const acc = await getMint(connection, mint, 'confirmed', prog);
        if (!off) {
          setMintPk(mint);
          setTokenProgram(prog);
          setDecimals(acc.decimals);
        }
      } catch (e) {
        if (!off) {
          setMintPk(null);
          setTokenProgram(TOKEN_PROGRAM_ID);
          setDecimals(6);
        }
      }
    })();
    return () => {
      off = true;
    };
  }, [connection, pcoinMint]);

  // Derive ATAs automatically
  useEffect(() => {
    if (!mintPk) return;
    try {
      if (publicKey) {
        const ata = getAssociatedTokenAddressSync(
          mintPk,
          publicKey,
          true,
          tokenProgram
        );
        setUserAta(ata.toBase58());
      }
      if (libraryOwner) {
        const owner = new PublicKey(libraryOwner);
        const ataLib = getAssociatedTokenAddressSync(
          mintPk,
          owner,
          true,
          tokenProgram
        );
        setLibraryAta(ataLib.toBase58());
      }
    } catch {
      // ignore
    }
  }, [mintPk, publicKey, libraryOwner, tokenProgram]);

  // Helpers: simulate + send with logs + toasts
  async function simulateAndSend(tx: any, label: string) {
    try {
      const sim = await connection.simulateTransaction(tx as any, {
        sigVerify: false,
        replaceRecentBlockhash: true,
      });
      if (sim.value.err) {
        console.error(`[${label}] Simulation error:`, sim.value.err);
        console.error(`[${label}] Logs:`, sim.value.logs);
        const brief = Array.isArray(sim.value.logs)
          ? sim.value.logs.slice(-5).join('\n')
          : JSON.stringify(sim.value.err);
        toast.error(`${label} failed: ${brief}`);
        throw new Error(brief);
      }
    } catch (e: any) {
      // Nếu simulate lỗi do blockhash, vẫn cố gửi nhưng cảnh báo
      console.warn(
        `[${label}] simulate failed, trying to send anyway`,
        e?.message
      );
    }
    const sig = await sendTransaction(tx, connection);
    toast.success(`${label} sent: ${sig.slice(0, 8)}...`);
    console.log(`[${label}] signature:`, sig);
    return sig;
  }

  // Minimal actions
  const [buyLoading, setBuyLoading] = useState(false);
  const [borrowLoading, setBorrowLoading] = useState(false);

  const buy = useCallback(
    async (params: {
      bookPk: string;
      libraryPk: string;
      userTokenAccount: string;
      libraryTokenAccount: string;
      priceRaw: number;
    }) => {
      if (!publicKey) {
        toast.error('Wallet not connected');
        throw new Error('Wallet not connected');
      }
      if (!isReady || !program) {
        toast.error('Program not ready');
        throw new Error('Program not ready');
      }
      if (!isWritable) {
        toast.error('Read-only wallet');
        throw new Error('Read-only wallet');
      }
      setBuyLoading(true);
      try {
        // Log IDL accounts schema
        console.log(
          'buyBook accounts schema:',
          program?.idl?.instructions?.find((i: any) => i.name === 'buyBook')
            ?.accounts
        );

        const tx = await program.methods
          .buyBook({}) // chỉnh theo IDL nếu cần amount
          .accounts({
            book: new PublicKey(params.bookPk),
            library: new PublicKey(params.libraryPk),
            user: publicKey,
            userTokenAccount: new PublicKey(params.userTokenAccount),
            libraryTokenAccount: new PublicKey(params.libraryTokenAccount),
            tokenProgram: tokenProgram,
            systemProgram: SystemProgram.programId,
          })
          .transaction();

        console.table({
          book: params.bookPk,
          library: params.libraryPk,
          user: publicKey.toBase58(),
          userTA: params.userTokenAccount,
          libraryTA: params.libraryTokenAccount,
          tokenProgram: tokenProgram.toBase58?.() ?? String(tokenProgram),
        });

        const sig = await simulateAndSend(tx, 'Buy');
        return sig;
      } catch (e: any) {
        console.error('Buy failed:', e);
        toast.error(e?.message || 'Buy failed');
        throw e;
      } finally {
        setBuyLoading(false);
      }
    },
    [
      connection,
      program,
      isReady,
      isWritable,
      publicKey,
      sendTransaction,
      tokenProgram,
    ]
  );

  const borrow = useCallback(
    async (params: {
      bookPk: string;
      libraryPk: string;
      userTokenAccount: string;
      libraryTokenAccount: string;
      rentalDays: number;
    }) => {
      if (!publicKey) {
        toast.error('Wallet not connected');
        throw new Error('Wallet not connected');
      }
      if (!isReady || !program) {
        toast.error('Program not ready');
        throw new Error('Program not ready');
      }
      if (!isWritable) {
        toast.error('Read-only wallet');
        throw new Error('Read-only wallet');
      }
      setBorrowLoading(true);
      try {
        const book = new PublicKey(params.bookPk);
        const library = new PublicKey(params.libraryPk);
        const user = publicKey;

        // PDA derive — CHỈNH seeds theo program thật
        const [loanPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('loan'), book.toBuffer(), user.toBuffer()],
          program.programId
        );
        const [memberPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('member'), library.toBuffer(), user.toBuffer()],
          program.programId
        );

        // Log IDL
        console.log(
          'borrowBook accounts schema:',
          program?.idl?.instructions?.find((i: any) => i.name === 'borrowBook')
            ?.accounts
        );

        const tx = await program.methods
          .borrowBook(Math.max(1, Math.trunc(params.rentalDays)))
          .accounts({
            loan: loanPda,
            member: memberPda,
            book,
            library,
            user,
            userTokenAccount: new PublicKey(params.userTokenAccount),
            libraryTokenAccount: new PublicKey(params.libraryTokenAccount),
            tokenProgram: tokenProgram,
            systemProgram: SystemProgram.programId,
          })
          .transaction();

        console.table({
          book: book.toBase58(),
          library: library.toBase58(),
          user: user.toBase58(),
          loan: loanPda.toBase58(),
          member: memberPda.toBase58(),
          userTA: params.userTokenAccount,
          libraryTA: params.libraryTokenAccount,
          tokenProgram: tokenProgram.toBase58?.() ?? String(tokenProgram),
        });

        const sig = await simulateAndSend(tx, 'Borrow');
        return sig;
      } catch (e: any) {
        console.error('Borrow failed:', e);
        toast.error(e?.message || 'Borrow failed');
        throw e;
      } finally {
        setBorrowLoading(false);
      }
    },
    [
      connection,
      program,
      isReady,
      isWritable,
      publicKey,
      sendTransaction,
      tokenProgram,
    ]
  );

  return {
    decimals,
    userAta,
    libraryAta,
    buy,
    borrow,
    buyLoading,
    borrowLoading,
  };
}
