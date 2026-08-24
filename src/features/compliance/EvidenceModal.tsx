import React, { useState, useEffect } from 'react';
import { X, FileText, Upload, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';

interface Evidence {
  id: string;
  controlMappingId: string;
  documentId: string;
  description: string;
  originalFilename: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

interface EvidenceModalProps {
  mappingId: string;
  mappingType: string;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ mappingId, mappingType, onClose }) => {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchEvidences = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/v1/evidence/mapping/${mappingId}`);
      setEvidences(data || []);
    } catch (err) {
      console.error('Failed to fetch evidences', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidences();
  }, [mappingId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('mappingId', mappingId);
      formData.append('organizationId', user.organizationId);
      formData.append('description', description);
      formData.append('file', file);

      await apiFetch('/api/v1/evidence', {
        method: 'POST',
        body: formData,
      });

      setFile(null);
      setDescription('');
      fetchEvidences();
    } catch (err) {
      console.error('Failed to upload evidence', err);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Evidences for {mappingType} Mapping</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Upload Section */}
          <div className="bg-slate-50 p-4 rounded-lg border border-dashed">
            <h4 className="text-sm font-medium mb-3">Upload New Evidence</h4>
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90 cursor-pointer"
                  required
                />
              </div>
              <div>
                <input 
                  type="text"
                  placeholder="Short description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border p-2 text-sm"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={!file || uploading}>
                  {uploading ? 'Uploading...' : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* List Section */}
          <div>
            <h4 className="text-sm font-medium mb-3">Attached Evidences ({evidences.length})</h4>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : evidences.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No evidence attached yet.</p>
            ) : (
              <div className="space-y-2">
                {evidences.map(ev => (
                  <div key={ev.id} className="flex items-start justify-between p-3 border rounded-md hover:bg-slate-50 group">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-600 cursor-pointer hover:underline">
                          {ev.originalFilename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(ev.fileSize)} • Uploaded {new Date(ev.uploadedAt).toLocaleDateString()}
                        </p>
                        {ev.description && (
                          <p className="text-sm mt-1 text-slate-700">{ev.description}</p>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        if (confirm('Voulez-vous vraiment supprimer cette preuve ?')) {
                          try {
                            await apiFetch(`/api/v1/evidence/${ev.id}`, { method: 'DELETE' });
                            fetchEvidences();
                          } catch (e) {
                            console.error(e);
                          }
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer la preuve"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
