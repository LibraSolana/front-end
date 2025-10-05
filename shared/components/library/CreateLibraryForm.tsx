'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { useInitializeLibrary } from 'shared/hooks/useInitializeLibrary';
import { CreateLibraryFormData } from 'shared/utils/solana/types';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import {
  BookOpen,
  AlignLeft,
  Coins,
  AlertTriangle,
  Clock,
  Key,
} from 'lucide-react';

// Yup schema validate
const schema = yup.object().shape({
  name: yup
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .required('Library name is required'),

  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .required('Description is required'),

  membershipFee: yup
    .number()
    .typeError('Membership fee must be a number')
    .integer('Membership fee must be an integer')
    .min(1, 'Must be greater than 0 lamports')
    .required('Membership fee is required'),

  lateFeePerDay: yup
    .number()
    .typeError('Late fee must be a number')
    .integer('Late fee must be an integer')
    .min(0, 'Late fee cannot be negative')
    .required('Late fee is required'),

  maxBorrowDays: yup
    .number()
    .typeError('Max borrow days must be a number')
    .integer('Must be an integer')
    .min(1, 'Must be at least 1 day')
    .max(365, 'Cannot exceed 365 days')
    .required('Max borrow days is required'),

  paymentMint: yup
    .string()
    .required('Payment mint is required')
    .length(44, 'Must be a valid Solana address (44 chars)'),
});

export function CreateLibraryForm() {
  const form = useForm<CreateLibraryFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      membershipFee: 0,
      lateFeePerDay: 0,
      maxBorrowDays: 0,
      paymentMint: '',
    },
  });

  const { initializeLibrary, loading } = useInitializeLibrary();
  const [libraryAddress, setLibraryAddress] = useState<string | null>(null);

  const onSubmit = async (values: CreateLibraryFormData) => {
    const res = await initializeLibrary(values);
    setLibraryAddress(res.libraryAddress);
    form.reset();
  };

  // Helper render label with icon
  const LabelWithIcon = ({
    icon: Icon,
    text,
  }: {
    icon: React.ElementType;
    text: string;
  }) => (
    <FormLabel className="flex items-center gap-1">
      <Icon size={16} className="text-muted-foreground" />
      {text}
    </FormLabel>
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid md:grid-cols-2 gap-4"
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <LabelWithIcon icon={BookOpen} text="Library Name" />
              <FormControl>
                <Input placeholder="My Library" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <LabelWithIcon icon={AlignLeft} text="Description" />
              <FormControl>
                <Textarea
                  placeholder="Write a short description..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Membership Fee */}
        <FormField
          control={form.control}
          name="membershipFee"
          render={({ field }) => (
            <FormItem>
              <LabelWithIcon icon={Coins} text="Membership Fee" />
              <FormControl>
                <Input type="number" placeholder="1000000" {...field} />
              </FormControl>
              <FormDescription>
                💰 Tính theo <strong>lamports</strong> (1 SOL = 1,000,000,000
                lamports)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Late Fee */}
        <FormField
          control={form.control}
          name="lateFeePerDay"
          render={({ field }) => (
            <FormItem>
              <LabelWithIcon icon={AlertTriangle} text="Late Fee Per Day" />
              <FormControl>
                <Input type="number" placeholder="5000" {...field} />
              </FormControl>
              <FormDescription>
                ⚠️ Phí phạt mỗi ngày trễ (đơn vị <strong>lamports</strong>)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Max Borrow Days */}
        <FormField
          control={form.control}
          name="maxBorrowDays"
          render={({ field }) => (
            <FormItem>
              <LabelWithIcon icon={Clock} text="Max Borrow Days" />
              <FormControl>
                <Input type="number" placeholder="30" {...field} />
              </FormControl>
              <FormDescription>
                ⏳ Số ngày tối đa có thể mượn sách
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Mint */}
        <FormField
          control={form.control}
          name="paymentMint"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <LabelWithIcon icon={Key} text="Payment Mint" />
              <FormControl>
                <Input
                  placeholder="So11111111111111111111111111111111111111112"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                🔑 Public key của token mint (ví dụ: USDC, USDT, WSOL…)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="col-span-full flex flex-wrap gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Creating...' : 'Create Library'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => form.reset()}
          >
            Reset
          </Button>
        </div>

        {libraryAddress && (
          <span className="col-span-full text-xs text-muted-foreground truncate">
            📚 Library PDA: {libraryAddress}
          </span>
        )}
      </form>
    </Form>
  );
}
