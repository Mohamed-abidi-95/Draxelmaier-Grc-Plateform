import React, { useState, useEffect } from 'react';
import { ShieldPlus, Search, ArrowUpRight, Calendar } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { apiFetch } from '../../lib/apiClient';
import { Link } from 'react-router';

export const RiskTreatmentsView = () => {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Risk Treatments</h2>
        <p className="text-slate-500 text-sm mt-1">Global view of all risk treatment plans.</p>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search treatments..." className="pl-9 bg-white border-slate-200" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-6 py-4">Related Risk</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Loading treatments...
                  </td>
                </tr>
              ) : treatments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <ShieldPlus className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-slate-900">No treatments planned</p>
                  </td>
                </tr>
              ) : (
                treatments.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/risks/${t.riskId}`} className="font-medium text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                        {t.riskTitle}
                        <ArrowUpRight className="h-3 w-3 opacity-50" />
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-slate-100 text-slate-700">
                        {t.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                      {t.description}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/risks/${t.riskId}`} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">
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
