import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Admin Login – EventPro</title></Helmet>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">E</div>
              <span className="font-display text-2xl font-bold text-gray-900">Event<span className="gradient-text">Pro</span></span>
            </div>
            <p className="text-gray-500 text-sm">Admin Dashboard</p>
          </div>

          <div className="card p-8">
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-gray-500 text-sm mb-7">Sign in to manage your events</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Email Address</label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@eventpro.com"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Password</label>
                <input
                  type="password" required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3 mt-2"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in…</>
                  : '🔐 Sign In'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-600 mt-6">
              First time? <a href="/admin/setup" className="text-primary-600 hover:underline">Setup admin account</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
