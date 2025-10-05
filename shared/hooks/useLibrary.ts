// shared/hooks/useLibrary.ts
'use client';

import { useState } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import toast from 'react-hot-toast';
import { useProgram } from './useProgram';
import { CreateLibraryFormData } from 'shared/types/types';
import { PDAUtils } from 'shared/utils/solana/pda';

export const useLibraryOperations = () => {
  const { program, wallet } = useProgram();
  const [loading, setLoading] = useState(false);

  const initializeLibrary = async (data: CreateLibraryFormData) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');

    setLoading(true);
    try {
      // 1. Get or create counter
      const [counterPDA] = await PDAUtils.deriveLibraryCounterPDA(
        wallet.publicKey
      );

      let counterAccount;
      try {
        counterAccount = await program.account.libraryCounter.fetch(counterPDA);
      } catch {
        await program.methods
          .initializeCounter()
          .accounts({
            counter: counterPDA,
            authority: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        await new Promise((resolve) => setTimeout(resolve, 2000));
        counterAccount = await program.account.libraryCounter.fetch(counterPDA);
      }

      // 2. Derive library PDA
      //@ts-ignore
      const nextIndex = counterAccount.nextIndex;
      const [libraryPDA] = await PDAUtils.deriveLibraryPDA(
        wallet.publicKey,
        nextIndex
      );

      // 3. Initialize library
      const tx = await program.methods
        .initializeLibrary(
          data.name,
          data.description,
          new BN(data.membershipFee),
          new BN(data.lateFeePerDay),
          data.maxBorrowDays,
          new PublicKey(data.paymentMint),
          nextIndex
        )
        .accounts({
          counter: counterPDA,
          library: libraryPDA,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const result = {
        success: true,
        signature: tx,
        libraryAddress: libraryPDA.toBase58(),
        index: nextIndex,
        explorerUrl: `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
      };

      toast.success('Library created successfully!');
      return result;
    } catch (error: any) {
      toast.error(`Failed to create library: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateLibrary = async (
    library: PublicKey,
    updates: {
      name?: string;
      description?: string;
      membershipFee?: number;
      lateFeePerDay?: number;
      maxBorrowDays?: number;
    }
  ) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');

    setLoading(true);
    try {
      const tx = await program.methods
        .updateLibrary(
          updates.name ?? null,
          updates.description ?? null,
          updates.membershipFee ? new BN(updates.membershipFee) : null,
          updates.lateFeePerDay ? new BN(updates.lateFeePerDay) : null,
          updates.maxBorrowDays ?? null
        )
        .accounts({
          library,
          authority: wallet.publicKey,
        })
        .rpc();

      toast.success('Library updated successfully!');
      return {
        signature: tx,
        explorerUrl: `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
      };
    } catch (error: any) {
      toast.error(`Failed to update library: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteLibrary = async (library: PublicKey) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');

    setLoading(true);
    try {
      const tx = await program.methods
        .deleteLibrary()
        .accounts({
          library,
          authority: wallet.publicKey,
        })
        .rpc();

      toast.success('Library deleted successfully!');
      return {
        signature: tx,
        explorerUrl: `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
      };
    } catch (error: any) {
      toast.error(`Failed to delete library: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const withdrawFunds = async (
    library: PublicKey,
    amount: number,
    libraryTokenAccount: PublicKey,
    authorityTokenAccount: PublicKey
  ) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');

    setLoading(true);
    try {
      const tx = await program.methods
        .withdrawFunds(new BN(amount))
        .accounts({
          library,
          authority: wallet?.publicKey,
          libraryTokenAccount,
          authorityTokenAccount,
          tokenProgram: new PublicKey(
            'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
          ),
        })
        .rpc();

      toast.success('Funds withdrawn successfully!');
      return {
        signature: tx,
        explorerUrl: `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
      };
    } catch (error: any) {
      toast.error(`Failed to withdraw funds: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    initializeLibrary,
    updateLibrary,
    deleteLibrary,
    withdrawFunds,
    loading,
  };
};
