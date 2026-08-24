import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Plus, Users, Shield, Trash2, Edit, Key } from 'lucide-react';
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

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">Manage platform users, roles, and access permissions.</p>
        </div>
        <Button onClick={() => setShowInviteModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>
      
      {/* TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openPasswordModal(user)} className="h-8 w-8 p-0 text-slate-400 hover:text-amber-600" title="Reset Password">
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openRoleModal(user)} className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600" title="Change Role">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} className="h-8 w-8 p-0 text-slate-400 hover:text-red-600" title="Delete User">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-900">Invite User</h3>
            </div>
            <form onSubmit={handleInviteUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input required className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 border-slate-200" value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input required className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 border-slate-200" value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 border-slate-200" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 border-slate-200" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                <input required type="text" className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 border-slate-200 bg-slate-50" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSubmitting}>{isSubmitting ? 'Inviting...' : 'Invite User'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLE MODAL */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-900">Change Role</h3>
            </div>
            <form onSubmit={handleUpdateRole} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-3">Update role for <strong>{selectedUser.firstName} {selectedUser.lastName}</strong></p>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Role</label>
                <select className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 border-slate-200" value={newRole} onChange={e => setNewRole(e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowRoleModal(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Role'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* PASSWORD MODAL */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-900">Reset Password</h3>
            </div>
            <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-3">Set new password for <strong>{selectedUser.firstName} {selectedUser.lastName}</strong></p>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input required type="text" className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 border-slate-200" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Reset Password'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
