import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthInit } from './hooks/useAuth';
import { PublicOnly, ProtectedRoute } from './components/layout/AuthGuard';
import ToastContainer from './components/common/Toast';
import GlassSettings from './components/common/GlassSettings';
import { ROLES } from './constants/roles';
import { ROUTES } from './constants/routes';

import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import InternDashboard from './pages/intern/InternDashboard';
import MyAttendance from './pages/intern/MyAttendance';
import TutorialsPage from './pages/intern/TutorialsPage';
import DocumentsPage from './pages/intern/DocumentsPage';
import MyLeave from './pages/intern/MyLeave';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageInterns from './pages/admin/ManageInterns';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminTutorials from './pages/admin/AdminTutorials';
import OfferLetters from './pages/admin/OfferLetters';
import Certificates from './pages/admin/Certificates';
import Announcements from './pages/admin/Announcements';
import SystemSettings from './pages/admin/SystemSettings';
import LeadDashboard from './pages/lead/LeadDashboard';
import TeamAttendance from './pages/lead/TeamAttendance';
import VerifyPage from './pages/VerifyPage';
import HomeRedirect from './components/layout/HomeRedirect';

export default function App() {
  useAuthInit();

  return (
    <BrowserRouter>
      <ToastContainer />
      <GlassSettings />
      <Routes>
        <Route path="/verify/:certId" element={<VerifyPage />} />
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />
        <Route
          path={ROUTES.FORGOT_PASSWORD}
          element={
            <PublicOnly>
              <ForgotPasswordPage />
            </PublicOnly>
          }
        />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute allowedRoles={[ROLES.INTERN]} />}>
          <Route path={ROUTES.INTERN} element={<InternDashboard />} />
          <Route path={ROUTES.INTERN_ATTENDANCE} element={<MyAttendance />} />
          <Route path={ROUTES.INTERN_TUTORIALS} element={<TutorialsPage />} />
          <Route path={ROUTES.INTERN_DOCUMENTS} element={<DocumentsPage />} />
          <Route path={ROUTES.INTERN_LEAVE} element={<MyLeave />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.TEAM_LEAD]} />}>
          <Route path={ROUTES.LEAD} element={<LeadDashboard />} />
          <Route path={ROUTES.LEAD_ATTENDANCE} element={<TeamAttendance />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
          <Route path="/admin/interns" element={<ManageInterns />} />
          <Route path={ROUTES.ADMIN_ATTENDANCE} element={<AdminAttendance />} />
          <Route path={ROUTES.ADMIN_LEAVES} element={<AdminLeaves />} />
          <Route path={ROUTES.ADMIN_TUTORIALS} element={<AdminTutorials />} />
          <Route path={ROUTES.ADMIN_OFFER_LETTERS} element={<OfferLetters />} />
          <Route path={ROUTES.ADMIN_CERTIFICATES} element={<Certificates />} />
          <Route path={ROUTES.ADMIN_ANNOUNCEMENTS} element={<Announcements />} />
          <Route path={ROUTES.ADMIN_SETTINGS} element={<SystemSettings />} />
        </Route>

        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
