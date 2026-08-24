import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';

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
      
      let rStatus = r.status === '0' ? 'Ouvert' : r.status === '1' ? 'Mitigated' : 'Closed';
      if (r.status === '0') rStatus = 'Ouvert';
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
    if (!hasAssessment) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border border-error/20 text-error bg-error/5">Non évalué</span>;
    if (status === 'Open' || status === '0') return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-container-low text-text-secondary border border-border">Ouvert</span>;
    if (status === 'Mitigated' || status === '1') return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-success/10 text-success border border-success/20">Traité</span>;
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-warning/10 text-warning border border-warning/20">Accepté</span>;
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-[1440px] mx-auto w-full animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">gavel</span>
            </div>
            <h1 className="font-headline-lg text-text-primary tracking-tight">Risk Register</h1>
          </div>
          <p className="font-body-md text-text-secondary mt-2">Manage, assess, and treat enterprise risks across your organization.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90 text-white shadow-sm px-4 py-2 flex items-center gap-2 rounded-lg transition-all hover:shadow-md">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Log New Risk
        </Button>
      </div>

      {/* SEVERITY SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
        <div className="bg-surface border border-error/20 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-error text-6xl">dangerous</span></div>
          <div className="text-4xl font-bold text-text-primary tracking-tight relative z-10">{kpis.critical}</div>
          <div className="font-label-md uppercase text-error tracking-wider mt-2 relative z-10 font-bold">Critique</div>
        </div>
        <div className="bg-surface border border-orange-500/20 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-orange-500 text-6xl">warning</span></div>
          <div className="text-4xl font-bold text-text-primary tracking-tight relative z-10">{kpis.high}</div>
          <div className="font-label-md uppercase text-orange-500 tracking-wider mt-2 relative z-10 font-bold">Élevé</div>
        </div>
        <div className="bg-surface border border-warning/20 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-warning text-6xl">error</span></div>
          <div className="text-4xl font-bold text-text-primary tracking-tight relative z-10">{kpis.medium}</div>
          <div className="font-label-md uppercase text-warning tracking-wider mt-2 relative z-10 font-bold">Moyen</div>
        </div>
        <div className="bg-surface border border-success/20 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-success text-6xl">check_circle</span></div>
          <div className="text-4xl font-bold text-text-primary tracking-tight relative z-10">{kpis.low}</div>
          <div className="font-label-md uppercase text-success tracking-wider mt-2 relative z-10 font-bold">Faible</div>
        </div>
        <div className="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-text-secondary text-6xl">help</span></div>
          <div className="text-4xl font-bold text-text-primary tracking-tight relative z-10">{kpis.unassessed}</div>
          <div className="font-label-md uppercase text-text-secondary tracking-wider mt-2 relative z-10 font-bold">Non évalués</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="font-label-md text-text-tertiary">
          Affichage de {filteredRisks.length} sur {risks.length} risques
        </div>
      </div>

      <section className="bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        {/* FILTER BAR */}
        <div className="px-5 py-4 border-b border-border bg-surface-secondary/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-[350px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-text-tertiary">search</span>
            <input 
              placeholder="Rechercher un risque (code, titre)…" 
              className="w-full pl-10 pr-4 py-2 font-body-sm text-text-primary bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              className="px-4 py-2 bg-surface border border-border rounded-lg font-body-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all"
              value={categoryFilter}
              onChange={(e: any) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Toutes catégories</option>
              {allCategories.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
            </select>
            <select 
              className="px-4 py-2 bg-surface border border-border rounded-lg font-body-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-all"
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous statuts</option>
              <option value="Non évalué">Non évalués</option>
              {allStatuses.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
            </select>
            <Button 
              variant="outline" 
              onClick={() => { setSearch(''); setCategoryFilter('all'); setStatusFilter('all'); }}
              className="flex items-center gap-1 border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary px-3"
              title="Réinitialiser les filtres"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
            </Button>
          </div>
        </div>

        {/* RISK TABLE */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="bg-surface/50 border-b border-border">
              <tr>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Risque</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Catégorie</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold text-center">Score (P×I)</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Propriétaire</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Statut</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold text-center">Contrôles</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-text-primary divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-4 border-surface-container border-t-primary rounded-full animate-spin"></div>
                      <p className="font-body-sm text-text-secondary">Loading risks...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRisks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-text-tertiary">
                      <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">policy</span>
                      <h3 className="font-headline-sm text-text-primary">Aucun risque trouvé</h3>
                      <p className="font-body-sm text-text-secondary">Essayez de modifier vos filtres ou ajoutez un nouveau risque.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRisks.map((risk, index) => {
                  const assessment = getLatestScore(risk);
                  
                  // Calculate Severity Color
                  let scoreColor = "text-text-primary bg-surface-container-low border-border";
                  if (assessment) {
                    if (assessment.score >= 15) scoreColor = "text-error bg-error/10 border-error/20";
                    else if (assessment.score >= 10) scoreColor = "text-orange-600 bg-orange-500/10 border-orange-500/20";
                    else if (assessment.score >= 5) scoreColor = "text-warning bg-warning/10 border-warning/20";
                    else scoreColor = "text-success bg-success/10 border-success/20";
                  }

                  return (
                    <tr 
                      key={risk.id} 
                      onClick={() => window.location.href = `/risks/${risk.id}`}
                      className="hover:bg-surface-secondary/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-4 align-middle">
                        <div className="font-mono text-[11px] text-text-tertiary mb-1 bg-surface-container-low inline-block px-1.5 py-0.5 rounded border border-border">
                          {risk.code || 'RSK-UNASSIGNED'}
                        </div>
                        <div className="font-medium text-text-primary group-hover:text-primary transition-colors leading-tight">
                          {risk.title}
                        </div>
                        {!assessment && (
                          <div className="text-[11px] text-error flex items-center mt-1.5 font-medium bg-error/5 inline-flex px-1.5 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[14px] mr-1">warning</span>
                            Non évalué
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 align-middle text-text-secondary">
                        {risk.category || 'Non classé'}
                      </td>
                      <td className="px-5 py-4 align-middle text-center">
                        {assessment ? (
                          <div className="flex flex-col items-center">
                            <div className={`font-bold text-[14px] px-2 py-0.5 rounded border ${scoreColor} min-w-[32px] inline-flex items-center justify-center`}>
                              {assessment.score}
                            </div>
                            <div className="text-[11px] text-text-tertiary mt-1 font-mono">
                              P:{assessment.probability} × I:{assessment.impact}
                            </div>
                          </div>
                        ) : (
                          <span className="text-text-tertiary italic text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 align-middle font-medium text-text-secondary">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                            {risk.ownerName?.substring(0,2).toUpperCase() || 'NA'}
                          </div>
                          {risk.ownerName || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        {getStatusPill(risk.status, !!assessment)}
                      </td>
                      <td className="px-5 py-4 align-middle text-center">
                        <span className="inline-flex items-center justify-center bg-surface-container-low text-text-secondary text-[11px] font-bold h-6 min-w-[24px] px-2 rounded-full border border-border">
                          {risk.controlsCount}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-middle text-right">
                        <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center p-1.5 bg-primary/10 rounded-lg hover:bg-primary hover:text-white">
                          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create Risk Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-border scale-in-center">
            
            <div className="px-6 py-5 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">add_box</span>
                </div>
                <h3 className="font-headline-sm text-text-primary">Log New Risk</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-secondary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateRisk} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block font-label-md text-text-secondary uppercase tracking-wider">Risk ID (Code)</label>
                  <input 
                    required 
                    autoFocus
                    value={newRisk.code}
                    onChange={(e: any) => setNewRisk({...newRisk, code: e.target.value})}
                    placeholder="e.g. RSK-001"
                    className="w-full px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-label-md text-text-secondary uppercase tracking-wider">Category</label>
                  <input 
                    required 
                    value={newRisk.category}
                    onChange={(e: any) => setNewRisk({...newRisk, category: e.target.value})}
                    placeholder="e.g. Cybersécurité"
                    className="w-full px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Risk Title</label>
                <input 
                  required 
                  value={newRisk.title}
                  onChange={(e: any) => setNewRisk({...newRisk, title: e.target.value})}
                  placeholder="e.g., Unpatched legacy servers"
                  className="w-full px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Description</label>
                <textarea 
                  required
                  className="w-full h-24 px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary resize-none"
                  value={newRisk.description}
                  onChange={e => setNewRisk({...newRisk, description: e.target.value})}
                  placeholder="Describe the risk scenario..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-2">
                <Button type="button" variant="outline" className="px-5 font-medium border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="px-5 bg-primary hover:bg-primary/90 text-white font-medium flex items-center gap-2">
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
