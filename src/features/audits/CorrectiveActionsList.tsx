import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';

interface CorrectiveAction {
  id: string;
  findingId: string;
  description: string;
  status: string;
  createdAt: string;
  ownerId: string | null;
}

interface CorrectiveActionsListProps {
  findingId: string;
}

export const CorrectiveActionsList: React.FC<CorrectiveActionsListProps> = ({ findingId }) => {
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActionDescription, setNewActionDescription] = useState('');
  const { user } = useAuth();

  const loadActions = async () => {
    try {
      const data = await apiFetch(`/api/v1/audits/findings/${findingId}/actions`);
      setActions(data || []);
    } catch (err) {
      console.error('Failed to load corrective actions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, [findingId]);

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionDescription.trim()) return;
    try {
      await apiFetch(`/api/v1/audits/findings/${findingId}/actions`, {
        method: 'POST',
        body: JSON.stringify({
          findingId,
          description: newActionDescription,
          ownerId: user?.id,
          dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
        })
      });
      setShowAddForm(false);
      setNewActionDescription('');
      loadActions();
    } catch (err) {
      console.error(err);
    }
  };

  const updateActionStatus = async (actionId: string, statusValue: number) => {
    try {
      await apiFetch(`/api/v1/audits/findings/actions/${actionId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          actionId,
          status: statusValue
        })
      });
      loadActions();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-warning/10 text-warning border border-warning/20">PENDING</span>;
      case 'Completed': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">COMPLETED</span>;
      case 'Verified': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-success/10 text-success border border-success/20">VERIFIED</span>;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="py-4 flex justify-center">
        <div className="w-5 h-5 border-2 border-surface-container border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-border bg-surface-secondary/30 -mx-5 px-5 pb-2 rounded-b-xl">
      <div className="flex justify-between items-center mb-3">
        <h6 className="font-label-md text-text-secondary uppercase tracking-wider">Corrective Actions ({actions.length})</h6>
        {!showAddForm && (
          <Button size="sm" variant="outline" className="text-[12px] h-7 px-2 border-border" onClick={() => setShowAddForm(true)}>
            <span className="material-symbols-outlined text-[14px] mr-1">add</span> Add Task
          </Button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddAction} className="mb-4 bg-surface p-3 rounded-lg border border-border">
          <textarea 
            required
            autoFocus
            value={newActionDescription}
            onChange={(e) => setNewActionDescription(e.target.value)}
            placeholder="Describe the remediation task..."
            className="w-full h-16 px-3 py-2 text-[13px] text-text-primary bg-surface-secondary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none mb-2"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" className="h-7 text-[12px]" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button type="submit" size="sm" className="h-7 text-[12px] bg-primary text-white">Save Task</Button>
          </div>
        </form>
      )}

      {actions.length === 0 && !showAddForm ? (
        <p className="text-[13px] text-text-tertiary italic mb-2">No actions assigned yet.</p>
      ) : (
        <div className="space-y-2 mb-2">
          {actions.map(action => (
            <div key={action.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface border border-border rounded-lg">
              <div className="flex-1">
                <p className="text-[13px] text-text-primary mb-1">{action.description}</p>
                <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
                  <span className="material-symbols-outlined text-[14px]">event</span>
                  {new Date(action.createdAt).toLocaleDateString()}
                  <span>•</span>
                  {getStatusBadge(action.status)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {action.status === 'Pending' && (
                  <Button size="sm" variant="outline" className="h-7 text-[11px] border-primary text-primary" onClick={() => updateActionStatus(action.id, 2)}>
                    Mark Done
                  </Button>
                )}
                {action.status === 'Completed' && (
                  <Button size="sm" variant="outline" className="h-7 text-[11px] border-success text-success" onClick={() => updateActionStatus(action.id, 3)}>
                    Verify
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
