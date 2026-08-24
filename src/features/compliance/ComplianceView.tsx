import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/apiClient';
import { ImportFrameworkModal } from './ImportFrameworkModal';
import { CreateMappingModal } from './CreateMappingModal';
import { EvidenceModal } from './EvidenceModal';

interface Framework {
  id: string;
  name: string;
  version: string;
  description: string;
  createdAt: string;
}

interface Requirement {
  id: string;
  frameworkId: string;
  identifier: string;
  title: string;
  description: string;
  status: string;
}

interface Mapping {
  id: string;
  requirementId: string;
  policyId?: string;
  controlId?: string;
  status: string;
  origin: string;
}

export const ComplianceView = () => {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [mappingModalReq, setMappingModalReq] = useState<{ id: string, identifier: string } | null>(null);
  const [evidenceModalMapping, setEvidenceModalMapping] = useState<{ id: string, type: string } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [expandedReqs, setExpandedReqs] = useState<Record<string, boolean>>({});
  const [reqMappings, setReqMappings] = useState<Record<string, Mapping[]>>({});
  const [search, setSearch] = useState('');

  const fetchFrameworks = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/v1/frameworks');
      setFrameworks(data);
      if (data.length > 0 && !selectedFrameworkId) {
        setSelectedFrameworkId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch frameworks', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequirements = async (frameworkId: string) => {
    try {
      const data = await apiFetch(`/api/v1/frameworks/${frameworkId}/requirements`);
      setRequirements(data);
    } catch (err) {
      console.error('Failed to fetch requirements', err);
    }
  };

  const fetchMappings = async (reqId: string) => {
    try {
      const data = await apiFetch(`/api/v1/mappings?requirementId=${reqId}`);
      setReqMappings(prev => ({ ...prev, [reqId]: data }));
    } catch (err) {
      console.error('Failed to fetch mappings', err);
    }
  };

  const toggleExpand = (reqId: string) => {
    setExpandedReqs(prev => {
      const isExpanded = !prev[reqId];
      if (isExpanded && !reqMappings[reqId]) {
        fetchMappings(reqId);
      }
      return { ...prev, [reqId]: isExpanded };
    });
  };

  const updateMappingStatus = async (mappingId: string, reqId: string, status: string) => {
    try {
      await apiFetch(`/api/v1/mappings/${mappingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ mappingId, status })
      });
      fetchMappings(reqId);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  useEffect(() => {
    fetchFrameworks();
  }, []);

  useEffect(() => {
    if (selectedFrameworkId) {
      fetchRequirements(selectedFrameworkId);
      setExpandedReqs({});
    }
  }, [selectedFrameworkId]);

  const handleImportSuccess = () => {
    fetchFrameworks();
  };

  const handleMappingSuccess = () => {
    if (mappingModalReq) {
      fetchMappings(mappingModalReq.id);
      setExpandedReqs(prev => ({ ...prev, [mappingModalReq.id]: true }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Compliant': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-success/10 text-success border border-success/20"><span className="material-symbols-outlined text-[12px] mr-1">check_circle</span>Compliant</span>;
      case 'NonCompliant': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-error/10 text-error border border-error/20"><span className="material-symbols-outlined text-[12px] mr-1">cancel</span>Non Compliant</span>;
      case 'NotApplicable': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-surface-container-low text-text-tertiary border border-border"><span className="material-symbols-outlined text-[12px] mr-1">block</span>N/A</span>;
      default: return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-warning/10 text-warning border border-warning/20"><span className="material-symbols-outlined text-[12px] mr-1">help</span>Not Assessed</span>;
    }
  };

  const filteredRequirements = requirements.filter(r => 
    r.identifier.toLowerCase().includes(search.toLowerCase()) || 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-[1440px] mx-auto w-full animate-fade-in pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
            </div>
            <h1 className="font-headline-lg text-text-primary tracking-tight">Compliance Frameworks</h1>
          </div>
          <p className="font-body-md text-text-secondary mt-2">Monitor adherence to regulatory and internal standards.</p>
        </div>
        <Button onClick={() => setIsImportModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-sm px-4 py-2 flex items-center gap-2 rounded-lg transition-all hover:shadow-md">
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          Import Framework
        </Button>
      </div>

      {frameworks.length === 0 && !loading && (
        <div className="bg-surface border border-dashed border-border rounded-xl p-16 text-center">
          <div className="w-16 h-16 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px] text-text-tertiary">library_books</span>
          </div>
          <h3 className="font-headline-sm text-text-primary mb-2">No frameworks imported yet</h3>
          <p className="font-body-sm text-text-secondary">Click the button above to import your first CSV framework (e.g., ISO 27001).</p>
        </div>
      )}

      {frameworks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {frameworks.map((fw) => (
            <div 
              key={fw.id} 
              className={`flex flex-col p-5 rounded-xl border transition-all cursor-pointer group ${selectedFrameworkId === fw.id ? 'bg-primary/5 border-primary shadow-sm' : 'bg-surface border-border hover:border-primary/50 hover:bg-surface-secondary/50'}`}
              onClick={() => setSelectedFrameworkId(fw.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-[20px] ${selectedFrameworkId === fw.id ? 'text-primary' : 'text-text-tertiary group-hover:text-primary transition-colors'}`}>
                    account_balance
                  </span>
                  <h3 className={`font-headline-sm ${selectedFrameworkId === fw.id ? 'text-primary' : 'text-text-primary'}`}>{fw.name}</h3>
                </div>
                <span className="font-mono text-[11px] bg-surface-secondary text-text-tertiary px-2 py-0.5 rounded border border-border">v{fw.version}</span>
              </div>
              <p className="font-body-sm text-text-secondary line-clamp-2 mt-1">{fw.description}</p>
            </div>
          ))}
        </div>
      )}

      {selectedFrameworkId && (
        <section className="bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-border bg-surface-secondary/50 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-text-tertiary">list_alt</span>
              <h3 className="font-headline-sm text-text-primary">Requirements</h3>
            </div>
            <div className="relative w-full max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-text-tertiary">search</span>
              <input 
                placeholder="Search requirements..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 font-body-sm text-text-primary bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-surface/50 border-b border-border">
                <tr>
                  <th className="px-3 py-3 w-10"></th>
                  <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold w-24">ID</th>
                  <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Title</th>
                  <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Description</th>
                  <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold text-center w-36">Status</th>
                  <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-text-primary divide-y divide-border/50">
                {requirements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">rule</span>
                        <h3 className="font-headline-sm text-text-primary">No requirements found</h3>
                        <p className="font-body-sm text-text-secondary">This framework has no requirements configured.</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredRequirements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <p className="font-body-sm text-text-secondary">No requirements match your search.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRequirements.map((req) => (
                    <React.Fragment key={req.id}>
                      <tr className="hover:bg-surface-secondary/30 transition-colors group">
                        <td className="px-3 py-4 align-top text-center">
                          <button onClick={() => toggleExpand(req.id)} className="text-text-tertiary hover:text-primary transition-colors p-1 rounded hover:bg-primary/10">
                            <span className="material-symbols-outlined text-[20px]">
                              {expandedReqs[req.id] ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
                            </span>
                          </button>
                        </td>
                        <td className="px-5 py-4 align-top font-mono text-[12px] font-semibold text-primary">{req.identifier}</td>
                        <td className="px-5 py-4 align-top font-medium text-text-primary max-w-xs">{req.title}</td>
                        <td className="px-5 py-4 align-top text-text-secondary max-w-md">{req.description}</td>
                        <td className="px-5 py-4 align-top text-center">
                          {getStatusBadge(req.status)}
                        </td>
                        <td className="px-5 py-4 align-top text-right">
                          <Button variant="ghost" size="sm" onClick={() => setMappingModalReq({ id: req.id, identifier: req.identifier })} className="text-primary hover:bg-primary/10 hover:text-primary h-8 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-[16px] mr-1.5">link</span>
                            Map
                          </Button>
                        </td>
                      </tr>
                      {expandedReqs[req.id] && (
                        <tr className="bg-surface-secondary/30 border-b-2 border-border/50">
                          <td colSpan={6} className="px-8 py-5">
                            <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
                              <div className="px-4 py-3 border-b border-border bg-surface-secondary flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-text-tertiary">account_tree</span>
                                <h4 className="font-label-md text-text-primary font-semibold">Mapped Controls & Policies</h4>
                              </div>
                              {(!reqMappings[req.id] || reqMappings[req.id].length === 0) ? (
                                <div className="p-6 text-center text-text-tertiary">
                                  <span className="material-symbols-outlined text-[24px] mb-2 opacity-50">link_off</span>
                                  <p className="font-body-sm italic">No controls or policies are mapped to this requirement yet.</p>
                                </div>
                              ) : (
                                <table className="w-full text-left">
                                  <thead className="bg-surface-secondary/50 border-b border-border">
                                    <tr>
                                      <th className="px-4 py-2.5 font-label-sm text-text-tertiary uppercase tracking-wider">Type</th>
                                      <th className="px-4 py-2.5 font-label-sm text-text-tertiary uppercase tracking-wider">Status</th>
                                      <th className="px-4 py-2.5 font-label-sm text-text-tertiary uppercase tracking-wider text-right">Evidence</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border/50 font-body-sm text-text-primary">
                                    {reqMappings[req.id].map(map => (
                                      <tr key={map.id} className="hover:bg-surface-secondary/50 transition-colors">
                                        <td className="px-4 py-3">
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                                            {map.policyId ? 'Policy' : 'Control'}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3">
                                          <select 
                                            className="bg-surface border border-border rounded-md text-[12px] font-medium py-1 px-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer text-text-secondary"
                                            value={map.status}
                                            onChange={(e) => updateMappingStatus(map.id, req.id, e.target.value)}
                                          >
                                            <option value="NotAssessed">Not Assessed</option>
                                            <option value="Compliant">Compliant</option>
                                            <option value="NonCompliant">Non Compliant</option>
                                            <option value="NotApplicable">Not Applicable</option>
                                          </select>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                          <div className="flex items-center justify-end gap-2">
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              onClick={() => setEvidenceModalMapping({ id: map.id, type: map.policyId ? 'Policy' : 'Control' })}
                                              className="h-7 px-3 text-[11px] font-medium text-text-secondary border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                            >
                                              <span className="material-symbols-outlined text-[14px] mr-1.5">attachment</span>
                                              View Evidence
                                            </Button>
                                            <button 
                                              onClick={async () => {
                                                if(confirm('Are you sure you want to remove this mapping?')) {
                                                  try {
                                                    await apiFetch(`/api/v1/mappings/${map.id}`, { method: 'DELETE' });
                                                    fetchMappings(req.id);
                                                  } catch(e) { console.error(e); }
                                                }
                                              }}
                                              className="p-1.5 text-text-tertiary hover:text-error hover:bg-error/10 rounded transition-colors"
                                              title="Unlink"
                                            >
                                              <span className="material-symbols-outlined text-[16px]">link_off</span>
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {isImportModalOpen && (
        <ImportFrameworkModal 
          onClose={() => setIsImportModalOpen(false)} 
          onSuccess={handleImportSuccess} 
        />
      )}

      {mappingModalReq && (
        <CreateMappingModal 
          requirementId={mappingModalReq.id}
          requirementIdentifier={mappingModalReq.identifier}
          onClose={() => setMappingModalReq(null)}
          onSuccess={handleMappingSuccess}
        />
      )}

      {evidenceModalMapping && (
        <EvidenceModal
          mappingId={evidenceModalMapping.id}
          mappingType={evidenceModalMapping.type}
          onClose={() => setEvidenceModalMapping(null)}
        />
      )}
    </div>
  );
};
