import React, { useState, useEffect } from 'react';
import { Activity, Search, Shield, User as UserIcon, FileText, CheckCircle, Database } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { apiFetch } from '../../lib/apiClient';

export const ActivityLogsView = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = async () => {
    try {
      const data = await apiFetch('/api/v1/auditlogs');
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const formatChanges = (changes: string) => {
    try {
      const obj = JSON.parse(changes);
      return (
        <div className="mt-2 text-xs bg-slate-900 text-slate-300 p-3 rounded-lg overflow-x-auto font-mono">
          <pre>{JSON.stringify(obj, null, 2)}</pre>
        </div>
      );
    } catch {
      return <div className="mt-2 text-xs text-slate-500 italic">No detailed changes recorded.</div>;
    }
  };

  const getActionColor = (action: string) => {
    if (action === 'Create') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (action === 'Update') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (action === 'Delete') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getEntityIcon = (entity: string) => {
    if (entity.includes('User')) return <UserIcon className="h-4 w-4" />;
    if (entity.includes('Policy')) return <FileText className="h-4 w-4" />;
    if (entity.includes('Control')) return <Shield className="h-4 w-4" />;
    if (entity.includes('Audit')) return <CheckCircle className="h-4 w-4" />;
    return <Database className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Activity Logs</h2>
          <p className="text-muted-foreground text-sm">Immutable audit trail of all system activities.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="w-full pl-9 pr-4 py-2 text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading activity logs...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No activity recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <div key={log.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex gap-4">
                    <div className="mt-1 shrink-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                        {getEntityIcon(log.entityName)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900">{log.userName}</span>
                            <span className="text-slate-500 text-sm">performed</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                            <span className="text-slate-500 text-sm">on</span>
                            <span className="font-medium text-slate-700 text-sm">{log.entityName}</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-400 font-mono">
                            {new Date(log.timestamp).toLocaleString()} • ID: {log.id.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                      
                      {formatChanges(log.changes)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
