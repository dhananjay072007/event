import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Roles that are allowed to access the admin panel
const ALLOWED_ADMIN_ROLES = ['admin', 'superadmin'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate that the stored token still belongs to an active admin
  const validateSession = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Set header before the /me call
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await api.get('/auth/me');
      const userData = res.data.data;

      // Extra client-side role guard — even if backend sends a non-admin user somehow
      if (!ALLOWED_ADMIN_ROLES.includes(userData?.role)) {
        console.warn('⚠️  Token belongs to a non-admin user. Clearing session.');
        clearSession();
        return;
      }

      setUser(userData);
    } catch (err) {
      // 401 / network error → clear stale token
      console.warn('Session validation failed:', err.response?.status, err.message);
      clearSession();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const clearSession = () => {
    localStorage.removeItem('adminToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const login = async (email, password) => {
    // Clear any previous stale session first
    clearSession();

    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data.data;

    if (!token) throw new Error('No token received from server');

    // Validate role before accepting the session
    if (!ALLOWED_ADMIN_ROLES.includes(userData?.role)) {
      throw new Error('Access denied. Admin account required.');
    }

    localStorage.setItem('adminToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);

    return userData;
  };

  const logout = () => {
    clearSession();
  };

  // Expose a stable isAdmin derived value
  const isAdmin = !!user && ALLOWED_ADMIN_ROLES.includes(user.role);
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};