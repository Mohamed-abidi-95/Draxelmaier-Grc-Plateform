import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../../features/auth/AuthContext';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: 'dashboard', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'RiskOwner', 'Auditor', 'PolicyOwner'] },
  { id: 'business-units', path: '/business-units', label: 'Business Units', icon: 'account_tree', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO'] },
  { id: 'users', path: '/users', label: 'Users & Roles', icon: 'group', allowedRoles: ['Administrator'] },
  { id: 'documents', path: '/documents', label: 'Documents & Policies', icon: 'description', allowedRoles: ['Administrator', 'ComplianceOfficer', 'PolicyOwner', 'CISO', 'Auditor', 'PolicyApprover', 'EndUser', 'RiskOwner'] },
  { id: 'controls', path: '/controls', label: 'Controls', icon: 'settings_input_component', allowedRoles: ['Administrator', 'ComplianceOfficer', 'RiskOwner', 'CISO', 'Auditor'] },
  { id: 'risks', path: '/risks', label: 'Risk Register', icon: 'warning', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'RiskOwner', 'Auditor'] },
  { id: 'assets', path: '/assets', label: 'Asset Inventory', icon: 'dns', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'RiskOwner', 'Auditor'] },
  { id: 'risk-assessments', path: '/risk-assessments', label: 'Risk Assessments', icon: 'track_changes', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'RiskOwner', 'Auditor'] },
  { id: 'risk-treatments', path: '/risk-treatments', label: 'Risk Treatments', icon: 'health_and_safety', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'RiskOwner', 'Auditor'] },
  { id: 'compliance', path: '/compliance', label: 'Frameworks', icon: 'verified_user', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'Auditor'] },
  { id: 'audits', path: '/audits', label: 'Audits', icon: 'gavel', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'Auditor'] },
  { id: 'activity-logs', path: '/activity-logs', label: 'Activity Logs', icon: 'history', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO'] },
  { id: 'ai', path: '/ai', label: 'Intelligence', icon: 'psychology', allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO'] },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const hasAccess = (allowedRoles?: string[]) => {
    if (!allowedRoles) return true;
    if (!user || !user.roles) return false;
    return user.roles.some(r => allowedRoles.includes(r));
  };

  const filteredItems = SIDEBAR_ITEMS.filter(item => hasAccess(item.allowedRoles));

  return (
    <nav className="hidden md:flex flex-col h-screen overflow-y-auto px-density-tight py-margin-desktop fixed left-0 w-sidebar-width border-r border-border bg-surface-secondary z-50">
      
      {/* Brand Header */}
      <div className="px-3 mb-8 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[18px]">shield</span>
          </div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Shield GRC</h1>
        </div>
        <p className="font-label-sm text-label-sm text-text-tertiary ml-10">Enterprise Platform</p>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 space-y-1 px-1">
        {filteredItems.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded transition-colors duration-200 ${
                isActive 
                  ? 'bg-surface-variant text-primary font-bold border-r-4 border-primary' 
                  : 'text-text-secondary hover:bg-surface-container-low'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span 
                  className={`material-symbols-outlined text-[20px] transition-colors ${
                    isActive ? 'text-primary' : 'text-text-secondary'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Start Audit Button */}
      <div className="px-3 mt-8">
        <button 
          onClick={() => navigate('/audits')}
          className="w-full py-2 bg-primary text-on-primary font-label-md text-label-md rounded shadow-sm hover:bg-primary-container transition-colors flex justify-center items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">play_arrow</span>
          Start Audit
        </button>
      </div>

      {/* Bottom Profile & Settings */}
      <div className="mt-8 space-y-1 px-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-text-secondary hover:bg-surface-container-low transition-colors duration-200 text-left">
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="font-label-md text-label-md">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded text-text-secondary hover:bg-surface-container-low transition-colors duration-200 text-left">
          <span className="material-symbols-outlined text-[20px]">help</span>
          <span className="font-label-md text-label-md">Support</span>
        </button>

        <div className="pt-4 mt-4 border-t border-border flex items-center justify-between px-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-on-primary">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-primary">{user?.firstName}</span>
              <span className="text-[10px] text-text-tertiary uppercase tracking-wider">{user?.roles?.[0] || 'User'}</span>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="text-text-tertiary hover:text-error transition-colors p-1 rounded hover:bg-error-container"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>

    </nav>
  );
};
