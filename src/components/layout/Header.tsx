import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../features/auth/AuthContext';

export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center w-full px-margin-desktop h-16 z-40 bg-surface border-b border-border sticky top-0 shrink-0">
      <div className="flex items-center gap-8">
        <span className="font-headline-sm text-headline-sm font-semibold text-text-primary">Global HQ</span>
        <nav className="hidden md:flex gap-6">
          <button className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors">Workspaces</button>
          <button className="font-body-md text-body-md text-text-secondary hover:text-primary transition-colors">Admin Console</button>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="hidden md:flex items-center justify-center w-8 h-8 rounded-full text-text-secondary hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[20px]">history</span>
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded-full text-text-secondary hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button 
          onClick={() => navigate('/ai')}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-full text-text-secondary hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">smart_toy</span>
        </button>
        <button 
          onClick={() => navigate('/audits')}
          className="font-label-md text-label-md text-primary border border-border px-3 py-1.5 rounded hover:bg-surface-container-low transition-colors"
        >
          New Assessment
        </button>
        
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-on-primary border border-border shrink-0">
          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
        </div>
      </div>
    </header>
  );
};
