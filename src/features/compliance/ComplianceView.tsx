import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronRight, Link as LinkIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
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
      // Refresh mappings
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Compliant': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'NonCompliant': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <HelpCircle className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Compliance Frameworks</h2>
          <p className="text-muted-foreground text-sm">Monitor adherence to regulatory and internal standards.</p>
        </div>
        <Button onClick={() => setIsImportModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Import Framework (CSV)
        </Button>
      </div>

      {frameworks.length === 0 && !loading && (
        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-slate-50/50">
          No frameworks imported yet. Click the button above to import your first ISO 27001 CSV.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {frameworks.map((fw) => (
          <Card 
            key={fw.id} 
            className={`flex flex-col cursor-pointer transition-colors ${selectedFrameworkId === fw.id ? 'ring-2 ring-primary border-transparent' : 'hover:bg-slate-50/50'}`}
            onClick={() => setSelectedFrameworkId(fw.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>{fw.name} ({fw.version})</CardTitle>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">{fw.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedFrameworkId && (
        <Card className="mt-8 border-t border-x-0 border-b-0 rounded-none md:border md:rounded-lg">
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 border-b">
                  <tr>
                    <th className="px-4 py-3 w-10"></th>
                    <th className="px-4 py-3 font-medium text-slate-600 w-24">ID</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Title</th>
                    <th className="px-4 py-3 font-medium text-slate-600">Description</th>
                    <th className="px-4 py-3 font-medium text-slate-600 text-center w-32">Status</th>
                    <th className="px-4 py-3 font-medium text-slate-600 text-right w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {requirements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No requirements found for this framework.
                      </td>
                    </tr>
                  ) : (
                    requirements.map((req) => (
                      <React.Fragment key={req.id}>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <button onClick={() => toggleExpand(req.id)} className="text-slate-400 hover:text-slate-700">
                              {expandedReqs[req.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          </td>
                          <td className="px-4 py-3 font-medium">{req.identifier}</td>
                          <td className="px-4 py-3 font-semibold">{req.title}</td>
                          <td className="px-4 py-3 text-muted-foreground max-w-md truncate">{req.description}</td>
                          <td className="px-4 py-3 flex justify-center">{getStatusIcon(req.status)}</td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm" onClick={() => setMappingModalReq({ id: req.id, identifier: req.identifier })}>
                              <LinkIcon className="h-4 w-4 mr-1" />
                              Map
                            </Button>
                          </td>
                        </tr>
                        {expandedReqs[req.id] && (
                          <tr className="bg-slate-50/50">
                            <td colSpan={6} className="px-8 py-4">
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold flex items-center">
                                  <LinkIcon className="h-4 w-4 mr-2 text-slate-400" />
                                  Mapped Controls & Policies
                                </h4>
                                {(!reqMappings[req.id] || reqMappings[req.id].length === 0) ? (
                                  <p className="text-sm text-slate-500 italic">No mappings exist yet.</p>
                                ) : (
                                  <div className="bg-white rounded border overflow-hidden">
                                    <table className="w-full text-sm">
                                      <thead className="bg-slate-100/50 border-b">
                                        <tr>
                                          <th className="px-3 py-2 font-medium text-slate-600 text-left">Type</th>
                                          <th className="px-3 py-2 font-medium text-slate-600 text-left">Status</th>
                                          <th className="px-3 py-2 font-medium text-slate-600 text-right">Preuves</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {reqMappings[req.id].map(map => (
                                          <tr key={map.id}>
                                            <td className="px-3 py-2">
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                {map.policyId ? 'Policy' : 'Control'}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2">
                                              <select 
                                                className="border-slate-200 rounded text-sm p-1"
                                                value={map.status}
                                                onChange={(e) => updateMappingStatus(map.id, req.id, e.target.value)}
                                              >
                                                <option value="NotAssessed">Not Assessed</option>
                                                <option value="Compliant">Compliant</option>
                                                <option value="NonCompliant">Non Compliant</option>
                                                <option value="NotApplicable">Not Applicable</option>
                                              </select>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                              <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                  variant="outline" 
                                                  size="sm" 
                                                  onClick={() => setEvidenceModalMapping({ id: map.id, type: map.policyId ? 'Policy' : 'Control' })}
                                                >
                                                  Voir les preuves
                                                </Button>
                                                <button 
                                                  onClick={async () => {
                                                    if(confirm('Supprimer ce lien ?')) {
                                                      try {
                                                        await apiFetch(`/api/v1/mappings/${map.id}`, { method: 'DELETE' });
                                                        fetchMappings(req.id);
                                                      } catch(e) { console.error(e); }
                                                    }
                                                  }}
                                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                  title="Délier"
                                                >
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
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
          </CardContent>
        </Card>
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
