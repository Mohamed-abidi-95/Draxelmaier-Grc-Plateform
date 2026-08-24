import React from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-app-bg text-text-primary font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-sidebar-width min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
