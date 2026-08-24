import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';
import { AssessRiskModal } from './AssessRiskModal';

export const RiskDetailsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [risk, setRisk] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'assessments' | 'treatments' | 'controls'>('details');
  const [showAssessModal, setShowAssessModal] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [showControlModal, setShowControlModal] = useState(false);
  const [newTreatment, setNewTreatment] = useState({ type: 'Mitigate', description: '', dueDate: '' });
  
  const [assets, setAssets] = useState<any[]>([]);
  const [controlsList, setControlsList] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [selectedControlId, setSelectedControlId] = useState<string>('');

  useEffect(() => {
    if (id && user) {
      loadData();
    }
  }, [id, user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [riskData, assessData, treatData, assetsData, controlsData] = await Promise.all([
        apiFetch(`/api/v1/risks/${id}`),
        apiFetch(`/api/v1/risk-assessments?riskId=${id}`),
        apiFetch(`/api/v1/risk-treatments?riskId=${id}`),
        apiFetch(`/api/v1/assets`),
        apiFetch(`/api/v1/controls?organizationId=${user?.organizationId}`)
      ]);
      setRisk(riskData);
      setAssessments(assessData);
      setTreatments(treatData);
      setAssets(assetsData);
      setControlsList(controlsData);
      if (riskData.assetId) {
        setSelectedAssetId(riskData.assetId);
      }
    } catch (error) {
      console.error('Failed to load risk details', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/v1/risk-treatments', {
        method: 'POST',
        body: JSON.stringify({
          riskId: id,
          type: newTreatment.type,
          description: newTreatment.description,
          dueDate: newTreatment.dueDate ? new Date(newTreatment.dueDate).toISOString() : null
        })
      });
      setShowTreatmentModal(false);
      setNewTreatment({ type: 'Mitigate', description: '', dueDate: '' });
      loadData();
    } catch (error) {
      console.error('Failed to add treatment', error);
    }
  };

  const handleLinkAsset = async (assetId: string) => {
    try {
      await apiFetch(`/api/v1/risks/${id}/asset`, {
        method: 'PUT',
        body: JSON.stringify({ riskId: id, assetId })
      });
      setSelectedAssetId(assetId);
      loadData();
    } catch (error) {
      console.error('Failed to link asset', error);
    }
  };

  const handleLinkControl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedControlId) return;
    try {
      await apiFetch(`/api/v1/risks/${id}/controls`, {
        method: 'POST',
        body: JSON.stringify({ riskId: id, controlId: selectedControlId })
      });
      setShowControlModal(false);
      setSelectedControlId('');
      loadData();
    } catch (error) {
      console.error('Failed to link control', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-surface-container border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-text-tertiary">
        <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">error</span>
        <h3 className="font-headline-sm text-text-primary">Risk not found</h3>
      </div>
    );
  }

  const latestAssessment = assessments.length > 0 ? assessments[0] : null;

  const getStatusBadge = (status: number) => {
    switch(status) {
      case 0: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-error/10 text-error border border-error/20">OPEN</span>;
      case 1: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-warning/10 text-warning border border-warning/20">MITIGATED</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-success/10 text-success border border-success/20">CLOSED</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 15) return "text-error";
    if (score >= 10) return "text-orange-600";
    if (score >= 5) return "text-warning";
    return "text-success";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 15) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-error/10 text-error border border-error/20">Critical</span>;
    if (score >= 10) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-600 border border-orange-500/20">High</span>;
    if (score >= 5) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-warning/10 text-warning border border-warning/20">Medium</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-success/10 text-success border border-success/20">Low</span>;
  };

  const getTreatmentColor = (type: string) => {
    switch (type) {
      case 'Mitigate': return "bg-primary/10 text-primary border-primary/20";
      case 'Accept': return "bg-success/10 text-success border-success/20";
      case 'Transfer': return "bg-warning/10 text-warning border-warning/20";
      case 'Avoid': return "bg-error/10 text-error border-error/20";
      default: return "bg-surface-container-low text-text-secondary border-border";
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-[1000px] mx-auto w-full animate-fade-in pb-12">
      <button 
        onClick={() => navigate('/risks')}
        className="flex items-center gap-2 text-[13px] font-medium text-text-tertiary hover:text-text-primary transition-colors w-fit"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Risk Register
      </button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="font-headline-lg text-text-primary tracking-tight">{risk.title}</h2>
            {getStatusBadge(risk.status)}
          </div>
          <p className="font-body-md text-text-secondary leading-relaxed max-w-3xl">{risk.description}</p>
        </div>
        
        {latestAssessment && (
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col items-end shadow-sm shrink-0 min-w-[200px]">
            <span className="font-label-sm text-text-tertiary uppercase tracking-wider mb-2">Current Risk Score</span>
            <div className="flex items-center gap-3">
              <span className={`text-[32px] font-bold leading-none ${getScoreColor(latestAssessment.score)}`}>{latestAssessment.score}</span>
              {getScoreBadge(latestAssessment.score)}
            </div>
            <div className="text-[12px] text-text-tertiary mt-2 font-mono bg-surface-container-low px-2 py-1 rounded">
              P:{latestAssessment.probability} × I:{latestAssessment.impact}
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-border mt-4">
        <nav className="flex space-x-6 overflow-x-auto hide-scrollbar">
          {[
            { id: 'details', label: 'Overview', count: null },
            { id: 'assessments', label: 'Assessments', count: assessments.length },
            { id: 'treatments', label: 'Treatments', count: treatments.length },
            { id: 'controls', label: 'Linked Controls', count: risk.linkedControls?.length || 0 }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap pb-4 border-b-2 font-label-md transition-colors flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-surface-secondary text-text-tertiary'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-2">
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-surface border border-border rounded-xl p-6 shadow-sm space-y-6">
              <h3 className="font-headline-sm text-text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">assignment</span>
                Risk Properties
              </h3>
              <div className="space-y-5">
                <div>
                  <div className="font-label-sm text-text-tertiary uppercase tracking-wider mb-1">Created At</div>
                  <div className="font-body-sm text-text-primary">{new Date(risk.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                </div>
                <div>
                  <div className="font-label-sm text-text-tertiary uppercase tracking-wider mb-1">Owner ID</div>
                  <div className="font-mono text-[12px] text-text-secondary bg-surface-secondary px-2 py-1 rounded inline-block">{risk.ownerId}</div>
                </div>
                <div>
                  <div className="font-label-sm text-text-tertiary uppercase tracking-wider mb-2">Linked Asset</div>
                  <select 
                    className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-lg font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all"
                    value={selectedAssetId}
                    onChange={(e: any) => handleLinkAsset(e.target.value)}
                  >
                    <option value="">-- No asset linked --</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-text-tertiary mt-2">Linking an asset helps trace the origin of the risk.</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'assessments' && (
          <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-surface-secondary/50 flex items-center justify-between">
              <h3 className="font-headline-sm text-text-primary">Assessment History</h3>
              <Button onClick={() => setShowAssessModal(true)} className="bg-primary hover:bg-primary/90 text-white shadow-sm px-4 py-2 flex items-center gap-2 rounded-lg transition-all hover:shadow-md h-9 text-[13px]">
                <span className="material-symbols-outlined text-[16px]">add_task</span> New Assessment
              </Button>
            </div>
            {assessments.length === 0 ? (
              <div className="p-16 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-text-tertiary">
                  <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">history</span>
                  <h3 className="font-headline-sm text-text-primary">No assessments yet</h3>
                  <p className="font-body-sm text-text-secondary">Perform an assessment to evaluate this risk.</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface/50 border-b border-border">
                  <tr>
                    <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Date</th>
                    <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Probability</th>
                    <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Impact</th>
                    <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-text-primary divide-y divide-border/50">
                  {assessments.map((a, i) => (
                    <tr key={a.id} className="hover:bg-surface-secondary/50 transition-colors">
                      <td className="px-5 py-4 font-medium flex items-center gap-2">
                        {new Date(a.assessedAt).toLocaleDateString()}
                        {i === 0 && <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded font-bold">LATEST</span>}
                      </td>
                      <td className="px-5 py-4 text-text-secondary">{a.probability} / 5</td>
                      <td className="px-5 py-4 text-text-secondary">{a.impact} / 5</td>
                      <td className="px-5 py-4 font-bold">
                        <span className={`inline-block px-2 py-0.5 rounded border ${getScoreColor(a.score)} ${a.score >= 15 ? 'bg-error/10 border-error/20' : a.score >= 10 ? 'bg-orange-500/10 border-orange-500/20' : a.score >= 5 ? 'bg-warning/10 border-warning/20' : 'bg-success/10 border-success/20'}`}>
                          {a.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {activeTab === 'treatments' && (
          <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-surface-secondary/50 flex items-center justify-between">
              <h3 className="font-headline-sm text-text-primary">Treatment Plans</h3>
              <Button onClick={() => setShowTreatmentModal(true)} className="bg-primary hover:bg-primary/90 text-white shadow-sm px-4 py-2 flex items-center gap-2 rounded-lg transition-all hover:shadow-md h-9 text-[13px]">
                <span className="material-symbols-outlined text-[16px]">healing</span> Add Treatment
              </Button>
            </div>
            {treatments.length === 0 ? (
              <div className="p-16 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-text-tertiary">
                  <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">medication</span>
                  <h3 className="font-headline-sm text-text-primary">No treatment plans</h3>
                  <p className="font-body-sm text-text-secondary">Define actions to mitigate or manage this risk.</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface/50 border-b border-border">
                  <tr>
                    <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Type</th>
                    <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Description</th>
                    <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Due Date</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-text-primary divide-y divide-border/50">
                  {treatments.map(t => (
                    <tr key={t.id} className="hover:bg-surface-secondary/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getTreatmentColor(t.type)}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 max-w-md">{t.description}</td>
                      <td className="px-5 py-4 text-text-tertiary">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                          {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date set'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {activeTab === 'controls' && (
          <section className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-surface-secondary/50 flex items-center justify-between">
              <h3 className="font-headline-sm text-text-primary">Linked Controls</h3>
              <Button onClick={() => setShowControlModal(true)} className="bg-primary hover:bg-primary/90 text-white shadow-sm px-4 py-2 flex items-center gap-2 rounded-lg transition-all hover:shadow-md h-9 text-[13px]">
                <span className="material-symbols-outlined text-[16px]">link</span> Link Control
              </Button>
            </div>
            {!risk.linkedControls || risk.linkedControls.length === 0 ? (
              <div className="p-16 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-text-tertiary">
                  <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">link_off</span>
                  <h3 className="font-headline-sm text-text-primary">No controls linked</h3>
                  <p className="font-body-sm text-text-secondary">Link controls that help mitigate this risk.</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface/50 border-b border-border">
                  <tr>
                    <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Control ID</th>
                    <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Control Name</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-text-primary divide-y divide-border/50">
                  {risk.linkedControls.map((c: any) => (
                    <tr key={c.controlId} className="hover:bg-surface-secondary/50 transition-colors cursor-pointer" onClick={() => navigate(`/controls`)}>
                      <td className="px-5 py-4">
                        <span className="font-mono text-[12px] bg-surface-secondary px-2 py-1 rounded border border-border">{c.controlId}</span>
                      </td>
                      <td className="px-5 py-4 font-medium hover:text-primary transition-colors">{c.controlName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </div>

      {showAssessModal && user && (
        <AssessRiskModal
          riskId={risk.id}
          riskTitle={risk.title}
          assessorId={user.id}
          onClose={() => setShowAssessModal(false)}
          onSuccess={() => {
            setShowAssessModal(false);
            loadData();
          }}
        />
      )}

      {showTreatmentModal && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-border scale-in-center">
            <div className="px-6 py-5 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">healing</span>
                </div>
                <h3 className="font-headline-sm text-text-primary">Add Risk Treatment</h3>
              </div>
              <button onClick={() => setShowTreatmentModal(false)} className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-secondary">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleAddTreatment} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Treatment Type</label>
                <select 
                  className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-lg font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all"
                  value={newTreatment.type}
                  onChange={e => setNewTreatment({...newTreatment, type: e.target.value})}
                >
                  <option value="Mitigate">Mitigate</option>
                  <option value="Accept">Accept</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Avoid">Avoid</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Description</label>
                <textarea 
                  required
                  placeholder="Describe how you plan to treat this risk..."
                  className="w-full h-24 px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary resize-none"
                  value={newTreatment.description}
                  onChange={e => setNewTreatment({...newTreatment, description: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Due Date</label>
                <input 
                  type="date"
                  className="w-full px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={newTreatment.dueDate}
                  onChange={(e: any) => setNewTreatment({...newTreatment, dueDate: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-2">
                <Button type="button" variant="outline" className="px-5 font-medium border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary" onClick={() => setShowTreatmentModal(false)}>Cancel</Button>
                <Button type="submit" className="px-5 bg-primary hover:bg-primary/90 text-white font-medium">Save Treatment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showControlModal && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-border scale-in-center">
            <div className="px-6 py-5 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">link</span>
                </div>
                <h3 className="font-headline-sm text-text-primary">Link Mitigating Control</h3>
              </div>
              <button onClick={() => setShowControlModal(false)} className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-secondary">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleLinkControl} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Select Control</label>
                <select 
                  required
                  className="w-full px-4 py-2.5 bg-surface-secondary border border-border rounded-lg font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all"
                  value={selectedControlId}
                  onChange={e => setSelectedControlId(e.target.value)}
                >
                  <option value="">-- Select a control --</option>
                  {controlsList.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                  ))}
                </select>
                <p className="font-body-sm text-text-tertiary mt-2">Linking a control allows you to monitor how this risk is mitigated.</p>
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-2">
                <Button type="button" variant="outline" className="px-5 font-medium border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary" onClick={() => setShowControlModal(false)}>Cancel</Button>
                <Button type="submit" className="px-5 bg-primary hover:bg-primary/90 text-white font-medium flex items-center gap-2">
                  Link Control
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
