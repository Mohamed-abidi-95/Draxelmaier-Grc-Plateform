import React, { useState, useEffect } from 'react';
import { Upload, Search, Filter, FileText, Eye, Download, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';

export const DocumentsView = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [newPolicy, setNewPolicy] = useState({ title: '', description: '' });
  const { user } = useAuth();

  const loadPolicies = async () => {
    if (!user) return;
    try {
      // Pass organizationId to the GET request as per PoliciesController
      const data = await apiFetch(`/api/v1/policies?organizationId=${user.organizationId}`);
      setPolicies(data);
    } catch (error) {
      console.error('Failed to load policies', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, [user]);

  const handleDownload = async (documentId: string, filename: string, action: 'view' | 'download') => {
    if (!documentId || documentId === '00000000-0000-0000-0000-000000000000') {
      alert('Aucun document physique associé.');
      return;
    }
    
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`http://localhost:5179/api/v1/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Échec du téléchargement');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      if (action === 'view') {
        window.open(url, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la récupération du document.');
    }
  };

  const handleUploadAndCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;

    setUploading(true);
    try {
      // 1. Upload Document
      const formData = new FormData();
      formData.append('organizationId', user.organizationId);
      formData.append('file', file);
      
      const docResult = await apiFetch('/api/v1/documents/upload', {
        method: 'POST',
        body: formData,
      });

      // 2. Create Policy linking the Document
      await apiFetch('/api/v1/policies', {
        method: 'POST',
        body: JSON.stringify({
          title: newPolicy.title,
          description: newPolicy.description,
          organizationId: user.organizationId,
          ownerId: user.id,
          documentId: docResult.id
        })
      });

      setShowUpload(false);
      setFile(null);
      setNewPolicy({ title: '', description: '' });
      loadPolicies();
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Document Library</h2>
          <p className="text-muted-foreground text-sm">Centralized repository for policies, procedures, and evidence.</p>
        </div>
        {user?.roles.some(r => r === 'Administrator' || r === 'ComplianceOfficer') && (
          <Button onClick={() => setShowUpload(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
      </div>

      <Card>
        <div className="p-4 border-b flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-9" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Status
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Policy ID</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Owner ID</th>
                <th className="px-4 py-3 font-medium">Created At</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-4 text-muted-foreground">Loading...</td></tr>
              ) : policies.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4 text-muted-foreground">No policies found.</td></tr>
              ) : policies.map((policy, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs" title={policy.id}>{policy.id}</td>
                  <td className="px-4 py-3 font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {policy.title}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="bg-background text-[10px]">{policy.status === 0 ? 'Draft' : policy.status === 1 ? 'Active' : 'Archived'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs" title={policy.ownerId}>{policy.ownerId}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(policy.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(policy.documentId, policy.title, 'view')}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(policy.documentId, policy.title, 'download')}><Download className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal for Uploading Document */}
      {showUpload && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-lg p-6 relative">
            <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => setShowUpload(false)}>
              <X className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold mb-4">Upload New Policy Document</h3>
            <form onSubmit={handleUploadAndCreatePolicy} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Policy Title</label>
                <Input required value={newPolicy.title} onChange={(e: any) => setNewPolicy({...newPolicy, title: e.target.value})} placeholder="Information Security Policy v2.4" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input required value={newPolicy.description} onChange={(e: any) => setNewPolicy({...newPolicy, description: e.target.value})} placeholder="Brief description of the policy" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Document File</label>
                <Input required type="file" onChange={(e: any) => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload & Create Policy'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
