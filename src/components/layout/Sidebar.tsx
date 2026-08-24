import React from 'react';
import { NavLink } from 'react-router';
import { 
  LayoutDashboard, ShieldAlert, CheckSquare, Settings2, 
  FileText, Activity, ShieldCheck, Bot, MoreHorizontal,
  ChevronRight, Target, ShieldPlus, Server, Building2, FolderTree, LogOut, Users
} from 'lucide-react';
import { Badge } from '../ui/Badge';

import { useAuth } from '../../features/auth/AuthContext';

const SIDEBAR_SECTIONS = [
  {
    title: 'Gouvernance',
    items: [
      { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'RiskOwner', 'Auditor', 'PolicyOwner'] },
      { id: 'business-units', path: '/business-units', label: 'Business Units', icon: FolderTree, allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO'] },
      { id: 'users', path: '/users', label: 'Users & Roles', icon: Users, allowedRoles: ['Administrator'] },
      { id: 'documents', path: '/documents', label: 'Documents & Policies', icon: FileText, allowedRoles: ['Administrator', 'ComplianceOfficer', 'PolicyOwner', 'CISO', 'Auditor', 'PolicyApprover', 'EndUser', 'RiskOwner'] },
      { id: 'controls', path: '/controls', label: 'Controls', icon: Settings2, allowedRoles: ['Administrator', 'ComplianceOfficer', 'RiskOwner', 'CISO', 'Auditor'] },
    ]
  },
  {
    title: 'Risk',
    items: [
      { id: 'risks', path: '/risks', label: 'Risk Register', icon: ShieldAlert, allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'RiskOwner', 'Auditor'] },
      { id: 'assets', path: '/assets', label: 'Asset Inventory', icon: Server, allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'RiskOwner', 'Auditor'] },
      { id: 'risk-assessments', path: '/risk-assessments', label: 'Risk Assessments', icon: Target, allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'RiskOwner', 'Auditor'] },
      { id: 'risk-treatments', path: '/risk-treatments', label: 'Risk Treatments', icon: ShieldPlus, allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'RiskOwner', 'Auditor'] },
    ]
  },
  {
    title: 'Compliance',
    items: [
      { id: 'compliance', path: '/compliance', label: 'Frameworks', icon: ShieldCheck, allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'Auditor'] },
      { id: 'audits', path: '/audits', label: 'Audits', icon: CheckSquare, allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO', 'Auditor'] },
      { id: 'activity-logs', path: '/activity-logs', label: 'Activity Logs', icon: Activity, allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO'] },
    ]
  },
  {
    title: 'Intelligence',
    items: [
      { id: 'ai', path: '/ai', label: 'AI Assistant', icon: Bot, allowedRoles: ['Administrator', 'ComplianceOfficer', 'CISO'] },
    ]
  }
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  
  const hasAccess = (allowedRoles?: string[]) => {
    if (!allowedRoles) return true;
    if (!user || !user.roles) return false;
    return user.roles.some(r => allowedRoles.includes(r));
  };

  const filteredSections = SIDEBAR_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => hasAccess(item.allowedRoles))
  })).filter(section => section.items.length > 0);

  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col hidden md:flex shrink-0">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5 text-slate-900 font-semibold tracking-tight text-[15px]">
          <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center shadow-sm">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          ShieldGRC
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-5 px-3">
        <div className="space-y-8">
          {filteredSections.map((section, idx) => (
            <div key={idx}>
              <h4 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                {section.title}
              </h4>
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => 
                      `w-full group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        isActive 
                          ? 'bg-white text-slate-900 font-medium shadow-sm ring-1 ring-slate-200' 
                          : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon 
                          className={`h-[18px] w-[18px] transition-colors ${
                            isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                          }`} 
                        />
                        <span className="truncate">{item.label}</span>
                        
                        {item.id === 'ai' && (
                          <span className="ml-auto flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                            Beta
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-slate-200 shrink-0 flex items-center gap-2">
        <button className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-200/50 transition-colors text-left group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white ring-1 ring-slate-900/5 shrink-0">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="truncate text-sm font-medium text-slate-900">{user?.firstName} {user?.lastName}</span>
            <span className="truncate text-xs text-slate-500">{user?.roles?.[0] || 'User'}</span>
          </div>
        </button>
        <button 
          onClick={() => logout()} 
          title="Sign out"
          className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
