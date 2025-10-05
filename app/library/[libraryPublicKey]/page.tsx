'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Book } from 'shared/utils/solana/types';
import { useGetProgram } from 'shared/hooks/useGetProgram';
import { PublicKey } from '@solana/web3.js';
import { listBooksByLibrary } from 'shared/hooks/useGetListData';
import { BookSummary } from '@/domains/LibraryPage/components/BookSummary';
import { Layers, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PublicLayout from 'components/layouts/PublicLayout';

export default function LibraryDetailPage() {
  const params = useParams();
  const { connection, wallet } = useGetProgram();
  const libraryPublicKey = params?.libraryPublicKey;

  const [books, setBooks] = useState<{ pubkey: string; data: Book }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!libraryPublicKey) return;

    (async () => {
      try {
        setLoading(true);
        const results = await listBooksByLibrary(
          connection,
          wallet,
          new PublicKey(libraryPublicKey)
        );

        setBooks(
          results.map((x: any) => ({
            pubkey: x.publicKey.toString(),
            data: x.account as Book,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch books:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [connection, wallet, libraryPublicKey]);

  return (
    <PublicLayout>
      <div className="p-6 space-y-6">
        {/* Header với icon */}
        <div className="flex items-center gap-3">
          <Layers className="h-6 w-6 text-indigo-500" />
          <h1 className="text-3xl font-bold text-slate-900">
            Library {libraryPublicKey?.slice(0, 8)}...
          </h1>
        </div>

        {/* Breadcrumbs (có thể mở rộng sau) */}
        <div className="text-sm text-muted-foreground">
          Home &gt; Libraries &gt; {libraryPublicKey?.slice(0, 8)}...
        </div>

        {/* Loading / Empty */}
        {loading && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading books...
          </p>
        )}
        {!loading && books.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No books found in this library.
          </p>
        )}

        {/* Grid sách */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => {
            const b = book.data;
            return (
              <div
                key={book.pubkey}
                className="hover:shadow-lg transition-shadow duration-200 rounded-lg"
              >
                <BookSummary book={book} />

                {/* Optional: badge info */}
                <div className="flex justify-between px-2 mt-2">
                  {b.isFree && <Badge variant="outline">Free</Badge>}
                  {!b.isFree && <Badge variant="secondary">Paid</Badge>}
                  {b.availableCopies !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {b.availableCopies} copies
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
}
