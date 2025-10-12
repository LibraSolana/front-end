// components/tokens/TokenMintForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { PublicKey } from '@solana/web3.js';
import { useCreateToken } from 'shared/hooks/useCreateToken';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const schema = yup
  .object({
    programKind: yup
      .mixed<'legacy' | '2022'>()
      .oneOf(['legacy', '2022'])
      .required(),
    decimals: yup.number().integer().min(0).max(9).required('Bắt buộc'),
    initialSupply: yup.number().min(0, 'Không âm').required('Bắt buộc'),
    freezeAuthority: yup.boolean().required(),
    lockMintAfter: yup.boolean().required(),
    treasuryOwner: yup
      .string()
      .required()
      .test('is-pubkey', 'Địa chỉ không hợp lệ', (v) => {
        if (!v || v.trim() === '') return true;
        try {
          new PublicKey(v);
          return true;
        } catch {
          return false;
        }
      }),
    name: yup.string().max(32, 'Tối đa 32 ký tự').default(''),
    symbol: yup.string().max(10, 'Tối đa 10 ký tự').default(''),
    uri: yup.string().url('URI không hợp lệ').default(''),
  })
  .required();

type FormVals = yup.InferType<typeof schema>;

export default function TokenMintForm() {
  const { createToken, loading } = useCreateToken();
  const form = useForm<FormVals>({
    resolver: yupResolver(schema),
    defaultValues: {
      programKind: 'legacy',
      decimals: 9,
      initialSupply: 1000,
      freezeAuthority: false,
      lockMintAfter: false,
      treasuryOwner: '',
      name: '',
      symbol: '',
      uri: '',
    },
    mode: 'onSubmit',
  });

  const [result, setResult] = useState<{
    mint: string;
    ata: string;
    sigMint?: string;
    sigLock?: string;
  } | null>(null);

  const onSubmit = async (vals: FormVals) => {
    const ownerPk =
      vals.treasuryOwner && vals.treasuryOwner.trim()
        ? new PublicKey(vals.treasuryOwner)
        : undefined;
    const res = await createToken({
      programKind: vals.programKind,
      decimals: vals.decimals,
      initialSupply: vals.initialSupply,
      freezeAuthority: vals.freezeAuthority,
      lockMintAfter: vals.lockMintAfter,
      treasuryOwner: ownerPk,
      name: vals.name || undefined,
      symbol: vals.symbol || undefined,
      uri: vals.uri || undefined,
    });
    setResult({
      mint: res.mint.toBase58(),
      ata: res.treasuryAta.toBase58(),
      sigMint: res.signatureMint,
      sigLock: res.signatureLock,
    });
  };

  return (
    <Card className="border-muted shadow-sm">
      <CardHeader className="!p-4">
        <CardTitle>Tạo token mới</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 sm:grid-cols-2"
          >
            <FormField
              control={form.control}
              name="programKind"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chuẩn token</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chuẩn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="legacy">
                        SPL Legacy{' '}
                        <Badge className="ml-2" variant="secondary">
                          TOKEN_PROGRAM_ID
                        </Badge>
                      </SelectItem>
                      <SelectItem value="2022">
                        Token-2022{' '}
                        <Badge className="ml-2">TOKEN_2022_PROGRAM_ID</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Legacy tương thích rộng; Token-2022 có extensions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="decimals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Decimals</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={9} {...field} />
                  </FormControl>
                  <FormDescription>Gợi ý: 6 (USDC), 9 (WSOL).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="initialSupply"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng phát hành ban đầu</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="any" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nhập theo đơn vị token; sẽ tự quy đổi theo decimals.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treasuryOwner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chủ sở hữu Treasury (tuỳ chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="Bỏ trống = ví hiện tại" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nếu nhập, ATA sẽ thuộc địa chỉ này.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="freezeAuthority"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-2">
                  <div>
                    <FormLabel>Freeze authority</FormLabel>
                    <FormDescription>
                      Cho phép đóng băng tài khoản token.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lockMintAfter"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-2">
                  <div>
                    <FormLabel>Khoá quyền mint</FormLabel>
                    <FormDescription>
                      Đặt mint authority = null sau khi phát hành.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Tên token */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên token (tuỳ chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Libra Token" {...field} />
                  </FormControl>
                  <FormDescription>Tối đa 32 ký tự.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Symbol */}
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol (tuỳ chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="LIB" {...field} />
                  </FormControl>
                  <FormDescription>Tối đa 10 ký tự.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* URI */}
            <FormField
              control={form.control}
              name="uri"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Metadata URI (tuỳ chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://.../metadata.json" {...field} />
                  </FormControl>
                  <FormDescription>
                    JSON metadata: name, symbol, image, description…
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Đang tạo...' : 'Tạo token'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="flex-1"
              >
                Đặt lại
              </Button>
            </div>
          </form>
        </Form>

        {result && (
          <div className="mt-4 space-y-2 text-sm">
            <div>
              Mint: <span className="font-mono break-all">{result.mint}</span>
            </div>
            <div>
              Treasury ATA:{' '}
              <span className="font-mono break-all">{result.ata}</span>
            </div>
            {result.sigMint && (
              <div>
                Tx mint supply:{' '}
                <span className="font-mono break-all">{result.sigMint}</span>
              </div>
            )}
            {result.sigLock && (
              <div>
                Tx lock mint:{' '}
                <span className="font-mono break-all">{result.sigLock}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
