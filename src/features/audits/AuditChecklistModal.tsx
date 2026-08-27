import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';

interface AuditChecklistModalProps {
  auditId: string;
  auditTitle: string;
  onClose: () => void;
}

export const AuditChecklistModal: React.FC<AuditChecklistModalProps> = ({ auditId, auditTitle, onClose }) => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRequirement, setNewRequirement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const loadItems = async () => {
    try {
      const data = await apiFetch(`/api/v1/audits/${auditId}/checklist`);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [auditId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequirement.trim()) return;

    setIsSubmitting(true);
    try {
      await apiFetch(`/api/v1/audits/${auditId}/checklist`, {
        method: 'POST',
        body: JSON.stringify({ auditId, requirement: newRequirement })
      });
      setNewRequirement('');
      loadItems();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEvaluate = async (itemId: string, status: string, comments: string) => {
    try {
      await apiFetch(`/api/v1/audits/checklist/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ id: itemId, status, comments })
      });
      loadItems();
    } catch (err) {
      console.error(err);
      alert('Failed to evaluate item');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await apiFetch(`/api/v1/audits/checklist/${itemId}`, {
        method: 'DELETE'
      });
      loadItems();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Conform': return 'text-success bg-success/10 border-success/20';
      case 'NonConform': return 'text-error bg-error/10 border-error/20';
      case 'NotApplicable': return 'text-slate-600 bg-slate-100 border-slate-200';
      default: return 'text-warning bg-warning/10 border-warning/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-border">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[18px]">fact_check</span>
              </div>
              <h3 className="font-headline-sm text-text-primary">Audit Checklist</h3>
            </div>
            <p className="font-body-sm text-text-secondary mt-1">{auditTitle}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-secondary"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-container-low">
          
          {/* Add Item Form */}
          <form onSubmit={handleAddItem} className="bg-surface border border-border rounded-xl p-4 mb-6 shadow-sm flex gap-3">
            <input 
              type="text"
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Add a new requirement or control to verify..."
              className="flex-1 font-body-sm px-4 py-2 bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <Button type="submit" disabled={!newRequirement.trim() || isSubmitting} className="bg-primary text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Item
            </Button>
          </form>

          {/* Checklist */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-surface border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary bg-surface border border-border border-dashed rounded-xl">
              <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">checklist</span>
              <p className="font-body-sm">No items in the checklist yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col gap-4 hover:border-primary/30 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-medium text-text-primary flex-1 mt-1">{item.requirement}</p>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-text-tertiary hover:text-error opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Delete Item"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-surface-secondary/50 p-3 rounded-lg border border-border/50">
                    <div className="flex gap-2">
                      <select 
                        value={item.status}
                        onChange={(e) => handleEvaluate(item.id, e.target.value, item.comments)}
                        className={`font-label-md px-3 py-1.5 rounded-lg border appearance-none cursor-pointer focus:outline-none ${getStatusColor(item.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Conform">Conform</option>
                        <option value="NonConform">Non Conform</option>
                        <option value="NotApplicable">N/A</option>
                      </select>
                    </div>
                    
                    <input 
                      type="text"
                      defaultValue={item.comments}
                      onBlur={(e) => {
                        if (e.target.value !== item.comments) {
                          handleEvaluate(item.id, item.status, e.target.value);
                        }
                      }}
                      placeholder="Add comments or findings..."
                      className="flex-1 font-body-sm bg-surface px-3 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary w-full"
                    />
                    
                    {item.status === 'NonConform' && (
                      <span className="text-[11px] font-medium text-error bg-error/10 px-2 py-1 rounded flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        Create finding recommended
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface flex justify-end">
          <Button variant="outline" onClick={onClose}>Done</Button>
        </div>

      </div>
    </div>
  );
};
