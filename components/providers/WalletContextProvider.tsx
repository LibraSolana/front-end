'use client';

import React, { ReactNode, useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import {
  WalletMultiButton,
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, BookOpen, Library } from 'lucide-react';

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <div className="min-h-screen bg-white">
            <header className="shadow-sm px-5 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <Link href={'/'}>
                  <div className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="logo" width={40} height={40} />
                    <h1 className="text-sm lg:text-2xl font-bold">
                      Libra Solana
                    </h1>
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  {/* Dropdown for Create */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href="/library/create"
                          className="flex items-center gap-2"
                        >
                          <Library className="h-4 w-4" /> Library
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/book/create"
                          className="flex items-center gap-2"
                        >
                          <BookOpen className="h-4 w-4" /> Book
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <WalletMultiButton className="!bg-white !text-black !rounded-xl !px-4 !py-2 hover:!bg-gray-100 shadow-md" />
                </div>
              </div>
            </header>
            <main className="p-3 mx-auto w-full ">{children}</main>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
