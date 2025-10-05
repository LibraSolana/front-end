import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC!;
export const connection = new Connection(SOLANA_RPC);


export function useTokenBalance(mintAddress: string) {
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);
  
    useEffect(() => {
      if (!publicKey) return setBalance(null);
  
      (async () => {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { mint: new PublicKey(mintAddress) }
        );
  
        if (tokenAccounts.value.length > 0) {
          const info = tokenAccounts.value[0].account.data.parsed.info;
          const decimals = info.tokenAmount.decimals;
          const amount = info.tokenAmount.uiAmount;
          setBalance(Number(amount.toFixed(decimals)));
        } else {
          setBalance(0);
        }
      })();
    }, [publicKey, mintAddress]);
  
    return balance;
  }
  