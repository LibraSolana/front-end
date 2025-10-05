// sidebarConfig.ts
import { Store, Gift, User, Home } from 'lucide-react';

export type SidebarItem = {
  label: string;
  path: string;
  icon: React.ElementType;
};

export const sidebarConfig: SidebarItem[] = [
  {
    label: 'Home',
    path: '/',
    icon: Home,
  },
  {
    label: 'Marketplace',
    path: '/marketplace',
    icon: Store,
  },
  {
    label: 'Rewards',
    path: '/rewards',
    icon: Gift,
  },
  {
    label: 'My Library',
    path: '/myLibrary',
    icon: User,
  },
];
