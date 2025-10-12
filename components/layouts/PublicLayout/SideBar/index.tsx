// Sidebar.tsx
'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { sidebarConfig } from './sidebarConfig';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from 'lib/utils';
import WalletCard from 'shared/components/UserSummary';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Image from 'next/image';

const SidebarInner = ({ onNavigate }: { onNavigate?: () => void }) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="w-56 p-4 space-y-2">
      <WalletCard
        name="Amanda Smith"
        avatar="/avatar.jpg"
        ddlMint="HwBgz6m8XGAC3jJHYsLP2wdbm7b2NF8k9rhFianPGzRZ"
      />

      {sidebarConfig.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        return (
          <Button
            key={item.path}
            onClick={() => {
              router.push(item.path);
              onNavigate?.(); // đóng sheet trên mobile
            }}
            className={cn(
              isActive ? 'font-bold' : 'font-medium',
              'w-full justify-start hover:!bg-[#6450CB]/30 hover:!text-[#6450CB] shadow-none rounded-[9px] gap-2'
            )}
            variant={isActive ? 'secondary' : 'ghost'}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

const Sidebar = () => {
  // Header bar cho mobile
  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="logo" width={28} height={28} />
            <span className="text-sm font-semibold">Thư Viện</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetHeader className="px-4 py-3 border-b">
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <SidebarInner
                onNavigate={() => {
                  /* Sheet tự đóng bởi shadcn */
                }}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block sticky top-16 h-[calc(100dvh-4rem)] overflow-auto">
        <SidebarInner />
      </aside>
    </>
  );
};

export default Sidebar;
