import React, { useState, useEffect } from 'react';
import { Target, Search, Activity, ArrowUpRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { apiFetch } from '../../lib/apiClient';
import { Link } from 'react-router';

export const RiskAssessmentsView = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    if (score >= 15) return <Badge variant="destructive" className="bg-rose-100 text-rose-700 border-rose-200">High</Badge>;
    if (score >= 8) return <Badge variant="default" className="bg-amber-100 text-amber-700 border-amber-200">Medium</Badge>;
    return <Badge variant="default" className="bg-emerald-100 text-emerald-700 border-emerald-200">Low</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Risk Assessments</h2>
        <p className="text-slate-500 text-sm mt-1">Global view of all risk evaluations across the enterprise.</p>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search assessments..." className="pl-9 bg-white border-slate-200" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-6 py-4">Related Risk</th>
                <th className="px-6 py-4">Assessed At</th>
                <th className="px-6 py-4">Score (P×I)</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Loading assessments...
                  </td>
                </tr>
              ) : assessments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-slate-900">No assessments found</p>
                  </td>
                </tr>
              ) : (
                assessments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/risks/${a.riskId}`} className="font-medium text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                        {a.riskTitle}
                        <ArrowUpRight className="h-3 w-3 opacity-50" />
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(a.assessedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-700">{a.score}</span>
                        <span className="text-[10px] text-slate-400">/ 25</span>
                        <span className="text-xs text-slate-400 ml-1">({a.probability}×{a.impact})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getSeverityBadge(a.score)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/risks/${a.riskId}`} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">
                        View Risk
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
