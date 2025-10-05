import { Connection, PublicKey } from '@solana/web3.js';
import { getProgram } from 'shared/utils/getProgram';

type MemcmpFilter = { memcmp: { offset: number; bytes: string } };

function pkBytes(pk: PublicKey) {
  return pk.toBase58();
}

export async function listLibrariesByAuthority(
  connection: Connection,
  wallet: any,
  authority: PublicKey
) {
  const program = getProgram(connection, wallet);
  // authority là field đầu tiên sau discriminator? Theo struct Library, authority đứng đầu -> offset 8
  const filters: MemcmpFilter[] = [
    { memcmp: { offset: 8, bytes: pkBytes(authority) } },
  ];
  const accs = await program.account.library.all(filters);
  return accs;
}

export async function listBooksByLibrary(
  connection: Connection,
  wallet: any,
  library: PublicKey
) {
  const program = getProgram(connection, wallet);
  // book.library là field đầu tiên -> offset 8
  const filters: MemcmpFilter[] = [
    { memcmp: { offset: 8, bytes: pkBytes(library) } },
  ];
  return program.account.book.all(filters);
}

export async function listLoansByBook(
  connection: Connection,
  wallet: any,
  book: PublicKey
) {
  const program = getProgram(connection, wallet);
  const filters: MemcmpFilter[] = [
    { memcmp: { offset: 8, bytes: pkBytes(book) } },
  ];
  return program.account.loan.all(filters);
}

export async function listLoansByLibrary(
  connection: Connection,
  wallet: any,
  library: PublicKey
) {
  const program = getProgram(connection, wallet);
  const filters: MemcmpFilter[] = [
    { memcmp: { offset: 72, bytes: pkBytes(library) } },
  ]; // book(32)=8..40, member(32)=40..72, library bắt đầu tại 72
  return program.account.loan.all(filters);
}

export async function listReservationsByBook(
  connection: Connection,
  wallet: any,
  book: PublicKey
) {
  const program = getProgram(connection, wallet);
  const filters: MemcmpFilter[] = [
    { memcmp: { offset: 8, bytes: pkBytes(book) } },
  ];
  return program.account.reservation.all(filters);
}

export async function listReviewsByBook(
  connection: Connection,
  wallet: any,
  book: PublicKey
) {
  const program = getProgram(connection, wallet);
  const filters: MemcmpFilter[] = [
    { memcmp: { offset: 8, bytes: pkBytes(book) } },
  ];
  return program.account.review.all(filters);
}
