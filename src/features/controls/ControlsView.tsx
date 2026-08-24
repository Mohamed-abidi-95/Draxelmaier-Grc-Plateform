import React, { useState, useEffect } from 'react';
import { Plus, Search, Settings2, ShieldCheck, FileText, ArrowUpRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';

interface Control {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export const ControlsView = () => {
  const [controls, setControls] = useState<Control[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const [newControl, setNewControl] = useState({ name: '', description: '' });
  const { user } = useAuth();

  const loadControls = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await apiFetch(`/api/v1/controls?organizationId=${user.organizationId}`);
      setControls(data || []);
    } catch (error) {
      console.error('Failed to load controls', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadControls();
  }, [user]);

  const handleCreateControl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await apiFetch('/api/v1/controls', {
        method: 'POST',
        body: JSON.stringify({
          name: newControl.name,
          description: newControl.description,
          organizationId: user.organizationId
        })
      });
      setShowModal(false);
      setNewControl({ name: '', description: '' });
      loadControls();
    } catch (error) {
      console.error('Failed to create control', error);
      alert('Failed to create control');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Internal Controls</h2>
          <p className="text-slate-500 text-sm mt-1">Manage and define mitigating controls for your organization.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4" />
          Create Control
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search controls..." className="pl-9 bg-white border-slate-200" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-6 py-4">Control Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                    Loading controls...
                  </td>
                </tr>
              ) : controls.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Settings2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-slate-900">No controls found</p>
                    <p className="text-sm mt-1">Get started by creating your first internal control.</p>
                  </td>
                </tr>
              ) : (
                controls.map(control => (
                  <tr key={control.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        {control.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-md truncate">
                      {control.description}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(control.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedControl(control)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end w-full gap-1"
                      >
                        View Details <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-900">Create New Control</h3>
            </div>
            
            <form onSubmit={handleCreateControl} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Control Name</label>
                <Input 
                  required 
                  value={newControl.name}
                  onChange={(e: any) => setNewControl({...newControl, name: e.target.value})}
                  placeholder="e.g., Access Review Policy"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  required
                  className="w-full h-24 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-slate-200 resize-none"
                  value={newControl.description}
                  onChange={(e: any) => setNewControl({...newControl, description: e.target.value})}
                  placeholder="Describe the control and its purpose..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Save Control
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedControl && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Control Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Name</h4>
                <p className="text-sm font-medium text-slate-900">{selectedControl.name}</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</h4>
                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                  {selectedControl.description}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">ID</h4>
                  <p className="text-xs font-mono text-slate-600 break-all" title={selectedControl.id}>{selectedControl.id}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Created At</h4>
                  <p className="text-xs text-slate-600">{new Date(selectedControl.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <Button onClick={() => setSelectedControl(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
