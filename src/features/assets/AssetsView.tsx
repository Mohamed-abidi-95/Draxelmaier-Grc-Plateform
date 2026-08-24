import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Server, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
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
    return assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  }, [assets, search]);

  const getCriticalityBadge = (criticality: number) => {
    switch (criticality) {
      case 3: return <Badge variant="destructive" className="bg-rose-100 text-rose-700 border-rose-200">Critical</Badge>;
      case 2: return <Badge variant="default" className="bg-orange-100 text-orange-700 border-orange-200">High</Badge>;
      case 1: return <Badge variant="default" className="bg-amber-100 text-amber-700 border-amber-200">Medium</Badge>;
      default: return <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200">Low</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Asset Inventory</h2>
          <p className="text-slate-500 text-sm mt-1">Manage IT assets, applications, and infrastructure.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search assets..." 
            className="pl-9 bg-white" 
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[12px] font-semibold">
              <tr>
                <th className="px-6 py-3 font-semibold">Asset Name</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Criticality</th>
                <th className="px-4 py-3 font-semibold">Owner</th>
                <th className="px-4 py-3 font-semibold">Date Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading assets...</td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Server className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-slate-900">No assets found</p>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-[#F0F4F8] transition-colors">
                    <td className="px-6 py-4 h-[64px] align-middle">
                      <div className="text-[14px] font-medium text-slate-900 flex items-center gap-2">
                        <Server className="h-4 w-4 text-indigo-500" />
                        {asset.name}
                      </div>
                      <div className="text-[12px] text-slate-500 mt-0.5 ml-6">{asset.description}</div>
                    </td>
                    <td className="px-4 py-4 align-middle text-[13px] text-slate-700 font-medium">
                      {asset.type}
                    </td>
                    <td className="px-4 py-4 align-middle">
                      {getCriticalityBadge(asset.criticality)}
                    </td>
                    <td className="px-4 py-4 align-middle text-[13px] text-slate-500">
                      {asset.ownerName}
                    </td>
                    <td className="px-4 py-4 align-middle text-[13px] text-slate-500">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-900">Add New Asset</h3>
            </div>
            
            <form onSubmit={handleCreateAsset} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Asset Name</label>
                <Input 
                  required 
                  value={newAsset.name}
                  onChange={(e: any) => setNewAsset({...newAsset, name: e.target.value})}
                  placeholder="e.g. Core Database Server"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 border-slate-200 text-sm"
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Criticality</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 border-slate-200 text-sm"
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  className="w-full h-24 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-slate-200 resize-none"
                  value={newAsset.description}
                  onChange={e => setNewAsset({...newAsset, description: e.target.value})}
                  placeholder="Brief description of the asset's purpose..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Asset</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
