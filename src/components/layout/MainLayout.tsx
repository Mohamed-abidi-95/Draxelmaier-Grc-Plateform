import React from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="flex min-h-screen w-full bg-app-bg text-text-primary font-sans">
      <Sidebar isOpen={isSidebarOpen} />
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-[256px]' : 'ml-0'}`}>
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
