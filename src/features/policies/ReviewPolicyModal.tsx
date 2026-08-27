import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/apiClient';
import { useAuth } from '../auth/AuthContext';

interface ReviewPolicyModalProps {
  policyId: string;
  policyTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewPolicyModal: React.FC<ReviewPolicyModalProps> = ({ policyId, policyTitle, onClose, onSuccess }) => {
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isApproved === null) return;
    
    setIsSubmitting(true);
    try {
      await apiFetch(`/api/v1/policies/${policyId}/review`, {
        method: 'POST',
        body: JSON.stringify({
          policyId,
          reviewerId: user?.id,
          isApproved,
          comments
        })
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-border">
        
        <div className="px-6 py-5 border-b border-border bg-surface-secondary/50 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
              </div>
              <h3 className="font-headline-sm text-text-primary">Review Policy</h3>
            </div>
            <p className="font-body-sm text-text-secondary mt-1">{policyTitle}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-secondary"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-3">
              <label className="block font-label-md text-text-secondary uppercase tracking-wider">Decision</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsApproved(true)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${isApproved === true ? 'border-success bg-success/10 text-success' : 'border-border bg-surface hover:border-success/50 hover:bg-success/5 text-text-secondary'}`}
                >
                  <span className="material-symbols-outlined text-[28px]">check_circle</span>
                  <span className="font-headline-sm text-[14px]">Approve</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setIsApproved(false)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${isApproved === false ? 'border-error bg-error/10 text-error' : 'border-border bg-surface hover:border-error/50 hover:bg-error/5 text-text-secondary'}`}
                >
                  <span className="material-symbols-outlined text-[28px]">cancel</span>
                  <span className="font-headline-sm text-[14px]">Reject</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-label-md text-text-secondary uppercase tracking-wider">
                Comments {isApproved === false && <span className="text-error">*</span>}
              </label>
              <textarea 
                required={isApproved === false}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={isApproved === false ? "Please explain why the policy is rejected..." : "Optional comments..."}
                className="w-full h-24 px-4 py-2 font-body-sm text-text-primary bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isApproved === null || isSubmitting} className="bg-primary text-white">
                {isSubmitting ? 'Submitting...' : 'Submit Decision'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
