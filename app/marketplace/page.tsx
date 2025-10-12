// app/marketplace/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { borrowBookTx, reserveBookTx, reviewBookTx } from 'shared/utils/action';
import { useAllLibraries } from 'shared/hooks/useGetAllLibraries';
import { IDL } from 'shared/types/enhanced_decentralized_library';
import { LibrarySummary } from '@/domains/LibraryPage/components/LibrarySumary';

import {
  Library as LibraryIcon,
  BookOpen,
  Search,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  Loader2,
  Flame,
} from 'lucide-react';
import { useAllBooks } from 'shared/hooks/useGetAllBooks';
import PublicLayout from 'components/layouts/PublicLayout';
import { TokenPricesChart } from 'shared/components/TokenPricesChart';
import BookSummary from '@/domains/LibraryPage/components/BookSummary';

const PROGRAM_ID = new PublicKey(
  '5mNRbBTG3K3LZif5GU11PZNBFrSbyLWhvS4wW2ABWdv2'
);
const SYS = new PublicKey('11111111111111111111111111111111');
const TOKEN_PROGRAM = TOKEN_PROGRAM_ID;

export default function Marketplace() {
  const walletCtx = useWallet();
  const wallet = walletCtx as unknown as anchor.Wallet | undefined;

  const { libs, loading: loadingLibs } = useAllLibraries(PROGRAM_ID, IDL);
  const [libraryFilter, setLibraryFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [tab, setTab] = useState<'all' | 'bylib'>('all');

  const { books, loading: loadingBooks } = useAllBooks(
    PROGRAM_ID,
    IDL,
    libraryFilter === 'all' ? undefined : new PublicKey(libraryFilter)
  );

  const groupedLibs = useMemo(() => {
    const acc: Record<string, { pubkey: string; data: any }[]> = {};
    (libs ?? []).forEach((l) => {
      const auth = (l.data.authority as PublicKey)?.toBase58();
      acc[auth] ??= [];
      acc[auth].push(l);
    });
    return acc;
  }, [libs]);

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    if (!searchText.trim()) return books;
    const q = searchText.toLowerCase();
    return books.filter((b) => {
      const t = (b.data.title || '').toLowerCase();
      const a = (b.data.authorname || '').toLowerCase();
      const c = (b.data.category || '').toLowerCase?.() ?? '';
      return t.includes(q) || a.includes(q) || c.includes(q);
    });
  }, [books, searchText]);

  async function onBorrow(b: { pubkey: string; data: any }) {
    if (!wallet?.publicKey) return;
    const bookPk = new PublicKey(b.pubkey);
    const libraryPk = b.data.library as PublicKey;
    const lib = (libs ?? []).find(
      (l) => l.pubkey === libraryPk.toBase58()
    )?.data;
    if (!lib) return;
    const mint = lib.paymentmint as PublicKey;
    const userAta = getAssociatedTokenAddressSync(mint, wallet.publicKey, true);
    const libAta = getAssociatedTokenAddressSync(mint, libraryPk, true);
    await borrowBookTx(
      // actions sử dụng provider riêng; nếu cần connection, truyền từ useProgram trong actions
      // ở đây giả định actions tự khởi tạo Program bằng wallet + connection global
      // nếu actions yêu cầu connection, truyền connection của useProgram tương ứng
      // tạm dùng window.connection hoặc đã bọc trong actions
      // ví dụ cũ: borrowBookTx(connection, wallet, {...}, 7)
      // nếu giữ chữ ký cũ, hãy import connection từ useProgram
      // @ts-ignore
      window.connection || undefined,
      wallet,
      {
        user: wallet.publicKey,
        library: libraryPk,
        book: bookPk,
        userTokenAccount: userAta,
        libraryTokenAccount: libAta,
        tokenProgram: TOKEN_PROGRAM,
        systemProgram: SYS,
      },
      7
    );
  }

  async function onReserve(b: { pubkey: string; data: any }) {
    if (!wallet?.publicKey) return;
    const bookPk = new PublicKey(b.pubkey);
    const libraryPk = b.data.library as PublicKey;
    const lib = (libs ?? []).find(
      (l) => l.pubkey === libraryPk.toBase58()
    )?.data;
    if (!lib) return;
    const mint = lib.paymentmint as PublicKey;
    const userAta = getAssociatedTokenAddressSync(mint, wallet.publicKey, true);
    const libAta = getAssociatedTokenAddressSync(mint, libraryPk, true);
    await reserveBookTx(
      // @ts-ignore
      window.connection || undefined,
      wallet,
      {
        user: wallet.publicKey,
        library: libraryPk,
        book: bookPk,
        userTokenAccount: userAta,
        libraryTokenAccount: libAta,
        tokenProgram: TOKEN_PROGRAM,
        systemProgram: SYS,
      },
      0n
    );
  }

  async function onReview(b: { pubkey: string; data: any }) {
    if (!wallet?.publicKey) return;
    const bookPk = new PublicKey(b.pubkey);
    const libraryPk = b.data.library as PublicKey;
    await reviewBookTx(
      // @ts-ignore
      window.connection || undefined,
      wallet,
      {
        user: wallet.publicKey,
        library: libraryPk,
        book: bookPk,
        systemProgram: SYS,
      },
      5,
      'Rất hay!'
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-2xl shadow-2xl border border-gray-200">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3">
          <LibraryIcon className="h-6 w-6 text-gradient-to-r from-green-400 to-blue-500 drop-shadow-xl" />
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-[gradient-x_5s_ease_infinite]">
            Library Marketplace
          </h1>
          <Badge className="ml-2 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white font-bold shadow-lg animate-pulse">
            Beta
          </Badge>
        </div>

        {/* Right: Subtext */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0 text-sm font-medium text-purple-500 animate-pulse">
          <ShieldCheck className="h-4 w-4" />
          <span>Giao dịch on-chain an toàn</span>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-semibold">Giá token phổ biến</h2>
        </div>
        <TokenPricesChart tokenIds={['solana', 'ethereum', 'usd-coin']} />
      </section>

      {/* Toolbar */}
      <Card>
        <CardHeader className="p-5">
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Bộ lọc & tìm kiếm
          </CardTitle>
          <CardDescription>
            Chọn nguồn thư viện hoặc tìm theo tiêu đề, tác giả
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:w-[340px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm sách, tác giả, thể loại..."
              className="pl-9"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <Select
            value={libraryFilter}
            onValueChange={(v) => setLibraryFilter(v)}
          >
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Tất cả thư viện" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thư viện</SelectItem>
              {(libs ?? []).map((l) => (
                <SelectItem key={l.pubkey} value={l.pubkey}>
                  {l.data.name} ·{' '}
                  {(l.data.authority as PublicKey).toBase58().slice(0, 6)}...
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {loadingLibs || loadingBooks ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-4 w-4 animate-spin" /> Đang tải dữ liệu
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-4 w-4" /> Sẵn sàng
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as any)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <BookOpen className="h-4 w-4" /> Tất cả sách
          </TabsTrigger>
          <TabsTrigger value="bylib" className="gap-2">
            <LibraryIcon className="h-4 w-4" /> Theo thư viện
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Danh mục</h2>
              <div className="text-sm text-muted-foreground">
                {(filteredBooks ?? []).length} kết quả
              </div>
            </div>
            <Separator />
            <ScrollArea className="h-[70vh] rounded-md border p-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {(filteredBooks ?? []).map((book, idx) => (
                  <BookSummary key={idx} book={book} />
                ))}
              </div>
            </ScrollArea>
          </section>
        </TabsContent>

        <TabsContent value="bylib">
          <section className="space-y-4">
            {Object.entries(groupedLibs).map(([auth, items]) => (
              <Card key={auth}>
                <CardHeader className="p-5">
                  <CardTitle className="flex items-center gap-2">
                    <LibraryIcon className="h-5 w-5" />
                    Authority {auth.slice(0, 8)}...
                  </CardTitle>
                  <CardDescription>{items.length} thư viện</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((lib) => (
                      <LibrarySummary
                        key={lib.pubkey}
                        libraryKey={lib.pubkey}
                        library={lib.data}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
