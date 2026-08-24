import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';

export const AssetsView = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: '', description: '', type: 'Server', criticality: 'Medium' });
  const [search, setSearch] = useState('');

  const { user } = useAuth();

  const loadAssets = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch('/api/v1/assets');
      setAssets(data);
    } catch (error) {
      console.error('Failed to load assets', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await apiFetch('/api/v1/assets', {
        method: 'POST',
        body: JSON.stringify({
          name: newAsset.name,
          description: newAsset.description,
          type: newAsset.type,
          criticality: newAsset.criticality,
          organizationId: user.organizationId,
          ownerId: user.id
        })
      });
      setShowModal(false);
      setNewAsset({ name: '', description: '', type: 'Server', criticality: 'Medium' });
      loadAssets(); 
    } catch (error) {
      console.error('Failed to create asset', error);
      alert('Failed to create asset');
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || (a.description && a.description.toLowerCase().includes(search.toLowerCase())));
  }, [assets, search]);

  const getCriticalityBadge = (criticality: number | string) => {
    let level = "Low";
    if (criticality === 3 || criticality === "Critical") level = "Critical";
    if (criticality === 2 || criticality === "High") level = "High";
    if (criticality === 1 || criticality === "Medium") level = "Medium";

    switch (level) {
      case "Critical": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-error/10 text-error border border-error/20">Critical</span>;
      case "High": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-600 border border-orange-500/20">High</span>;
      case "Medium": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-warning/10 text-warning border border-warning/20">Medium</span>;
      default: return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-success/10 text-success border border-success/20">Low</span>;
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'Server': return 'dns';
      case 'Application': return 'apps';
      case 'Database': return 'database';
      case 'Network': return 'router';
      case 'Data': return 'folder_data';
      default: return 'devices';
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-[1440px] mx-auto w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">inventory_2</span>
            </div>
            <h1 className="font-headline-lg text-text-primary tracking-tight">Asset Inventory</h1>
          </div>
          <p className="font-body-md text-text-secondary mt-2">Manage IT assets, applications, and infrastructure across your organization.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90 text-white shadow-sm px-4 py-2 flex items-center gap-2 rounded-lg transition-all hover:shadow-md">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Asset
        </Button>
      </div>

      <section className="bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        <div className="px-5 py-4 border-b border-border bg-surface-secondary/50 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-text-tertiary">search</span>
            <input 
              placeholder="Search assets..." 
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
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Asset Name</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Type</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Criticality</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Owner</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold text-right">Date Added</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-text-primary divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-4 border-surface-container border-t-primary rounded-full animate-spin"></div>
                      <p className="font-body-sm text-text-secondary">Loading assets...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-text-tertiary">
                      <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">dns</span>
                      <h3 className="font-headline-sm text-text-primary">No assets found</h3>
                      <p className="font-body-sm text-text-secondary">Get started by registering your first IT asset.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-surface-secondary/50 transition-colors group cursor-pointer">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-surface-container-low border border-border flex items-center justify-center text-text-secondary mt-0.5 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                          <span className="material-symbols-outlined text-[20px]">{getAssetIcon(asset.type)}</span>
                        </div>
                        <div>
                          <div className="font-medium text-text-primary group-hover:text-primary transition-colors leading-tight mb-1">
                            {asset.name}
                          </div>
                          <div className="text-[12px] text-text-tertiary line-clamp-1 max-w-sm">
                            {asset.description || 'No description provided'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-text-secondary font-medium">
                      {asset.type}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      {getCriticalityBadge(asset.criticality)}
                    </td>
                    <td className="px-5 py-4 align-middle text-text-secondary">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                          {asset.ownerName?.substring(0,2).toUpperCase() || 'NA'}
                        </div>
                        {asset.ownerName || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-right text-text-tertiary font-mono text-[12px]">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-border scale-in-center">
            
            <div className="px-6 py-5 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">add_circle</span>
                </div>
                <h3 className="font-headline-sm text-text-primary">Add New Asset</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-secondary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateAsset} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Asset Name</label>
                <input 
                  required 
                  autoFocus
                  value={newAsset.name}
                  onChange={(e: any) => setNewAsset({...newAsset, name: e.target.value})}
                  placeholder="e.g. Core Database Server"
                  className="w-full px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block font-label-md text-text-secondary uppercase tracking-wider">Type</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-lg font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all"
                    value={newAsset.type}
                    onChange={(e: any) => setNewAsset({...newAsset, type: e.target.value})}
                  >
                    <option value="Server">Server</option>
                    <option value="Application">Application</option>
                    <option value="Database">Database</option>
                    <option value="Network">Network Device</option>
                    <option value="Data">Data Repository</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block font-label-md text-text-secondary uppercase tracking-wider">Criticality</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-lg font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all"
                    value={newAsset.criticality}
                    onChange={e => setNewAsset({...newAsset, criticality: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Description</label>
                <textarea 
                  className="w-full h-24 px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary resize-none"
                  value={newAsset.description}
                  onChange={e => setNewAsset({...newAsset, description: e.target.value})}
                  placeholder="Brief description of the asset's purpose..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-2">
                <Button type="button" variant="outline" className="px-5 font-medium border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="px-5 bg-primary hover:bg-primary/90 text-white font-medium flex items-center gap-2">
                  Save Asset
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
