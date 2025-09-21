// Sidebar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { sidebarConfig } from "./sidebarConfig";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="w-56 p-4 space-y-2">
      {sidebarConfig.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;

        return (
          <Button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={cn(isActive ? 'font-bold' : 'font-medium','w-full justify-start hover:!bg-[#6450CB]/30 hover:!text-[#6450CB] shadow-none rounded-[9px]')}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default Sidebar;
