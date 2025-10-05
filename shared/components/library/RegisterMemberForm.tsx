'use client';

import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { useCompleteRegistration } from 'shared/hooks/useCompleteRegistration';
import { RegisterMemberFormData } from 'shared/utils/solana/types';
import toast from 'react-hot-toast';

export function RegisterMemberForm() {
  const { register, handleSubmit, setValue, watch } = useForm<
    RegisterMemberFormData & { library: string; paymentMint: string }
  >();
  const { completeRegistration, loading } = useCompleteRegistration();
  const [memberPda, setMemberPda] = useState<string | null>(null);

  return (
    <form
      className="grid md:grid-cols-3 gap-3"
      onSubmit={handleSubmit(async (values) => {
        try {
          const res = await completeRegistration({
            library: values.library,
            paymentMint: values.paymentMint,
            name: values.name,
            email: values.email,
            membershipTier: values.membershipTier,
          });
          setMemberPda(res.memberPDA?.toBase58?.() ?? '');
          toast.success('Member registered successfully');
        } catch (e: any) {
          toast.error(`Register failed: ${e.message}`);
        }
      })}
    >
      <Input
        placeholder="Library Pubkey"
        {...register('library', { required: true })}
      />
      <Input
        placeholder="Payment Mint Pubkey"
        {...register('paymentMint', { required: true })}
      />
      <Input placeholder="Name" {...register('name', { required: true })} />
      <Input placeholder="Email" {...register('email', { required: true })} />
      <div>
        <Select onValueChange={(v) => setValue('membershipTier', v as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Membership Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Basic">Basic</SelectItem>
            <SelectItem value="Premium">Premium</SelectItem>
            <SelectItem value="VIP">VIP</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-full flex gap-2 items-center">
        <Button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
        {memberPda && (
          <span className="text-xs text-muted-foreground">
            Member PDA: {memberPda}
          </span>
        )}
      </div>
    </form>
  );
}
