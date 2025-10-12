// components/members/RegisterForm.tsx
'use client';

import { useState, useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMemberApi } from 'shared/hooks/useMembers';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

type Props = { libraryPk: string; paymentMint: string };

export function RegisterForm({ libraryPk, paymentMint }: Props) {
  const { registerMember } = useMemberApi();
  const { connected } = useWallet();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<'Basic' | 'Premium' | 'VIP'>('Basic');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const library = useMemo(() => new PublicKey(libraryPk), [libraryPk]);
  console.log('Library PK:', libraryPk);
  const mintPk = useMemo(() => new PublicKey(paymentMint), [paymentMint]);
  console.log('Payment Mint PK:', paymentMint);

  const onSubmit = async () => {
    setErr(null);
    setOk(null);
    if (!connected) {
      setErr('Connect wallet to continue');
      return;
    }
    if (!name.trim()) {
      setErr('Name required');
      return;
    }
    setLoading(true);
    try {
      const res = await registerMember(library, {
        name,
        email,
        tier,
        mint: mintPk,
      });
      setOk(`Registered: ${res.signature}`);
    } catch (e: any) {
      setErr(e.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-3">
      {!connected && (
        <div className="mb-2">
          <WalletMultiButton />
        </div>
      )}

      <div>
        <Label>Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>
      <div>
        <Label>Email</Label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div>
        <Label>Tier</Label>
        <Select value={tier} onValueChange={(v) => setTier(v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Basic">Basic</SelectItem>
            <SelectItem value="Premium">Premium</SelectItem>
            <SelectItem value="VIP">VIP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onSubmit} disabled={loading || !connected}>
        {connected
          ? loading
            ? 'Processing...'
            : 'Register'
          : 'Connect wallet'}
      </Button>

      {err && <p className="text-sm text-red-500">{err}</p>}
      {ok && <p className="text-sm text-green-600">{ok}</p>}
    </div>
  );
}
