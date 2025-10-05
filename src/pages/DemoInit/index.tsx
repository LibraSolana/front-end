'use client';

import React, { useState } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useInitializeLibrary } from 'shared/hooks/useInitializeLibrary';

export default function DemoInitializeLibrary() {
  const { initializeLibrary } = useInitializeLibrary();
  const [result, setResult] = useState<any>(null);

  const handleClick = async () => {
    try {
      const res = await initializeLibrary({
        name: 'My Library',
        description: 'Just a demo',
        membershipFee: new BN(100),
        lateFeePerDay: new BN(5),
        maxBorrowDays: 7,
        paymentMint: new PublicKey(
          'So11111111111111111111111111111111111111112'
        ), // native SOL mint
      });
      setResult(res);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={handleClick}>Init Library</button>
      {result && (
        <div>
          <p>
            <b>Tx:</b> {result.tx}
          </p>
          <p>
            <b>Library PDA:</b> {result.library.toBase58()}
          </p>
        </div>
      )}
    </div>
  );
}
