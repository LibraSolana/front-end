// src/lib/books/service.ts
import { BN, Program } from '@coral-xyz/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import { findBookPDA } from 'shared/utils/solana/pda';

export type AddBookArgs = {
  title: string;
  authorName: string;
  isbn: string;
  description: string;
  category: { [k in string]?: {} }; // Anchor enum variant, e.g. { Fiction: {} }
  language: string;
  publisher: string;
  publicationYear: number;
  pages: number;
  price: BN;
  rentalPrice: BN;
  maxRentalDays: number;
  isFree: boolean;
  isNft: boolean;
  fileUrl: string;
  coverUrl: string;
  copiesAvailable: number;
};

export async function addBook(
  program: Program,
  library: PublicKey,
  librarian: PublicKey,
  args: AddBookArgs
) {
  const [book] = findBookPDA(library, librarian, args.title);
  await program.methods
    .addBook(
      args.title,
      args.authorName,
      args.isbn,
      args.description,
      args.category,
      args.language,
      args.publisher,
      args.publicationYear,
      args.pages,
      args.price,
      args.rentalPrice,
      args.maxRentalDays,
      args.isFree,
      args.isNft,
      args.fileUrl,
      args.coverUrl,
      args.copiesAvailable
    )
    .accounts({
      book,
      library,
      librarian,
      systemProgram: PublicKey.default,
    })
    .rpc();
  return book;
}

export type UpdateBookArgs = {
  title?: string | null;
  description?: string | null;
  price?: BN | null;
  rentalPrice?: BN | null;
  copiesAvailable?: number | null;
  isActive?: boolean | null;
};

export async function updateBook(
  program: Program,
  book: PublicKey,
  library: PublicKey,
  authority: PublicKey,
  args: UpdateBookArgs
) {
  await program.methods
    .updateBook(
      args.title ?? null,
      args.description ?? null,
      args.price ?? null,
      args.rentalPrice ?? null,
      args.copiesAvailable ?? null,
      args.isActive ?? null
    )
    .accounts({ book, library, authority })
    .rpc();
}

export async function deleteBook(
  program: Program,
  book: PublicKey,
  library: PublicKey,
  authority: PublicKey
) {
  await program.methods
    .deleteBook()
    .accounts({ book, library, authority })
    .rpc();
}

export async function fetchBook(program: Program, book: PublicKey) {
  return program.account.book.fetch(book);
}

export async function fetchBooksByLibrary(
  program: Program,
  library: PublicKey
) {
  // offset 8 vì 8 bytes discriminator; trường library là Pubkey đầu tiên của account Book
  return program.account.book.all([
    { memcmp: { offset: 8, bytes: library.toBase58() } },
  ]);
}
