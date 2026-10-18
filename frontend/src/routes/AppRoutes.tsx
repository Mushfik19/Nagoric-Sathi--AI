import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Navigation & Common Components
import { PublicNavbar } from '../components/common/PublicNavbar';
import { PublicFooter } from '../components/common/PublicFooter';
import { AuthenticatedHeader } from '../components/common/AuthenticatedHeader';
import { Sidebar } from '../components/common/Sidebar';
import { MobileNav } from '../components/common/MobileNav';
import { DevDemoDrawer } from '../components/common/DevDemoDrawer';
import { AskSathiDrawer } from '../components/common/AskSathiDrawer';
import { AuthGuard, RoleGuard } from '../components/common/Guards';

// Public & Citizen Views
import { PublicHomePage } from '../features/public/PublicHomePage';
import { CitizenHomePage } from '../features/citizen/CitizenHomePage';
import { ReportProblemWizard } from '../features/citizen/ReportProblemWizard';
import { CitizenCasesListPage } from '../features/citizen/CitizenCasesListPage';
import { CitizenCaseDetailPage } from '../features/citizen/CitizenCaseDetailPage';
import { ServiceDiscoveryPage } from '../features/citizen/ServiceDiscoveryPage';
import { ServiceDetailPage } from '../features/citizen/ServiceDetailPage';
import { CitizenNotificationsPage } from '../features/citizen/CitizenNotificationsPage';
import { CitizenProfilePage } from '../features/citizen/CitizenProfilePage';

// Ward Views
import { WardDashboardPage } from '../features/ward/WardDashboardPage';
import { WardVerificationQueuePage } from '../features/ward/WardVerificationQueuePage';
import { WardCaseReviewPage } from '../features/ward/WardCaseReviewPage';
import { WardDuplicateManagerPage } from '../features/ward/WardDuplicateManagerPage';

// Officer Views
import { OfficerDashboardPage } from '../features/officer/OfficerDashboardPage';
import { OfficerTaskDetailPage } from '../features/officer/OfficerTaskDetailPage';
import { OfficerDepartmentRequestsPage } from '../features/officer/OfficerDepartmentRequestsPage';
import { OfficerAssignmentQueuePage } from '../features/officer/OfficerAssignmentQueuePage';
import { OfficerAvailabilityPage } from '../features/officer/OfficerAvailabilityPage';
import { OfficerWorkloadPage } from '../features/officer/OfficerWorkloadPage';
import { OfficerTasksPage } from '../features/officer/OfficerTasksPage';

// Coordinator Views
import { CoordinatorDashboardPage } from '../features/coordinator/CoordinatorDashboardPage';
import { MultiDepartmentCaseViewPage } from '../features/coordinator/MultiDepartmentCaseViewPage';
import { CoordinatorEscalationsPage } from '../features/coordinator/CoordinatorEscalationsPage';
import { CoordinatorHotspotsPage } from '../features/coordinator/CoordinatorHotspotsPage';

// Admin Views
import { AdminOverviewPage } from '../features/admin/AdminOverviewPage';
import { AdminUsersPage } from '../features/admin/AdminUsersPage';
import { AdminAiGatePage } from '../features/admin/AdminAiGatePage';
import { AdminRulesPage } from '../features/admin/AdminRulesPage';
import { AdminServiceKnowledgePage } from '../features/admin/AdminServiceKnowledgePage';
import { AdminAuditLogPage } from '../features/admin/AdminAuditLogPage';
import { AdminSystemSettingsPage } from '../features/admin/AdminSystemSettingsPage';

