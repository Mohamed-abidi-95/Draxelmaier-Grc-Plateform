import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/apiClient';

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
      <div className="flex flex-col items-center justify-center h-full text-text-tertiary space-y-4 pt-20">
        <div className="w-8 h-8 border-4 border-surface-container border-t-primary rounded-full animate-spin"></div>
        <p className="font-body-sm text-body-sm">Loading intelligence...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-secondary pt-20">
        <span className="material-symbols-outlined text-error text-[40px] mb-3">warning</span>
        <p className="font-body-md text-body-md">Failed to load dashboard data.</p>
      </div>
    );
  }

  const getStatusBadge = (score: number) => {
    if (score >= 90) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-success/10 text-success border border-success/20">Compliant</span>;
    }
    if (score >= 60) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-warning/10 text-warning border border-warning/20">Action Required</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-error/10 text-error border border-error/20">Non-Compliant</span>;
  };

  const getStatusColor = (score: number) => {
    if (score >= 90) return 'bg-success';
    if (score >= 60) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="flex-1 flex flex-col gap-gutter max-w-[1440px] mx-auto w-full">
      {/* Executive Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Metric 1 */}
        <div className="bg-surface border border-border p-density-comfortable rounded-lg flex flex-col gap-2 hover:border-primary transition-colors duration-200 group">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-label-md text-text-secondary">Open Risks</span>
            <span className="material-symbols-outlined text-warning">warning</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg text-text-primary group-hover:text-primary transition-colors">{metrics.openRisksCount}</span>
          </div>
          <p className={`font-body-sm text-body-sm mt-2 ${metrics.highSeverityRisksCount > 0 ? 'text-error' : 'text-success'}`}>
            {metrics.highSeverityRisksCount > 0 ? `${metrics.highSeverityRisksCount} High Severity` : 'All mitigated'}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface border border-border p-density-comfortable rounded-lg flex flex-col gap-2 hover:border-primary transition-colors duration-200 group">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-label-md text-text-secondary">Compliance Adherence</span>
            <span className="material-symbols-outlined text-success">verified</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg text-text-primary group-hover:text-primary transition-colors">
              {metrics.complianceRate.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-surface-container-low h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-success h-full" style={{ width: `${metrics.complianceRate}%` }}></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface border border-border p-density-comfortable rounded-lg flex flex-col gap-2 hover:border-primary transition-colors duration-200 group">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-label-md text-text-secondary">Active Policies</span>
            <span className="material-symbols-outlined text-primary">description</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg text-text-primary group-hover:text-primary transition-colors">{metrics.activePoliciesCount}</span>
          </div>
          <p className="font-body-sm text-body-sm text-text-tertiary mt-2">
            Total Audits: {metrics.totalAuditsCount}
          </p>
        </div>
      </section>

      {/* Framework Adherence Table */}
      <section className="bg-surface border border-border rounded-lg overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <div className="px-density-comfortable py-3 border-b border-border bg-surface-secondary flex justify-between items-center">
          <h2 className="font-headline-sm text-headline-sm text-text-primary">Framework Adherence</h2>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-surface-secondary sticky top-0 z-10 border-b border-border">
              <tr>
                <th className="px-density-comfortable py-2 font-label-md text-label-md text-text-secondary font-medium">Framework</th>
                <th className="px-density-comfortable py-2 font-label-md text-label-md text-text-secondary font-medium">Status</th>
                <th className="px-density-comfortable py-2 font-label-md text-label-md text-text-secondary font-medium">Coverage</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-text-primary divide-y divide-border">
              {metrics.complianceByFramework && metrics.complianceByFramework.length > 0 ? (
                metrics.complianceByFramework.map(fw => (
                  <tr key={fw.frameworkId} className="hover:bg-surface-secondary transition-colors cursor-pointer group">
                    <td className="px-density-comfortable py-4">
                      <div className="font-medium group-hover:text-primary transition-colors">{fw.frameworkName}</div>
                    </td>
                    <td className="px-density-comfortable py-4">
                      {getStatusBadge(fw.complianceScorePercentage)}
                    </td>
                    <td className="px-density-comfortable py-4">
                      <div className="flex items-center gap-2">
                        <span>{Math.round(fw.complianceScorePercentage)}%</span>
                        <div className="w-16 bg-border h-1 rounded-full overflow-hidden">
                          <div 
                            className={`${getStatusColor(fw.complianceScorePercentage)} h-full rounded-full`} 
                            style={{ width: `${fw.complianceScorePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-density-comfortable py-8 text-center text-text-tertiary font-body-sm">
                    No framework data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
