import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../lib/apiClient';
import { Link } from 'react-router';

export const RiskTreatmentsView = () => {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadTreatments();
  }, []);

  const loadTreatments = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch('/api/v1/risk-treatments');
      setTreatments(data);
    } catch (error) {
      console.error('Failed to load treatments', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTreatments = useMemo(() => {
    return treatments.filter(t => 
      t.riskTitle?.toLowerCase().includes(search.toLowerCase()) || 
      t.description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [treatments, search]);

  const getTreatmentColor = (type: string) => {
    switch (type) {
      case 'Mitigate': return "bg-primary/10 text-primary border-primary/20";
      case 'Accept': return "bg-success/10 text-success border-success/20";
      case 'Transfer': return "bg-warning/10 text-warning border-warning/20";
      case 'Avoid': return "bg-error/10 text-error border-error/20";
      default: return "bg-surface-container-low text-text-secondary border-border";
    }
  };

  const getTreatmentIcon = (type: string) => {
    switch (type) {
      case 'Mitigate': return "shield";
      case 'Accept': return "thumb_up";
      case 'Transfer': return "move_up";
      case 'Avoid': return "block";
      default: return "healing";
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-[1440px] mx-auto w-full animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">healing</span>
            </div>
            <h1 className="font-headline-lg text-text-primary tracking-tight">Risk Treatments</h1>
          </div>
          <p className="font-body-md text-text-secondary mt-2">Global view of all risk treatment plans and mitigation strategies.</p>
        </div>
      </div>

      <section className="bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-border bg-surface-secondary/50 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-text-tertiary">search</span>
            <input 
              placeholder="Search treatments by risk or description..." 
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
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Related Risk</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Treatment Strategy</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Description</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Due Date</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-text-primary divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-4 border-surface-container border-t-primary rounded-full animate-spin"></div>
                      <p className="font-body-sm text-text-secondary">Loading treatments...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTreatments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-text-tertiary">
                      <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">medical_services</span>
                      <h3 className="font-headline-sm text-text-primary">No treatments found</h3>
                      <p className="font-body-sm text-text-secondary">Treatment plans will appear here once created.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTreatments.map(t => (
                  <tr key={t.id} className="hover:bg-surface-secondary/50 transition-colors group">
                    <td className="px-5 py-4">
                      <Link to={`/risks/${t.riskId}`} className="font-medium text-text-primary hover:text-primary transition-colors flex items-center gap-2">
                        {t.riskTitle}
                        <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getTreatmentColor(t.type)}`}>
                        <span className="material-symbols-outlined text-[14px] mr-1.5">{getTreatmentIcon(t.type)}</span>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-text-secondary max-w-sm truncate" title={t.description}>
                      {t.description}
                    </td>
                    <td className="px-5 py-4 text-text-tertiary">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date set'}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link to={`/risks/${t.riskId}`} className="text-primary hover:text-primary/80 font-medium text-xs inline-flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        View Risk <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
