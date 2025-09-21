import React from "react";
import SideBar from "./SideBar";

type PublicLayoutProps = {
  children: React.ReactNode;
};

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-[#f6f4ed]">
      {/* Sidebar */}
      <SideBar />

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default PublicLayout;
