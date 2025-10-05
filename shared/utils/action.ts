// src/chain/actions.ts
import { BN, AnchorProvider, Program } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { IDL } from 'shared/types/enhanced_decentralized_library';

// Program ID từ declare_id!
export const PROGRAM_ID = new PublicKey(
  '5mNRbBTG3K3LZif5GU11PZNBFrSbyLWhvS4wW2ABWdv2'
);

// PDA helpers theo seeds trong program
const ENC = new TextEncoder();
function pdaMember(library: PublicKey, user: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [ENC.encode('member'), library.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
}
function pdaLoan(book: PublicKey, user: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [ENC.encode('loan'), book.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
}
function pdaReservation(book: PublicKey, user: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [ENC.encode('reservation'), book.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
}
function pdaReview(book: PublicKey, user: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [ENC.encode('review'), book.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
}

// Tạo Program client
function getProgram(connection: Connection, wallet: any) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  return new Program(IDL as any, PROGRAM_ID, provider);
}

// Kiểu accounts chung cho borrow/reserve
export type AccountsWithToken = {
  user: PublicKey; // signer
  library: PublicKey; // Library account address (PDA 'library')
  book: PublicKey; // Book account address (PDA 'book')
  userTokenAccount: PublicKey; // ATA của user cho Library.paymentMint
  libraryTokenAccount: PublicKey; // ATA của Library cho cùng mint
  tokenProgram: PublicKey; // SPL Token program id
  systemProgram: PublicKey; // 11111111111111111111111111111111
};

// Thuê sách: tạo Loan, chuyển rentalFee (nếu >0), cập nhật counters
export async function borrowBookTx(
  connection: Connection,
  wallet: any,
  a: AccountsWithToken,
  rentalDays: number
) {
  const program = getProgram(connection, wallet);
  const [member] = pdaMember(a.library, a.user);
  const [loan] = pdaLoan(a.book, a.user);

  return program.methods
    .borrowBook(new BN(rentalDays))
    .accounts({
      loan,
      book: a.book,
      member,
      library: a.library,
      user: a.user,
      userTokenAccount: a.userTokenAccount,
      libraryTokenAccount: a.libraryTokenAccount,
      tokenProgram: a.tokenProgram,
      systemProgram: a.systemProgram,
    })
    .rpc();
}

// Đặt trước: tạo Reservation, thu priorityFee nếu có
export async function reserveBookTx(
  connection: Connection,
  wallet: any,
  a: AccountsWithToken,
  priorityFee: bigint // u64
) {
  const program = getProgram(connection, wallet);
  const [member] = pdaMember(a.library, a.user);
  const [reservation] = pdaReservation(a.book, a.user);

  return program.methods
    .reserveBook(new BN(priorityFee.toString()))
    .accounts({
      reservation,
      book: a.book,
      member,
      library: a.library,
      user: a.user,
      userTokenAccount: a.userTokenAccount,
      libraryTokenAccount: a.libraryTokenAccount,
      tokenProgram: a.tokenProgram,
      systemProgram: a.systemProgram,
    })
    .rpc();
}

// Đánh giá: tạo Review, cập nhật rating trung bình
export async function reviewBookTx(
  connection: Connection,
  wallet: any,
  a: {
    user: PublicKey;
    library: PublicKey;
    book: PublicKey;
    systemProgram: PublicKey;
  },
  rating: number, // 1..5
  comment: string // <= MAXCOMMENTLEN
) {
  const program = getProgram(connection, wallet);
  const [member] = pdaMember(a.library, a.user);
  const [review] = pdaReview(a.book, a.user);

  return program.methods
    .reviewBook(rating, comment)
    .accounts({
      review,
      book: a.book,
      member,
      library: a.library,
      user: a.user,
      systemProgram: a.systemProgram,
    })
    .rpc();
}
