// shared/utils/pda.ts
import { PublicKey } from '@solana/web3.js';
import { PROGRAM_ID } from 'shared/types/types';

export class PDAUtils {
  static async deriveLibraryCounterPDA(
    authority: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('library_counter'), authority.toBuffer()],
      PROGRAM_ID
    );
  }

  static async deriveLibraryPDA(
    authority: PublicKey,
    index: number
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('library'),
        authority.toBuffer(),
        Buffer.from(new Uint8Array(new Uint32Array([index]).buffer)),
      ],
      PROGRAM_ID
    );
  }

  static async deriveBookPDA(
    library: PublicKey,
    librarian: PublicKey,
    titleHash: Uint8Array
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('book'),
        library.toBuffer(),
        librarian.toBuffer(),
        Buffer.from(titleHash),
      ],
      PROGRAM_ID
    );
  }

  static async deriveMemberPDA(
    library: PublicKey,
    user: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('member'), library.toBuffer(), user.toBuffer()],
      PROGRAM_ID
    );
  }

  static async deriveLoanPDA(
    book: PublicKey,
    user: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('loan'), book.toBuffer(), user.toBuffer()],
      PROGRAM_ID
    );
  }

  static async deriveReservationPDA(
    book: PublicKey,
    user: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('reservation'), book.toBuffer(), user.toBuffer()],
      PROGRAM_ID
    );
  }

  static async deriveReviewPDA(
    book: PublicKey,
    user: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('review'), book.toBuffer(), user.toBuffer()],
      PROGRAM_ID
    );
  }

  static async hashTitle(title: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const data = encoder.encode(title);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  }
}

const ENC = new TextEncoder();

export function pdaMember(library: PublicKey, user: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [ENC.encode('member'), library.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
}

export function pdaReview(book: PublicKey, user: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [ENC.encode('review'), book.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
}
