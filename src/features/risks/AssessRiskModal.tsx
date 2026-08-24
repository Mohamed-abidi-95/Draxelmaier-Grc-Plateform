import React, { useState } from 'react';
import { X, Calculator } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { apiFetch } from '../../lib/apiClient';

interface AssessRiskModalProps {
  riskId: string;
  riskTitle: string;
  onClose: () => void;
  onSuccess: () => void;
  assessorId: string;
}

export const AssessRiskModal: React.FC<AssessRiskModalProps> = ({ riskId, riskTitle, onClose, onSuccess, assessorId }) => {
  const [probability, setProbability] = useState(3);
  const [impact, setImpact] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  const score = probability * impact;
  
  let severity = 'Low';
  let severityColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  
  if (score >= 15) {
    severity = 'High';
    severityColor = 'text-rose-600 bg-rose-50 border-rose-200';
  } else if (score >= 8) {
    severity = 'Medium';
    severityColor = 'text-amber-600 bg-amber-50 border-amber-200';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiFetch(`/api/v1/risks/${riskId}/assessments`, {
        method: 'POST',
        body: JSON.stringify({
          riskId,
          probability,
          impact,
          assessorId
        })
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to assess risk', err);
      alert('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-600" />
            Assess Risk
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
            <span className="font-semibold text-slate-700">Risk:</span> {riskTitle}
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                <span>Probability (1-5)</span>
                <span className="text-indigo-600 font-bold">{probability}</span>
              </label>
              <input 
                type="range" 
                min="1" max="5" step="1"
                value={probability}
                onChange={(e) => setProbability(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Very Low</span>
                <span>Very High</span>
              </div>
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                <span>Impact (1-5)</span>
                <span className="text-rose-600 font-bold">{impact}</span>
              </label>
              <input 
                type="range" 
                min="1" max="5" step="1"
                value={impact}
                onChange={(e) => setImpact(parseInt(e.target.value))}
                className="w-full accent-rose-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Negligible</span>
                <span>Catastrophic</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Calculated Score</div>
              <div className="text-2xl font-bold text-slate-900">{score}</div>
            </div>
            <div className={`px-3 py-1 rounded-full border text-sm font-bold ${severityColor}`}>
              {severity}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {submitting ? 'Saving...' : 'Submit Assessment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
