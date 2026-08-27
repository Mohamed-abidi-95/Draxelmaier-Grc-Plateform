import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/apiClient';

interface ImportFrameworkModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportFrameworkModal = ({ onClose, onSuccess }: ImportFrameworkModalProps) => {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !version || !file) {
      setError('Please fill in all fields and select a file.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('version', version);
      formData.append('file', file);

      await apiFetch('/api/v1/frameworks/upload', {
        method: 'POST',
        body: formData,
        // Let the browser set the Content-Type header with the boundary for FormData
        headers: {
          // Remove default Content-Type so it's auto-generated
        }
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import framework');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6 space-y-4 border border-border">
        <h3 className="text-lg font-semibold">Import Framework (CSV)</h3>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Framework Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g. ISO 27001"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Version</label>
            <input
              type="text"
              value={version}
              onChange={e => setVersion(e.target.value)}
              className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g. 2022"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              required
            />
            <p className="text-xs text-muted-foreground">CSV must contain Identifier, Title, and Description headers.</p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
