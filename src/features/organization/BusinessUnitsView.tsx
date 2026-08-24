import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Plus, Building2, ChevronRight, ChevronDown, Building, FolderTree } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { apiFetch } from '../../lib/apiClient';

interface BusinessUnit {
  id: string;
  name: string;
  organizationId: string;
  parentId: string | null;
  children: BusinessUnit[];
}

const BusinessUnitNode = ({ unit, depth = 0, onAdd }: { unit: BusinessUnit; depth?: number, onAdd: (parentId: string) => void }) => {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div className="flex flex-col">
      <div 
        className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg group cursor-pointer transition-colors"
        style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-6 h-6 flex items-center justify-center shrink-0">
          {unit.children && unit.children.length > 0 ? (
            expanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />
          ) : (
            <div className="w-4" />
          )}
        </div>
        <div className={`w-8 h-8 rounded-md flex items-center justify-center shadow-sm shrink-0 ${depth === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
          {depth === 0 ? <Building2 className="h-4 w-4" /> : <Building className="h-4 w-4" />}
        </div>
        <span className={`font-medium ${depth === 0 ? 'text-slate-900' : 'text-slate-700'}`}>
          {unit.name}
        </span>
        <Badge className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {unit.children.length} sub-units
        </Badge>
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={(e: any) => { e.stopPropagation(); onAdd(unit.id); }}>
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
      </div>
      
      {expanded && unit.children && unit.children.length > 0 && (
        <div className="flex flex-col">
          {unit.children.map(child => (
            <BusinessUnitNode key={child.id} unit={child} depth={depth + 1} onAdd={onAdd} />
          ))}
        </div>
      )}
    </div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 ${className || ''}`}>
    {children}
  </span>
);

export const BusinessUnitsView = () => {
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: '', parentId: null as string | null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const fetchUnits = async () => {
    try {
      const data = await apiFetch('/api/v1/businessunits');
      setUnits(data);
    } catch (err) {
      console.error(err);
      // fallback dummy data for demo
      setUnits([
        {
          id: '1',
          name: 'Global HQ',
          organizationId: '0000',
          parentId: null,
          children: [
            {
              id: '2',
              name: 'Information Security',
              organizationId: '0000',
              parentId: '1',
              children: []
            },
            {
              id: '3',
              name: 'Human Resources',
              organizationId: '0000',
              parentId: '1',
              children: []
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const openNewUnitModal = (parentId: string | null = null) => {
    setNewUnit({ name: '', parentId });
    setShowModal(true);
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit.name.trim()) return;

    try {
      setIsSubmitting(true);
      await apiFetch('/api/v1/businessunits', {
        method: 'POST',
        body: JSON.stringify({
          name: newUnit.name,
          parentId: newUnit.parentId
        })
      });
      addToast('success', 'Business unit created successfully');
      setShowModal(false);
      fetchUnits();
    } catch (error) {
      console.error('Failed to create business unit', error);
      addToast('error', 'Failed to create business unit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Business Units</h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">Manage the organizational hierarchy and departments.</p>
        </div>
        <Button onClick={() => openNewUnitModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          New Unit
        </Button>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading hierarchy...</div>
        ) : units.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center">
            <Building2 className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No Business Units</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Get started by creating your primary organizational unit.</p>
            <Button onClick={() => openNewUnitModal()}><Plus className="h-4 w-4 mr-2" /> Add Root Unit</Button>
          </div>
        ) : (
          <div className="flex flex-col py-2">
            {units.map(unit => (
              <BusinessUnitNode key={unit.id} unit={unit} onAdd={openNewUnitModal} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-900">
                {newUnit.parentId ? 'Add Sub-Unit' : 'Add Root Unit'}
              </h3>
            </div>
            
            <form onSubmit={handleCreateUnit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit Name</label>
                <input 
                  autoFocus
                  required 
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-slate-200"
                  value={newUnit.name}
                  onChange={e => setNewUnit({...newUnit, name: e.target.value})}
                  placeholder="e.g. Sales, Marketing, EMEA..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Unit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
