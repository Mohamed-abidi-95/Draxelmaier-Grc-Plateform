import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';

export const AuditsView = () => {
  const [audits, setAudits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAudit, setNewAudit] = useState({ title: '', description: '', targetFrameworkId: '' });
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const loadData = async () => {
    try {
      const [auditsData, fwData] = await Promise.all([
        apiFetch('/api/v1/audits'),
        apiFetch('/api/v1/frameworks')
      ]);
      setAudits(auditsData || []);
      setFrameworks(fwData || []);
    } catch (err) {
      console.error('Failed to load audits', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await apiFetch('/api/v1/audits', {
        method: 'POST',
        body: JSON.stringify({
          title: newAudit.title,
          description: newAudit.description,
          organizationId: user.organizationId,
          auditorId: user.id,
          targetFrameworkId: newAudit.targetFrameworkId || null,
          plannedDate: new Date().toISOString()
        })
      });
      setShowModal(false);
      setNewAudit({ title: '', description: '', targetFrameworkId: '' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateResult = async (id: string, result: string) => {
    try {
      await apiFetch(`/api/v1/audits/${id}/result`, {
        method: 'PATCH',
        body: JSON.stringify({
          auditId: id,
          status: 'Completed',
          result: result
        })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Completed') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-success/10 text-success border border-success/20">COMPLETED</span>;
    if (status === 'InProgress') return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">IN PROGRESS</span>;
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-surface-container-low text-text-tertiary border border-border">PLANNED</span>;
  };

  const getResultBadge = (result: string) => {
    if (result === 'Compliant') return <span className="inline-flex items-center gap-1 font-bold text-success"><span className="material-symbols-outlined text-[16px]">check_circle</span> Pass</span>;
    if (result === 'NonCompliant') return <span className="inline-flex items-center gap-1 font-bold text-error"><span className="material-symbols-outlined text-[16px]">cancel</span> Fail</span>;
    if (result === 'NeedsImprovement') return <span className="inline-flex items-center gap-1 font-bold text-warning"><span className="material-symbols-outlined text-[16px]">warning</span> Needs Imp.</span>;
    return <span className="text-text-tertiary">-</span>;
  };

  const filteredAudits = useMemo(() => {
    return audits.filter(a => 
      a.title?.toLowerCase().includes(search.toLowerCase()) || 
      a.description?.toLowerCase().includes(search.toLowerCase()) ||
      a.targetFrameworkName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [audits, search]);

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-[1440px] mx-auto w-full animate-fade-in pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">fact_check</span>
            </div>
            <h1 className="font-headline-lg text-text-primary tracking-tight">Audits & Assessments</h1>
          </div>
          <p className="font-body-md text-text-secondary mt-2">Track internal and external audit engagements and their outcomes.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90 text-white shadow-sm px-4 py-2 flex items-center gap-2 rounded-lg transition-all hover:shadow-md">
          <span className="material-symbols-outlined text-[18px]">add_box</span>
          Schedule Audit
        </Button>
      </div>

      <section className="bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-border bg-surface-secondary/50 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-text-tertiary">search</span>
            <input 
              placeholder="Search audits by title, description or framework..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 font-body-sm text-text-primary bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Data List */}
        <div className="flex-1 p-5 bg-surface-secondary/20">
          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-8 h-8 border-4 border-surface-container border-t-primary rounded-full animate-spin"></div>
                <p className="font-body-sm text-text-secondary">Loading audits...</p>
              </div>
            ) : filteredAudits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-[48px] opacity-50 mb-2 text-text-tertiary">assignment_turned_in</span>
                <h3 className="font-headline-sm text-text-primary mb-1">No audits found</h3>
                <p className="font-body-sm text-text-secondary">Get started by scheduling your first audit.</p>
              </div>
            ) : filteredAudits.map((audit) => (
              <div key={audit.id} className="bg-surface border border-border rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center gap-6 group">
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-[11px] text-text-tertiary bg-surface-secondary px-2 py-0.5 rounded border border-border">{audit.id.substring(0,8)}</span>
                    {getStatusBadge(audit.status)}
                  </div>
                  <h3 className="font-headline-sm text-text-primary mb-1 truncate">{audit.title}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 font-body-sm text-text-secondary mt-2">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-text-tertiary">library_books</span>
                      {audit.targetFrameworkName ? audit.targetFrameworkName : 'General Audit (No specific framework)'}
                    </span>
                    <span className="hidden sm:inline text-text-tertiary">•</span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-text-tertiary">calendar_today</span>
                      {new Date(audit.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {audit.description && (
                    <p className="font-body-sm text-text-secondary mt-3 max-w-3xl line-clamp-2">{audit.description}</p>
                  )}
                </div>
                
                <div className="w-full md:w-32 shrink-0 flex flex-col md:items-end gap-1">
                  <span className="font-label-sm text-text-tertiary uppercase tracking-wider">Result</span>
                  <div className="text-[14px]">
                    {getResultBadge(audit.result)}
                  </div>
                </div>

                <div className="w-full md:w-48 shrink-0 flex items-center md:justify-end gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                  {audit.status !== 'Completed' ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 md:flex-none border-success text-success hover:bg-success/10 font-medium" 
                        onClick={() => updateResult(audit.id, 'Compliant')}
                      >
                        <span className="material-symbols-outlined text-[18px] mr-1">thumb_up</span> Pass
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 md:flex-none border-error text-error hover:bg-error/10 font-medium" 
                        onClick={() => updateResult(audit.id, 'NonCompliant')}
                      >
                        <span className="material-symbols-outlined text-[18px] mr-1">thumb_down</span> Fail
                      </Button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-label-md text-text-tertiary bg-surface-secondary px-3 py-1.5 rounded-lg border border-border">
                      <span className="material-symbols-outlined text-[16px]">lock</span> Finalized
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-border scale-in-center">
            
            <div className="px-6 py-5 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">add_box</span>
                </div>
                <h3 className="font-headline-sm text-text-primary">Schedule New Audit</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-secondary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateAudit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Audit Title</label>
                <input 
                  required 
                  autoFocus
                  value={newAudit.title}
                  onChange={(e: any) => setNewAudit({...newAudit, title: e.target.value})}
                  placeholder="e.g., Annual ISO 27001 Surveillance Audit"
                  className="w-full px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Target Framework (Optional)</label>
                <select 
                  className="w-full px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  value={newAudit.targetFrameworkId}
                  onChange={(e: any) => setNewAudit({...newAudit, targetFrameworkId: e.target.value})}
                >
                  <option value="">-- General Audit (No specific framework) --</option>
                  {frameworks.map(fw => (
                    <option key={fw.id} value={fw.id}>{fw.name} v{fw.version}</option>
                  ))}
                </select>
                <p className="text-[11px] text-text-tertiary mt-1">Linking a framework allows you to assess specific requirements.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Description & Scope</label>
                <textarea 
                  className="w-full h-24 px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary resize-none"
                  value={newAudit.description}
                  onChange={(e: any) => setNewAudit({...newAudit, description: e.target.value})}
                  placeholder="Define the scope and objectives of this audit..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-2">
                <Button type="button" variant="outline" className="px-5 font-medium border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="px-5 bg-primary hover:bg-primary/90 text-white font-medium flex items-center gap-2">
                  Schedule Audit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
