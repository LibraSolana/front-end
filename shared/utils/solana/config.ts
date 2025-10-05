import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { IDL } from 'shared/types/enhanced_decentralized_library';

export const PROGRAM_ID = new PublicKey(
  '5mNRbBTG3K3LZif5GU11PZNBFrSbyLWhvS4wW2ABWdv2'
);

export const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  process.env.RPC_URL ||
  clusterApiUrl('devnet');

export function getConnection(): Connection {
  return new Connection(RPC_URL, 'confirmed');
}

export function getProgram(provider: AnchorProvider) {
  return new Program(IDL as any, PROGRAM_ID, provider);
}

export const SOLANA_CONFIG = {
  programId: PROGRAM_ID,
  network: NETWORK,
  rpcUrl: RPC_URL,
  commitment: 'confirmed' as web3.Commitment,
} as const;
