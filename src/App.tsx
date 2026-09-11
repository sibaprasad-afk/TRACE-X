import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { RoleProtectedRoute } from './components/auth/RoleProtectedRoute';
import { AccessDenied } from './components/auth/AccessDenied';
import { InvestigationWorkspacePage } from './pages/InvestigationWorkspacePage';
import { WalletIntelligencePage } from './pages/WalletIntelligencePage';
import { TransactionExplorerPage } from './pages/TransactionExplorerPage';
import { FraudDetectionPage } from './pages/FraudDetectionPage';
import { MoneyFlowPage } from './pages/MoneyFlowPage';
import { VaspAttributionPage } from './pages/VaspAttributionPage';
import { CrossChainPage } from './pages/CrossChainPage';
import { AiIntelligencePage } from './pages/AiIntelligencePage';
import { ReportCenterPage } from './pages/ReportCenterPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { AlertsPage } from './pages/AlertsPage';
import { CasesPage } from './pages/CasesPage';
import { DatasetManagerPage } from './pages/DatasetManagerPage';
import { OrganizationOverviewPage } from './pages/OrganizationOverviewPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Trace Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/trace" element={<LandingPage />} />

          {/* Dedicated Sign In & Authentication Portal */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signin" element={<LoginPage />} />
          <Route path="/access" element={<LoginPage />} />

          {/* Authenticated Workspace App Layout */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/investigations" element={<InvestigationWorkspacePage />} />
            <Route path="/investigations/:id" element={<InvestigationWorkspacePage />} />
            <Route path="/wallet-intelligence" element={<WalletIntelligencePage />} />
            <Route path="/transaction-analysis" element={<TransactionExplorerPage />} />
            <Route path="/fraud-detection" element={<FraudDetectionPage />} />
            <Route path="/money-flow" element={<MoneyFlowPage />} />
            <Route path="/vasp-attribution" element={<VaspAttributionPage />} />
            <Route path="/cross-chain" element={<CrossChainPage />} />
            <Route path="/ai-intelligence" element={<AiIntelligencePage />} />
            <Route path="/reports" element={<ReportCenterPage />} />
            <Route path="/reports/:id" element={<ReportCenterPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/dataset-manager" element={<DatasetManagerPage />} />
            <Route path="/datasets" element={<DatasetManagerPage />} />
            <Route path="/diagnostics" element={<DiagnosticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Org Management Routes - Senior Analyst & Admin Only */}
            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SENIOR_ANALYST']} />}>
              <Route path="/organization-overview" element={<OrganizationOverviewPage />} />
              <Route path="/admin/organization" element={<OrganizationOverviewPage />} />
              <Route path="/admin/cases" element={<CasesPage />} />
              <Route path="/admin/activity" element={<AuditLogsPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
            </Route>

            {/* Strictly Admin-Only Routes */}
            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/admin/employees" element={<EmployeesPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
