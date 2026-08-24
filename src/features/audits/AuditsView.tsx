import React, { useState, useEffect } from 'react';
import { Plus, CheckSquare, Search, Filter } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';

export const AuditsView = () => {
  const [audits, setAudits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAudit, setNewAudit] = useState({ title: '', description: '', targetFrameworkId: '' });
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const { user } = useAuth();

  const loadData = async () => {
    try {
      const [auditsData, fwData] = await Promise.all([
        apiFetch('/api/v1/audits'),
        apiFetch('/api/v1/frameworks')
      ]);
      setAudits(auditsData || []);
      setFrameworks(fwData || []);
    } catch (err) {
      console.error('Failed to load audits', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await apiFetch('/api/v1/audits', {
        method: 'POST',
        body: JSON.stringify({
          title: newAudit.title,
          description: newAudit.description,
          organizationId: user.organizationId,
          auditorId: user.id,
          targetFrameworkId: newAudit.targetFrameworkId || null,
          plannedDate: new Date().toISOString()
        })
      });
      setShowModal(false);
      setNewAudit({ title: '', description: '', targetFrameworkId: '' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateResult = async (id: string, result: string) => {
    try {
      await apiFetch(`/api/v1/audits/${id}/result`, {
        method: 'PATCH',
        body: JSON.stringify({
          auditId: id,
          status: 'Completed',
          result: result
        })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Completed') return 'success';
    if (status === 'InProgress') return 'warning';
    return 'secondary';
  };

  const getResultColor = (result: string) => {
    if (result === 'Compliant') return 'text-green-600';
    if (result === 'NonCompliant') return 'text-red-600';
    if (result === 'NeedsImprovement') return 'text-amber-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Audits & Assessments</h2>
          <p className="text-muted-foreground text-sm">Track internal and external audit engagements.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Audit
        </Button>
      </div>

      {showModal && (
        <Card className="mb-6">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Schedule New Audit</h3>
          </div>
          <div className="p-4">
            <form onSubmit={handleCreateAudit} className="space-y-4 max-w-xl">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input required value={newAudit.title} onChange={(e: any) => setNewAudit({...newAudit, title: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input value={newAudit.description} onChange={(e: any) => setNewAudit({...newAudit, description: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Target Framework (Optional)</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  value={newAudit.targetFrameworkId}
                  onChange={(e: any) => setNewAudit({...newAudit, targetFrameworkId: e.target.value})}
                >
                  <option value="">-- General Audit (No Framework) --</option>
                  {frameworks.map(fw => (
                    <option key={fw.id} value={fw.id}>{fw.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Schedule</Button>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading audits...</div>
        ) : audits.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No audits scheduled yet.</div>
        ) : audits.map((audit) => (
          <Card key={audit.id}>
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-start md:items-center p-5 gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckSquare className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{audit.id.substring(0,8)}</span>
                    <Badge variant={getStatusBadge(audit.status)} className="text-[10px]">
                      {audit.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg">{audit.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {audit.targetFrameworkName ? `Framework: ${audit.targetFrameworkName}` : 'General Audit'}
                  </p>
                </div>
                
                <div className="w-full md:w-48 space-y-2 text-center">
                  <div className="text-xs text-muted-foreground">Result</div>
                  <div className={`font-semibold ${getResultColor(audit.result)}`}>
                    {audit.result === 'NotAssessed' ? '-' : audit.result}
                  </div>
                </div>

                <div className="flex gap-2 md:ml-8 mt-4 md:mt-0">
                  {audit.status !== 'Completed' && (
                    <>
                      <Button variant="outline" size="sm" className="text-green-600" onClick={() => updateResult(audit.id, 'Compliant')}>
                        Pass
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600" onClick={() => updateResult(audit.id, 'NonCompliant')}>
                        Fail
                      </Button>
                    </>
                  )}
                  {audit.status === 'Completed' && (
                    <Button variant="outline" size="sm" disabled>Finalized</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
