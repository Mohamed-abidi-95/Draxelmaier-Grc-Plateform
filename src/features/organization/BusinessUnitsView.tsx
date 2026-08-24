import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
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
        className="flex items-center gap-3 p-3 hover:bg-surface-secondary rounded-lg group cursor-pointer transition-all duration-200 border border-transparent hover:border-border/50"
        style={{ paddingLeft: `${depth * 2 + 0.75}rem` }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-6 h-6 flex items-center justify-center shrink-0">
          {unit.children && unit.children.length > 0 ? (
            <span className="material-symbols-outlined text-[20px] text-text-tertiary transition-transform duration-200" style={{ transform: expanded ? 'rotate(90deg)' : 'none' }}>
              chevron_right
            </span>
          ) : (
            <div className="w-5" />
          )}
        </div>
        <div className={`w-9 h-9 rounded-md flex items-center justify-center shadow-sm shrink-0 transition-colors ${depth === 0 ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-container-low text-text-secondary border border-border/50'}`}>
          <span className="material-symbols-outlined text-[18px]">
            {depth === 0 ? 'domain' : 'corporate_fare'}
          </span>
        </div>
        <span className={`font-medium ${depth === 0 ? 'text-text-primary text-[15px]' : 'text-text-secondary text-[14px]'}`}>
          {unit.name}
        </span>
        <Badge className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {unit.children.length} sub-units
        </Badge>
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 px-3 text-xs bg-surface text-primary border border-primary/20 hover:bg-primary hover:text-white" onClick={(e: any) => { e.stopPropagation(); onAdd(unit.id); }}>
            <span className="material-symbols-outlined text-[16px] mr-1.5">add</span>
            Add Sub-Unit
          </Button>
        </div>
      </div>
      
      {expanded && unit.children && unit.children.length > 0 && (
        <div className="flex flex-col relative before:absolute before:left-5 before:top-0 before:bottom-0 before:w-px before:bg-border/50 mt-1 ml-2">
          {unit.children.map(child => (
            <BusinessUnitNode key={child.id} unit={child} depth={depth + 1} onAdd={onAdd} />
          ))}
        </div>
      )}
    </div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-variant text-text-secondary border border-border ${className || ''}`}>
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
              children: [
                {
                  id: '4',
                  name: 'Talent Acquisition',
                  organizationId: '0000',
                  parentId: '3',
                  children: []
                }
              ]
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
    <div className="flex-1 flex flex-col gap-6 max-w-[1440px] mx-auto w-full animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">account_tree</span>
            </div>
            <h1 className="font-headline-lg text-text-primary tracking-tight">Business Units</h1>
          </div>
          <p className="font-body-md text-text-secondary mt-2">Manage your organizational hierarchy and map compliance across departments.</p>
        </div>
        <Button onClick={() => openNewUnitModal()} className="bg-primary hover:bg-primary/90 text-white shadow-sm px-4 py-2 flex items-center gap-2 rounded-lg transition-all hover:shadow-md">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Unit
        </Button>
      </div>
      
      {/* Main Card */}
      <section className="bg-surface rounded-xl border border-border p-6 shadow-sm min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-text-tertiary space-y-4">
            <div className="w-8 h-8 border-4 border-surface-container border-t-primary rounded-full animate-spin"></div>
            <p className="font-body-sm text-text-secondary">Loading organizational structure...</p>
          </div>
        ) : units.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mb-4 border border-border">
              <span className="material-symbols-outlined text-[32px] text-text-tertiary">domain_disabled</span>
            </div>
            <h3 className="font-headline-sm text-text-primary mb-2">No Business Units found</h3>
            <p className="font-body-sm text-text-secondary mb-6">Get started by creating your primary organizational unit to build out your hierarchy.</p>
            <Button onClick={() => openNewUnitModal()} className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span> Add Root Unit
            </Button>
          </div>
        ) : (
          <div className="flex flex-col">
            {units.map(unit => (
              <BusinessUnitNode key={unit.id} unit={unit} onAdd={openNewUnitModal} />
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-border scale-in-center">
            
            <div className="px-6 py-5 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    {newUnit.parentId ? 'corporate_fare' : 'domain'}
                  </span>
                </div>
                <h3 className="font-headline-sm text-text-primary">
                  {newUnit.parentId ? 'Add Sub-Unit' : 'Add Root Unit'}
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-secondary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateUnit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Unit Name</label>
                <input 
                  autoFocus
                  required 
                  className="w-full px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary"
                  value={newUnit.name}
                  onChange={e => setNewUnit({...newUnit, name: e.target.value})}
                  placeholder="e.g. Sales, Information Security, EMEA..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button type="button" variant="outline" className="px-5 font-medium border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="px-5 bg-primary hover:bg-primary/90 text-white font-medium flex items-center gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Unit'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
