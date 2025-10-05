'use client';

import { useWallet } from '@solana/wallet-adapter-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { InitializeSection } from 'shared/components/library/InitializeSection';
import { CreateLibraryForm } from 'shared/components/library/CreateLibraryForm';
import { LibrariesByAuthority } from 'shared/components/library/LibrariesByAuthority';

export default function LibraryPage() {
  const { connected } = useWallet();

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Libraries</CardTitle>
          <CardDescription>
            Initialize counter and create libraries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <InitializeSection />
          {connected && <CreateLibraryForm />}
          <LibrariesByAuthority />
        </CardContent>
      </Card>
    </main>
  );
}
