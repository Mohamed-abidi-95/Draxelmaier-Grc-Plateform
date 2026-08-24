import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';

interface CreateMappingModalProps {
  requirementId: string;
  requirementIdentifier: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Policy {
  id: string;
  title: string;
}

interface Control {
  id: string;
  name: string;
}

export const CreateMappingModal: React.FC<CreateMappingModalProps> = ({ requirementId, requirementIdentifier, onClose, onSuccess }) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [selectedType, setSelectedType] = useState<'policy' | 'control'>('policy');
  const [selectedId, setSelectedId] = useState<string>('');
  const [status, setStatus] = useState<string>('NotAssessed');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const orgId = user.organizationId; 
        const [policiesData, controlsData] = await Promise.all([
          apiFetch(`/api/v1/policies?organizationId=${orgId}`),
          apiFetch(`/api/v1/controls?organizationId=${orgId}`)
        ]);
        setPolicies(policiesData || []);
        setControls(controlsData || []);
      } catch (err) {
        console.error('Failed to fetch policies or controls', err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;

    try {
      setLoading(true);
      await apiFetch('/api/v1/mappings', {
        method: 'POST',
        body: JSON.stringify({
          requirementId,
          policyId: selectedType === 'policy' ? selectedId : null,
          controlId: selectedType === 'control' ? selectedId : null,
          status
        }),
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create mapping', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Add Mapping for {requirementIdentifier}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Link to</label>
            <select 
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as 'policy' | 'control');
                setSelectedId('');
              }}
              className="w-full rounded-md border p-2"
            >
              <option value="policy">Policy</option>
              <option value="control">Control</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Select Item</label>
            <select 
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              required
              className="w-full rounded-md border p-2"
            >
              <option value="">-- Select --</option>
              {selectedType === 'policy' 
                ? policies.map(p => <option key={p.id} value={p.id}>{p.title}</option>)
                : controls.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
              }
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Initial Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border p-2"
            >
              <option value="NotAssessed">Not Assessed</option>
              <option value="Compliant">Compliant</option>
              <option value="NonCompliant">Non Compliant</option>
              <option value="NotApplicable">Not Applicable</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !selectedId}>
              {loading ? 'Saving...' : 'Save Mapping'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
