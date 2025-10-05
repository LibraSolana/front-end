import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { IDL } from 'shared/types/enhanced_decentralized_library';

// Program ID từ declare_id! trong on-chain program
export const PROGRAM_ID = new PublicKey(
  '5mNRbBTG3K3LZif5GU11PZNBFrSbyLWhvS4wW2ABWdv2'
); // [attached_file:1]

export function getProgram(connection: Connection, wallet: any) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  return new Program(IDL as any, PROGRAM_ID, provider);
}
