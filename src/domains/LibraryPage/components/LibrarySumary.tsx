'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { Wallet, BookOpen, Users, UserPlus, Settings } from 'lucide-react';
import { RegisterForm } from 'shared/forms/RegisterForm';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getMint,
} from '@solana/spl-token';
import { useRouter } from 'next/navigation';

// Mint cố định PCOIN
const PCOIN_MINT = 'HwBgz6m8XGAC3jJHYsLP2wdbm7b2NF8k9rhFianPGzRZ';

// -------- Utils xử lý BN/u64 --------
function toHexString(input: any): string | null {
  if (input == null) return null;
  if (typeof input === 'string')
    return input.startsWith('0x') ? input.slice(2) : input;
  if (typeof input === 'number' && Number.isFinite(input))
    return Math.max(0, Math.trunc(input)).toString(16);
  if (typeof input === 'bigint') return input.toString(16);
  if (
    typeof input?.toString === 'function' &&
    input?.words &&
    Array.isArray(input.words)
  ) {
    try {
      const dec = BigInt(input.toString(10));
      return dec.toString(16);
    } catch {}
  }
  if (input instanceof Uint8Array)
    return Array.from(input)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  return null;
}
function hexToBigInt(input: unknown): bigint {
  const hex = toHexString(input);
  if (!hex || hex.length === 0) return 0n;
  try {
    return BigInt(`0x${hex}`);
  } catch {
    try {
      return BigInt((input as any)?.toString?.(10) ?? 0);
    } catch {
      return 0n;
    }
  }
}
function asNumber(u64Like: unknown, fallback = 0): number {
  const bi = hexToBigInt(u64Like);
  const n = Number(bi);
  return Number.isFinite(n) ? n : fallback;
}
function normalizeLibrary(input?: any) {
  const d = input ?? {};
  const name = d.name ?? d.library_name ?? 'Chưa đặt tên';
  const description = d.description ?? d.desc ?? '';
  const isActive = (d.isActive ?? d.is_active ?? false) ? true : false;
  const maxBorrowDays = asNumber(d.maxBorrowDays ?? d.max_borrow_days, 0);
  // membershipFee raw PCOIN units
  const membershipFeeRaw = asNumber(d.membershipFee ?? d.membership_fee, 0);
  const totalBooks = asNumber(d.totalBooks ?? d.total_books, 0);
  const totalMembers = asNumber(d.totalMembers ?? d.total_members, 0);
  const createdAt = asNumber(d.createdAt ?? d.created_at, 0);
  // Chủ thư viện (đổi key này nếu khác tên trong schema)
  const owner =
    d.owner?.toString?.() ??
    d.owner ??
    d.authority?.toString?.() ??
    d.authority ??
    '';

  return {
    name,
    description,
    isActive,
    maxBorrowDays,
    membershipFeeRaw,
    totalBooks,
    totalMembers,
    createdAt,
    owner,
  };
}

export function LibrarySummary({
  libraryKey,
  library,
}: {
  libraryKey: string;
  library?: any;
}) {
  const [open, setOpen] = useState(false);
  const vm = useMemo(() => normalizeLibrary(library), [library]);

  const router = useRouter();
  const { publicKey } = useWallet();

  // Lấy decimals PCOIN để hiển thị phí theo đơn vị token
  const { connection } = useConnection();
  const [pcoinDecimals, setPcoinDecimals] = useState<number>(6);
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        const mintPk = new PublicKey(PCOIN_MINT);
        const info = await connection.getAccountInfo(mintPk);
        const program =
          info && info.owner.equals(TOKEN_2022_PROGRAM_ID)
            ? TOKEN_2022_PROGRAM_ID
            : TOKEN_PROGRAM_ID;
        const mintAcc = await getMint(connection, mintPk, 'confirmed', program);
        if (!abort) setPcoinDecimals(mintAcc.decimals);
      } catch {
        if (!abort) setPcoinDecimals(6);
      }
    })();
    return () => {
      abort = true;
    };
  }, [connection]);

  const membershipFeeUi = useMemo(() => {
    const ui = vm.membershipFeeRaw / 10 ** pcoinDecimals;
    return ui.toLocaleString(undefined, {
      maximumFractionDigits: Math.min(pcoinDecimals, 4),
    });
  }, [vm.membershipFeeRaw, pcoinDecimals]);

  // Là chủ thư viện?
  const isOwner = useMemo(() => {
    if (!publicKey || !vm.owner) return false;
    try {
      return publicKey.toBase58() === vm.owner;
    } catch {
      return false;
    }
  }, [publicKey, vm.owner]);

  return (
    <Card className="relative max-w-[440px] shadow-md !p-0 !gap-0">
      <Badge
        variant="secondary"
        className="absolute top-2 right-2 rounded-md px-2 py-1 flex items-center gap-1"
      >
        <span
          className={`h-2 w-2 rounded-full ${vm.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
        />
        {vm.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
      </Badge>

      <CardHeader>
        <img
          alt="library"
          src="/librarySummary.jpg"
          className="!rounded-t-xl max-h-[200px] object-cover w-full"
        />
      </CardHeader>

      <CardContent className="!p-4 space-y-2">
        <Link href={`/library/${libraryKey}`}>
          <CardTitle className="text-xl font-bold">{vm.name}</CardTitle>
        </Link>

        <p className="text-sm text-muted-foreground">
          {vm.description || 'Chưa có mô tả'}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Phí thành viên</p>
              <p>{membershipFeeUi} PCOIN</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Tổng số sách</p>
              <p>{vm.totalBooks.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Tổng thành viên</p>
              <p>{vm.totalMembers.toLocaleString()}</p>
            </div>
          </div>

          {/* Nút hành động: chủ thì Quản lý, không phải chủ thì Đăng ký */}
          {isOwner ? (
            <Button
              variant="default"
              className="gap-2 col-span-2"
              onClick={() => router.push(`/dashboard/${libraryKey}`)}
              title="Quản lý thư viện"
            >
              <Settings className="h-4 w-4" />
              Quản lý
            </Button>
          ) : (
            <Button
              variant="outline"
              className="gap-2 col-span-2"
              onClick={() => setOpen(true)}
              title="Đăng ký thành viên"
            >
              <UserPlus className="h-4 w-4" />
              Đăng ký
            </Button>
          )}
        </div>
      </CardContent>

      {/* Hộp thoại đăng ký — chỉ mở khi không phải chủ */}
      <Dialog open={open && !isOwner} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Đăng ký thành viên</DialogTitle>
            <DialogDescription>
              Nhập thông tin cơ bản để tham gia thư viện (Thanh toán bằng
              PCOIN).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <RegisterForm libraryPk={libraryKey} paymentMint={PCOIN_MINT} />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
