'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useInitializeCounter } from 'shared/hooks/useInitializeCounter';
import toast from 'react-hot-toast';

export function InitializeSection() {
  const { publicKey } = useWallet();
  const { initializeCounter, loading } = useInitializeCounter();
  const [counterPda, setCounterPda] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <div className="text-sm">
        Authority: {publicKey?.toBase58() || 'Not connected'}
      </div>
      <Button
        disabled={loading || !publicKey}
        onClick={async () => {
          try {
            const res = await initializeCounter();
            setCounterPda(res.counterPDA.toBase58());

            toast.success(`Counter initialized: ${res.counterPDA.toBase58()}`);
          } catch (e: any) {
            toast.error(`Init counter failed: ${e.message}`);
          }
        }}
      >
        {loading ? 'Initializing...' : 'Initialize Counter'}
      </Button>
      {counterPda && (
        <div className="text-xs text-muted-foreground">
          Counter PDA: {counterPda}
        </div>
      )}
    </div>
  );
}
