import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../features/auth/AuthContext';

const SIDEBAR_GROUPS = [
  {
    title: 'Overview',
    icon: 'home',
    items: [
      { id: 'dashboard', path: '/dashboard', label: 'Dashboard', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'RiskOwner', 'Auditor', 'PolicyOwner'] }
    ]
  },
  {
    title: 'Governance',
    icon: 'account_balance',
    items: [
      { id: 'business-units', path: '/business-units', label: 'Business Units', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO'] },
      { id: 'users', path: '/users', label: 'Users & Roles', allowedRoles: ['Administrator'] },
      { id: 'documents', path: '/documents', label: 'Documents & Policies', allowedRoles: ['Administrator', 'ComplianceOfficer', 'PolicyOwner', 'CISO', 'Auditor', 'PolicyApprover', 'EndUser', 'RiskOwner'] },
      { id: 'controls', path: '/controls', label: 'Controls', allowedRoles: ['Administrator', 'ComplianceOfficer', 'RiskOwner', 'CISO', 'Auditor'] }
    ]
  },
  {
    title: 'Risk Management',
    icon: 'warning',
    items: [
      { id: 'risks', path: '/risks', label: 'Risk Register', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'RiskOwner', 'Auditor'] },
      { id: 'assets', path: '/assets', label: 'Asset Inventory', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'RiskOwner', 'Auditor'] },
      { id: 'risk-assessments', path: '/risk-assessments', label: 'Risk Assessments', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'RiskOwner', 'Auditor'] },
      { id: 'risk-treatments', path: '/risk-treatments', label: 'Risk Treatments', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'RiskOwner', 'Auditor'] }
    ]
  },
  {
    title: 'Compliance',
    icon: 'verified',
    items: [
      { id: 'compliance', path: '/compliance', label: 'Frameworks', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'Auditor'] },
      { id: 'audits', path: '/audits', label: 'Audits', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'Auditor'] },
      { id: 'findings', path: '/findings', label: 'Findings & Actions', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'Auditor'] },
      { id: 'soa', path: '/soa', label: 'SoA Report', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'Auditor'] }
    ]
  },
  {
    title: 'Intelligence',
    icon: 'auto_awesome',
    items: [
      { id: 'ai', path: '/intelligence', label: 'AI Intelligence', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO'] }
    ]
  },
  {
    title: 'Monitoring',
    icon: 'search',
    items: [
      { id: 'activity-logs', path: '/activity-logs', label: 'Activity Logs', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO'] }
    ]
  }
];

export const Sidebar = ({ isOpen = true }: { isOpen?: boolean }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for collapsible groups. By default, let's keep all open or determine by current route
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    SIDEBAR_GROUPS.reduce((acc, group) => {
      // Auto-expand if active route is in group, otherwise expand all by default for visibility
      acc[group.title] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };
  
  const hasAccess = (allowedRoles?: string[]) => {
    if (!allowedRoles) return true;
    if (!user || !user.roles) return false;
    return user.roles.some(r => allowedRoles.includes(r));
  };

  return (
    <nav className={`hidden md:flex flex-col h-screen overflow-hidden fixed left-0 w-64 border-r border-border bg-surface-secondary z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      {/* Brand Header */}
      <div className="p-5 flex flex-col gap-1 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[18px]">security</span>
          </div>
          <h1 className="font-headline-sm font-bold text-text-primary tracking-tight">SHIELDGRC</h1>
        </div>
        <p className="font-label-sm text-[10px] text-text-tertiary ml-[42px] uppercase tracking-wider">Enterprise Platform</p>
      </div>

      {/* Navigation Items (Scrollable) */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 custom-scrollbar">
        {SIDEBAR_GROUPS.map((group) => {
          const filteredItems = group.items.filter(item => hasAccess(item.allowedRoles));
          if (filteredItems.length === 0) return null;

          const isExpanded = expandedGroups[group.title];

          return (
            <div key={group.title} className="flex flex-col">
              <button 
                onClick={() => toggleGroup(group.title)}
                className="flex items-center justify-between w-full px-2 mb-1.5 group/header"
              >
                <div className="flex items-center gap-2 text-text-tertiary group-hover/header:text-text-primary transition-colors">
                  <span className="material-symbols-outlined text-[16px]">{group.icon}</span>
                  <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider">{group.title}</span>
                </div>
                {group.items.length > 1 && (
                  <span className="material-symbols-outlined text-[16px] text-text-tertiary opacity-0 group-hover/header:opacity-100 transition-all">
                    {isExpanded ? 'expand_less' : 'expand_more'}
                  </span>
                )}
              </button>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col mt-1 relative">
                  {/* Tree branch line (only if multiple items) */}
                  {filteredItems.length > 1 && (
                    <div className="absolute left-[11px] top-2 bottom-4 w-px bg-border"></div>
                  )}

                  {filteredItems.map((item, index) => {
                    const isActive = location.pathname.startsWith(item.path);
                    const isLast = index === filteredItems.length - 1;
                    const hasMultipleItems = filteredItems.length > 1;

                    return (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        className={`relative flex items-center py-1.5 px-2 rounded-lg transition-all duration-200 group/item ${
                          isActive 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                        } ${hasMultipleItems ? 'ml-6' : 'ml-1'} mb-0.5`}
                      >
                        {/* Tree branch connector */}
                        {hasMultipleItems && (
                          <div className={`absolute -left-[14px] w-3 border-t border-border ${
                            isLast ? 'top-1/2 -mt-px h-1/2 bg-surface-secondary' : 'top-1/2'
                          }`}></div>
                        )}

                        {!hasMultipleItems && (
                          <span className={`w-1.5 h-1.5 rounded-full mr-2.5 ${isActive ? 'bg-primary' : 'bg-text-tertiary/50'}`}></span>
                        )}

                        <span className="font-body-sm text-[13px] leading-5">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Profile & Settings (Sticky at bottom) */}
      <div className="shrink-0 border-t border-border/50 bg-surface-secondary/50 p-3 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary transition-colors duration-200">
          <span className="material-symbols-outlined text-[18px]">settings</span>
          <span className="font-body-sm text-[13px] font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary transition-colors duration-200">
          <span className="material-symbols-outlined text-[18px]">help</span>
          <span className="font-body-sm text-[13px] font-medium">Support</span>
        </button>

        <div className="mt-2 pt-3 border-t border-border/50 flex items-center justify-between px-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-semibold text-text-primary truncate">{user?.firstName} {user?.lastName}</span>
              <span className="text-[10px] text-text-tertiary truncate">{user?.roles?.[0] || 'User'}</span>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="text-text-tertiary hover:text-error transition-colors p-1.5 rounded-lg hover:bg-error/10 shrink-0"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>

    </nav>
  );
};
