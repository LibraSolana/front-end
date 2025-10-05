import { BN, utils } from '@coral-xyz/anchor';
import { useGetProgram } from 'shared/hooks/useGetProgram';

/**
 * Hook: kiểm tra Anchor đã sẵn sàng chưa
 */
export function useAnchorReady() {
  const ctx = useGetProgram();
  const ready = !!ctx?.program && ctx.isReady && !!ctx.publicKey;
  return { ...ctx, ready };
}

/**
 * Hash SHA-256: tương thích với `solana_program::hash::hash(...).to_bytes()`
 */
export function sha256Bytes(input: string): Uint8Array {
  //@ts-ignore
  return utils.sha256.hash(utils.bytes.utf8.encode(input)); // Uint8Array(32)
}

/**
 * Chuyển số → little-endian bytes
 */
export function numToLeBytes32(n: number | bigint | BN, bytes = 4): Buffer {
  const bn = BN.isBN(n) ? n : new BN(n.toString());
  const buf = Buffer.alloc(bytes);
  buf.writeUInt32LE(bn.toNumber(), 0);
  return buf;
}

/**
 * Unix timestamp (seconds)
 */
export function i64Now(): number {
  return Math.floor(Date.now() / 1000);
}
