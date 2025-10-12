'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  ArrowDownToLine,
  Banknote,
  BookOpen,
  Users,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useOwnerOverview,
  useWithdrawFunds,
} from 'shared/hooks/useOwnerDashboard';

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-lg bg-muted p-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OwnerDashboard({ libraryPk }: { libraryPk: string }) {
  const { data, loading, error, isOwner } = useOwnerOverview(libraryPk);
  console.log(data);
  const {
    withdraw,
    loading: wdLoading,
    error: wdError,
    txSig,
  } = useWithdrawFunds();

  const [amountUi, setAmountUi] = useState<string>('');

  useEffect(() => {
    if (wdError) toast.error(wdError);
  }, [wdError]);

  useEffect(() => {
    if (txSig) toast.success(`Đã gửi giao dịch: ${txSig}`);
  }, [txSig]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const canWithdraw = useMemo(() => {
    if (!data || !isOwner) return false;
    const n = Number(amountUi);
    return Number.isFinite(n) && n > 0 && n <= data.balanceUi;
  }, [amountUi, data, isOwner]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }
  if (!data)
    return (
      <div className="flex items-center justify-center py-16">
        <div>Không có dữ liệu</div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{data.name}</h1>
            <Badge variant={data.isActive ? 'secondary' : 'destructive'}>
              {data.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
            </Badge>
            {isOwner && (
              <Badge variant="outline" className="gap-1">
                <ShieldCheck className="h-4 w-4" /> Chủ thư viện
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {data.description || 'Chưa có mô tả'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Payment mint</div>
          <div className="font-mono text-sm">{data.paymentMint}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Số dư"
          value={`${data.balanceUi.toLocaleString()} ${'PCOIN'}`}
        />
        <StatCard
          icon={Banknote}
          label="Tổng doanh thu"
          value={`${(data.totalRevenue / 10 ** data.mintDecimals).toLocaleString()} ${'PCOIN'}`}
        />
        <StatCard
          icon={BookOpen}
          label="Sách"
          value={data.totalBooks.toLocaleString()}
        />
        <StatCard
          icon={Users}
          label="Thành viên"
          value={data.totalMembers.toLocaleString()}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader className="pb-2 p-5">
            <CardTitle className="flex items-center gap-2">
              <ArrowDownToLine className="h-5 w-5" />
              Rút tiền
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isOwner && (
              <div className="text-sm text-muted-foreground">
                Chỉ chủ thư viện mới được rút tiền.
              </div>
            )}

            <div className="space-y-2">
              <Label>Số tiền ({data.mintSymbol})</Label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder={`tối đa ${data.balanceUi.toLocaleString()}`}
                value={amountUi}
                onChange={(e) => setAmountUi(e.target.value)}
                disabled={!isOwner || wdLoading}
              />
              <div className="text-xs text-muted-foreground">
                Số dư hiện tại: {data.balanceUi.toLocaleString()}{' '}
                {data.mintSymbol}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setAmountUi(String(Math.max(0, data.balanceUi * 0.25)))
                }
                disabled={!isOwner || wdLoading}
              >
                25%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setAmountUi(String(Math.max(0, data.balanceUi * 0.5)))
                }
                disabled={!isOwner || wdLoading}
              >
                50%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmountUi(String(data.balanceUi))}
                disabled={!isOwner || wdLoading}
              >
                Tối đa
              </Button>
            </div>

            <Button
              className="w-full"
              disabled={!canWithdraw || wdLoading}
              onClick={async () => {
                if (!canWithdraw) return;
                const n = Number(amountUi);
                const raw = Math.round(n * 10 ** data.mintDecimals);
                await toast.promise(
                  withdraw({
                    libraryPk,
                    amountRaw: raw,
                    libraryTokenAccount: data.libraryTokenAccount,
                    authorityTokenAccount: data.authorityTokenAccount,
                  }),
                  {
                    loading: 'Đang gửi giao dịch...',
                    success: 'Gửi giao dịch thành công',
                    error: (e) => e?.message || 'Gửi giao dịch thất bại',
                  }
                );
              }}
            >
              {wdLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang gửi giao dịch...
                </>
              ) : (
                'Rút tiền'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="pb-2 p-5">
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">
              Tính năng log giao dịch chưa kết nối indexer. Dữ liệu dưới đây là
              minh họa.
            </div>
            <div className="rounded-md border">
              <div className="grid grid-cols-4 p-2 text-xs text-muted-foreground border-b">
                <div>Thời gian</div>
                <div>Sự kiện</div>
                <div>Số tiền</div>
                <div>Chi tiết</div>
              </div>
              {[
                {
                  ts: 'Hôm nay 10:35',
                  ev: 'Borrow',
                  amt: `—`,
                  info: 'User A mượn sách #123',
                },
                {
                  ts: 'Hôm qua 18:20',
                  ev: 'Membership',
                  amt: `10 ${data.mintSymbol}`,
                  info: 'User B đăng ký',
                },
                {
                  ts: 'Hôm qua 11:02',
                  ev: 'Return Late',
                  amt: `1 ${data.mintSymbol}`,
                  info: 'Phí trễ hạn',
                },
              ].map((r, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 p-2 text-sm border-b last:border-0"
                >
                  <div>{r.ts}</div>
                  <div>{r.ev}</div>
                  <div>{r.amt}</div>
                  <div className="truncate">{r.info}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2 p-5">
          <CardTitle>Cấu hình thư viện</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Phí thành viên</div>
            <div className="font-medium">
              {data.membershipFeeLamports.toLocaleString()} lamports
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              Phí trễ hạn/ngày
            </div>
            <div className="font-medium">
              {data.lateFeePerDayLamports.toLocaleString()} lamports
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">
              Số ngày mượn tối đa
            </div>
            <div className="font-medium">{data.maxBorrowDays}</div>
          </div>
          <Separator className="md:col-span-3" />
          <div className="md:col-span-3">
            <div className="text-xs text-muted-foreground">Tài khoản token</div>
            <div className="font-mono text-xs break-all">
              Library TA: {data.libraryTokenAccount || '—'}
            </div>
            <div className="font-mono text-xs break-all">
              Owner TA: {data.authorityTokenAccount || '—'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OwnerDashboard;
