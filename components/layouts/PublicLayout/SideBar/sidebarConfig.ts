// sidebarConfig.ts
import { BookOpen, Store, Gift, User } from "lucide-react";

export type SidebarItem = {
  label: string;
  path: string;
  icon: React.ElementType;
};

export const sidebarConfig: SidebarItem[] = [
  {
    label: "Library",
    path: "/library",
    icon: BookOpen,
  },
  {
    label: "Marketplace",
    path: "/marketplace",
    icon: Store,
  },
  {
    label: "Rewards",
    path: "/rewards",
    icon: Gift,
  },
  {
    label: "My Books",
    path: "/my-books",
    icon: User,
  },
];
