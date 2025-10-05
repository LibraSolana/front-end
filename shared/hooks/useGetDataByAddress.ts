import { Connection, PublicKey } from '@solana/web3.js';
import { getProgram } from 'shared/utils/getProgram';

export async function getLibraryByAddress(
  connection: Connection,
  wallet: any,
  libraryPk: PublicKey
) {
  const program = getProgram(connection, wallet);
  return program.account.library.fetch(libraryPk);
}

export async function getMemberByAddress(
  connection: Connection,
  wallet: any,
  memberPk: PublicKey
) {
  const program = getProgram(connection, wallet);
  return program.account.member.fetch(memberPk);
}

export async function getBookByAddress(
  connection: Connection,
  wallet: any,
  bookPk: PublicKey
) {
  const program = getProgram(connection, wallet);
  return program.account.book.fetch(bookPk);
}

export async function getLoanByAddress(
  connection: Connection,
  wallet: any,
  loanPk: PublicKey
) {
  const program = getProgram(connection, wallet);
  return program.account.loan.fetch(loanPk);
}

export async function getReservationByAddress(
  connection: Connection,
  wallet: any,
  reservationPk: PublicKey
) {
  const program = getProgram(connection, wallet);
  return program.account.reservation.fetch(reservationPk);
}

export async function getReviewByAddress(
  connection: Connection,
  wallet: any,
  reviewPk: PublicKey
) {
  const program = getProgram(connection, wallet);
  return program.account.review.fetch(reviewPk);
}
