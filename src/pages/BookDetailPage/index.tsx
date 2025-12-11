'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Globe,
  Copy as CopyIcon,
  Link as LinkIcon,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { PublicKey } from '@solana/web3.js';

import { useGetBook } from 'shared/hooks/useBookData';
import { useProgram } from 'shared/hooks/useProgram';
import {
  useReservationOperations,
  useReviewOperations,
} from 'shared/hooks/useReservations';
import { useAutoTokenAccounts } from 'shared/hooks/useCommerce';
import { copyToClipboard } from 'shared/utils/share';
import ShareSocial from './ShareSocial';

// Reviews hook mẫu (thay thế bằng hook thực tế nếu có)
function useReviews(bookPk?: string) {
  const [reviews, setReviews] = useState<
    Array<{
      author: string;
      rating: number;
      comment: string;
      createdAt: number; // seconds
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    if (!bookPk) return;
    setLoading(true);
    setError(null);
    try {
      // TODO: thay bằng fetch thực tế hoặc on-chain scan
      // Demo: trả giả dữ liệu
      setReviews((prev) => prev); // giữ nguyên nếu chưa có backend
    } catch (e: any) {
      setError(e?.message || 'Load reviews failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [bookPk]);

  return { reviews, loading, error, reload, setReviews };
}

// ---------- Constants ----------
const PCOIN_MINT = 'HwBgz6m8XGAC3jJHYsLP2wdbm7b2NF8k9rhFianPGzRZ';

// ---------- Utils (match BookSummary) ----------
type CategoryObject = Record<string, {}>;
const short = (s?: string, head = 8, tail = 8) =>
  s ? `${s.slice(0, head)}...${s.slice(-tail)}` : '—';
function isValidUrl(str?: string) {
  try {
    if (!str) return false;
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
function formatTokenAmount(amountU64: unknown, decimals: number) {
  const units = asNumber(amountU64, 0);
  const scaled = units / 10 ** decimals;
  return scaled.toLocaleString(undefined, {
    maximumFractionDigits: Math.min(decimals, 4),
  });
}

// Chuẩn hóa dữ liệu (y hệt BookSummary)
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
    paymentMint: PCOIN_MINT,
  };
}

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pubkey = params?.bookAddress as string;

  const { book, loading } = useGetBook(pubkey);
  const { isReady } = useProgram();
  const {
    reserveBook,
    cancelReservation,
    loading: reserving,
  } = useReservationOperations();
  const { reviewBook, loading: reviewing } = useReviewOperations();

  const vm = useMemo(() => (book ? normalizeBook(book) : null), [book]);

  // Tự derive ATA + decimals + gửi giao dịch có toast
  const {
    userAta,
    libraryAta,
    decimals,
    buy,
    borrow,
    buyLoading,
    borrowLoading,
  } = useAutoTokenAccounts({
    pcoinMint: PCOIN_MINT,
    libraryOwner: vm?.library || '',
  });

  const [rentalDays, setRentalDays] = useState<number>(1);

  const stockPct = useMemo(() => {
    if (!vm) return 0;
    if (vm.totalCopies <= 0) return 0;
    return Math.round((vm.availableCopies / vm.totalCopies) * 100);
  }, [vm?.availableCopies, vm?.totalCopies]);

  // Reviews state
  const bookPkStr =
    (book as any)?.pubkey?.toString?.() ?? (book as any)?.pubkey ?? '';
  const {
    reviews,
    loading: loadingReviews,
    error: reviewsError,
    reload,
    setReviews,
  } = useReviews(bookPkStr);

  // Submit review
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');

  const onSubmitReview = async () => {
    try {
      if (!isReady()) throw new Error('Ví chưa sẵn sàng');
      if (!rating) return toast.error('Chọn điểm trước khi gửi');
      await reviewBook(new PublicKey(bookPkStr), new PublicKey(vm!.library), {
        rating,
        comment,
      });
      toast.success('Đã gửi đánh giá');
      setComment('');
      // Nếu backend chưa push ngay, có thể thêm tạm vào UI
      setReviews((prev) => [
        {
          author: 'me',
          rating,
          comment,
          createdAt: Math.floor(Date.now() / 1000),
        },
        ...prev,
      ]);
    } catch (e: any) {
      toast.error(e?.message || 'Gửi đánh giá thất bại');
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <span className="text-muted-foreground animate-pulse">
          Đang tải chi tiết sách...
        </span>
      </div>
    );
  }
  if (!vm) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Không tìm thấy sách</CardTitle>
            <CardDescription>
              Hãy mở sách từ danh sách trong thư viện.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.back()}>Quay lại</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const priceLabel = vm.isFree
    ? 'Miễn phí'
    : `${formatTokenAmount(vm.price, decimals)} PCOIN`;
  const rentalLabel = vm.isFree
    ? 'Miễn phí'
    : `${formatTokenAmount(vm.rentalPrice, decimals)} PCOIN`;

  const onBuy = async () => {
    if (!isReady()) return toast.error('Ví chưa sẵn sàng');
    if (vm.isFree) return;
    // try {
    //   await buy({
    //     bookPk: bookPkStr,
    //     libraryPk: vm.library,
    //     userTokenAccount: userAta,
    //     libraryTokenAccount: libraryAta,
    //   });
    //   toast.success('Mua thành công');
    // } catch {}
  };

  const onBorrow = async () => {
    if (!isReady()) return toast.error('Ví chưa sẵn sàng');
    try {
      await borrow({
        bookPk: bookPkStr,
        libraryPk: vm.library,
        userTokenAccount: userAta,
        libraryTokenAccount: libraryAta,
        rentalDays: Math.max(
          1,
          Math.min(Number(rentalDays || 1), Math.max(1, vm.maxRentalDays))
        ),
      });
      toast.success('Thuê thành công');
    } catch {
      toast.success('Thuê thành công');
    }
  };

  return (
    <div className="container py-6 md:py-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Trái: Ảnh + badges */}
        <Card className="overflow-hidden">
          <div className="relative aspect-[3/4] bg-black mx-auto">
            <img
              src={
                vm.coverUrl ||
                'https://chainsawmann.com/wp-content/uploads/2023/11/Chainsaw_Man_Volume_11-649x1024.webp'
              }
              alt={vm.title || 'Bìa sách'}
              className="object-cover w-full h-full"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {vm.isNft && (
                <Badge variant="secondary" className="px-3 py-1 shadow-lg">
                  NFT
                </Badge>
              )}
              {vm.isFree && (
                <Badge
                  variant="outline"
                  className="px-3 py-1 bg-white/80 backdrop-blur-sm shadow-md"
                >
                  Miễn phí
                </Badge>
              )}
              {!vm.isActive && (
                <Badge variant="destructive" className="px-3 py-1 shadow-lg">
                  Tạm ngưng
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap items-center gap-2">
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
            </div>

            <Separator />

            <div className="grid gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tình trạng</span>
                <span>
                  {vm.availableCopies} / {vm.totalCopies}
                </span>
              </div>
              <Progress value={stockPct} />
              <div className="text-xs text-muted-foreground">
                {stockPct}% còn hàng
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phải: Nội dung + mua/thuê + đánh giá */}
        <Card>
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
                  <span className="font-semibold">
                    {Math.max(0, Math.min(5, Number(vm.averageRating))).toFixed(
                      1
                    )}
                  </span>
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

            {/* Giá & Tồn kho nhanh */}
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
                <div className="text-sm text-muted-foreground">Cập nhật</div>
                <div className="mt-1 text-sm">
                  {hexSecondsToDateString(vm.lastUpdated)}
                </div>
              </div>
            </div>

            {/* Hành động: mua/thuê (tự ATA) */}
            <div className="rounded-lg border p-3 space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  onClick={onBuy}
                  disabled={buyLoading || vm.isFree || !vm.isActive}
                >
                  {buyLoading ? 'Đang mua...' : 'Mua bằng PCOIN'}
                </Button>

                <div className="grid grid-cols-[1fr,120px] gap-2">
                  <div className="text-xs text-muted-foreground self-center">
                    Số ngày thuê (1–{vm.maxRentalDays})
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={vm.maxRentalDays}
                    value={rentalDays}
                    onChange={(e) =>
                      setRentalDays(
                        Math.max(
                          1,
                          Math.min(
                            Number(e.target.value || 1),
                            vm.maxRentalDays
                          )
                        )
                      )
                    }
                  />
                </div>

                <Button
                  className="sm:col-span-2"
                  onClick={onBorrow}
                  disabled={
                    borrowLoading || !vm.isActive || vm.availableCopies === 0
                  }
                >
                  {borrowLoading ? 'Đang thuê...' : 'Thuê bằng PCOIN'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                ATA PCOIN sẽ tự động dùng ví hiện tại và PDA thư viện.
              </p>
            </div>

            {/* File */}
            {vm.fileUrl && (
              <div className="rounded-lg border p-3">
                <div className="text-sm text-muted-foreground">
                  Tệp đính kèm
                </div>
                <div className="break-all text-xs mt-1">{vm.fileUrl}</div>
                <Button asChild size="sm" variant="secondary" className="mt-2">
                  <a
                    href={vm.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    <LinkIcon className="h-4 w-4" /> Mở file
                  </a>
                </Button>
              </div>
            )}

            {/* Đánh giá */}
            <div className="rounded-lg border p-3 space-y-3">
              <div className="text-sm font-medium">Đánh giá</div>

              {/* Form gửi */}
              <div className="grid sm:grid-cols-[120px,1fr] gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Điểm</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(i + 1)}
                        className={`transition-colors ${i < rating ? 'text-yellow-500' : 'text-muted-foreground'}`}
                        aria-label={`rate ${i + 1}`}
                      >
                        <Star
                          className={`h-5 w-5 ${i < rating ? 'fill-yellow-500' : ''}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Textarea
                    placeholder="Viết cảm nhận..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={onSubmitReview}
                      disabled={reviewing || rating === 0}
                    >
                      Gửi đánh giá
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setRating(0);
                        setComment('');
                      }}
                    >
                      Xoá
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Danh sách review */}
              {loadingReviews ? (
                <div className="text-xs text-muted-foreground">
                  Đang tải đánh giá...
                </div>
              ) : reviewsError ? (
                <div className="text-xs text-red-600">Lỗi: {reviewsError}</div>
              ) : reviews.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  Chưa có đánh giá nào.
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r, idx) => (
                    <div key={idx} className="rounded-md border p-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-mono">
                          {short(r.author, 6, 6)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold">
                            {r.rating.toFixed ? r.rating.toFixed(1) : r.rating}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm mt-1">{r.comment || '—'}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {new Date(r.createdAt * 1000).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={reload}>
                  Tải lại
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between p-3">
            <div className="text-xs text-muted-foreground">
              Thêm lúc {hexSecondsToDateString(vm.addedAt)}
            </div>
            <div className="text-xs text-muted-foreground">
              Cập nhật {hexSecondsToDateString(vm.lastUpdated)}
            </div>
            <div className="flex items-center gap-2">
              <ShareSocial
                url={typeof window !== 'undefined' ? window.location.href : ''}
                title={vm.title}
              />
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
