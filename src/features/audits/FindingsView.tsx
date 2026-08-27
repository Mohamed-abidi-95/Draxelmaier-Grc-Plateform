import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/apiClient';
import { Search, Filter, AlertCircle, Clock, ShieldCheck, CheckCircle } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';

interface Finding {
  id: string;
  auditId: string;
  auditTitle: string;
  title: string;
  description: string;
  severity: number;
  status: number;
  assigneeName: string;
  dueDate: string;
}

export const FindingsView = () => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchFindings = async () => {
      try {
        const data = await apiFetch('/api/v1/findings');
        setFindings(data || []);
      } catch (err) {
        console.error('Failed to load findings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFindings();
  }, []);

  const getSeverityBadge = (severity: number) => {
    switch (severity) {
      case 3: return <Badge className="bg-error/10 text-error hover:bg-error/20">Critical</Badge>;
      case 2: return <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20">High</Badge>;
      case 1: return <Badge className="bg-warning/10 text-warning-700 hover:bg-warning/20">Medium</Badge>;
      default: return <Badge className="bg-success/10 text-success hover:bg-success/20">Low</Badge>;
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: return <Badge className="bg-slate-100 text-slate-700">Open</Badge>;
      case 1: return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>;
      case 2: return <Badge className="bg-emerald-100 text-emerald-700">Resolved</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  const filteredFindings = findings.filter(f => 
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.auditTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-[1440px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Findings & Corrective Actions</h2>
          <p className="text-slate-500 text-sm mt-1">Manage audit findings, track remediation progress, and assign corrective actions.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white shadow-sm hover:bg-slate-100 h-9 px-4 py-2">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-slate-500">Open Findings</span>
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">{findings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-slate-500">Overdue Actions</span>
              <Clock className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-slate-500">Resolution Rate</span>
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900">0%</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search findings by title, description or audit..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[40%]">Finding Details</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Source Audit</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                      Loading findings...
                    </div>
                  </td>
                </tr>
              ) : filteredFindings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle className="h-12 w-12 text-slate-300 mb-4" />
                      <p className="text-slate-600 font-medium">No open findings</p>
                      <p className="text-sm">Great job! You have addressed all identified issues.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFindings.map((finding) => (
                  <tr key={finding.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{finding.title}</div>
                      <div className="text-sm text-slate-500 line-clamp-1 mt-1">{finding.description}</div>
                    </td>
                    <td className="px-6 py-4">{getSeverityBadge(finding.severity)}</td>
                    <td className="px-6 py-4">{getStatusBadge(finding.status)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 font-medium">{finding.auditTitle || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-slate-600 font-medium">
                        {finding.dueDate ? new Date(finding.dueDate).toLocaleDateString() : 'No due date'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
