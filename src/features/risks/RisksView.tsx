import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, ShieldAlert, ChevronRight, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';
import { Link } from 'react-router';

export const RisksView = () => {
  const [risks, setRisks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Create Modal State
  const [newRisk, setNewRisk] = useState({ title: '', description: '', code: '', category: '' });
  
  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { user } = useAuth();

  const loadRisks = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch('/api/v1/risks');
      setRisks(data);
    } catch (error) {
      console.error('Failed to load risks', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRisks();
  }, []);

  const handleCreateRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await apiFetch('/api/v1/risks', {
        method: 'POST',
        body: JSON.stringify({
          title: newRisk.title,
          description: newRisk.description,
          code: newRisk.code,
          category: newRisk.category,
          organizationId: user.organizationId,
          ownerId: user.id
        })
      });
      setShowModal(false);
      setNewRisk({ title: '', description: '', code: '', category: '' });
      loadRisks(); 
    } catch (error) {
      console.error('Failed to create risk', error);
      alert('Failed to create risk');
    }
  };

  const getLatestScore = (risk: any) => {
    if (!risk.assessments || risk.assessments.length === 0) return null;
    return risk.assessments[risk.assessments.length - 1];
  };

  // Compute KPIs & Filter data
  const filteredRisks = useMemo(() => {
    return risks.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                            (r.code && r.code.toLowerCase().includes(search.toLowerCase()));
      const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
      
      let rStatus = r.status === '0' ? 'Ouvert' : r.status === '1' ? 'Mitigated' : 'Closed'; // Backend sends "0" or "Open" depending on json serialization. Let's assume text string since it's "Status.ToString()"
      if (r.status === '0') rStatus = 'Ouvert';
      // Wait, backend sends "Open" or "0"? The backend sends `Status.ToString()` which is "Open".
      rStatus = r.status;
      if (statusFilter !== 'all') {
        if (statusFilter === 'Non évalué' && getLatestScore(r) !== null) return false;
        if (statusFilter !== 'Non évalué' && rStatus !== statusFilter) return false;
      }
      return matchesSearch && matchesCat;
    }).sort((a, b) => {
      // Sort by PxI descending
      const scoreA = getLatestScore(a)?.score ?? -1;
      const scoreB = getLatestScore(b)?.score ?? -1;
      return scoreB - scoreA;
    });
  }, [risks, search, categoryFilter, statusFilter]);

  const kpis = useMemo(() => {
    let critical = 0, high = 0, medium = 0, low = 0, unassessed = 0;
    risks.forEach(r => {
      const a = getLatestScore(r);
      if (!a) {
        unassessed++;
        return;
      }
      if (a.score >= 15) critical++;
      else if (a.score >= 10) high++;
      else if (a.score >= 5) medium++;
      else low++;
    });
    return { critical, high, medium, low, unassessed };
  }, [risks]);

  const allCategories = Array.from(new Set(risks.map(r => r.category).filter(Boolean)));
  const allStatuses = Array.from(new Set(risks.map(r => r.status)));

  const getStatusPill = (status: string, hasAssessment: boolean) => {
    if (!hasAssessment) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-rose-200 text-rose-600 bg-white">Non évalué</span>;
    if (status === 'Open' || status === '0') return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Ouvert</span>;
    if (status === 'Mitigated' || status === '1') return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Traité</span>;
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Accepté</span>;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Risk Register</h2>
          <p className="text-slate-500 text-sm mt-1">Manage, assess, and treat enterprise risks.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
          <Plus className="h-4 w-4" />
          Log New Risk
        </Button>
      </div>

      {/* SEVERITY SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-rose-500 shadow-none border-t border-r border-b">
          <div className="text-2xl font-bold text-slate-900">{kpis.critical}</div>
          <div className="text-xs uppercase text-slate-500 font-semibold tracking-wider mt-1">Critique</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-orange-500 shadow-none border-t border-r border-b">
          <div className="text-2xl font-bold text-slate-900">{kpis.high}</div>
          <div className="text-xs uppercase text-slate-500 font-semibold tracking-wider mt-1">Élevé</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-400 shadow-none border-t border-r border-b">
          <div className="text-2xl font-bold text-slate-900">{kpis.medium}</div>
          <div className="text-xs uppercase text-slate-500 font-semibold tracking-wider mt-1">Moyen</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500 shadow-none border-t border-r border-b">
          <div className="text-2xl font-bold text-slate-900">{kpis.low}</div>
          <div className="text-xs uppercase text-slate-500 font-semibold tracking-wider mt-1">Faible</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-slate-300 shadow-none border-t border-r border-b">
          <div className="text-2xl font-bold text-slate-900">{kpis.unassessed}</div>
          <div className="text-xs uppercase text-slate-500 font-semibold tracking-wider mt-1">Non évalués</div>
        </Card>
      </div>

      <div className="text-[13px] text-slate-500 font-medium">
        {filteredRisks.length}/{risks.length} risques
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Rechercher un risque…" 
            className="pl-9 bg-white" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="px-3 py-2 border border-slate-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">Toutes catégories</option>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select 
          className="px-3 py-2 border border-slate-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous statuts</option>
          <option value="Non évalué">Non évalués</option>
          {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button 
          variant="outline" 
          onClick={() => { setSearch(''); setCategoryFilter('all'); setStatusFilter('all'); }}
          className="text-slate-600 hover:text-slate-900 hover:bg-slate-50"
        >
          Réinitialiser
        </Button>
      </div>

      {/* RISK TABLE */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[12px] font-semibold">
              <tr>
                <th className="px-6 py-3 font-semibold">Risque</th>
                <th className="px-4 py-3 font-semibold">Catégorie</th>
                <th className="px-4 py-3 font-semibold">P × I</th>
                <th className="px-4 py-3 font-semibold">CTL</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold text-center">Count</th>
                <th className="px-6 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                    Loading risks...
                  </td>
                </tr>
              ) : filteredRisks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-slate-900">Aucun risque trouvé</p>
                  </td>
                </tr>
              ) : (
                filteredRisks.map((risk, index) => {
                  const assessment = getLatestScore(risk);
                  const isZebra = index % 2 === 1;
                  
                  // Calculate Severity Color
                  let scoreColor = "text-slate-900";
                  if (assessment) {
                    if (assessment.score >= 15) scoreColor = "text-rose-600";
                    else if (assessment.score >= 10) scoreColor = "text-orange-500";
                    else if (assessment.score >= 5) scoreColor = "text-amber-500";
                    else scoreColor = "text-emerald-600";
                  }

                  return (
                    <tr 
                      key={risk.id} 
                      onClick={() => window.location.href = `/risks/${risk.id}`}
                      className={`group cursor-pointer hover:bg-[#F0F4F8] transition-colors ${isZebra ? 'bg-[#FAFBFC]' : ''}`}
                    >
                      <td className="px-6 py-3 h-[64px] align-middle">
                        <div className="text-[12px] text-slate-500 font-mono mb-0.5">{risk.code || 'RSK-UNASSIGNED'}</div>
                        <div className="text-[14px] font-medium text-slate-900">{risk.title}</div>
                        {!assessment && (
                          <div className="text-[12px] text-amber-600 flex items-center mt-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            ⚠ Non évalué — aucun contrôle documenté
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle text-[13px] text-slate-500">
                        {risk.category || 'Non classé'}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        {assessment ? (
                          <div>
                            <div className={`font-bold text-[14px] ${scoreColor}`}>{assessment.score}</div>
                            <div className="text-[12px] text-slate-400">{assessment.probability}×{assessment.impact}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle text-[14px] text-slate-900">
                        {risk.ownerName}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        {getStatusPill(risk.status, !!assessment)}
                      </td>
                      <td className="px-4 py-3 align-middle text-[13px] text-slate-500">
                        {assessment ? new Date(assessment.assessedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Jamais évalué'}
                      </td>
                      <td className="px-4 py-3 align-middle text-center">
                        <span className="inline-flex items-center justify-center bg-slate-100 text-slate-600 text-[11px] font-bold h-6 min-w-[24px] px-2 rounded-full">
                          {risk.controlsCount}
                        </span>
                      </td>
                      <td className="px-6 py-3 align-middle text-right">
                        <div className="text-indigo-600 group-hover:underline text-[13px] font-medium inline-flex items-center">
                          Détail <ChevronRight className="h-4 w-4 ml-0.5" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Risk Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-900">Log New Risk</h3>
            </div>
            
            <form onSubmit={handleCreateRisk} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Risk ID (Code)</label>
                  <Input 
                    required 
                    value={newRisk.code}
                    onChange={e => setNewRisk({...newRisk, code: e.target.value})}
                    placeholder="e.g. RSK-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <Input 
                    required 
                    value={newRisk.category}
                    onChange={e => setNewRisk({...newRisk, category: e.target.value})}
                    placeholder="e.g. Cybersécurité"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Risk Title</label>
                <Input 
                  required 
                  value={newRisk.title}
                  onChange={e => setNewRisk({...newRisk, title: e.target.value})}
                  placeholder="e.g., Unpatched legacy servers"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  required
                  className="w-full h-24 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-slate-200 resize-none"
                  value={newRisk.description}
                  onChange={e => setNewRisk({...newRisk, description: e.target.value})}
                  placeholder="Describe the risk scenario..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Create Risk
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
