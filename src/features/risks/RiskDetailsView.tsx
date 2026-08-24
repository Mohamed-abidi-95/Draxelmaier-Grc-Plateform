import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ArrowLeft, ShieldAlert, Activity, ShieldPlus, Target, Calendar
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
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
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [riskData, assessData, treatData, assetsData, controlsData] = await Promise.all([
        apiFetch(`/api/v1/risks/${id}`),
        apiFetch(`/api/v1/risk-assessments?riskId=${id}`),
        apiFetch(`/api/v1/risk-treatments?riskId=${id}`),
        apiFetch(`/api/v1/assets`),
        apiFetch(`/api/v1/controls`)
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
      loadData(); // refresh
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
    return <div className="p-8 text-center text-slate-500">Loading risk details...</div>;
  }

  if (!risk) {
    return <div className="p-8 text-center text-rose-500">Risk not found.</div>;
  }

  const latestAssessment = assessments.length > 0 ? assessments[0] : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/risks')}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Risk Register
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{risk.title}</h2>
            <Badge variant="outline" className="bg-slate-100 text-slate-700">{risk.status === 0 ? 'Open' : risk.status === 1 ? 'Mitigated' : 'Closed'}</Badge>
          </div>
          <p className="text-slate-500 text-sm max-w-2xl">{risk.description}</p>
        </div>
        
        {latestAssessment && (
          <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col items-end shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Current Score</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">{latestAssessment.score}</span>
              {latestAssessment.score >= 15 ? (
                <Badge variant="destructive" className="bg-rose-100 text-rose-700 border-rose-200">High</Badge>
              ) : latestAssessment.score >= 8 ? (
                <Badge variant="default" className="bg-amber-100 text-amber-700 border-amber-200">Medium</Badge>
              ) : (
                <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200">Low</Badge>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button 
            onClick={() => setActiveTab('details')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'details' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('assessments')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'assessments' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          >
            Assessments
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0 rounded-full">{assessments.length}</Badge>
          </button>
          <button 
            onClick={() => setActiveTab('treatments')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'treatments' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          >
            Treatments
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0 rounded-full">{treatments.length}</Badge>
          </button>
          <button 
            onClick={() => setActiveTab('controls')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'controls' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          >
            Linked Controls
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0 rounded-full">{risk.linkedControls?.length || 0}</Badge>
          </button>
        </nav>
      </div>

      <div className="pt-4">
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-indigo-600" />
                Risk Properties
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-0.5">Created At</div>
                  <div className="text-sm text-slate-900">{new Date(risk.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-0.5">Owner ID</div>
                  <div className="text-sm text-slate-900 font-mono text-xs">{risk.ownerId}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-1">Linked Asset</div>
                  <select 
                    className="w-full max-w-xs px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={selectedAssetId}
                    onChange={(e: any) => handleLinkAsset(e.target.value)}
                  >
                    <option value="">-- No asset linked --</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'assessments' && (
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Assessment History</h3>
              <Button onClick={() => setShowAssessModal(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Target className="h-4 w-4 mr-2" /> New Assessment
              </Button>
            </div>
            {assessments.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No assessments performed yet.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-[11px] uppercase">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Probability</th>
                    <th className="px-6 py-3">Impact</th>
                    <th className="px-6 py-3">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assessments.map(a => (
                    <tr key={a.id}>
                      <td className="px-6 py-4 font-medium">{new Date(a.assessedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{a.probability} / 5</td>
                      <td className="px-6 py-4">{a.impact} / 5</td>
                      <td className="px-6 py-4 font-bold">{a.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}

        {activeTab === 'treatments' && (
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Treatment Plans</h3>
              <Button onClick={() => setShowTreatmentModal(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <ShieldPlus className="h-4 w-4 mr-2" /> Add Treatment
              </Button>
            </div>
            {treatments.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No treatments defined yet.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-[11px] uppercase">
                  <tr>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {treatments.map(t => (
                    <tr key={t.id}>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{t.type}</Badge>
                      </td>
                      <td className="px-6 py-4">{t.description}</td>
                      <td className="px-6 py-4 flex items-center gap-1.5 text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}

        {activeTab === 'controls' && (
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Linked Controls</h3>
              <Button onClick={() => setShowControlModal(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <ShieldPlus className="h-4 w-4 mr-2" /> Link Control
              </Button>
            </div>
            {!risk.linkedControls || risk.linkedControls.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No controls linked to mitigate this risk.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-[11px] uppercase">
                  <tr>
                    <th className="px-6 py-3">Control Name</th>
                    <th className="px-6 py-3">Control ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {risk.linkedControls.map((c: any) => (
                    <tr key={c.controlId}>
                      <td className="px-6 py-4 font-medium text-slate-900">{c.controlName}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{c.controlId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-900">Add Risk Treatment</h3>
            </div>
            <form onSubmit={handleAddTreatment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Treatment Type</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 border-slate-200 text-sm"
                  value={newTreatment.type}
                  onChange={e => setNewTreatment({...newTreatment, type: e.target.value})}
                >
                  <option value="Mitigate">Mitigate</option>
                  <option value="Accept">Accept</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Avoid">Avoid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  required
                  className="w-full h-24 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 border-slate-200 resize-none"
                  value={newTreatment.description}
                  onChange={e => setNewTreatment({...newTreatment, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <Input 
                  type="date"
                  value={newTreatment.dueDate}
                  onChange={(e: any) => setNewTreatment({...newTreatment, dueDate: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowTreatmentModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Treatment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showControlModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-900">Link Mitigating Control</h3>
            </div>
            <form onSubmit={handleLinkControl} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Control</label>
                <select 
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 border-slate-200 text-sm"
                  value={selectedControlId}
                  onChange={e => setSelectedControlId(e.target.value)}
                >
                  <option value="">-- Select a control --</option>
                  {controlsList.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowControlModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Link Control</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
