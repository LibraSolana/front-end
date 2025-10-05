'use client';

import { useMemo } from 'react';
import {
  AnchorProvider,
  Program,
  Idl,
  setProvider,
} from '@project-serum/anchor';
import {
  useConnection,
  useAnchorWallet,
  useWallet,
} from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import IDL from 'shared/types/idl.json';

// Nếu IDL có trường metadata.address thì có thể lấy program id từ đó, nếu không dùng hằng PROGRAM_ID
const PROGRAM_ID = new PublicKey(
  (IDL as any)?.metadata?.address ??
    '5mNRbBTG3K3LZif5GU11PZNBFrSbyLWhvS4wW2ABWdv2'
);

type UseProgramResult<T extends Idl = any> = {
  program: Program<T> | null;
  provider: AnchorProvider | null;
  connection: Connection;
  wallet: ReturnType<typeof useWallet>;
  anchorWallet: ReturnType<typeof useAnchorWallet>;
  publicKey: PublicKey | null;
  programId: PublicKey;
  idl: T;
  isReady: boolean; // true khi provider và program sẵn sàng (có ví), hoặc program read-only sẵn sàng
  isWritable: boolean; // true khi có ví hỗ trợ ký
};

export function useGetProgram<T extends Idl = any>(): UseProgramResult<T> {
  const { connection } = useConnection();
  const wallet = useWallet(); // WalletContextState (để hiển thị trạng thái UI)
  const anchorWallet = useAnchorWallet(); // AnchorWallet (tương thích AnchorProvider)

  const { program, provider, isReady, isWritable } = useMemo(() => {
    // Nếu có anchorWallet thì tạo Provider có khả năng ký
    if (anchorWallet?.publicKey) {
      const provider = new AnchorProvider(connection, anchorWallet, {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
        skipPreflight: false,
      });
      // Optional: set provider mặc định cho @project-serum/anchor
      setProvider(provider);

      const program = new Program(IDL as T, PROGRAM_ID, provider) as Program<T>;
      return {
        provider,
        program,
        isReady: true,
        isWritable: true,
      };
    }

    // Nếu chưa có ví: trả về Program read-only (không có provider.wallet)
    // Anchor cho phép khởi tạo Program chỉ với connection qua provider tạm thời không có wallet
    const readOnlyProvider = new AnchorProvider(
      connection,
      // @ts-expect-error allow null wallet for read-only operations
      null,
      { commitment: 'confirmed', preflightCommitment: 'confirmed' }
    );
    // Không setProvider trong chế độ read-only để tránh ghi đè global
    const readOnlyProgram = new Program(
      IDL as T,
      PROGRAM_ID,
      readOnlyProvider
    ) as Program<T>;

    return {
      provider: readOnlyProvider,
      program: readOnlyProgram,
      isReady: true, // Read-only vẫn sẵn sàng để fetch account
      isWritable: false, // Không thể gửi tx
    };
  }, [connection, anchorWallet]);

  return {
    program,
    provider,
    connection,
    wallet,
    anchorWallet,
    publicKey: anchorWallet?.publicKey ?? null,
    programId: PROGRAM_ID,
    idl: IDL as T,
    isReady,
    isWritable,
  };
}
