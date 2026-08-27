import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/apiClient';
import { Button } from '../../components/ui/Button';

export const SoAView = () => {
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('');
  const [soaReport, setSoaReport] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // For inline editing
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [editIsApplicable, setEditIsApplicable] = useState(true);
  const [editJustification, setEditJustification] = useState('');

  useEffect(() => {
    loadFrameworks();
  }, []);

  const loadFrameworks = async () => {
    try {
      const data = await apiFetch('/api/v1/frameworks');
      setFrameworks(data);
      if (data && data.length > 0) {
        setSelectedFrameworkId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedFrameworkId) {
      loadSoA(selectedFrameworkId);
    }
  }, [selectedFrameworkId]);

  const loadSoA = async (frameworkId: string) => {
    setIsLoading(true);
    try {
      const data = await apiFetch(`/api/v1/frameworks/${frameworkId}/soa`);
      setSoaReport(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const startEditing = (item: any) => {
    setEditingReqId(item.requirementId);
    setEditIsApplicable(item.isApplicable);
    setEditJustification(item.justification || '');
  };

  const saveEdit = async () => {
    if (!editingReqId) return;
    try {
      await apiFetch('/api/v1/mappings/soa', {
        method: 'PATCH',
        body: JSON.stringify({
          requirementId: editingReqId,
          isApplicable: editIsApplicable,
          justification: editJustification
        })
      });
      setEditingReqId(null);
      loadSoA(selectedFrameworkId);
    } catch (err) {
      console.error(err);
    }
  };

  // Stats
  const total = soaReport.length;
  const applicable = soaReport.filter(x => x.isApplicable).length;
  const implemented = soaReport.filter(x => x.isApplicable && x.status === 'Compliant').length;

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-[1440px] mx-auto w-full animate-fade-in pb-12">
      
      {/* Header - Hidden on print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
            </div>
            <h1 className="font-headline-lg text-text-primary tracking-tight">Statement of Applicability</h1>
          </div>
          <p className="font-body-md text-text-secondary mt-2">Generate and manage the SoA report for compliance frameworks.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={selectedFrameworkId}
            onChange={(e) => setSelectedFrameworkId(e.target.value)}
            className="font-label-md px-4 py-2 bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[200px]"
          >
            {frameworks.map(fw => (
              <option key={fw.id} value={fw.id}>{fw.name} v{fw.version}</option>
            ))}
          </select>

          <Button onClick={handlePrint} className="bg-surface border border-border hover:bg-surface-secondary text-text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print SoA
          </Button>
        </div>
      </div>

      {/* Print Header - Only visible on print */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Statement of Applicability (SoA)</h1>
        <h2 className="text-lg text-gray-600">
          {frameworks.find(f => f.id === selectedFrameworkId)?.name} v{frameworks.find(f => f.id === selectedFrameworkId)?.version}
        </h2>
        <p className="text-sm text-gray-500 mt-2">Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-surface-secondary rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-text-secondary">list_alt</span>
          </div>
          <div>
            <p className="font-body-sm text-text-tertiary">Total Controls</p>
            <p className="font-headline-md text-text-primary">{total}</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">rule</span>
          </div>
          <div>
            <p className="font-body-sm text-text-tertiary">Applicable</p>
            <p className="font-headline-md text-text-primary">{applicable}</p>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-success">task_alt</span>
          </div>
          <div>
            <p className="font-body-sm text-text-tertiary">Implemented (Compliant)</p>
            <p className="font-headline-md text-text-primary">{implemented}</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-surface-container border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-secondary/50 border-b border-border">
                  <th className="px-5 py-4 font-label-md text-text-secondary uppercase tracking-wider w-[120px]">Control ID</th>
                  <th className="px-5 py-4 font-label-md text-text-secondary uppercase tracking-wider min-w-[250px]">Requirement</th>
                  <th className="px-5 py-4 font-label-md text-text-secondary uppercase tracking-wider w-[120px] text-center">Applicable?</th>
                  <th className="px-5 py-4 font-label-md text-text-secondary uppercase tracking-wider min-w-[200px]">Justification</th>
                  <th className="px-5 py-4 font-label-md text-text-secondary uppercase tracking-wider w-[180px]">Status & Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {soaReport.map(item => (
                  <tr key={item.requirementId} className="hover:bg-surface-secondary/30 transition-colors group">
                    <td className="px-5 py-4 align-top">
                      <span className="font-mono font-medium text-text-primary bg-surface-secondary px-2 py-1 rounded border border-border">
                        {item.identifier}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-medium text-text-primary mb-1">{item.title}</p>
                      <p className="font-body-sm text-text-secondary line-clamp-2 print:line-clamp-none">{item.description}</p>
                    </td>
                    <td className="px-5 py-4 align-top text-center">
                      {editingReqId === item.requirementId ? (
                        <select 
                          value={editIsApplicable ? 'yes' : 'no'}
                          onChange={(e) => setEditIsApplicable(e.target.value === 'yes')}
                          className="font-body-sm border border-border rounded px-2 py-1 outline-none"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      ) : (
                        item.isApplicable ? 
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success/10 text-success"><span className="material-symbols-outlined text-[16px]">check</span></span> : 
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-error/10 text-error"><span className="material-symbols-outlined text-[16px]">close</span></span>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top">
                      {editingReqId === item.requirementId ? (
                        <div className="flex flex-col gap-2">
                          <textarea 
                            value={editJustification}
                            onChange={(e) => setEditJustification(e.target.value)}
                            className="font-body-sm border border-border rounded px-3 py-2 outline-none w-full h-20 resize-none focus:border-primary"
                            placeholder="Enter justification for inclusion or exclusion..."
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={saveEdit} className="bg-primary text-white flex-1">Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingReqId(null)} className="flex-1">Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="group/edit relative">
                          <p className="font-body-sm text-text-secondary whitespace-pre-wrap">
                            {item.justification || <span className="italic opacity-50">No justification provided.</span>}
                          </p>
                          <button 
                            onClick={() => startEditing(item)}
                            className="absolute top-0 right-0 p-1 text-text-tertiary hover:text-primary opacity-0 group-hover/edit:opacity-100 transition-opacity bg-surface rounded print:hidden"
                            title="Edit Applicability & Justification"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top">
                      {item.isApplicable ? (
                        <div className="space-y-3">
                          <div className="inline-flex px-2 py-1 rounded text-[11px] font-bold tracking-wider bg-surface-secondary text-text-tertiary border border-border">
                            {item.status.toUpperCase()}
                          </div>
                          
                          {(item.linkedPolicies?.length > 0 || item.linkedControls?.length > 0) && (
                            <div className="space-y-1">
                              {item.linkedPolicies?.map((p: any) => (
                                <div key={p.id} className="flex items-center gap-1.5 font-body-sm text-text-secondary">
                                  <span className="material-symbols-outlined text-[14px]">policy</span>
                                  <span className="truncate max-w-[150px]" title={p.name}>{p.name}</span>
                                </div>
                              ))}
                              {item.linkedControls?.map((c: any) => (
                                <div key={c.id} className="flex items-center gap-1.5 font-body-sm text-text-secondary">
                                  <span className="material-symbols-outlined text-[14px]">shield</span>
                                  <span className="truncate max-w-[150px]" title={c.name}>{c.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-text-tertiary font-body-sm italic">Excluded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
