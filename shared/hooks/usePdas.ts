import { useCallback, useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useGetProgram } from './useGetProgram';

// Seeds khớp on-chain
const SEEDS = {
  COUNTER: 'library_counter',
  LIBRARY: 'library',
  MEMBER: 'member',
  BOOK: 'book',
  LOAN: 'loan',
  RESERVATION: 'reservation',
  REVIEW: 'review',
} as const;

// Helper: UInt32 little-endian 4 bytes
function u32Le(n: number): Buffer {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(n >>> 0, 0);
  return buf;
}

export function usePdas() {
  const {
    program,
    programId,
    publicKey: connected,
    isReady,
  } = useGetProgram() as any;

  // Hook: counter PDA
  function usePdaLibraryCounter(authority?: PublicKey | null) {
    return useMemo(() => {
      if (!authority || !programId) return null;
      const [pda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.COUNTER), authority.toBuffer()],
        programId
      );
      return { pda, bump };
    }, [authority?.toBase58(), programId?.toBase58()]);
  }

  // Hook: library PDA
  function usePdaLibrary(authority?: PublicKey | null, index?: number) {
    return useMemo(() => {
      if (!authority || index === undefined || !programId) return null;
      const [pda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.LIBRARY), authority.toBuffer(), u32Le(index)],
        programId
      );
      return { pda, bump, index };
    }, [authority?.toBase58(), index, programId?.toBase58()]);
  }

  // Helper: derive library PDA (sync)
  const deriveLibraryPda = useCallback(
    (authority: PublicKey, index: number) => {
      if (!program) throw new Error('Missing program');
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.LIBRARY), authority.toBuffer(), u32Le(index)],
        program.programId
      );
      return pda;
    },
    [program]
  );

  // Helper: derive member
  const deriveMemberPda = useCallback(
    (library: PublicKey, user?: PublicKey) => {
      const u = user ?? connected;
      if (!u || !program) throw new Error('Missing user/program');
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.MEMBER), library.toBuffer(), u.toBuffer()],
        program.programId
      );
      return pda;
    },
    [program, connected?.toBase58()]
  );

  // Helper: derive book — cần truyền vào đúng 32 byte hash(title.as_bytes()) theo on-chain
  // Gợi ý: dùng crypto.subtle.digest("SHA-256", new TextEncoder().encode(title)) để có 32 byte.
  const deriveBookPda = useCallback(
    (library: PublicKey, librarian: PublicKey, titleHash32: Uint8Array) => {
      if (!program) throw new Error('Missing program');
      if (titleHash32.length !== 32)
        throw new Error('titleHash32 must be 32 bytes');
      const [pda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from(SEEDS.BOOK),
          library.toBuffer(),
          librarian.toBuffer(),
          Buffer.from(titleHash32),
        ],
        program.programId
      );
      return pda;
    },
    [program]
  );

  // Helper: derive loan
  const deriveLoanPda = useCallback(
    (book: PublicKey, user?: PublicKey) => {
      const u = user ?? connected;
      if (!u || !program) throw new Error('Missing user/program');
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.LOAN), book.toBuffer(), u.toBuffer()],
        program.programId
      );
      return pda;
    },
    [program, connected?.toBase58()]
  );

  // Helper: derive reservation
  const deriveReservationPda = useCallback(
    (book: PublicKey, user?: PublicKey) => {
      const u = user ?? connected;
      if (!u || !program) throw new Error('Missing user/program');
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.RESERVATION), book.toBuffer(), u.toBuffer()],
        program.programId
      );
      return pda;
    },
    [program, connected?.toBase58()]
  );

  // Helper: derive review
  const deriveReviewPda = useCallback(
    (book: PublicKey, user?: PublicKey) => {
      const u = user ?? connected;
      if (!u || !program) throw new Error('Missing user/program');
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEEDS.REVIEW), book.toBuffer(), u.toBuffer()],
        program.programId
      );
      return pda;
    },
    [program, connected?.toBase58()]
  );

  return {
    // Hooks
    usePdaLibraryCounter,
    usePdaLibrary,
    // Helpers
    deriveLibraryPda,
    deriveMemberPda,
    deriveBookPda,
    deriveLoanPda,
    deriveReservationPda,
    deriveReviewPda,
  };
}
