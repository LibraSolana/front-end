// shared/hooks/useLoans.ts
'use client';

import { useState } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import toast from 'react-hot-toast';
import { useProgram } from './useProgram';
import { BorrowBookFormData } from 'shared/types/types';
import { PDAUtils } from 'shared/utils/solana/pda';

export const useLoanOperations = () => {
  const { program, wallet } = useProgram();
  const [loading, setLoading] = useState(false);

  const borrowBook = async (
    book: PublicKey,
    library: PublicKey,
    data: BorrowBookFormData,
    userTokenAccount: PublicKey,
    libraryTokenAccount: PublicKey
  ) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');

    setLoading(true);
    try {
      const [loanPDA] = await PDAUtils.deriveLoanPDA(book, wallet.publicKey);
      const [memberPDA] = await PDAUtils.deriveMemberPDA(
        library,
        wallet.publicKey
      );

      const tx = await program.methods
        .borrowBook(data.rentalDays)
        .accounts({
          loan: loanPDA,
          book,
          member: memberPDA,
          library,
          user: wallet.publicKey,
          userTokenAccount,
          libraryTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success('Book borrowed successfully!');
      return {
        signature: tx,
        loan: loanPDA,
        explorerUrl: `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
      };
    } catch (error: any) {
      toast.error(`Failed to borrow book: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const returnBook = async (
    loan: PublicKey,
    book: PublicKey,
    library: PublicKey,
    userTokenAccount: PublicKey,
    libraryTokenAccount: PublicKey
  ) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');

    setLoading(true);
    try {
      const [memberPDA] = await PDAUtils.deriveMemberPDA(
        library,
        wallet.publicKey
      );

      const tx = await program.methods
        .returnBook()
        .accounts({
          loan,
          book,
          member: memberPDA,
          library,
          user: wallet.publicKey,
          userTokenAccount,
          libraryTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      toast.success('Book returned successfully!');
      return {
        signature: tx,
        explorerUrl: `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
      };
    } catch (error: any) {
      toast.error(`Failed to return book: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    borrowBook,
    returnBook,
    loading,
  };
};
