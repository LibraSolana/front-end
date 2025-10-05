// shared/hooks/useBooks.ts
'use client';

import { useState } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import toast from 'react-hot-toast';
import { useProgram } from './useProgram';
import { AddBookFormData, BookCategory } from 'shared/types/types';
import { PDAUtils } from 'shared/utils/solana/pda';

export const useBookOperations = () => {
  const { program, wallet } = useProgram();
  const [loading, setLoading] = useState(false);

  // Helper: kiểm tra ví hiện tại có phải authority của Library
  const isAuthority = (libraryAuthority?: string | PublicKey) => {
    const wa = wallet?.publicKey?.toBase58?.();
    const la =
      typeof libraryAuthority === 'string'
        ? libraryAuthority
        : libraryAuthority?.toBase58?.();
    return !!wa && !!la && wa === la;
  };

  const addBook = async (library: PublicKey, data: AddBookFormData) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');

    setLoading(true);
    try {
      const titleHash = await PDAUtils.hashTitle(data.title);
      const [bookPDA] = await PDAUtils.deriveBookPDA(
        library,
        wallet.publicKey,
        titleHash
      );

      const categoryIndex = BookCategory[data.category];

      const tx = await program.methods
        .addBook(
          data.title,
          data.authorName,
          data.isbn || '',
          data.description || '',
          { [data.category.toLowerCase()]: {} }, // Enum variant
          data.language || '',
          data.publisher || '',
          data.publicationYear || 0,
          data.pages || 0,
          new BN(data.price || 0),
          new BN(data.rentalPrice || 0),
          data.maxRentalDays || 0,
          data.isFree,
          data.isNft,
          data.fileUrl || '',
          data.coverUrl || '',
          data.copiesAvailable
        )
        .accounts({
          book: bookPDA,
          library,
          librarian: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success('Book added successfully!');
      return {
        signature: tx,
        book: bookPDA,
        explorerUrl: `https://explorer.solana.com/tx/${tx}?cluster=devnet`,
      };
    } catch (error: any) {
      toast.error(`Failed to add book: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // UPDATE BOOK: Authority của Library ký, library phải active
  const updateBook = async (
    book: PublicKey,
    library: PublicKey,
    updates: {
      title?: string;
      description?: string;
      price?: number;
      rentalPrice?: number;
      copiesAvailable?: number;
      isActive?: boolean;
      // dữ liệu hỗ trợ validate client-side
      totals?: { totalCopies?: number; availableCopies?: number };
    }
  ) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');

    // client validation: độ dài và copies
    if (updates.title != null) {
      const t = updates.title.trim();
      if (!t) throw new Error('Title cannot be empty');
      if (t.length > 200) throw new Error('Title too long');
    }
    if (updates.description != null && updates.description.length > 1000) {
      throw new Error('Description too long');
    }
    // copiesAvailable mới phải ≥ số đang mượn
    if (typeof updates.copiesAvailable === 'number' && updates.totals) {
      const borrowed = Math.max(
        0,
        (updates.totals.totalCopies ?? 0) -
          (updates.totals.availableCopies ?? 0)
      );
      if (updates.copiesAvailable < borrowed) {
        throw new Error(`copiesAvailable must be ≥ ${borrowed}`);
      }
    }

    setLoading(true);
    try {
      const tx = await program.methods
        .updateBook(
          updates.title ?? null,
          updates.description ?? null,
          updates.price != null ? new BN(updates.price) : null,
          updates.rentalPrice != null ? new BN(updates.rentalPrice) : null,
          updates.copiesAvailable ?? null,
          updates.isActive ?? null
        )
        .accounts({
          book,
          library,
          authority: wallet.publicKey,
        })
        .rpc();

      toast.success('Book updated successfully!');
      return { signature: tx };
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update book');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // DELETE BOOK: Authority ký, chỉ xoá khi available == total (không có bản đang mượn)
  const deleteBook = async (book: PublicKey, library: PublicKey) => {
    if (!program || !wallet?.publicKey)
      throw new Error('Program or wallet not ready');
    setLoading(true);
    try {
      const tx = await program.methods
        .deleteBook()
        .accounts({
          book,
          library,
          authority: wallet.publicKey,
        })
        .rpc();

      toast.success('Book deleted successfully!');
      return { signature: tx };
    } catch (e: any) {
      // on-chain sẽ trả về LibraryErrorCannotDeleteBorrowedBook nếu còn bản đang mượn
      toast.error(e?.message || 'Failed to delete book');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { addBook, updateBook, deleteBook, isAuthority, loading };
};
