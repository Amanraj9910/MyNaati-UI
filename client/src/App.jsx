/**
 * =============================================================================
 * MyNaati Frontend — Main App Component
 * =============================================================================
 * 
 * Root component that sets up:
 *   1. React Router v6 with all route definitions
 *   2. AuthProvider for global authentication state
 *   3. QueryClientProvider for React Query data fetching
 *   4. Toast notifications (react-hot-toast)
 *   5. Layout (Navbar + Footer) wrapping all pages
 * 
 * Route Structure:
 *   /                    → Redirects to /dashboard (auth) or /login (public)
 *   /login               → Login page
 *   /register            → Registration page
 *   /forgot-password     → Password reset request
 *   /about               → About NAATI (public)
 *   /learn-more          → Learn More (public)
 *   /dashboard           → Dashboard (protected)
 *   /change-password     → Change password (protected)
 *   /admin/diagnostics   → System diagnostics (admin only)
 *   /admin/users         → User management (admin only)
 *   /forbidden           → 403 error page
 *   *                    → 404 error page
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages (Module 2)
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';

// Home pages (Module 1)
import DashboardPage from './pages/home/DashboardPage';
import AboutPage from './pages/home/AboutPage';
import LearnMorePage from './pages/home/LearnMorePage';

// Dashboard Detail Pages
import CredentialsPage from './pages/credentials/CredentialsPage';
import TestsPage from './pages/tests/TestsPage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import BillsPage from './pages/bills/BillsPage';
import ApplicationsPage from './pages/applications/ApplicationsPage';
import LogbookPage from './pages/logbook/LogbookPage';
import ProfilePage from './pages/profile/ProfilePage';

// Admin pages
import DiagnosticsPage from './pages/admin/DiagnosticsPage';
import UserSearchPage from './pages/admin/UserSearchPage';

// Error pages
import { NotFoundPage, ForbiddenPage } from './pages/ErrorPages';

/** React Query client with default configuration */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * SmartRedirect — redirects to dashboard if authenticated, login if not.
 * Used as the index route (/).
 */
function SmartRedirect() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

/**
 * AppRoutes — defines all application routes.
 * Separated from App for access to AuthProvider context.
 */
function AppRoutes() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Index — smart redirect */}
          <Route path="/" element={<SmartRedirect />} />

          {/* Public auth pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Public info pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/learn-more" element={<LearnMorePage />} />

          {/* Protected pages — require authentication */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/credentials" element={<ProtectedRoute><CredentialsPage /></ProtectedRoute>} />
          <Route path="/tests" element={<ProtectedRoute><TestsPage /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
          <Route path="/bills" element={<ProtectedRoute><BillsPage /></ProtectedRoute>} />
          <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />
          <Route path="/logbook" element={<ProtectedRoute><LogbookPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />

          {/* Admin-only pages — require Admin role */}
          <Route path="/admin/diagnostics" element={<ProtectedRoute roles={['Admin', 'SystemAdmin']}><DiagnosticsPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute roles={['Admin', 'SystemAdmin']}><UserSearchPage /></ProtectedRoute>} />

          {/* Error pages */}
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

/**
 * App — root component wrapping everything with providers.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a2e',
                color: '#e0e0ff',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
