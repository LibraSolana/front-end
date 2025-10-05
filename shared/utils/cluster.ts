import { Connection } from '@solana/web3.js';

export function getClusterFromConn(
  connection: Connection
): 'mainnet' | 'devnet' | 'testnet' {
  const ep = connection.rpcEndpoint.toLowerCase();
  if (ep.includes('devnet')) return 'devnet';
  if (ep.includes('testnet')) return 'testnet';
  return 'mainnet';
}
