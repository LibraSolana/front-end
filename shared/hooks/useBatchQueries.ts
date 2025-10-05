'use client';

import { useCallback, useState } from 'react';
import { useProgram } from './useProgram';

import { PublicKey } from '@solana/web3.js';
import { Book, Library, Loan } from 'shared/utils/solana/types';

export function useLibrariesByAuthority() {
  const { program, isReady } = useProgram();
  const [loading, setLoading] = useState(false);

  const fetchLibraries = useCallback(
    async (authority: string) => {
      if (!isReady() || !program) throw new Error('Program not ready');
      setLoading(true);
      try {
        const all = await program.account.library.all();
        const list = (
          all.map((x) => ({ pubkey: x.publicKey, data: x.account })) as {
            pubkey: PublicKey;
            data: Library;
          }[]
        ).filter((x) => x.data.authority.toString() === authority);
        return list;
      } finally {
        setLoading(false);
      }
    },
    [program, isReady]
  );

  return { fetchLibraries, loading };
}

export function useBooksByLibrary() {
  const { program, isReady } = useProgram();
  const [loading, setLoading] = useState(false);

  const fetchBooks = useCallback(
    async (library: string) => {
      if (!isReady() || !program) throw new Error('Program not ready');
      setLoading(true);
      try {
        const all = await program.account.book.all();
        const list = (
          all.map((x) => ({ pubkey: x.publicKey, data: x.account })) as {
            pubkey: PublicKey;
            data: Book;
          }[]
        ).filter((x) => x.data.library.toString() === library);
        return list;
      } finally {
        setLoading(false);
      }
    },
    [program, isReady]
  );

  return { fetchBooks, loading };
}

export function useLoansByMember() {
  const { program, isReady } = useProgram();
  const [loading, setLoading] = useState(false);

  const fetchLoans = useCallback(
    async (memberPubkey: string) => {
      if (!isReady() || !program) throw new Error('Program not ready');
      setLoading(true);
      try {
        const all = await program.account.loan.all();
        const list = (
          all.map((x) => ({ pubkey: x.publicKey, data: x.account })) as {
            pubkey: PublicKey;
            data: Loan;
          }[]
        ).filter((x) => x.data.member.toString() === memberPubkey);
        return list;
      } finally {
        setLoading(false);
      }
    },
    [program, isReady]
  );

  return { fetchLoans, loading };
}
