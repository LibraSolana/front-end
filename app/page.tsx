// app/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { useAllLibraries } from 'shared/hooks/useGetAllLibraries';
import { IDL } from 'shared/types/enhanced_decentralized_library';

import {
  Sparkles,
  BookOpen,
  Library as LibraryIcon,
  Search,
  Flame,
  Star,
  Rocket,
  ArrowRight,
} from 'lucide-react';
import { LibrarySummary } from '@/domains/LibraryPage/components/LibrarySumary';
import { useAllBooks } from 'shared/hooks/useGetAllBooks';
import PublicLayout from 'components/layouts/PublicLayout';
import { TokenPricesChart } from 'shared/components/TokenPricesChart';
import BookSummary from '@/domains/LibraryPage/components/BookSummary';

const PROGRAM_ID = new PublicKey(
  '5mNRbBTG3K3LZif5GU11PZNBFrSbyLWhvS4wW2ABWdv2'
);

export default function HomePage() {
  const walletCtx = useWallet();
  const wallet = walletCtx as unknown as anchor.Wallet | undefined;

  const { libs, loading: loadingLibs } = useAllLibraries(PROGRAM_ID, IDL);
  const { books, loading: loadingBooks } = useAllBooks(PROGRAM_ID, IDL);

  const [query, setQuery] = useState('');

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    if (!query.trim()) return books.slice(0, 12);
    const q = query.toLowerCase();
    return books
      .filter((b) => {
        const t = (b.data.title || '').toLowerCase();
        const a = (b.data.authorname || '').toLowerCase();
        const c = (b.data.category || '').toLowerCase?.() ?? '';
        return t.includes(q) || a.includes(q) || c.includes(q);
      })
      .slice(0, 12);
  }, [books, query]);

  const topLibraries = useMemo(() => {
    if (!libs) return [];
    // Xếp theo total_books rồi cắt top 6
    return [...libs]
      .sort(
        (a, b) =>
          Number(b.data.totalbooks ?? 0) - Number(a.data.totalbooks ?? 0)
      )
      .slice(0, 6);
  }, [libs]);

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-10">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 md:p-12 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">On-chain Digital Library</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Khám phá, thuê và đánh giá sách trên Solana
            </h1>
            <p className="text-white/90 max-w-2xl">
              Marketplace tổng hợp từ mọi thư viện on-chain, thanh toán bằng
              token của từng thư viện, hỗ trợ reserve và review tức thì.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="secondary" className="gap-2">
                <Rocket className="h-4 w-4" />
                Bắt đầu ngay
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 text-white hover:bg-white/20 gap-2"
              >
                Tìm hiểu thêm <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="w-full md:w-[420px]">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-white/70" />
              <Input
                placeholder="Tìm kiếm tiêu đề, tác giả, thể loại..."
                className="pl-12 h-12 bg-white text-black"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="mt-4 text-sm text-white/80">
              {loadingLibs || loadingBooks
                ? 'Đang tải dữ liệu...'
                : 'Sẵn sàng • Duyệt nhanh  >'}
            </div>
          </div>
        </div>
      </section>

      {/* Categories quick */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-semibold">Danh mục nổi bật</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Fiction', 'Non-fiction', 'Science', 'History', 'Tech', 'Art'].map(
            (c) => (
              <Badge key={c} variant="secondary" className="cursor-pointer">
                {c}
              </Badge>
            )
          )}
        </div>
      </section>

      {/* Featured libraries */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <LibraryIcon className="h-5 w-5 text-indigo-600" />
          <h2 className="text-xl font-semibold">Thư viện nổi bật</h2>
        </div>
        <Separator />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {topLibraries.map((lib) => (
            <LibrarySummary
              key={lib.pubkey}
              libraryKey={lib.pubkey}
              library={lib.data}
            />
          ))}
        </div>
      </section>

      {/* New books */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold">Sách mới cập nhật</h2>
        </div>
        <Separator />
        <ScrollArea className="h-[60vh] rounded-md border p-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book, idx) => (
              <BookSummary key={idx} book={book} />
            ))}
          </div>
        </ScrollArea>
      </section>
      {/* Token Prices Chart */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-semibold">Giá token phổ biến</h2>
        </div>
        <TokenPricesChart tokenIds={['solana', 'ethereum', 'usd-coin']} />
      </section>
      {/* CTA */}
      <section className="rounded-2xl border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Trở thành thủ thư
          </CardTitle>
          <CardDescription>
            Tạo thư viện của riêng mình, thêm sách và kiếm doanh thu on-chain.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="default">Tạo thư viện</Button>
          <Button variant="outline">Thêm sách</Button>
        </CardContent>
      </section>
    </div>
  );
}
