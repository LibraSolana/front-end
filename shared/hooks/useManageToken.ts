// shared/hooks/useManageToken.ts
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  getMint,
  getAccount,
  createMintToInstruction,
  createBurnInstruction,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { useProgram } from 'shared/hooks/useProgram';
import {
  PROGRAM_ID as TMPL,
  createUpdateMetadataAccountV2Instruction,
} from '@metaplex-foundation/mpl-token-metadata';

export function useManageToken() {
  const { connection, wallet } = useProgram();

  async function getTokenInfo(
    mint: PublicKey,
    tokenProgram = TOKEN_PROGRAM_ID
  ) {
    const mintAcc = await getMint(connection, mint, 'confirmed', tokenProgram);
    const [metadataPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), TMPL.toBuffer(), mint.toBuffer()],
      TMPL
    );
    const md = await connection.getAccountInfo(metadataPda);
    return { mintAcc, metadataPda, hasMetadata: Boolean(md) };
  }

  async function mintMore(
    mint: PublicKey,
    toAta: PublicKey,
    amount: bigint,
    tokenProgram = TOKEN_PROGRAM_ID
  ) {
    if (!wallet?.publicKey) throw new Error('Wallet not connected');
    const tx = new Transaction().add(
      createMintToInstruction(
        mint,
        toAta,
        wallet.publicKey,
        amount,
        [],
        tokenProgram
      )
    );
    return await (wallet as any).provider.sendAndConfirm(tx);
  }

  async function burnFrom(
    mint: PublicKey,
    fromAta: PublicKey,
    amount: bigint,
    tokenProgram = TOKEN_PROGRAM_ID
  ) {
    const tx = new Transaction().add(
      createBurnInstruction(
        fromAta,
        mint,
        wallet!.publicKey,
        amount,
        [],
        tokenProgram
      )
    );
    return await (wallet as any).provider.sendAndConfirm(tx);
  }

  async function updateMetadata(
    mint: PublicKey,
    data: { name?: string; symbol?: string; uri?: string }
  ) {
    const [metadata] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), TMPL.toBuffer(), mint.toBuffer()],
      TMPL
    );
    const ix = createUpdateMetadataAccountV2Instruction(
      { metadata, updateAuthority: wallet!.publicKey },
      {
        updateMetadataAccountArgsV2: {
          data: {
            name: data.name ?? '',
            symbol: data.symbol ?? '',
            uri: data.uri ?? '',
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
          },
          updateAuthority: wallet!.publicKey,
          primarySaleHappened: null,
          isMutable: true,
        },
      }
    );
    const tx = new Transaction().add(ix);
    return await (wallet as any).provider.sendAndConfirm(tx);
  }

  return { getTokenInfo, mintMore, burnFrom, updateMetadata };
}
