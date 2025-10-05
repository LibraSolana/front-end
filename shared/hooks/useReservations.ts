// shared/hooks/useReservations.ts
'use client';

import { useState } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import toast from 'react-hot-toast';
import { useProgram } from './useProgram';
import { ReserveBookFormData, ReviewBookFormData } from 'shared/types/types';
import { PDAUtils } from 'shared/utils/solana/pda';

export const useReservationOperations = () => {
  const { program, wallet } = useProgram();
  const [loading, setLoading] = useState(false);

  const reserveBook = async (
    book: PublicKey,
    library: PublicKey,
    data: ReserveBookFormData,
    userTokenAccount: PublicKey,
    libraryTokenAccount: PublicKey
  ) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');

    setLoading(true);
    try {
      const [reservationPDA] = await PDAUtils.deriveReservationPDA(
        book,
        wallet.publicKey
      );
      const [memberPDA] = await PDAUtils.deriveMemberPDA(
        library,
        wallet.publicKey
      );

      const tx = await program.methods
        .reserveBook(data.priorityFee)
        .accounts({
          reservation: reservationPDA,
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

      toast.success('Book reserved successfully!');
      return {
        signature: tx,
        reservation: reservationPDA,
        explorerUrl: `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
      };
    } catch (error: any) {
      toast.error(`Failed to reserve book: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (book: PublicKey, reservation: PublicKey) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');

    setLoading(true);
    try {
      const tx = await program.methods
        .cancelReservation()
        .accounts({
          reservation,
          book,
          user: wallet.publicKey,
        })
        .rpc();

      toast.success('Reservation cancelled successfully!');
      return {
        signature: tx,
        explorerUrl: `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
      };
    } catch (error: any) {
      toast.error(`Failed to cancel reservation: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    reserveBook,
    cancelReservation,
    loading,
  };
};

export const useReviewOperations = () => {
  const { program, wallet } = useProgram();
  const [loading, setLoading] = useState(false);

  const reviewBook = async (
    book: PublicKey,
    library: PublicKey,
    data: ReviewBookFormData
  ) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');

    setLoading(true);
    try {
      const [reviewPDA] = await PDAUtils.deriveReviewPDA(
        book,
        wallet.publicKey
      );
      const [memberPDA] = await PDAUtils.deriveMemberPDA(
        library,
        wallet.publicKey
      );

      const tx = await program.methods
        .reviewBook(data.rating, data.comment)
        .accounts({
          review: reviewPDA,
          book,
          member: memberPDA,
          library,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success('Review submitted successfully!');
      return {
        signature: tx,
        review: reviewPDA,
        explorerUrl: `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
      };
    } catch (error: any) {
      toast.error(`Failed to submit review: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    reviewBook,
    loading,
  };
};
