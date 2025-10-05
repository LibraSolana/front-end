'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
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
  Copy,
  Link as LinkIcon,
} from 'lucide-react';
import { PublicKey } from '@solana/web3.js';

import {
  useReservationOperations,
  useReviewOperations,
} from 'shared/hooks/useReservations';
// If available, plug in hooks that fetch the single book account by pubkey.
import { useProgram } from 'shared/hooks/useProgram';
import { useParams } from 'next/navigation';
import { useGetBook } from 'shared/hooks/useBookData';

import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy as CopyIcon,
} from 'lucide-react';
import { buildShare, copyToClipboard, nativeShare } from 'shared/utils/share';

type CategoryObject = Record<string, {}>;

type BookWire = {
  pubkey: string;
  data: {
    library: string | PublicKey;
    addedBy: string | PublicKey;
    title: string;
    authorName: string;
    isbn: string;
    description: string;
    category: CategoryObject;
    language: string;
    publisher: string;
    publicationYear: number;
    pages: number;
    price: string; // hex lamports
    rentalPrice: string; // hex lamports
    maxRentalDays: number;
    isFree: boolean;
    isNft: boolean;
    fileUrl: string;
    coverUrl: string;
    totalCopies: number;
    availableCopies: number;
    timesBorrowed: number;
    addedAt: string; // hex seconds
    lastUpdated: string; // hex seconds
    isActive: boolean;
    averageRating: number;
    totalReviews: number;
    ratingSum: string;
  };
};

function asBase58(v: string | PublicKey) {
  return typeof v === 'string' ? v : v.toBase58();
}

