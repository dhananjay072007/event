import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useUserAuth } from './context/UserAuthContext';
import WhatsAppButton from './components/common/WhatsAppButton';

// Public pages
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import PortfolioPage from './pages/PortfolioPage';
import BookingPage from './pages/BookingPage';
import ContactPage from './pages/ContactPage';
import PricingPage from './pages/PricingPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminForgotPassword from './pages/admin/AdminForgotPassword';
import AdminResetPassword from './pages/admin/AdminResetPassword';
import AdminSetup from './pages/admin/AdminSetup';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminContacts from './pages/admin/AdminContacts';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminGallery from './pages/admin/AdminGallery';
import AdminServices from './pages/admin/AdminServices';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminPricing from './pages/admin/AdminPricing';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUsers from './pages/admin/AdminUsers';

// ── Guards ────────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

/** Admin-only route — redirects to /admin/login if not authenticated */
const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/admin/login" replace />;
};

/** Redirects already-logged-in admin away from login/setup pages */
const AdminPublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Navigate to="/admin/dashboard" replace /> : children;
};

/** User-only route — redirects to /login if not authenticated */
const UserProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useUserAuth();
  if (loading) return <Spinner />;
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      <Routes>
        {/* ── Public ─────────────────────────────────────────────────── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />

        {/* ── User Auth ───────────────────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* ── User Protected ──────────────────────────────────────────── */}
        <Route path="/profile" element={
          <UserProtectedRoute>
            <ProfilePage />
          </UserProtectedRoute>
        } />

        {/* ── Admin Auth (redirect to dashboard if already logged in) ─── */}
        <Route path="/admin/login" element={
          <AdminPublicRoute>
            <AdminLogin />
          </AdminPublicRoute>
        } />

        <Route path="/admin/forgot-password" element={
          <AdminPublicRoute>
            <AdminForgotPassword />
          </AdminPublicRoute>
        } />

        <Route path="/admin/reset-password/:token" element={
          <AdminPublicRoute>
            <AdminResetPassword />
          </AdminPublicRoute>
        } />

        {/* /admin/setup is intentionally NOT linked anywhere in the UI.
            It is only accessible via direct URL and the backend blocks it
            once an admin account already exists. */}
        <Route path="/admin/setup" element={
          <AdminPublicRoute>
            <AdminSetup />
          </AdminPublicRoute>
        } />

        {/* ── Admin Protected ─────────────────────────────────────────── */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="pricing" element={<AdminPricing />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* ── 404 ─────────────────────────────────────────────────────── */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
            <h1 className="font-display text-8xl font-bold gradient-text">404</h1>
            <p className="text-gray-500 text-xl">Page not found</p>
            <a href="/" className="btn-primary">Go Home</a>
          </div>
        } />
      </Routes>

      {!isAdmin && <WhatsAppButton />}
    </>
  );
}