// Maps & Transparency & Auth
import { CivicMapPage } from '../features/maps/CivicMapPage';
import { PublicTransparencyPage } from '../features/transparency/PublicTransparencyPage';
import { RoleSelectionPage } from '../features/auth/RoleSelectionPage';
import { RoleLoginPage } from '../features/auth/RoleLoginPage';
import { UnauthorizedPage } from '../features/auth/UnauthorizedPage';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, activeRole } = useAuth();
  const isStaffOrAdmin = isAuthenticated && activeRole !== 'citizen';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] selection:bg-[#295e42] selection:text-[#d4c19a] pb-16 md:pb-0 transition-colors duration-200">
      {/* Dynamic Header */}
      {!isAuthenticated ? <PublicNavbar /> : <AuthenticatedHeader />}

      {/* Main Workspace Layout with Sidebar for Staff/Admin */}
      <div className="flex-1 flex w-full">
        {isStaffOrAdmin && <Sidebar />}

        <main className="flex-1 min-w-0 overflow-y-auto">
          <Routes>
            {/* Public Entry & General Routes */}
            <Route
              path="/"
              element={!isAuthenticated ? <PublicHomePage /> : activeRole === 'citizen' ? <CitizenHomePage /> : <Navigate to={getRoleRedirect(activeRole || 'citizen')} replace />}
            />
            <Route
              path="/home"
              element={
                <AuthGuard>
                  <CitizenHomePage />
                </AuthGuard>
              }
            />
            <Route path="/services" element={<ServiceDiscoveryPage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />
            <Route path="/map" element={<CivicMapPage />} />
            <Route path="/transparency" element={<PublicTransparencyPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Navigate to="/login/citizen" replace />} />
            <Route path="/login/:role" element={<RoleLoginPage />} />
            <Route path="/roles" element={<RoleSelectionPage />} />
            <Route path="/login/roles" element={<RoleSelectionPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/forbidden" element={<UnauthorizedPage />} />

            {/* Citizen Protected Routes */}
            <Route
              path="/report"
              element={
                <AuthGuard>
                  <ReportProblemWizard />
                </AuthGuard>
              }
            />
            <Route
              path="/cases"
              element={
                <AuthGuard>
                  <CitizenCasesListPage />
                </AuthGuard>
              }
            />
            <Route
              path="/cases/:id"
              element={
                <AuthGuard>
                  <CitizenCaseDetailPage />
                </AuthGuard>
              }
            />
            <Route
              path="/notifications"
              element={
                <AuthGuard>
                  <CitizenNotificationsPage />
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <CitizenProfilePage />
                </AuthGuard>
              }
            />

            {/* Ward Desk Protected Routes */}
            <Route
              path="/ward"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardDashboardPage />
                </RoleGuard>
              }
            />
            <Route
              path="/ward/verification"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardVerificationQueuePage />
                </RoleGuard>
              }
            />
            <Route
              path="/ward/cases/:id"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardCaseReviewPage />
                </RoleGuard>
              }
            />
            <Route
              path="/ward/duplicates"
              element={
                <RoleGuard allowedRoles={['ward_desk', 'admin']}>
                  <WardDuplicateManagerPage />
                </RoleGuard>
              }
            />

            {/* Officer Protected Routes */}
            <Route
              path="/officer"
              element={
                <RoleGuard allowedRoles={['field_officer', 'admin']}>
                  <OfficerDashboardPage />
                </RoleGuard>
              }
            />
            <Route
              path="/officer/requests"
              element={
                <RoleGuard allowedRoles={['field_officer', 'admin']}>
                  <OfficerDepartmentRequestsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/officer/assignment-queue"
              element={
                <RoleGuard allowedRoles={['field_officer', 'admin']}>
                  <OfficerAssignmentQueuePage />
                </RoleGuard>
              }
            />
            <Route
              path="/officer/availability"
              element={
                <RoleGuard allowedRoles={['field_officer', 'admin']}>
                  <OfficerAvailabilityPage />
                </RoleGuard>
              }
            />
            <Route
              path="/officer/workload"
              element={
                <RoleGuard allowedRoles={['field_officer', 'admin']}>
                  <OfficerWorkloadPage />
                </RoleGuard>
              }
            />
            <Route
              path="/officer/tasks"
              element={
                <RoleGuard allowedRoles={['field_officer', 'admin']}>
                  <OfficerTasksPage />
                </RoleGuard>
              }
            />
            <Route
              path="/officer/tasks/:id"
              element={
                <RoleGuard allowedRoles={['field_officer', 'admin']}>
                  <OfficerTaskDetailPage />
                </RoleGuard>
              }
            />

            {/* Coordinator Protected Routes */}
            <Route
              path="/coordinator"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorDashboardPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/cases/:id"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <MultiDepartmentCaseViewPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/escalations"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorEscalationsPage />
                </RoleGuard>
              }
            />
            <Route
              path="/coordinator/hotspots"
              element={
                <RoleGuard allowedRoles={['coordinator', 'admin']}>
                  <CoordinatorHotspotsPage />
                </RoleGuard>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminOverviewPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminUsersPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/ai-gate"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminAiGatePage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/rules"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminRulesPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/services"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminServiceKnowledgePage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminAuditLogPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminSystemSettingsPage />
                </RoleGuard>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation for Authenticated Citizens */}
      {isAuthenticated && activeRole === 'citizen' && <MobileNav />}

      {/* Public Footer for Non-authenticated Visitors or Citizen Pages */}
      {!isStaffOrAdmin && <PublicFooter />}

      {/* Sathi AI Floating Assistant Drawer */}
      <AskSathiDrawer />

      {/* Developer Demo Mode Drawer */}
      <DevDemoDrawer />
    </div>
  );
};

function getRoleRedirect(role: string): string {
  switch (role) {
    case 'ward_desk':
      return '/ward';
    case 'field_officer':
      return '/officer';
    case 'coordinator':
      return '/coordinator';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
}
