import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { apiFetch } from '../../lib/apiClient';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const ROLES = [
  'Administrator',
  'ComplianceOfficer',
  'RiskOwner',
  'PolicyOwner',
  'CISO',
  'Auditor',
  'PolicyApprover',
  'EndUser'
];

export const UsersView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', role: 'RiskOwner', password: 'TempPassword123!' });
  const [newRole, setNewRole] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [search, setSearch] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/v1/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await apiFetch('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(newUser)
      });
      addToast('success', 'User invited successfully');
      setShowInviteModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to invite user', error);
      addToast('error', 'Failed to invite user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      await apiFetch(`/api/v1/users/${selectedUser.id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      addToast('success', 'Role updated successfully');
      setShowRoleModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update role', error);
      addToast('error', 'Failed to update role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiFetch(`/api/v1/users/${id}`, { method: 'DELETE' });
      addToast('success', 'User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user', error);
      addToast('error', 'Failed to delete user');
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const openPasswordModal = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      await apiFetch(`/api/v1/users/${selectedUser.id}/password`, {
        method: 'PUT',
        body: JSON.stringify({ newPassword })
      });
      addToast('success', 'Password reset successfully');
      setShowPasswordModal(false);
    } catch (error: any) {
      console.error('Failed to reset password', error);
      addToast('error', error.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.firstName.toLowerCase().includes(search.toLowerCase()) || 
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const getRoleColor = (role: string) => {
    if (role === 'Administrator' || role === 'CISO') return "bg-error/10 text-error border-error/20";
    if (role === 'ComplianceOfficer' || role === 'Auditor') return "bg-warning/10 text-warning border-warning/20";
    if (role === 'RiskOwner' || role === 'PolicyOwner' || role === 'PolicyApprover') return "bg-primary/10 text-primary border-primary/20";
    return "bg-surface-container-low text-text-secondary border-border";
  };

  const getRoleIcon = (role: string) => {
    if (role === 'Administrator') return 'admin_panel_settings';
    if (role === 'CISO') return 'local_police';
    if (role === 'Auditor' || role === 'ComplianceOfficer') return 'policy';
    if (role === 'RiskOwner') return 'gavel';
    if (role === 'PolicyOwner' || role === 'PolicyApprover') return 'description';
    return 'person';
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-[1440px] mx-auto w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">group</span>
            </div>
            <h1 className="font-headline-lg text-text-primary tracking-tight">User Management</h1>
          </div>
          <p className="font-body-md text-text-secondary mt-2">Manage platform users, roles, and granular access permissions.</p>
        </div>
        <Button onClick={() => setShowInviteModal(true)} className="bg-primary hover:bg-primary/90 text-white shadow-sm px-4 py-2 flex items-center gap-2 rounded-lg transition-all hover:shadow-md">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Invite User
        </Button>
      </div>
      
      <section className="bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        <div className="px-5 py-4 border-b border-border bg-surface-secondary/50 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-text-tertiary">search</span>
            <input 
              placeholder="Search users by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 font-body-sm text-text-primary bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-surface/50 border-b border-border">
              <tr>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">User</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Email Contact</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Assigned Role</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold text-right w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-text-primary divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-4 border-surface-container border-t-primary rounded-full animate-spin"></div>
                      <p className="font-body-sm text-text-secondary">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-text-tertiary">
                      <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">person_search</span>
                      <h3 className="font-headline-sm text-text-primary">No users found</h3>
                      <p className="font-body-sm text-text-secondary">Invite users to start collaborating.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-surface-secondary/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-surface-container-low border border-border flex items-center justify-center text-text-secondary font-bold text-[13px]">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div className="font-medium text-text-primary leading-tight">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      <a href={`mailto:${user.email}`} className="hover:text-primary hover:underline transition-colors flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-text-tertiary">mail</span>
                        {user.email}
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getRoleColor(user.role)}`}>
                        <span className="material-symbols-outlined text-[14px] mr-1.5">{getRoleIcon(user.role)}</span>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => openPasswordModal(user)} className="h-8 w-8 p-0 text-text-tertiary hover:text-warning hover:bg-warning/10 rounded-md" title="Reset Password">
                          <span className="material-symbols-outlined text-[18px]">key</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openRoleModal(user)} className="h-8 w-8 p-0 text-text-tertiary hover:text-primary hover:bg-primary/10 rounded-md" title="Change Role">
                          <span className="material-symbols-outlined text-[18px]">shield_person</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} className="h-8 w-8 p-0 text-text-tertiary hover:text-error hover:bg-error/10 rounded-md" title="Delete User">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showInviteModal && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-border scale-in-center">
            <div className="px-6 py-5 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">person_add</span>
                </div>
                <h3 className="font-headline-sm text-text-primary">Invite New User</h3>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-secondary">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleInviteUser} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block font-label-md text-text-secondary uppercase tracking-wider">First Name</label>
                  <input required className="w-full px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary" value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-label-md text-text-secondary uppercase tracking-wider">Last Name</label>
                  <input required className="w-full px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary" value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Email Address</label>
                <input required type="email" className="w-full px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Assigned Role</label>
                <select className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-lg font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Temporary Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-text-tertiary">key</span>
                  <input required type="text" className="w-full pl-10 pr-4 py-2.5 font-body-sm text-text-primary bg-surface-container-low border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                </div>
                <p className="font-body-sm text-text-tertiary text-[12px] mt-1">User will be prompted to change this upon first login.</p>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-2">
                <Button type="button" variant="outline" className="px-5 font-medium border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary" onClick={() => setShowInviteModal(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" className="px-5 bg-primary hover:bg-primary/90 text-white font-medium flex items-center gap-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Inviting...' : 'Invite User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLE MODAL */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-border scale-in-center">
            <div className="px-6 py-5 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">manage_accounts</span>
                </div>
                <h3 className="font-headline-sm text-text-primary">Change Role</h3>
              </div>
              <button onClick={() => setShowRoleModal(false)} className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-secondary">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdateRole} className="p-6 space-y-5">
              <div>
                <p className="font-body-sm text-text-secondary mb-4">Update role for <strong className="text-text-primary font-semibold">{selectedUser.firstName} {selectedUser.lastName}</strong></p>
                <div className="space-y-1.5">
                  <label className="block font-label-md text-text-secondary uppercase tracking-wider">New Role</label>
                  <select className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-lg font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all" value={newRole} onChange={e => setNewRole(e.target.value)}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button type="button" variant="outline" className="px-5 font-medium border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary" onClick={() => setShowRoleModal(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" className="px-5 bg-primary hover:bg-primary/90 text-white font-medium" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Role'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD MODAL */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-border scale-in-center">
            <div className="px-6 py-5 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-warning text-[18px]">password</span>
                </div>
                <h3 className="font-headline-sm text-text-primary">Reset Password</h3>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-secondary">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleUpdatePassword} className="p-6 space-y-5">
              <div>
                <p className="font-body-sm text-text-secondary mb-4">Set new password for <strong className="text-text-primary font-semibold">{selectedUser.firstName} {selectedUser.lastName}</strong></p>
                <div className="space-y-1.5">
                  <label className="block font-label-md text-text-secondary uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-text-tertiary">lock_reset</span>
                    <input required type="text" className="w-full pl-10 pr-4 py-2.5 font-body-sm text-text-primary bg-surface-container-low border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-warning/20 focus:border-warning transition-all font-mono" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button type="button" variant="outline" className="px-5 font-medium border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary" onClick={() => setShowPasswordModal(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" className="px-5 bg-warning hover:bg-warning/90 text-white font-medium" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Reset Password'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
