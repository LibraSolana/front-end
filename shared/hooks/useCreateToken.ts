// shared/hooks/useCreateToken.ts
import { useCallback, useState } from 'react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
} from '@solana/spl-token';
import { useProgram } from 'shared/hooks/useProgram';
import { AnchorProvider } from '@coral-xyz/anchor';
import toast from 'react-hot-toast';

import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import {
  PROGRAM_ID as MPL_TOKEN_METADATA_PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
} from '@metaplex-foundation/mpl-token-metadata';

export type CreateTokenInput = {
  decimals: number;
  initialSupply: number;
  programKind: 'legacy' | '2022';
  freezeAuthority?: boolean;
  lockMintAfter?: boolean;
  treasuryOwner?: PublicKey;
  name?: string;
  symbol?: string;
  uri?: string;
};

export type CreateTokenResult = {
  mint: PublicKey;
  treasuryAta: PublicKey;
  signatureMint?: string;
  signatureLock?: string;
  metadataPda?: PublicKey;
};

export function useCreateToken() {
  const { connection, wallet, program } = useProgram();
  const [loading, setLoading] = useState(false);

  const createToken = useCallback(
    async (input: CreateTokenInput): Promise<CreateTokenResult> => {
      if (!wallet?.publicKey) {
        toast.error('Vui lòng kết nối ví');
        throw new Error('Wallet not connected');
      }

      const provider: AnchorProvider =
        (program?.provider as AnchorProvider) ||
        // @ts-ignore
        wallet.provider ||
        new AnchorProvider(connection as any, wallet as any, {});

      const owner = input.treasuryOwner ?? wallet.publicKey;
      const tokenProgram =
        input.programKind === '2022' ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID;

      setLoading(true);
      const step = (msg: string) => toast.loading(msg, { id: 'mint-flow' });
      const ok = (msg: string) => toast.success(msg, { id: 'mint-flow' });
      const fail = (msg: string) => toast.error(msg, { id: 'mint-flow' });

      try {
        // 1) Create mint
        step('Đang tạo mint...');
        const mintKeypair = await (async () => {
          const { Keypair } = await import('@solana/web3.js');
          const kp = Keypair.generate();
          const rent = await getMinimumBalanceForRentExemptMint(connection);

          const tx = new Transaction().add(
            SystemProgram.createAccount({
              fromPubkey: wallet.publicKey,
              newAccountPubkey: kp.publicKey,
              lamports: rent,
              space: MINT_SIZE,
              programId: tokenProgram,
            }),
            createInitializeMintInstruction(
              kp.publicKey,
              input.decimals,
              wallet.publicKey,
              input.freezeAuthority ? wallet.publicKey : null,
              tokenProgram
            )
          );

          await provider.sendAndConfirm(tx, [kp]);
          return kp;
        })();
        const mint = mintKeypair.publicKey;
        ok('Tạo mint thành công');

        // 2) Create ATA
        step('Đang tạo tài khoản token (ATA)...');
        const treasuryAta = getAssociatedTokenAddressSync(
          mint,
          owner,
          true,
          tokenProgram
        );
        try {
          const tx = new Transaction().add(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              treasuryAta,
              owner,
              mint,
              tokenProgram
            )
          );
          await provider.sendAndConfirm(tx);
          ok('Tạo ATA thành công');
        } catch (e: any) {
          const msg = String(e?.message || '');
          if (msg.includes('already in use') || msg.includes('exists')) {
            ok('ATA đã tồn tại');
          } else {
            throw e;
          }
        }

        // 3) Mint initial supply
        let signatureMint: string | undefined;
        const amount = BigInt(
          Math.round(Number(input.initialSupply || 0) * 10 ** input.decimals)
        );
        if (amount > 0n) {
          step('Đang mint số lượng ban đầu...');
          const tx = new Transaction().add(
            createMintToInstruction(
              mint,
              treasuryAta,
              wallet.publicKey,
              amount,
              [],
              tokenProgram
            )
          );
          signatureMint = await provider.sendAndConfirm(tx);
          ok('Mint supply ban đầu thành công');
        }

        // 4) Lock mint authority
        let signatureLock: string | undefined;
        if (input.lockMintAfter) {
          step('Đang khóa quyền mint...');
          const tx = new Transaction().add(
            createSetAuthorityInstruction(
              mint,
              wallet.publicKey,
              AuthorityType.MintTokens,
              null,
              [],
              tokenProgram
            )
          );
          signatureLock = await provider.sendAndConfirm(tx);
          ok('Đã khóa quyền mint');
        }

        // 5) Metadata (optional)
        let metadataPda: PublicKey | undefined;
        if (input.name || input.symbol || input.uri) {
          step('Đang tạo metadata...');
          try {
            const mx = Metaplex.make(connection).use(
              // Dùng identity tạm nếu cần; Metaplex có thể không bắt buộc cho fungible ở bản mới
              keypairIdentity(
                // @ts-ignore
                provider.wallet?.payer ??
                  // @ts-ignore
                  provider.payer ??
                  (await import('@solana/web3.js')).Keypair.generate()
              )
            );
            const anyMx = mx as any;

            if (anyMx.tokens?.createFungibleToken) {
              await anyMx.tokens().createFungibleToken({
                mint,
                decimals: input.decimals,
                name: input.name ?? '',
                symbol: input.symbol ?? '',
                uri: input.uri ?? '',
              });
            } else if (anyMx.nfts?.createFungible) {
              await anyMx.nfts().createFungible({
                mintAddress: mint,
                name: input.name ?? '',
                symbol: input.symbol ?? '',
                uri: input.uri ?? '',
                decimals: input.decimals,
                sellerFeeBasisPoints: 0,
                isMutable: true,
              });
            } else {
              throw new Error('No high-level fungible API');
            }

            const [pda] = PublicKey.findProgramAddressSync(
              [
                Buffer.from('metadata'),
                MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
              ],
              MPL_TOKEN_METADATA_PROGRAM_ID
            );
            metadataPda = pda;
            ok('Tạo metadata thành công');
          } catch {
            // Fallback MPL
            const [metadata] = PublicKey.findProgramAddressSync(
              [
                Buffer.from('metadata'),
                MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
              ],
              MPL_TOKEN_METADATA_PROGRAM_ID
            );
            const ix = createCreateMetadataAccountV3Instruction(
              {
                metadata,
                mint,
                mintAuthority: wallet.publicKey,
                payer: wallet.publicKey,
                updateAuthority: wallet.publicKey,
              },
              {
                createMetadataAccountArgsV3: {
                  data: {
                    name: input.name ?? '',
                    symbol: input.symbol ?? '',
                    uri: input.uri ?? '',
                    sellerFeeBasisPoints: 0,
                    creators: null,
                    collection: null,
                    uses: null,
                  },
                  isMutable: true,
                  collectionDetails: null,
                },
              }
            );
            const tx = new Transaction().add(ix);
            await provider.sendAndConfirm(tx);
            metadataPda = metadata;
            ok('Tạo metadata (fallback) thành công');
          }
        } else {
          toast.dismiss('mint-flow');
        }

        return { mint, treasuryAta, signatureMint, signatureLock, metadataPda };
      } catch (e: any) {
        fail(e?.message || 'Tạo token thất bại');
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [connection, wallet, program]
  );

  return { createToken, loading };
}
