import React from 'react';
import SideBar from './SideBar';

type PublicLayoutProps = {
  children: React.ReactNode;
};

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen">
      <div className="md:grid md:grid-cols-[224px_1fr] gap-0">
        <main className="p-1 lg:p-4">{children}</main>
      </div>
    </div>
  );
};

export default PublicLayout;
