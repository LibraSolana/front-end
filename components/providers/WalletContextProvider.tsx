// app/providers/WalletContextProvider.tsx
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
import { Plus, BookOpen, Library, Coins, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Sidebar from 'components/layouts/PublicLayout/SideBar';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from 'lib/utils';
import { sidebarConfig } from 'components/layouts/PublicLayout/SideBar/sidebarConfig';

const MobileMenuList = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="p-3 w-72 space-y-2">
      {sidebarConfig.map((item) => {
        const active = pathname === item.path;
        const Icon = item.icon;
        return (
          <Button
            key={item.path}
            onClick={() => router.push(item.path)}
            variant={active ? 'secondary' : 'ghost'}
            className={cn(
              'w-full justify-start gap-2 rounded-[9px] shadow-none',
              'hover:!bg-[#6450CB]/30 hover:!text-[#6450CB]'
            )}
          >
            <Icon size={20} />
            <span className="truncate">{item.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-white">
            {/* Header sticky */}
            <header className="sticky top-0 z-50 shadow-sm px-4 md:px-5 py-3 border-b bg-white/80 backdrop-blur">
              <div className="flex justify-between items-center gap-3">
                {/* Left: Logo + mobile sheet trigger */}
                <div className="flex items-center gap-2">
                  <div className="md:hidden">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Mở menu"
                        >
                          <Menu className="h-5 w-5" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="p-0 w-72">
                        <SheetHeader className="px-4 py-3 border-b">
                          <SheetTitle className="text-left">Menu</SheetTitle>
                        </SheetHeader>
                        {/* Mobile Menu from config */}
                        <MobileMenuList />
                      </SheetContent>
                    </Sheet>
                  </div>

                  <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="logo" width={32} height={32} />
                    <h1 className="hidden md:block text-lg lg:text-2xl font-bold">
                      Thư Viện Phi Tập Trung
                    </h1>
                  </Link>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Tạo mới</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href="/library/create"
                          className="flex items-center gap-2"
                        >
                          <Library className="h-4 w-4" /> <span>Thư viện</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/book/create"
                          className="flex items-center gap-2"
                        >
                          <BookOpen className="h-4 w-4" /> <span>Sách</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/token/create"
                          className="flex items-center gap-2"
                        >
                          <Coins className="h-4 w-4" /> <span>Token</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <WalletMultiButton className="!bg-white !text-black !rounded-xl !px-3 !py-2 hover:!bg-gray-100 shadow-sm border" />
                </div>
              </div>
            </header>

            {/* Layout: desktop 2 cột, mobile 1 cột */}
            <div className="md:grid md:grid-cols-[224px_1fr]">
              {/* Desktop sidebar */}
              <aside className="hidden md:block border-r min-h-[calc(100dvh-56px)]">
                <Sidebar />
              </aside>

              <main className="p-3 md:p-5">{children}</main>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
