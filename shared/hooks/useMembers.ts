// shared/hooks/useMembers.ts
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { useProgram } from 'shared/hooks/useProgram';
import { AnchorProvider } from '@coral-xyz/anchor';

const ENC = new TextEncoder();
const PROGRAM_ID = new PublicKey(
  '5mNRbBTG3K3LZif5GU11PZNBFrSbyLWhvS4wW2ABWdv2'
); // declare_id [attached_file:2]

function pdaMember(library: PublicKey, user: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [ENC.encode('member'), library.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  );
}

export type Tier = 'Basic' | 'Premium' | 'VIP';

export function useMemberApi() {
  const { program, connection, wallet } = useProgram();

  async function ensureAta(owner: PublicKey, mint: PublicKey) {
    const ata = await getAssociatedTokenAddress(mint, owner, true);
    const info = await connection.getAccountInfo(ata);
    if (!info) {
      if (!wallet?.publicKey) throw new Error('Wallet not connected');
      const ix = createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        ata,
        owner,
        mint,
        TOKEN_PROGRAM_ID
      );
      const tx = new Transaction().add(ix);
      const provider = program?.provider as AnchorProvider;
      await provider.sendAndConfirm(tx);
    }
    return ata;
  }

  async function registerMember(
    library: PublicKey,
    input: { name: string; email: string; tier: Tier; mint: PublicKey }
  ) {
    if (!wallet?.publicKey) throw new Error('Wallet not connected');
    const user = wallet.publicKey;

    const userAta = await ensureAta(user, input.mint);
    const libAta = await ensureAta(library, input.mint);

    const [member] = pdaMember(library, user);

    const sig = await program?.methods
      .registerMember(input.name, input.email, {
        [input.tier.toLowerCase()]: {},
      })
      .accounts({
        member,
        library,
        user,
        userTokenAccount: userAta,
        libraryTokenAccount: libAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return { signature: sig, member, userAta, libAta };
  }

  return { registerMember };
}
