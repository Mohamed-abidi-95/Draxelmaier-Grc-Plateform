import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/apiClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DashboardMetrics {
  activePoliciesCount: number;
  openRisksCount: number;
  highSeverityRisksCount: number;
  totalAuditsCount: number;
  totalRequirementsCount: number;
  compliantRequirementsCount: number;
  nonCompliantRequirementsCount: number;
  complianceRate: number;
  risksBySeverity: Record<string, number>;
  riskHeatmap: Record<string, number>;
  riskRadarNodes: {
    riskId: string;
    code: string;
    title: string;
    probability: number;
    impact: number;
    trajectory: number;
    score: number;
  }[];
  openFindingsCount: number;
  overdueActionsCount: number;
  expiringPoliciesCount: number;
  complianceByFramework: { frameworkId: string, frameworkName: string, complianceScorePercentage: number }[];
}

export const DashboardView = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await apiFetch('/api/v1/dashboard/metrics');
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-tertiary space-y-4 pt-20 animate-pulse">
        <div className="w-10 h-10 border-4 border-surface-container border-t-primary rounded-full animate-spin"></div>
        <p className="font-body-md text-text-secondary">Loading intelligence...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-secondary pt-20">
        <span className="material-symbols-outlined text-error text-[48px] mb-4 opacity-80">error_outline</span>
        <p className="font-headline-sm text-text-primary">Unable to load dashboard</p>
        <p className="font-body-sm text-text-tertiary mt-2">Please check your connection and try again.</p>
      </div>
    );
  }

  const getStatusBadge = (score: number) => {
    if (score >= 90) {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success border border-success/20"><span className="w-1.5 h-1.5 rounded-full bg-success"></span>Compliant</span>;
    }
    if (score >= 60) {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-warning/10 text-warning border border-warning/20"><span className="w-1.5 h-1.5 rounded-full bg-warning"></span>Action Required</span>;
    }
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20"><span className="w-1.5 h-1.5 rounded-full bg-error"></span>Non-Compliant</span>;
  };

  const getStatusColor = (score: number) => {
    if (score >= 90) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-error';
  };

  const renderStackedBarChart = () => {
    // Calculate distribution from radar nodes
    let critical = 0, high = 0, medium = 0, low = 0;
    const total = metrics.riskRadarNodes?.length || 0;
    
    metrics.riskRadarNodes?.forEach(node => {
      if (node.score >= 15) critical++;
      else if (node.score >= 10) high++;
      else if (node.score >= 5) medium++;
      else if (node.score > 0) low++;
    });

    const getPercent = (count: number) => total > 0 ? (count / total) * 100 : 0;
    
    return (
      <div className="flex flex-col w-full h-full p-6 relative bg-white">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-[18px] font-bold text-slate-900 leading-tight">Exposition Globale</h3>
            <p className="text-[13px] text-slate-500 mt-1">Répartition de vos {total} risques par niveau de criticité.</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 flex flex-col items-center">
            <span className="text-[24px] font-extrabold text-slate-900 leading-none">{total}</span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-1">Risques Actifs</span>
          </div>
        </div>

        {/* Stacked Bar */}
        <div className="w-full h-8 flex rounded-full overflow-hidden shadow-inner bg-slate-100 mt-2">
          {critical > 0 && <div className="h-full bg-[#E63946] transition-all duration-1000" style={{ width: `${getPercent(critical)}%` }} title={`Critical: ${critical}`}></div>}
          {high > 0 && <div className="h-full bg-[#F59E0B] transition-all duration-1000" style={{ width: `${getPercent(high)}%` }} title={`High: ${high}`}></div>}
          {medium > 0 && <div className="h-full bg-[#FBBF24] transition-all duration-1000" style={{ width: `${getPercent(medium)}%` }} title={`Medium: ${medium}`}></div>}
          {low > 0 && <div className="h-full bg-[#10B981] transition-all duration-1000" style={{ width: `${getPercent(low)}%` }} title={`Low: ${low}`}></div>}
        </div>

        {/* Legend and Stats */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="flex flex-col p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#E63946] shadow-sm"></div>
                <span className="text-[13px] font-semibold text-slate-700">Critique</span>
              </div>
              <span className="text-[14px] font-bold text-[#E63946]">{critical}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">{getPercent(critical).toFixed(1)}% du total</span>
          </div>

          <div className="flex flex-col p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#F59E0B] shadow-sm"></div>
                <span className="text-[13px] font-semibold text-slate-700">Haut</span>
              </div>
              <span className="text-[14px] font-bold text-[#F59E0B]">{high}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">{getPercent(high).toFixed(1)}% du total</span>
          </div>

          <div className="flex flex-col p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FBBF24] shadow-sm"></div>
                <span className="text-[13px] font-semibold text-slate-700">Moyen</span>
              </div>
              <span className="text-[14px] font-bold text-[#FBBF24]">{medium}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">{getPercent(medium).toFixed(1)}% du total</span>
          </div>

          <div className="flex flex-col p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-sm"></div>
                <span className="text-[13px] font-semibold text-slate-700">Faible</span>
              </div>
              <span className="text-[14px] font-bold text-[#10B981]">{low}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">{getPercent(low).toFixed(1)}% du total</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-[1440px] mx-auto w-full animate-fade-in">
      
      {/* Header Section */}
      <header className="flex flex-col gap-1 mb-2">
        <h1 className="font-headline-lg text-text-primary tracking-tight">Security Posture</h1>
        <p className="font-body-md text-text-secondary">Overview of your compliance and risk metrics.</p>
      </header>

      {/* KPI Cards Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Compliance Card */}
        <div className="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-text-secondary uppercase tracking-wider">Compliance Adherence</span>
            <div className="p-2 bg-success/10 rounded-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-success text-[20px]">verified</span>
            </div>
          </div>
          <div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-bold text-text-primary tracking-tight">{metrics.complianceRate.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-surface-secondary h-2 rounded-full overflow-hidden">
              <div className="bg-success h-full transition-all duration-1000 ease-out" style={{ width: `${metrics.complianceRate}%` }}></div>
            </div>
          </div>
        </div>

        {/* Risks Card */}
        <div className="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md hover:border-error/40 transition-all duration-300 group flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-text-secondary uppercase tracking-wider">Open Risks</span>
            <div className="p-2 bg-error/10 rounded-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-error text-[20px]">warning</span>
            </div>
          </div>
          <div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-text-primary tracking-tight">{metrics.openRisksCount}</span>
            </div>
            <p className={`font-body-sm mt-2 font-medium ${metrics.highSeverityRisksCount > 0 ? 'text-error' : 'text-success'}`}>
              {metrics.highSeverityRisksCount > 0 ? `🚨 ${metrics.highSeverityRisksCount} High Severity` : '✨ All mitigated'}
            </p>
          </div>
        </div>

        {/* Policies Card */}
        <div className="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-text-secondary uppercase tracking-wider">Active Policies</span>
            <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-[20px]">description</span>
            </div>
          </div>
          <div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-text-primary tracking-tight">{metrics.activePoliciesCount}</span>
            </div>
            <p className="font-body-sm text-text-secondary mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">update</span>
              Recently updated
            </p>
          </div>
        </div>

        {/* Audits & Findings Card */}
        <div className="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all duration-300 group flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-text-secondary uppercase tracking-wider">Findings & Actions</span>
            <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-indigo-600 text-[20px]">assignment_late</span>
            </div>
          </div>
          <div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-text-primary tracking-tight">{metrics.openFindingsCount}</span>
            </div>
            <p className={`font-body-sm mt-2 flex items-center gap-1 font-medium ${metrics.overdueActionsCount > 0 ? 'text-error' : 'text-success'}`}>
              <span className="material-symbols-outlined text-[14px]">{metrics.overdueActionsCount > 0 ? 'schedule' : 'check_circle'}</span>
              {metrics.overdueActionsCount > 0 ? `${metrics.overdueActionsCount} actions overdue` : 'All actions on track'}
            </p>
          </div>
        </div>

      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Predictive Risk Radar Chart */}
        <div className="lg:col-span-1 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          {renderStackedBarChart()}
        </div>

        {/* Framework Adherence Table */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
            <h2 className="font-headline-sm text-text-primary">Framework Adherence</h2>
            <span className="material-symbols-outlined text-text-tertiary">format_list_bulleted</span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="bg-surface/50 border-b border-border">
                <tr>
                  <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Framework</th>
                  <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Status</th>
                  <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Coverage Progress</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-text-primary divide-y divide-border/50">
                {metrics.complianceByFramework && metrics.complianceByFramework.length > 0 ? (
                  metrics.complianceByFramework.map(fw => (
                    <tr key={fw.frameworkId} className="hover:bg-surface-secondary/50 transition-colors cursor-pointer group">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-text-primary group-hover:text-primary transition-colors flex items-center gap-2">
                           <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center text-primary font-bold text-xs border border-primary/10">
                             {fw.frameworkName.substring(0,2).toUpperCase()}
                           </div>
                           {fw.frameworkName}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {getStatusBadge(fw.complianceScorePercentage)}
                      </td>
                      <td className="px-5 py-4 w-1/3">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-text-secondary w-10">{Math.round(fw.complianceScorePercentage)}%</span>
                          <div className="flex-1 bg-surface-container-low h-2 rounded-full overflow-hidden">
                            <div 
                              className={`${getStatusColor(fw.complianceScorePercentage)} h-full rounded-full transition-all duration-1000 ease-out`} 
                              style={{ width: `${fw.complianceScorePercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center text-text-tertiary">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-4xl opacity-50">data_alert</span>
                        <p className="font-body-sm">No framework data available.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </section>
    </div>
  );
};
