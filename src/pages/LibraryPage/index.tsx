'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Copy, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Library } from 'shared/utils/solana/types';
import { useLibrariesByAuthority } from 'shared/hooks/useBatchQueries';
import { LibrarySummary } from '@/domains/LibraryPage/components/LibrarySumary';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

// 🧩 Component: hiển thị thông tin ví
const ProfileDetails = ({ publicKey }: { publicKey: string }) => {
  const shortKey = `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicKey);
    toast.success('Copied wallet address!');
  };

  return (
    <Card className="bg-card text-card-foreground border border-border shadow-sm">
      <CardHeader className="flex flex-row justify-between items-center p-5">
        <h2 className="text-lg font-semibold">Wallet Information</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex items-center gap-2"
        >
          <Copy size={14} />
          Copy
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status:</span>
          <span className="font-medium text-green-500">Connected</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Wallet:</span>
          <code className="bg-muted px-2 py-1 rounded text-sm">{shortKey}</code>
        </div>
      </CardContent>
    </Card>
  );
};

// 🧩 Component: danh sách thư viện của user
const UserLibraries = ({ authority }: { authority: string }) => {
  const { fetchLibraries, loading } = useLibrariesByAuthority();
  const [libraries, setLibraries] = useState<
    { pubkey: string; data: Library }[]
  >([]);

  useEffect(() => {
    if (!authority) return;
    (async () => {
      const libs = await fetchLibraries(authority);
      setLibraries(
        libs.map((x) => ({
          pubkey: x.pubkey.toBase58(),
          data: x.data,
        }))
      );
    })();
  }, [authority, fetchLibraries]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Libraries</h2>
        <span className="text-sm text-muted-foreground">
          Total: {libraries.length}
        </span>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={16} className="animate-spin" /> Loading libraries...
        </div>
      )}

      {!loading && libraries.length === 0 && (
        <div className="p-6 border rounded-lg bg-muted/30 text-center text-muted-foreground">
          You don’t have any libraries yet.
          <div className="mt-3">
            <Button>Create a new Library</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {libraries.map((lib) => (
          //@ts-ignore
          <LibrarySummary
            key={lib.pubkey}
            libraryKey={lib.pubkey}
            library={lib.data}
          />
        ))}
      </div>
    </section>
  );
};

// 🧩 Component chính
const MyProfilePage = () => {
  const { publicKey, connected, disconnect } = useWallet();

  if (!connected) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center h-96">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>
        <p className="text-muted-foreground mb-6">
          Please connect your wallet to view your profile and libraries.
        </p>
        <WalletMultiButton />
      </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="p-6 text-center">
        <Loader2 size={20} className="animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading wallet information...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

        <div className="flex items-center gap-3">
          <WalletMultiButton />
          <Button
            variant="destructive"
            size="sm"
            className="flex items-center gap-1"
            onClick={disconnect}
          >
            <LogOut size={16} /> Disconnect
          </Button>
        </div>
      </div>

      {/* Wallet info */}
      <ProfileDetails publicKey={publicKey.toBase58()} />

      {/* Libraries */}
      <UserLibraries authority={publicKey.toBase58()} />
    </div>
  );
};

export default MyProfilePage;
