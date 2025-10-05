// shared/hooks/useMembers.ts
'use client';

import { useState } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import toast from 'react-hot-toast';
import { useProgram } from './useProgram';
import {
  RegisterMemberFormData,
  RenewMembershipFormData,
  UpgradeMembershipFormData,
} from 'shared/types/types';
import { PDAUtils } from 'shared/utils/solana/pda';

export const useMemberOperations = () => {
  const { program, wallet } = useProgram();
  const [loading, setLoading] = useState(false);

  const registerMember = async (
    library: PublicKey,
    data: RegisterMemberFormData,
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
        .registerMember(
          data.name,
          data.email,
          { [data.membershipTier.toLowerCase()]: {} } // Enum variant
        )
        .accounts({
          member: memberPDA,
          library,
          user: wallet.publicKey,
          userTokenAccount,
          libraryTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success('Member registered successfully!');
      return {
        signature: tx,
        member: memberPDA,
        explorerUrl: `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
      };
    } catch (error: any) {
      toast.error(`Failed to register member: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMember = async (
    member: PublicKey,
    library: PublicKey,
    updates: {
      name?: string;
      email?: string;
      isActive?: boolean;
    }
  ) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');

    setLoading(true);
    try {
      const tx = await program.methods
        .updateMember(
          updates.name ?? null,
          updates.email ?? null,
          updates.isActive ?? null
        )
        .accounts({
          member,
          library,
          user: wallet.publicKey,
        })
        .rpc();

      toast.success('Member updated successfully!');
      return {
        signature: tx,
        explorerUrl: `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
      };
    } catch (error: any) {
      toast.error(`Failed to update member: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (member: PublicKey, library: PublicKey) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');

    setLoading(true);
    try {
      const tx = await program.methods
        .deleteMember()
        .accounts({
          member,
          library,
          user: wallet.publicKey,
        })
        .rpc();

      toast.success('Member deleted successfully!');
      return {
        signature: tx,
        explorerUrl: `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
      };
    } catch (error: any) {
      toast.error(`Failed to delete member: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const renewMembership = async (
    member: PublicKey,
    library: PublicKey,
    data: RenewMembershipFormData,
    userTokenAccount: PublicKey,
    libraryTokenAccount: PublicKey
  ) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');

    setLoading(true);
    try {
      const tx = await program.methods
        .renewMembership(data.extensionMonths)
        .accounts({
          member,
          library,
          user: wallet.publicKey,
          userTokenAccount,
          libraryTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      toast.success('Membership renewed successfully!');
      return {
        signature: tx,
        explorerUrl: `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
      };
    } catch (error: any) {
      toast.error(`Failed to renew membership: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const upgradeMembership = async (
    member: PublicKey,
    library: PublicKey,
    data: UpgradeMembershipFormData,
    userTokenAccount: PublicKey,
    libraryTokenAccount: PublicKey
  ) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');

    setLoading(true);
    try {
      const tx = await program.methods
        .upgradeMembership({ [data.newTier.toLowerCase()]: {} })
        .accounts({
          member,
          library,
          user: wallet.publicKey,
          userTokenAccount,
          libraryTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      toast.success('Membership upgraded successfully!');
      return {
        signature: tx,
        explorerUrl: `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
      };
    } catch (error: any) {
      toast.error(`Failed to upgrade membership: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    registerMember,
    updateMember,
    deleteMember,
    renewMembership,
    upgradeMembership,
    loading,
  };
};
