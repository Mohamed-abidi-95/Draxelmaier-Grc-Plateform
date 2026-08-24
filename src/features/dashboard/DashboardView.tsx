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

  // Prepare data for the Pie Chart
  const riskData = Object.entries(metrics.risksBySeverity).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value
  }));

  const COLORS = {
    High: 'var(--color-error)',
    Medium: 'var(--color-warning)',
    Low: 'var(--color-success)',
    Critical: '#991B1B' // Darker red for critical
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

        {/* Audits Card */}
        <div className="bg-surface border border-border p-5 rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 group flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-md text-text-secondary uppercase tracking-wider">Total Audits</span>
            <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-indigo-600 text-[20px]">assignment</span>
            </div>
          </div>
          <div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-text-primary tracking-tight">{metrics.totalAuditsCount}</span>
            </div>
            <p className="font-body-sm text-text-secondary mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Across all frameworks
            </p>
          </div>
        </div>

      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risks Chart */}
        <div className="lg:col-span-1 bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
            <h2 className="font-headline-sm text-text-primary">Risks by Severity</h2>
            <span className="material-symbols-outlined text-text-tertiary">pie_chart</span>
          </div>
          <div className="p-5 flex-1 flex flex-col items-center justify-center min-h-[300px]">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || 'var(--color-primary)'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-text-tertiary flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl opacity-50">done_all</span>
                <p className="font-body-sm">No active risks found.</p>
              </div>
            )}
          </div>
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
