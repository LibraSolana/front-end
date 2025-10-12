'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Book } from 'shared/utils/solana/types';
import { useGetProgram } from 'shared/hooks/useGetProgram';
import { PublicKey } from '@solana/web3.js';
import { listBooksByLibrary } from 'shared/hooks/useGetListData';
import { Layers, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PublicLayout from 'components/layouts/PublicLayout';
import BookSummary from '@/domains/LibraryPage/components/BookSummary';
import OwnerDashboard from '../page';

export default function Page() {
  const params = useParams();
  const { connection, wallet } = useGetProgram();
  const libraryPublicKey = params?.libraryPublicKey;

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
      } catch (err) {
        console.error('Failed to fetch books:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [connection, wallet, libraryPublicKey]);

  return (
    <div className="p-6 space-y-6">
      {/* @ts-ignore */}
      <OwnerDashboard libraryPk={libraryPublicKey} />
    </div>
  );
}
