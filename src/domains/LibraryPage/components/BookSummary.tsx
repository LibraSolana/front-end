// components/books/BookSummary.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Star,
  Wallet,
  Layers,
  Calendar,
  Tag,
  Languages,
  Building2,
  Repeat2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Globe,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

import { PublicKey } from '@solana/web3.js';
import { useBookOperations } from 'shared/hooks/useBooks';
import { useConnection } from '@solana/wallet-adapter-react';
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getMint,
} from '@solana/spl-token';

// ---------- Constants ----------
const PCOIN_MINT = 'HwBgz6m8XGAC3jJHYsLP2wdbm7b2NF8k9rhFianPGzRZ';

// ---------- Utils ----------
type CategoryObject = Record<string, {}>;

function isValidUrl(str?: string) {
  if (!str) return false;
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

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
  if (input?.toBase58) return null;
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

function asBoolean(v: any): boolean {
  return v === true || v === 1 || v === '1';
}

function hexSecondsToDateString(input: unknown) {
  const secs = asNumber(input, 0);
  if (!Number.isFinite(secs) || secs <= 0) return '—';
  return new Date(secs * 1000).toLocaleDateString();
}

function getCategoryName(cat: CategoryObject) {
  const keys = Object.keys(cat || {});
  return keys[0] ?? 'không phân loại';
}

async function resolvePCoinMeta(connection: any) {
  try {
    const mintPk = new PublicKey(PCOIN_MINT);
    const info = await connection.getAccountInfo(mintPk);
    const program =
      info && info.owner.equals(TOKEN_2022_PROGRAM_ID)
        ? TOKEN_2022_PROGRAM_ID
        : TOKEN_PROGRAM_ID;
    const mintAcc = await getMint(connection, mintPk, 'confirmed', program);
    return { symbol: 'PCOIN', decimals: mintAcc.decimals };
  } catch {
    return { symbol: 'PCOIN', decimals: 6 };
  }
}

function formatTokenAmount(amountU64: unknown, decimals: number) {
  const units = asNumber(amountU64, 0);
  const scaled = units / 10 ** decimals;
  return scaled.toLocaleString(undefined, {
    maximumFractionDigits: Math.min(decimals, 4),
  });
}

// Chuẩn hóa dữ liệu sách
function normalizeBook(raw: any) {
  const d = raw?.data ?? raw ?? {};
  const title = d.title ?? '';
  const description = d.description ?? '';
  const authorName = d.authorName ?? '';
  const isbn = d.isbn ?? '';
  const language = d.language ?? '';
  const publisher = d.publisher ?? '';
  const publicationYear = asNumber(d.publicationYear, 0);
  const pages = asNumber(d.pages, 0);

  const isActive = asBoolean(d.isActive);
  const isFree = asBoolean(d.isFree);
  const isNft = asBoolean(d.isNft);

  const totalCopies = asNumber(d.totalCopies, 0);
  const availableCopies = asNumber(d.availableCopies, 0);
  const averageRating = Number.isFinite(d.averageRating)
    ? Number(d.averageRating)
    : 0;
  const totalReviews = asNumber(d.totalReviews, 0);
  const timesBorrowed = asNumber(d.timesBorrowed, 0);

  const price = hexToBigInt(d.price);
  const rentalPrice = hexToBigInt(d.rentalPrice);
  const maxRentalDays = asNumber(d.maxRentalDays, 0);

  const addedAt = d.addedAt;
  const lastUpdated = d.lastUpdated;

  const categoryName = getCategoryName(d.category || {});
  const coverUrl = isValidUrl(d.coverUrl) ? d.coverUrl : '';
  const fileUrl = isValidUrl(d.fileUrl) ? d.fileUrl : '';

  const library = d.library?.toString?.() ?? d.library ?? '';

  return {
    title,
    description,
    authorName,
    isbn,
    language,
    publisher,
    publicationYear,
    pages,
    isActive,
    isFree,
    isNft,
    totalCopies,
    availableCopies,
    averageRating,
    totalReviews,
    timesBorrowed,
    price,
    rentalPrice,
    maxRentalDays,
    addedAt,
    lastUpdated,
    categoryName,
    coverUrl,
    fileUrl,
    library,
    // payment luôn PCOIN
    paymentMint: PCOIN_MINT,
  };
}

// ---------- Component ----------
type Props = { book: any; onBorrow?: () => void; onOpen?: () => void };

export function BookSummary({ book, onBorrow, onOpen }: Props) {
  const vm = useMemo(() => normalizeBook(book), [book]);

  const stockPct = useMemo(() => {
    if (vm.totalCopies <= 0) return 0;
    return Math.round((vm.availableCopies / vm.totalCopies) * 100);
  }, [vm.availableCopies, vm.totalCopies]);

  const rating = Math.min(5, Math.max(0, vm.averageRating || 0));
  const addedDate = hexSecondsToDateString(vm.addedAt);
  const updatedDate = hexSecondsToDateString(vm.lastUpdated);

  const { updateBook, deleteBook, loading } = useBookOperations();
  const borrowedNow = Math.max(0, vm.totalCopies - vm.availableCopies);

  const { connection } = useConnection();
  const [pmMeta, setPmMeta] = useState<{
    symbol: string;
    decimals: number;
  } | null>(null);

  useEffect(() => {
    let abort = false;
    (async () => {
      const meta = await resolvePCoinMeta(connection);
      if (!abort) setPmMeta(meta);
    })();
    return () => {
      abort = true;
    };
  }, [connection]);

  const priceLabel = useMemo(() => {
    if (vm.isFree) return 'Miễn phí';
    if (!pmMeta) return '—';
    return `${formatTokenAmount(vm.price, pmMeta.decimals)} ${pmMeta.symbol}`;
  }, [vm.isFree, pmMeta, vm.price]);

  const rentalLabel = useMemo(() => {
    if (vm.isFree) return 'Miễn phí';
    if (!pmMeta) return '—';
    return `${formatTokenAmount(vm.rentalPrice, pmMeta.decimals)} ${pmMeta.symbol}`;
  }, [vm.isFree, pmMeta, vm.rentalPrice]);

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    title: vm.title,
    description: vm.description,
    price: 0,
    rentalPrice: 0,
    copiesAvailable: vm.availableCopies,
    isActive: vm.isActive,
  });

  useEffect(() => {
    if (!pmMeta) return;
    const p = asNumber(vm.price, 0) / 10 ** pmMeta.decimals;
    const r = asNumber(vm.rentalPrice, 0) / 10 ** pmMeta.decimals;
    setForm((f) => ({ ...f, price: p, rentalPrice: r }));
  }, [pmMeta, vm.price, vm.rentalPrice]);

  function uiToUnits(amount: number, decimals: number) {
    const n = Number.isFinite(amount) ? amount : 0;
    return Math.round(n * 10 ** decimals);
  }

  const handleSave = async () => {
    const decimals = pmMeta?.decimals ?? 6;
    const body = {
      title: form.title,
      description: form.description,
      price: uiToUnits(form.price, decimals),
      rentalPrice: uiToUnits(form.rentalPrice, decimals),
      copiesAvailable: Math.max(
        borrowedNow,
        Math.trunc(form.copiesAvailable || 0)
      ),
      isActive: form.isActive,
      totals: {
        totalCopies: vm.totalCopies,
        availableCopies: vm.availableCopies,
      },
      // luôn để payment PCOIN phía backend nếu cần
    };
    await updateBook(
      new PublicKey(book.pubkey),
      new PublicKey(vm.library),
      body
    );
    setEditOpen(false);
  };

  const handleDelete = async () => {
    if (borrowedNow > 0) return;
    await deleteBook(new PublicKey(book.pubkey), new PublicKey(vm.library));
  };

  return (
    <Card className="overflow-hidden border-muted shadow-sm !pt-0">
      <div className="grid md:grid-cols-[240px,1fr]">
        <Link href={`/book/${book.pubkey}`} className="no-underline">
          <div className="relative aspect-[3/4] md:h-full bg-black mx-auto">
            <img
              src={
                vm.coverUrl ||
                'https://emerald-accepted-barnacle-132.mypinata.cloud/ipfs/bafkreidqgazoqvu6gy52cfi6n2duezp6lfkdwxopeodtraze4vnzkpwc6y'
              }
              alt={vm.title || 'Bìa sách'}
              className="object-cover w-full h-full"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {vm.isNft && (
                <Badge
                  variant="secondary"
                  className="text-sm md:text-base px-3 py-1 shadow-lg"
                >
                  NFT
                </Badge>
              )}
              {vm.isFree && (
                <Badge
                  variant="outline"
                  className="text-sm md:text-base px-3 py-1 bg-white/80 backdrop-blur-sm shadow-md"
                >
                  Miễn phí
                </Badge>
              )}
              {!vm.isActive && (
                <Badge
                  variant="destructive"
                  className="text-sm md:text-base px-3 py-1 shadow-lg"
                >
                  Tạm ngưng
                </Badge>
              )}
            </div>
          </div>
        </Link>

        <div>
          <CardHeader className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl md:text-2xl">
                  {vm.title || 'Chưa đặt tên'}
                </CardTitle>
                <CardDescription className="mt-1">
                  {vm.authorName
                    ? `tác giả ${vm.authorName}`
                    : 'Chưa rõ tác giả'}
                  {vm.isbn ? ` • ISBN ${vm.isbn}` : ''}
                </CardDescription>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    {vm.categoryName}
                  </Badge>
                  {vm.language && (
                    <Badge variant="outline" className="gap-1">
                      <Languages className="h-3.5 w-3.5" />
                      {vm.language}
                    </Badge>
                  )}
                  {vm.publisher && (
                    <Badge variant="outline" className="gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {vm.publisher}
                    </Badge>
                  )}
                  {vm.publicationYear > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {vm.publicationYear}
                    </Badge>
                  )}
                  {vm.pages > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {vm.pages} trang
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">
                    ({vm.totalReviews})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Đã mượn {vm.timesBorrowed.toLocaleString()} lần
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {vm.description ? (
              <p className="text-sm text-muted-foreground">{vm.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Chưa có mô tả.
              </p>
            )}

            <Separator />

            {/* Giá & Tồn kho */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Mua đứt</div>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1 text-xl font-semibold">{priceLabel}</div>
                <p className="text-xs text-muted-foreground">
                  Thanh toán một lần
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Thuê</div>
                  <Repeat2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1 text-xl font-semibold">{rentalLabel}</div>
                <p className="text-xs text-muted-foreground">
                  Tối đa {vm.maxRentalDays} ngày
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Tình trạng
                  </div>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-semibold">
                    {vm.availableCopies}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {vm.totalCopies}
                  </span>
                </div>
                <Progress value={stockPct} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {stockPct}% còn hàng
                </p>
              </div>
            </div>

            {/* Thông tin thêm */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Thanh toán</span>
                <div className="mt-1 text-xs">
                  <span className="font-semibold">PCOIN</span>
                  <div className="font-mono break-all text-muted-foreground">
                    {PCOIN_MINT}
                  </div>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Thư viện</span>
                <div className="font-mono text-xs mt-1 break-all">
                  {vm.library || '—'}
                </div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Cập nhật</span>
                <div className="mt-1">{updatedDate}</div>
              </div>
            </div>
          </CardContent>

          <CardFooter
            className="flex items-center justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" /> Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="text-xs text-muted-foreground">
              Thêm lúc {addedDate}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={onOpen}
                className="gap-2"
                disabled={!vm.fileUrl}
              >
                <Globe className="h-4 w-4" /> Mở
              </Button>
              <Button
                onClick={onBorrow}
                disabled={!vm.isActive || vm.availableCopies === 0}
              >
                Mượn
              </Button>
            </div>
          </CardFooter>
        </div>
      </div>

      {/* Hộp thoại chỉnh sửa */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sách</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />
            <Input
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
            <Input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: Number(e.target.value || 0) }))
              }
            />
            <Input
              type="number"
              value={form.rentalPrice}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  rentalPrice: Number(e.target.value || 0),
                }))
              }
            />
            <Input
              type="number"
              min={borrowedNow}
              value={form.copiesAvailable}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  copiesAvailable: Number(e.target.value || 0),
                }))
              }
            />
            <div className="flex items-center gap-2">
              <span>Hoạt động</span>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              Lưu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default BookSummary;
