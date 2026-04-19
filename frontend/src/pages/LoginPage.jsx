import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useUserAuth } from '../context/UserAuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useUserAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) return toast.error('Please fill in all fields');
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            toast.success(`Welcome back, ${user.name}!`);
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet><title>Login – EventPro</title></Helmet>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-20 pb-16">
                <div className="relative w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-500">Sign in to your account to continue</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1.5 font-medium">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="your@email.com"
                                    className="input-field"
                                    autoComplete="email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-700 mb-1.5 font-medium">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        placeholder="••••••••"
                                        className="input-field pr-12"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                                    >
                                        {showPassword ? '🙈' : '👁'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full justify-center py-3 text-base"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Signing in…
                                    </span>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-500 text-sm">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
