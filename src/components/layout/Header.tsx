import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../features/auth/AuthContext';

export const Header = ({ onToggleSidebar }: { onToggleSidebar?: () => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex justify-between items-center w-full px-6 h-16 z-40 bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 shrink-0">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleSidebar}
            className="p-1.5 -ml-2 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-secondary transition-colors"
            title="Afficher/Masquer le menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[18px]">domain</span>
          </div>
          <span className="font-headline-sm text-text-primary tracking-tight">Global HQ</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-1 bg-surface-secondary/50 p-1 rounded-lg border border-border/50">
          <button className="px-3 py-1.5 rounded-md font-label-md text-text-secondary hover:text-text-primary hover:bg-surface transition-all shadow-sm">
            Workspaces
          </button>
          <button className="px-3 py-1.5 rounded-md font-label-md text-text-secondary hover:text-text-primary hover:bg-surface transition-all">
            Admin Console
          </button>
        </nav>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Actions */}
        <div className="flex items-center gap-1 border-r border-border pr-3">
          <button 
            title="Activity History"
            onClick={() => navigate('/activity-logs')}
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-text-tertiary hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">history</span>
          </button>
          
          <button 
            title="Notifications"
            className="flex items-center justify-center w-9 h-9 rounded-full text-text-tertiary hover:text-text-primary hover:bg-surface-secondary transition-colors relative"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
          </button>
          
          <button 
            title="Shield AI Copilot"
            onClick={() => navigate('/intelligence')}
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-text-tertiary hover:text-primary hover:bg-primary/10 transition-colors relative group"
          >
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface group-hover:border-primary/10 transition-colors animate-pulse"></span>
          </button>
        </div>

        {/* Primary Action */}
        <button 
          onClick={() => navigate('/risk-assessments')}
          className="font-label-md text-primary bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all flex items-center gap-2 font-medium"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span className="hidden sm:inline">New Assessment</span>
        </button>
        
        {/* User Profile */}
        <div 
          className="w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center text-xs font-bold text-text-secondary border-2 border-surface shadow-sm cursor-pointer hover:border-primary/30 transition-all shrink-0 ml-2"
          title={`${user?.firstName} ${user?.lastName}`}
        >
          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
        </div>
      </div>
    </header>
  );
};
