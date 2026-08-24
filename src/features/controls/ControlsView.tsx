import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
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
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredControls = controls.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-[1440px] mx-auto w-full animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
            </div>
            <h1 className="font-headline-lg text-text-primary tracking-tight">Internal Controls</h1>
          </div>
          <p className="font-body-md text-text-secondary mt-2">Manage and define mitigating controls for your organization.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90 text-white shadow-sm px-4 py-2 flex items-center gap-2 rounded-lg transition-all hover:shadow-md">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create Control
        </Button>
      </div>

      <section className="bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-border bg-surface-secondary/50 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-text-tertiary">search</span>
            <input 
              placeholder="Search controls..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 font-body-sm text-text-primary bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-surface/50 border-b border-border">
              <tr>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Control Name</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Description</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold w-40">Created Date</th>
                <th className="px-5 py-3 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-text-primary divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-4 border-surface-container border-t-primary rounded-full animate-spin"></div>
                      <p className="font-body-sm text-text-secondary">Loading controls...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredControls.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-text-tertiary">
                      <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">policy</span>
                      <h3 className="font-headline-sm text-text-primary">No controls found</h3>
                      <p className="font-body-sm text-text-secondary">Get started by creating your first internal control.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredControls.map(control => (
                  <tr key={control.id} className="hover:bg-surface-secondary/50 transition-colors group cursor-pointer" onClick={() => setSelectedControl(control)}>
                    <td className="px-5 py-4 font-medium text-text-primary">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-success/10 flex items-center justify-center text-success">
                          <span className="material-symbols-outlined text-[18px]">verified_user</span>
                        </div>
                        {control.name}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-text-secondary max-w-md">
                      <div className="truncate" title={control.description}>{control.description}</div>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      {new Date(control.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedControl(control); }}
                        className="text-primary hover:text-primary/80 font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg"
                      >
                        Details <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-border scale-in-center">
            
            <div className="px-6 py-5 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">add_moderator</span>
                </div>
                <h3 className="font-headline-sm text-text-primary">Create New Control</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-secondary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateControl} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Control Name</label>
                <input 
                  required 
                  autoFocus
                  value={newControl.name}
                  onChange={(e: any) => setNewControl({...newControl, name: e.target.value})}
                  placeholder="e.g., Access Review Policy"
                  className="w-full px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Description</label>
                <textarea 
                  required
                  className="w-full h-24 px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary resize-none"
                  value={newControl.description}
                  onChange={(e: any) => setNewControl({...newControl, description: e.target.value})}
                  placeholder="Describe the control and its purpose..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-2">
                <Button type="button" variant="outline" className="px-5 font-medium border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="px-5 bg-primary hover:bg-primary/90 text-white font-medium flex items-center gap-2">
                  Save Control
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedControl && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-border scale-in-center relative">
            <div className="px-6 py-5 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-success text-[18px]">verified_user</span>
                </div>
                <h3 className="font-headline-sm text-text-primary">Control Details</h3>
              </div>
              <button 
                onClick={() => setSelectedControl(null)}
                className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-secondary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <h4 className="font-label-md text-text-tertiary uppercase tracking-wider mb-1.5">Name</h4>
                <p className="font-body-md text-text-primary font-medium">{selectedControl.name}</p>
              </div>
              <div>
                <h4 className="font-label-md text-text-tertiary uppercase tracking-wider mb-1.5">Description</h4>
                <div className="font-body-sm text-text-secondary bg-surface-secondary p-4 rounded-xl border border-border whitespace-pre-wrap leading-relaxed">
                  {selectedControl.description}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 p-4 bg-surface-container-low rounded-xl border border-border">
                <div>
                  <h4 className="font-label-sm text-text-tertiary uppercase tracking-wider mb-1">ID</h4>
                  <p className="font-mono text-xs text-text-secondary break-all">{selectedControl.id.split('-')[0]}...</p>
                </div>
                <div>
                  <h4 className="font-label-sm text-text-tertiary uppercase tracking-wider mb-1">Created At</h4>
                  <p className="font-body-sm font-medium text-text-secondary">{new Date(selectedControl.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-border bg-surface-secondary/50 flex justify-end">
              <Button onClick={() => setSelectedControl(null)} className="px-5 font-medium border-border text-text-secondary hover:bg-surface hover:text-text-primary">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
