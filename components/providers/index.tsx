'use client';

import NiceModal from '@ebay/nice-modal-react';
import WalletContextProvider from 'components/providers/WalletContextProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NiceModal.Provider>
      <WalletContextProvider>{children}</WalletContextProvider>
    </NiceModal.Provider>
  );
}
