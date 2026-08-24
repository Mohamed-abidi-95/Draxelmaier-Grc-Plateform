import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, FileText, CheckSquare, 
  TrendingUp, Activity, BarChart2, Download, ArrowUpRight
} from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

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

// Premium SaaS Colors
const COLORS = ['#10b981', '#f43f5e', '#cbd5e1']; // Emerald, Rose, Slate-300

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
      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading intelligence...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <ShieldAlert className="h-10 w-10 text-rose-500 mb-3" />
        <p>Failed to load dashboard data.</p>
      </div>
    );
  }

  const unassessedCount = metrics.totalRequirementsCount - metrics.compliantRequirementsCount - metrics.nonCompliantRequirementsCount;
  
  const riskSeverityData = metrics.risksBySeverity ? [
    { name: 'High', value: metrics.risksBySeverity['High'] || 0 },
    { name: 'Medium', value: metrics.risksBySeverity['Medium'] || 0 },
    { name: 'Low', value: metrics.risksBySeverity['Low'] || 0 }
  ].filter(d => d.value > 0) : [];

  const frameworkData = metrics.complianceByFramework ? metrics.complianceByFramework.map(fw => ({
    name: fw.frameworkName,
    score: fw.complianceScorePercentage
  })) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Security Posture Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time metrics and compliance health for your organization.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors">
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* KPI 1 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText className="h-16 w-16 text-indigo-600" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Policies</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-slate-900 tracking-tight">{metrics.activePoliciesCount}</span>
            <span className="flex items-center text-xs font-medium text-emerald-600 mb-1.5">
              <TrendingUp className="h-3 w-3 mr-1" />
              Up to date
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert className="h-16 w-16 text-rose-600" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Open Risks</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-slate-900 tracking-tight">{metrics.openRisksCount}</span>
            {metrics.highSeverityRisksCount > 0 ? (
              <span className="flex items-center text-xs font-semibold text-rose-600 mb-1.5 px-2 py-0.5 bg-rose-50 rounded-full border border-rose-100">
                {metrics.highSeverityRisksCount} High Severity
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-400 mb-1.5">All mitigated</span>
            )}
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck className="h-16 w-16 text-emerald-600" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Compliance</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-slate-900 tracking-tight">{metrics.complianceRate.toFixed(1)}%</span>
            <span className="text-xs font-medium text-slate-400 mb-1.5">
              {metrics.compliantRequirementsCount} of {metrics.totalRequirementsCount}
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckSquare className="h-16 w-16 text-sky-600" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <CheckSquare className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Audits</h3>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-slate-900 tracking-tight">{metrics.totalAuditsCount}</span>
            <span className="flex items-center text-xs font-medium text-sky-600 mb-1.5 cursor-pointer hover:underline">
              View Log <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Compliance By Framework Chart - Takes 1/3 width */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-slate-500" />
              Compliance Score by Framework
            </h3>
          </div>
          <div className="p-6 flex-1 flex items-center justify-center min-h-[320px]">
            {frameworkData.length === 0 ? (
              <div className="text-center text-slate-400">No frameworks found</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={frameworkData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false} 
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    formatter={(value: any) => [`${value}%`, 'Score']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Risks by Severity Chart - Takes 1/3 width */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-slate-500" />
              Active Risks by Severity
            </h3>
          </div>
          <div className="p-6 flex-1 flex items-center justify-center min-h-[320px]">
            {riskSeverityData.length === 0 ? (
              <div className="text-center text-slate-400">No active risks</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskSeverityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={4}
                  >
                    {riskSeverityData.map((entry, index) => {
                      let color = '#94a3b8'; // default
                      if (entry.name === 'High') color = '#ef4444';
                      if (entry.name === 'Medium') color = '#f59e0b';
                      if (entry.name === 'Low') color = '#10b981';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* System Health / Summary - Takes 1/3 width */}
        <div className="lg:col-span-1 bg-slate-900 rounded-xl border border-slate-800 shadow-lg text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
          <div className="relative z-10 p-6 flex flex-col h-full">
            <h3 className="font-semibold text-slate-100 flex items-center gap-2 mb-6">
              <Activity className="h-4 w-4 text-indigo-400" />
              System Intelligence
            </h3>
            
            <div className="space-y-6 flex-1">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Posture Status</p>
                {metrics.complianceRate > 80 && metrics.highSeverityRisksCount === 0 ? (
                  <div className="text-emerald-400 font-medium flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    Healthy & Compliant
                  </div>
                ) : metrics.highSeverityRisksCount > 0 ? (
                  <div className="text-rose-400 font-medium flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-rose-400 animate-pulse"></div>
                    Action Required
                  </div>
                ) : (
                  <div className="text-amber-400 font-medium flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></div>
                    Needs Improvement
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Mapping Coverage</div>
                  <div className="flex items-end justify-between">
                    <span className="font-semibold text-slate-200">
                      {metrics.totalRequirementsCount > 0 ? 
                        Math.round(((metrics.compliantRequirementsCount + metrics.nonCompliantRequirementsCount) / metrics.totalRequirementsCount) * 100) 
                        : 0}%
                    </span>
                    <span className="text-[10px] text-slate-500">Assessed</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full" 
                      style={{ width: `${metrics.totalRequirementsCount > 0 ? ((metrics.compliantRequirementsCount + metrics.nonCompliantRequirementsCount) / metrics.totalRequirementsCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Risk Exposure</div>
                  <div className="flex items-end justify-between">
                    <span className="font-semibold text-slate-200">
                      {metrics.highSeverityRisksCount} Critical
                    </span>
                    <span className="text-[10px] text-slate-500">Unmitigated</span>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              <Bot className="h-4 w-4" />
              Ask AI Assistant
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Quick mock for Bot icon if not imported
const Bot = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);
