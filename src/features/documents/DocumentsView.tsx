import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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

  const getStatusBadge = (status: number) => {
    switch(status) {
      case 0:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">Draft</span>;
      case 1:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-success/10 text-success border border-success/20">Active</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-container-low text-text-tertiary border border-border">Archived</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-[1440px] mx-auto w-full animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-[24px]">description</span>
            </div>
            <h1 className="font-headline-lg text-text-primary tracking-tight">Document Library</h1>
          </div>
          <p className="font-body-md text-text-secondary mt-2">Centralized repository for policies, procedures, and compliance evidence.</p>
        </div>
        {user?.roles.some(r => r === 'Administrator' || r === 'ComplianceOfficer') && (
          <Button onClick={() => setShowUpload(true)} className="bg-primary hover:bg-primary/90 text-white shadow-sm px-4 py-2 flex items-center gap-2 rounded-lg transition-all hover:shadow-md">
            <span className="material-symbols-outlined text-[18px]">upload</span>
            Upload Document
          </Button>
        )}
      </div>

      <section className="bg-surface border border-border rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-border bg-surface-secondary/50 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-text-tertiary">search</span>
            <input 
              placeholder="Search documents..." 
              className="w-full pl-10 pr-4 py-2 font-body-sm text-text-primary bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2 font-medium bg-surface text-text-secondary hover:text-text-primary border-border">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filters
          </Button>
        </div>
        
        {/* Data Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-surface/50 border-b border-border">
              <tr>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold w-24">Policy ID</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Title</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Status</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Owner</th>
                <th className="px-5 py-3 font-label-md text-text-secondary uppercase tracking-wider font-semibold">Created At</th>
                <th className="px-5 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-text-primary divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                     <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-8 h-8 border-4 border-surface-container border-t-primary rounded-full animate-spin"></div>
                        <p className="font-body-sm text-text-secondary">Loading documents...</p>
                      </div>
                  </td>
                </tr>
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-text-tertiary">
                      <span className="material-symbols-outlined text-[48px] opacity-50 mb-2">find_in_page</span>
                      <p className="font-body-sm">No policies or documents found.</p>
                    </div>
                  </td>
                </tr>
              ) : policies.map((policy, i) => (
                <tr key={i} className="hover:bg-surface-secondary/50 transition-colors group">
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-text-tertiary bg-surface-container-low px-2 py-1 rounded" title={policy.id}>
                      {policy.id.split('-')[0]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-medium text-text-primary flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">article</span>
                      </div>
                      {policy.title}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {getStatusBadge(policy.status)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-text-secondary" title={policy.ownerId}>
                      {policy.ownerId.split('-')[0]}...
                    </span>
                  </td>
                  <td className="px-5 py-4 text-text-secondary">
                    {new Date(policy.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDownload(policy.documentId, policy.title, 'view')}
                        className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        title="View Document"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button 
                        onClick={() => handleDownload(policy.documentId, policy.title, 'download')}
                        className="p-1.5 text-text-tertiary hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        title="Download Document"
                      >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal for Uploading Document */}
      {showUpload && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-border scale-in-center">
            
            <div className="px-6 py-5 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">upload_file</span>
                </div>
                <h3 className="font-headline-sm text-text-primary">Upload New Policy Document</h3>
              </div>
              <button 
                onClick={() => setShowUpload(false)}
                className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-secondary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form onSubmit={handleUploadAndCreatePolicy} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Policy Title</label>
                <input 
                  autoFocus
                  required 
                  className="w-full px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary"
                  value={newPolicy.title} 
                  onChange={(e: any) => setNewPolicy({...newPolicy, title: e.target.value})} 
                  placeholder="e.g. Information Security Policy v2.4"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Description</label>
                <input 
                  required 
                  className="w-full px-4 py-2.5 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-text-tertiary"
                  value={newPolicy.description} 
                  onChange={(e: any) => setNewPolicy({...newPolicy, description: e.target.value})} 
                  placeholder="Brief description of the policy"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block font-label-md text-text-secondary uppercase tracking-wider">Document File</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-surface-secondary hover:bg-surface-container-low hover:border-primary/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <span className="material-symbols-outlined text-text-tertiary text-[32px] mb-2">cloud_upload</span>
                      <p className="mb-1 text-sm text-text-secondary font-medium">
                        {file ? file.name : <><span className="text-primary">Click to upload</span> or drag and drop</>}
                      </p>
                      <p className="text-xs text-text-tertiary">PDF, DOCX up to 10MB</p>
                    </div>
                    <input type="file" className="hidden" required onChange={(e: any) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-2">
                <Button type="button" variant="outline" className="px-5 font-medium border-border text-text-secondary hover:bg-surface-secondary hover:text-text-primary" onClick={() => setShowUpload(false)} disabled={uploading}>
                  Cancel
                </Button>
                <Button type="submit" className="px-5 bg-primary hover:bg-primary/90 text-white font-medium flex items-center gap-2" disabled={uploading}>
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload & Create'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
