import React from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout = () => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground selection:bg-primary selection:text-primary-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 lg:px-8 bg-[#f9fafb] dark:bg-background">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
