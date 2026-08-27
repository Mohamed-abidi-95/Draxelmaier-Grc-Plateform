import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardView } from './features/dashboard/DashboardView';
import { RisksView } from './features/risks/RisksView';
import { RiskDetailsView } from './features/risks/RiskDetailsView';
import { RiskAssessmentsView } from './features/risks/RiskAssessmentsView';
import { RiskTreatmentsView } from './features/risks/RiskTreatmentsView';
import { ComplianceView } from './features/compliance/ComplianceView';
import { SoAView } from './features/compliance/SoAView';
import { DocumentsView } from './features/documents/DocumentsView';
import { AuditsView } from './features/audits/AuditsView';
import { FindingsView } from './features/audits/FindingsView';
import { ActivityLogsView } from './features/audits/ActivityLogsView';
import { ControlsView } from './features/controls/ControlsView';
import { AssetsView } from './features/assets/AssetsView';
import { BusinessUnitsView } from './features/organization/BusinessUnitsView';
import { UsersView } from './features/admin/UsersView';
import { AiAssistantView } from './features/ai/AiAssistantView';

import { LoginView } from './features/auth/LoginView';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { ShieldCheck } from 'lucide-react';
import { Button } from './components/ui/Button';
import { ToastProvider } from './contexts/ToastContext';

const PlaceholderView = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground shadow-sm">
      <ShieldCheck className="h-8 w-8" />
    </div>
    <div>
      <h3 className="text-lg font-semibold tracking-tight">{title} Module</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">This module is currently in development. Check back later for updates.</p>
    </div>
    <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>Return to Dashboard</Button>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginView />} />
        
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="business-units" element={<BusinessUnitsView />} />
          <Route path="risks" element={<RisksView />} />
          <Route path="risks/:id" element={<RiskDetailsView />} />
          <Route path="risk-assessments" element={<RiskAssessmentsView />} />
          <Route path="risk-treatments" element={<RiskTreatmentsView />} />
          <Route path="compliance" element={<ComplianceView />} />
          <Route path="soa" element={<SoAView />} />
          <Route path="controls" element={<ControlsView />} />
          <Route path="assets" element={<AssetsView />} />
          <Route path="documents" element={<DocumentsView />} />
          <Route path="audits" element={<AuditsView />} />
          <Route path="findings" element={<FindingsView />} />
          <Route path="activity-logs" element={<ActivityLogsView />} />
          <Route path="users" element={<UsersView />} />
          <Route path="intelligence" element={<AiAssistantView />} />
          <Route path="incidents" element={<PlaceholderView title="Incidents" />} />
          <Route path="reports" element={<PlaceholderView title="Reports" />} />

          <Route path="settings" element={<PlaceholderView title="Settings" />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