function toHexString(input: unknown): string | null {
  if (input == null) return null;
  if (typeof input === 'string')
    return input.startsWith('0x') ? input.slice(2) : input;
  if (typeof input === 'bigint') return input.toString(16);
  if (typeof input === 'number' && Number.isFinite(input))
    return Math.max(0, Math.trunc(input)).toString(16);
  if (input instanceof Uint8Array)
    return Array.from(input)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  return null;
}
function hexToBigInt(input: unknown): bigint {
  const hex = toHexString(input);
  if (!hex || hex.length === 0) return BigInt('0');
  try {
    return BigInt(`0x${hex}`);
  } catch {
    return BigInt('0');
  }
}
function lamportsToSOLFromHex(input: unknown) {
  const lamports = hexToBigInt(input);
  const sol = Number(lamports) / 1_000_000_000;
  return `${sol.toLocaleString(undefined, { maximumFractionDigits: 4 })} SOL`;
}
function hexSecondsToDateString(input: unknown) {
  const secs = Number(hexToBigInt(input));
  if (!Number.isFinite(secs) || secs <= 0) return '—';
  return new Date(secs * 1000).toLocaleDateString();
}
function getCategoryName(cat: CategoryObject) {
  return Object.keys(cat || {})[0] ?? 'uncategorized';
}

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams(); // lấy từ /book/:pubkey
  const pubkey = params?.bookAddress as string;

  const { book, loading, error } = useGetBook(pubkey);

  const [userTokenAccount, setUserTokenAccount] = useState('');
  const [libraryTokenAccount, setLibraryTokenAccount] = useState('');
  const [priorityFee, setPriorityFee] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');

  const {
    reserveBook,
    cancelReservation,
    loading: reserving,
  } = useReservationOperations();
  const { reviewBook, loading: reviewing } = useReviewOperations();
  const { isReady } = useProgram();

  const stockPct = useMemo(() => {
    if (!book) return 0;
    const b = book.data;
    return b.totalCopies > 0
      ? Math.round((b.availableCopies / b.totalCopies) * 100)
      : 0;
  }, [book]);
  // Loading skeleton / spinner khi đang fetch book
  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <span className="text-muted-foreground animate-pulse">
          Loading book details...
        </span>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Book not found</CardTitle>
            <CardDescription>
              Please navigate from the library list to open a book.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.back()}>Go back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const b = book.data;

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = b.title || 'Book';
  const shareText = b.authorName ? `by ${b.authorName}` : 'Check this book';
  const shareLinks = buildShare(pageUrl, shareTitle, shareText);

  const onReserve = async () => {
    try {
      if (!isReady()) throw new Error('Wallet not ready');
      const res = await reserveBook(
        new PublicKey(book.pubkey),
        new PublicKey(asBase58(b.library)),
        { priorityFee },
        new PublicKey(userTokenAccount),
        new PublicKey(libraryTokenAccount)
      );
      toast.success('Reserved!');
      window.open(res.explorerUrl, '_blank');
    } catch (e: any) {
      toast.error(e.message || 'Failed to reserve');
    }
  };

  const onCancel = async () => {
    try {
      if (!isReady()) throw new Error('Wallet not ready');
      // In real flow, pass the reservation PDA, here just demo field:
      const reservationAddr = prompt('Reservation PDA address');
      if (!reservationAddr) return;
      const res = await cancelReservation(
        new PublicKey(book.pubkey),
        new PublicKey(reservationAddr)
      );
      toast.success('Cancelled!');
      window.open(res.explorerUrl, '_blank');
    } catch (e: any) {
      toast.error(e.message || 'Failed to cancel');
    }
  };

  const onReview = async () => {
    try {
      if (!isReady()) throw new Error('Wallet not ready');
      await reviewBook(
        new PublicKey(book.pubkey),
        new PublicKey(asBase58(b.library)),
        { rating, comment }
      );
      toast.success('Review posted');
      setComment('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to review');
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6 md:gap-8 lg:gap-12 lg:flex-row">
        {/* Left: cover + quick stats */}
        <Card className="overflow-hidden">
          <div className="relative aspect-[3/4]">
            {/* <Image
              src={b.coverUrl || '/placeholder.svg'}
              alt={b.title || 'Book cover'}
              fill
              className="object-cover"
              priority
            /> */}
            <img
              src={
                b.coverUrl ||
                'https://chainsawmann.com/wp-content/uploads/2023/11/Chainsaw_Man_Volume_11-649x1024.webp'
              }
              alt=""
              className="object-cover w-full h-full"
            />
          </div>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap gap-2">
              {b.isNft && <Badge variant="secondary">NFT</Badge>}
              {b.isFree && <Badge variant="outline">Free</Badge>}
              {!b.isActive && <Badge variant="destructive">Inactive</Badge>}
              <Badge variant="soft" className="capitalize">
                {getCategoryName(b.category)}
              </Badge>
            </div>
            <Separator />
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Availability
                </span>
                <span className="text-sm">
                  {b.availableCopies} / {b.totalCopies}
                </span>
              </div>
              <Progress value={stockPct} />
              <div className="text-xs text-muted-foreground">
                {stockPct}% in stock
              </div>
            </div>

            <TooltipProvider>
              <div className="mt-2 flex items-center justify-end gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={async (e) => {
                        e.preventDefault();
                        const ok = await nativeShare(
                          pageUrl,
                          shareTitle,
                          shareText
                        );
                        if (!ok) {
                          await copyToClipboard(pageUrl);
                          toast.success('Link copied');
                        }
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <a
                        href={shareLinks.twitter}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share on X</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <a
                        href={shareLinks.facebook}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            fill="currentColor"
                            d="M13 22v-8h2.6l.4-3H13V8.5c0-.9.3-1.5 1.6-1.5H16V4.2C15.7 4.2 14.8 4 13.7 4 11.4 4 10 5.3 10 7.9V11H7v3h3v8h3z"
                          />
                        </svg>
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share on Facebook</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <a
                        href={shareLinks.linkedin}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share on LinkedIn</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={async (e) => {
                        e.preventDefault();
                        await copyToClipboard(pageUrl);
                        toast.success('Link copied');
                      }}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy link</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Right: details */}
        <Card>
          <CardHeader className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-2xl">
                  {b.title || 'Untitled'}
                </CardTitle>
                <CardDescription className="mt-1">
                  {b.authorName ? `by ${b.authorName}` : 'Unknown author'}
                  {b.isbn ? ` • ISBN ${b.isbn}` : ''}
                </CardDescription>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {b.language && (
                    <Badge variant="outline" className="gap-1">
                      <Languages className="h-3.5 w-3.5" />
                      {b.language}
                    </Badge>
                  )}
                  {b.publisher && (
                    <Badge variant="outline" className="gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {b.publisher}
                    </Badge>
                  )}
                  {b.publicationYear > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {b.publicationYear}
                    </Badge>
                  )}
                  {b.pages > 0 && (
                    <Badge variant="outline" className="gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {b.pages} pages
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">
                    {(b.averageRating || 0).toFixed?.(1) ??
                      Number(b.averageRating).toFixed(1)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    ({b.totalReviews})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Borrowed {b.timesBorrowed.toLocaleString()} times
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {b.description ? (
              <p className="text-sm text-muted-foreground">{b.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No description provided.
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Purchase</div>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {b.isFree ? 'Free' : lamportsToSOLFromHex(b.price)}
                </div>
                <p className="text-xs text-muted-foreground">
                  One-time purchase
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Rental</div>
                  <Repeat2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {b.isFree ? 'Free' : lamportsToSOLFromHex(b.rentalPrice)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Up to {b.maxRentalDays} days
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-sm text-muted-foreground">
                  Library / Added by
                </div>
                <div className="mt-1 space-y-1 text-xs font-mono break-all">
                  <div className="flex items-center gap-1">
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    <span title="Library">{asBase58(b.library)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    <span title="Added By">{asBase58(b.addedBy)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="actions" className="w-full">
              <TabsList>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
                <TabsTrigger value="meta">Metadata</TabsTrigger>
              </TabsList>

              {/* Actions */}
              <TabsContent value="actions" className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="userToken">User token account</Label>
                    <Input
                      id="userToken"
                      placeholder="Your token account"
                      value={userTokenAccount}
                      onChange={(e) => setUserTokenAccount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="libraryToken">Library token account</Label>
                    <Input
                      id="libraryToken"
                      placeholder="Library token account"
                      value={libraryTokenAccount}
                      onChange={(e) => setLibraryTokenAccount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prioFee">
                      Priority fee (microlamports)
                    </Label>
                    <Input
                      id="prioFee"
                      type="number"
                      placeholder="0"
                      value={priorityFee}
                      onChange={(e) =>
                        setPriorityFee(Number(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={onReserve}
                    disabled={
                      reserving || !b.isActive || b.availableCopies === 0
                    }
                  >
                    Reserve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={reserving}
                  >
                    Cancel reservation
                  </Button>
                  <Button variant="secondary" asChild disabled={!b.fileUrl}>
                    <a
                      href={b.fileUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <LinkIcon className="h-4 w-4" /> Open file
                    </a>
                  </Button>
                </div>
              </TabsContent>

              {/* Review */}
              <TabsContent value="review" className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Your rating</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="comment">Comment</Label>
                  <Textarea
                    id="comment"
                    placeholder="Share thoughts about this book…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <Button onClick={onReview} disabled={reviewing || rating === 0}>
                  Submit review
                </Button>
              </TabsContent>

              {/* Full metadata */}
              <TabsContent value="meta">
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Publication year
                    </span>
                    <div>{b.publicationYear || '—'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pages</span>
                    <div>{b.pages || '—'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Max rental days
                    </span>
                    <div>{b.maxRentalDays}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Added</span>
                    <div>{hexSecondsToDateString(b.addedAt)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Updated</span>
                    <div>{hexSecondsToDateString(b.lastUpdated)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price</span>
                    <div>
                      {b.isFree ? 'Free' : lamportsToSOLFromHex(b.price)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rental price</span>
                    <div>
                      {b.isFree ? 'Free' : lamportsToSOLFromHex(b.rentalPrice)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Category</span>
                    <div className="capitalize">
                      {getCategoryName(b.category)}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">Book address</span>
                    <div className="font-mono break-all text-xs">
                      {book.pubkey}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">File URL</span>
                    <div className="break-all text-xs">{b.fileUrl || '—'}</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Added {hexSecondsToDateString(b.addedAt)}
            </div>
            <div className="text-xs text-muted-foreground">
              Updated {hexSecondsToDateString(b.lastUpdated)}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
