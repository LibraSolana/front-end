import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";

const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC!;
export const connection = new Connection(SOLANA_RPC);

export function useSolBalance() {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!publicKey) return setBalance(null);

    (async () => {
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / 1e9); // lamports -> SOL
    })();
  }, [publicKey]);

  return balance;
}
