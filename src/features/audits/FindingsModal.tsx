import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';
import { CorrectiveActionsList } from './CorrectiveActionsList';

interface Finding {
  id: string;
  auditId: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
}

interface FindingsModalProps {
  auditId: string;
  auditTitle: string;
  onClose: () => void;
}

export const FindingsModal: React.FC<FindingsModalProps> = ({ auditId, auditTitle, onClose }) => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFinding, setNewFinding] = useState({ title: '', description: '', severity: 'Medium' });
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);
  const { user } = useAuth();

  const loadFindings = async () => {
    try {
      const data = await apiFetch(`/api/v1/audits/${auditId}/findings`);
      setFindings(data || []);
    } catch (err) {
      console.error('Failed to load findings', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, [auditId]);

  const handleCreateFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(`/api/v1/audits/${auditId}/findings`, {
        method: 'POST',
        body: JSON.stringify({
          auditId,
          title: newFinding.title,
          description: newFinding.description,
          severity: parseInt(getSeverityValue(newFinding.severity)),
          dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
          assigneeId: user?.id
        })
      });
      setShowAddForm(false);
      setNewFinding({ title: '', description: '', severity: 'Medium' });
      loadFindings();
    } catch (err) {
      console.error(err);
    }
  };

  const updateFindingStatus = async (findingId: string, status: string) => {
    try {
      await apiFetch(`/api/v1/audits/findings/${findingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          findingId,
          status: parseInt(getStatusValue(status))
        })
      });
      loadFindings();
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityValue = (severity: string) => {
    switch (severity) {
      case 'Low': return '1';
      case 'Medium': return '2';
      case 'High': return '3';
      case 'Critical': return '4';
      default: return '2';
    }
  };

  const getStatusValue = (status: string) => {
    switch (status) {
      case 'Open': return '1';
      case 'InProgress': return '2';
      case 'Resolved': return '3';
      case 'Closed': return '4';
      default: return '1';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Low': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-success/10 text-success border border-success/20">LOW</span>;
      case 'Medium': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-warning/10 text-warning border border-warning/20">MEDIUM</span>;
      case 'High': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-error/10 text-error border border-error/20">HIGH</span>;
      case 'Critical': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-error text-white border border-error">CRITICAL</span>;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-error/10 text-error border border-error/20">OPEN</span>;
      case 'InProgress': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">IN PROGRESS</span>;
      case 'Resolved': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-success/10 text-success border border-success/20">RESOLVED</span>;
      case 'Closed': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-surface-container-low text-text-tertiary border border-border">CLOSED</span>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-border flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-surface-secondary/50 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-error/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-[18px]">gavel</span>
              </div>
              <h3 className="font-headline-sm text-text-primary">Audit Findings</h3>
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
        <div className="flex-1 overflow-y-auto p-6 bg-surface-secondary/20">
          {showAddForm ? (
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm mb-6 animate-in slide-in-from-top-4 duration-300">
              <h4 className="font-headline-sm text-text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">add_circle</span>
                Log New Finding
              </h4>
              <form onSubmit={handleCreateFinding} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block font-label-md text-text-secondary uppercase tracking-wider">Title</label>
                  <input 
                    required 
                    autoFocus
                    value={newFinding.title}
                    onChange={(e) => setNewFinding({...newFinding, title: e.target.value})}
                    placeholder="Brief description of the non-conformity..."
                    className="w-full px-4 py-2 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block font-label-md text-text-secondary uppercase tracking-wider">Severity</label>
                  <select 
                    value={newFinding.severity}
                    onChange={(e) => setNewFinding({...newFinding, severity: e.target.value})}
                    className="w-full px-4 py-2 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-label-md text-text-secondary uppercase tracking-wider">Detailed Description</label>
                  <textarea 
                    required
                    value={newFinding.description}
                    onChange={(e) => setNewFinding({...newFinding, description: e.target.value})}
                    placeholder="Provide detailed evidence and context..."
                    className="w-full h-24 px-4 py-2 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  <Button type="submit" className="bg-primary text-white">Save Finding</Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-headline-sm text-text-primary">Discovered Findings ({findings.length})</h4>
              <Button onClick={() => setShowAddForm(true)} className="bg-primary text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add</span> Add Finding
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-surface-container border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : findings.length === 0 && !showAddForm ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-surface border border-dashed border-border rounded-xl">
              <span className="material-symbols-outlined text-[48px] opacity-50 mb-2 text-text-tertiary">check_circle</span>
              <h3 className="font-headline-sm text-text-primary mb-1">No findings yet</h3>
              <p className="font-body-sm text-text-secondary">This audit is currently clean.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {findings.map(finding => (
                <div key={finding.id} className="bg-surface border border-border rounded-xl p-5 hover:border-border/80 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {getSeverityBadge(finding.severity)}
                      {getStatusBadge(finding.status)}
                    </div>
                    {finding.status !== 'Resolved' && finding.status !== 'Closed' && (
                      <Button size="sm" variant="outline" className="border-success text-success hover:bg-success/10" onClick={() => updateFindingStatus(finding.id, 'Resolved')}>
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                  <h5 className="font-headline-sm text-text-primary mb-2">{finding.title}</h5>
                  <p className="font-body-sm text-text-secondary">{finding.description}</p>
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-4 font-body-sm text-text-tertiary">
                    <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">calendar_today</span> {new Date(finding.createdAt).toLocaleDateString()}</span>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={`text-[12px] h-7 px-3 border-border transition-colors ${expandedFindingId === finding.id ? 'bg-surface-secondary text-text-primary' : 'hover:bg-surface-secondary'}`}
                      onClick={() => setExpandedFindingId(expandedFindingId === finding.id ? null : finding.id)}
                    >
                      <span className="material-symbols-outlined text-[14px] mr-1">task</span>
                      {expandedFindingId === finding.id ? 'Hide Action Plan' : 'View Action Plan'}
                    </Button>
                  </div>

                  {expandedFindingId === finding.id && (
                    <CorrectiveActionsList findingId={finding.id} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
