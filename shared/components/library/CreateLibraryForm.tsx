// components/libraries/CreateLibraryForm.tsx
'use client';

import { useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, AlignLeft, Coins, Clock, Key, Info } from 'lucide-react';

import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, getMint } from '@solana/spl-token';

// Mint mặc định PCOIN
const PCOIN_MINT = 'HwBgz6m8XGAC3jJHYsLP2wdbm7b2NF8k9rhFianPGzRZ';

// Kiểu chỉ dùng cho UI
type UiForm = {
  name: string;
  description: string;
  membershipFee: number; // đơn vị PCOIN
  maxBorrowDays: number;
};

const schema = yup.object().shape({
  name: yup
    .string()
    .min(3, 'Ít nhất 3 ký tự')
    .max(100, 'Tối đa 100 ký tự')
    .required('Bắt buộc'),
  description: yup
    .string()
    .min(10, 'Ít nhất 10 ký tự')
    .max(500, 'Tối đa 500 ký tự')
    .required('Bắt buộc'),
  membershipFee: yup
    .number()
    .typeError('Phải là số')
    .min(0, 'Không âm')
    .required('Bắt buộc'),
  maxBorrowDays: yup
    .number()
    .typeError('Phải là số')
    .integer('Phải là số nguyên')
    .min(1, 'Tối thiểu 1')
    .max(365, 'Tối đa 365')
    .required('Bắt buộc'),
});

export function CreateLibraryForm() {
  const form = useForm<UiForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      membershipFee: 0,
      maxBorrowDays: 30,
    },
  });

  const { initializeLibrary, loading } = useInitializeLibrary();
  const [libraryAddress, setLibraryAddress] = useState<string | null>(null);

  // Thông tin PCOIN để chuyển đổi sang raw units
  const [mintDecimals, setMintDecimals] = useState<number | null>(null);
  const [mintProgram, setMintProgram] = useState<'legacy' | '2022' | null>(
    null
  );

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const mintPk = new PublicKey(PCOIN_MINT);
        const conn = new Connection(
          process.env.NEXT_PUBLIC_RPC_URL ||
            'https://api.mainnet-beta.solana.com',
          'confirmed'
        );
        const info = await conn.getAccountInfo(mintPk);
        if (!info) return;
        const p = info.owner.equals(TOKEN_2022_PROGRAM_ID) ? '2022' : 'legacy';
        if (!abort) setMintProgram(p);
        const mintAcc = await getMint(conn, mintPk, 'confirmed', info.owner);
        if (!abort) setMintDecimals(mintAcc.decimals);
      } catch {
        if (!abort) {
          setMintProgram('legacy');
          setMintDecimals(6);
        }
      }
    })();
    return () => {
      abort = true;
    };
  }, []);

  const onSubmit = async (vals: UiForm) => {
    const decimals = mintDecimals ?? 6;
    const toAmount = (x: number) => Math.round(Number(x || 0) * 10 ** decimals);

    // Map sang CreateLibraryFormData
    const payload: CreateLibraryFormData = {
      name: vals.name,
      description: vals.description,
      maxBorrowDays: vals.maxBorrowDays,
      paymentMint: PCOIN_MINT,
      membershipFee: toAmount(vals.membershipFee), // chỉ PCOIN
      lateFeePerDay: 0, // ẩn khỏi UI
    };

    const res = await initializeLibrary(payload);
    setLibraryAddress(res.libraryAddress);
    form.reset({
      name: '',
      description: '',
      membershipFee: 0,
      maxBorrowDays: 30,
    });
  };

  return (
    <Card className="border-muted shadow-sm">
      <CardHeader className="space-y-1 p-4">
        <CardTitle className="text-2xl">Tạo thư viện mới</CardTitle>
        <div className="text-sm text-muted-foreground">
          Thanh toán cố định bằng PCOIN. Tổng cung: 100,000,000 PCOIN.
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid md:grid-cols-2 gap-5"
          >
            {/* Tên */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Tên thư viện
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: LibraX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mô tả */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="flex items-center gap-2">
                    <AlignLeft className="h-4 w-4" /> Mô tả
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Giới thiệu ngắn gọn về thư viện..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phí thành viên (PCOIN) */}
            <FormField
              control={form.control}
              name="membershipFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Coins className="h-4 w-4" /> Phí thành viên (PCOIN)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="VD: 1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Decimals PCOIN: {mintDecimals ?? '—'} • Chương trình:{' '}
                    {mintProgram ?? '—'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Số ngày mượn tối đa */}
            <FormField
              control={form.control}
              name="maxBorrowDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Số ngày mượn tối đa
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hiển thị mint mặc định */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <Key className="h-4 w-4" />
                <span className="text-sm font-medium">Mint thanh toán</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="default">PCOIN</Badge>
                <code className="text-xs break-all">{PCOIN_MINT}</code>
              </div>
              <div className="text-xs text-muted-foreground flex items-start gap-2 mt-2">
                <Info className="h-4 w-4 mt-0.5" />
                <span>Mint cố định, không thể thay đổi.</span>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Đang tạo...' : 'Tạo thư viện'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => form.reset()}
              >
                Đặt lại
              </Button>
            </div>

            {libraryAddress && (
              <div className="md:col-span-2 text-xs text-muted-foreground truncate">
                📚 Library PDA: {libraryAddress}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
