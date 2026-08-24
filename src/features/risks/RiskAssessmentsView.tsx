import React, { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../../lib/apiClient';
import { Link } from 'react-router';

export const RiskAssessmentsView = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch('/api/v1/risk-assessments');
      setAssessments(data);
    } catch (error) {
      console.error('Failed to load assessments', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityBadge = (score: number) => {
    if (score >= 15) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-error/10 text-error border border-error/20">Critical</span>;
    if (score >= 10) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-600 border border-orange-500/20">High</span>;
    if (score >= 5) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-warning/10 text-warning border border-warning/20">Medium</span>;
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-success/10 text-success border border-success/20">Low</span>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 15) return "text-error bg-error/10 border-error/20";
    if (score >= 10) return "text-orange-600 bg-orange-500/10 border-orange-500/20";
    if (score >= 5) return "text-warning bg-warning/10 border-warning/20";
    return "text-success bg-success/10 border-success/20";
  };

  const filteredAssessments = useMemo(() => {
    return assessments.filter(a => a.riskTitle?.toLowerCase().includes(search.toLowerCase()));
  }, [assessments, search]);

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-[1440px] mx-auto w-full animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">fact_check</span>
            </div>
            <h1 className="font-headline-lg text-text-primary tracking-tight">Risk Assessments</h1>
          </div>
          <p className="font-body-md text-text-secondary mt-2">Global view of all risk evaluations and scoring across the enterprise.</p>
        </div>
      </div>

      <section className="bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-border bg-surface-secondary/50 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-text-tertiary">search</span>
            <input 
              placeholder="Search by risk title..." 
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
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Assessed At</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold text-center">Score (P×I)</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Severity</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-text-primary divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-4 border-surface-container border-t-primary rounded-full animate-spin"></div>
                      <p className="font-body-sm text-text-secondary">Loading assessments...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-text-tertiary">
                      <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">find_in_page</span>
                      <h3 className="font-headline-sm text-text-primary">No assessments found</h3>
                      <p className="font-body-sm text-text-secondary">Risk assessments will appear here once submitted.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssessments.map(a => (
                  <tr key={a.id} className="hover:bg-surface-secondary/50 transition-colors group">
                    <td className="px-5 py-4">
                      <Link to={`/risks/${a.riskId}`} className="font-medium text-text-primary hover:text-primary transition-colors flex items-center gap-2">
                        {a.riskTitle}
                        <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">
                      {new Date(a.assessedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 align-middle text-center">
                      <div className="flex flex-col items-center">
                        <div className={`font-bold text-[14px] px-2 py-0.5 rounded border ${getScoreColor(a.score)} min-w-[32px] inline-flex items-center justify-center`}>
                          {a.score}
                        </div>
                        <div className="text-[11px] text-text-tertiary mt-1 font-mono">
                          P:{a.probability} × I:{a.impact}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {getSeverityBadge(a.score)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link to={`/risks/${a.riskId}`} className="text-primary hover:text-primary/80 font-medium text-xs inline-flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
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
