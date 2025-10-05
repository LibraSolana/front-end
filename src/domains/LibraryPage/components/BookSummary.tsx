'use client';

import Image from 'next/image';
import { useMemo } from 'react';
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
  Globe,
  BookOpen,
  Star,
  Wallet,
  Layers,
  Calendar,
  Tag,
  Languages,
  Building2,
  Repeat2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useBookOperations } from 'shared/hooks/useBooks';
import { useProgram } from 'shared/hooks/useProgram';
import { PublicKey } from '@solana/web3.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

type CategoryObject = Record<string, {}>;
function isValidUrl(str?: string) {
  if (!str) return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
function toHexString(input: unknown): string | null {
  if (input == null) return null;
  // already hex-like string
  if (typeof input === 'string')
    return input.startsWith('0x') ? input.slice(2) : input;

  // bigint or number
  if (typeof input === 'bigint') return input.toString(16);
  if (typeof input === 'number' && Number.isFinite(input))
    return Math.max(0, Math.trunc(input)).toString(16);

  // bytes (e.g., Buffer/Uint8Array)
  if (input instanceof Uint8Array)
    return Array.from(input)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  // fallback: unsupported type
  return null;
}

function hexToBigInt(input: unknown): bigint {
  const hex = toHexString(input);
  if (!hex || hex.length === 0) return 0n;
  try {
    return BigInt(`0x${hex}`);
  } catch {
    return 0n;
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
  const keys = Object.keys(cat || {});
  return keys[0] ?? 'uncategorized';
}

type Props = {
  book: any;
  onBorrow?: () => void;
  onOpen?: () => void;
};

export function BookSummary({ book, onBorrow, onOpen }: Props) {
  const b = book.data;
  const stockPct = useMemo(() => {
    if (b.totalCopies <= 0) return 0;
    return Math.round((b.availableCopies / b.totalCopies) * 100);
  }, [b.availableCopies, b.totalCopies]);

  const rating = Math.min(5, Math.max(0, b.averageRating || 0));
  const category = getCategoryName(b.category);

  const priceLabel = b.isFree ? 'Free' : lamportsToSOLFromHex(b.price);
  const rentalLabel = b.isFree ? 'Free' : lamportsToSOLFromHex(b.rentalPrice);

  const addedDate = hexSecondsToDateString(b.addedAt);
  const updatedDate = hexSecondsToDateString(b.lastUpdated);

  const { wallet } = useProgram();
  const { updateBook, deleteBook, loading } = useBookOperations();

  // const canManage = isAuthority(b.libraryAuthority?.toString?.()) && b.isActive;

  const borrowedNow = Math.max(
    0,
    (b.totalCopies || 0) - (b.availableCopies || 0)
  );

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    title: b.title ?? '',
    description: b.description ?? '',
    price: Number(b.price ?? 0),
    rentalPrice: Number(b.rentalPrice ?? 0),
    copiesAvailable: Number(b.availableCopies ?? 0),
    isActive: Boolean(b.isActive),
  });

  const handleSave = async () => {
    await updateBook(new PublicKey(book.pubkey), new PublicKey(b.library), {
      ...form,
      totals: {
        totalCopies: b.totalCopies,
        availableCopies: b.availableCopies,
      },
    });
    setEditOpen(false);
    // TODO: refresh list (SWR mutate/refetch)
  };

  const handleDelete = async () => {
    if (borrowedNow > 0) {
      // phòng trước lỗi on-chain CannotDeleteBorrowedBook
      return;
    }
    await deleteBook(new PublicKey(book.pubkey), new PublicKey(b.library));
    // TODO: remove from list
  };

  return (
    <Card className="overflow-hidden border-muted shadow-sm !pt-0">
      <div className="grid md:grid-cols-[240px,1fr]">
        <Link href={`/book/${book.pubkey}`} className="no-underline">
          {/* Cover */}
          <div className="relative aspect-[3/4]  md:h-full bg-black mx-auto">
            {/* <Image
            src={b.coverUrl || '/placeholder.png'}
            alt={b.title || 'Book cover'}
            fill
            className="object-cover"
            priority
          /> */}
            <img
              src={
                isValidUrl(b.coverUrl)
                  ? b.coverUrl
                  : 'https://chainsawmann.com/wp-content/uploads/2023/11/Chainsaw_Man_Volume_11-649x1024.webp'
              }
              alt={b.title || 'Book cover'}
              className="object-cover w-full h-full"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {b.isNft && (
                <Badge
                  variant="secondary"
                  className="text-sm md:text-base px-3 py-1 shadow-lg"
                >
                  NFT
                </Badge>
              )}
              {b.isFree && (
                <Badge
                  variant="outline"
                  className="text-sm md:text-base px-3 py-1 bg-white/80 backdrop-blur-sm shadow-md"
                >
                  Free
                </Badge>
              )}
              {!b.isActive && (
                <Badge
                  variant="destructive"
                  className="text-sm md:text-base px-3 py-1 shadow-lg"
                >
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </Link>

        {/* Details */}
        <div>
          <CardHeader className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl md:text-2xl">
                  {b.title || 'Untitled'}
                </CardTitle>
                <CardDescription className="mt-1">
                  {b.authorName ? `by ${b.authorName}` : 'Unknown author'}
                  {b.isbn ? ` • ISBN ${b.isbn}` : ''}
                </CardDescription>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    {category}
                  </Badge>
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

              {/* Rating */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
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

          <CardContent className="space-y-4">
            {/* Description */}
            {b.description ? (
              <p className="text-sm text-muted-foreground">{b.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No description provided.
              </p>
            )}

            <Separator />

            {/* Pricing + Availability */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Purchase</div>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1 text-xl font-semibold">{priceLabel}</div>
                <p className="text-xs text-muted-foreground">
                  One-time purchase
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Rental</div>
                  <Repeat2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1 text-xl font-semibold">{rentalLabel}</div>
                <p className="text-xs text-muted-foreground">
                  Up to {b.maxRentalDays} days
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Availability
                  </div>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-semibold">
                    {b.availableCopies}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    / {b.totalCopies}
                  </span>
                </div>
                <Progress value={stockPct} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {stockPct}% in stock
                </p>
              </div>
            </div>

            {/* Meta */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Library</span>
                <div className="font-mono text-xs mt-1 break-all">
                  {b.library?.toString() ?? '—'}
                </div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Added by</span>
                <div className="font-mono text-xs mt-1 break-all">
                  {b.addedBy?.toString() ?? '—'}
                </div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Updated</span>
                <div className="mt-1">{updatedDate}</div>
              </div>
            </div>
          </CardContent>

          <CardFooter
            className="flex items-center justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {true && (
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditOpen(true)}>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Added {addedDate}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={onOpen}
                className="gap-2"
                disabled={!b.fileUrl}
              >
                <Globe className="h-4 w-4" />
                Open
              </Button>
              <Button
                onClick={onBorrow}
                disabled={!b.isActive || b.availableCopies === 0}
              >
                Borrow
              </Button>
            </div>
          </CardFooter>
        </div>
      </div>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit book</DialogTitle>
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
              <span>Active</span>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
