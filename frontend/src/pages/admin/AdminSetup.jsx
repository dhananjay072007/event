import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminSetup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [alreadySetup, setAlreadySetup] = useState(false);
    const [checking, setChecking] = useState(true);

    // Probe the setup endpoint on mount — if admin already exists, backend returns 403
    // and we show a "already setup" screen instead of the form
    useEffect(() => {
        const checkSetupStatus = async () => {
            try {
                // A HEAD-like probe: try calling setup with an empty body.
                // Backend immediately responds 403 if admin already exists without creating anything.
                // We use a quick GET to /api/auth/me — if it returns 401 (no token), setup may be needed.
                // The cleanest check: attempt setup with invalid data and catch the 403.
                await api.post('/auth/setup', { _probe: true });
                // If we somehow reach here with a 2xx, that's unexpected — just show the form.
            } catch (err) {
                if (err.response?.status === 403) {
                    // Admin already exists — block the page
                    setAlreadySetup(true);
                }
                // 400 (validation error on _probe) means setup endpoint is reachable and no admin yet
            } finally {
                setChecking(false);
            }
        };
        checkSetupStatus();
    }, []);

    const validate = () => {
        if (!form.name.trim() || form.name.trim().length < 2) {
            toast.error('Name must be at least 2 characters');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }
        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return false;
        }
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await api.post('/auth/setup', {
                name: form.name.trim(),
                email: form.email.toLowerCase().trim(),
                password: form.password,
            });
            toast.success('Admin account created! You can now log in.');
            setDone(true);
        } catch (err) {
            const msg = err.response?.data?.message || 'Setup failed.';
            if (err.response?.status === 403) {
                setAlreadySetup(true);
            } else {
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Loading state ────────────────────────────────────────────────────────────
    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ── Already setup ────────────────────────────────────────────────────────────
    if (alreadySetup) {
        return (
            <>
                <Helmet><title>Setup – Shiv Event Management</title></Helmet>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="w-full max-w-md card p-8 text-center">
                        <div className="text-5xl mb-4">🔒</div>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Setup Already Complete</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            An admin account already exists. Please log in with your credentials.
                        </p>
                        <button onClick={() => navigate('/admin/login')} className="btn-primary w-full">
                            Go to Login
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // ── Success state ────────────────────────────────────────────────────────────
    if (done) {
        return (
            <>
                <Helmet><title>Setup Complete – Shiv Event Management</title></Helmet>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="w-full max-w-md card p-8 text-center">
                        <div className="text-5xl mb-4">✅</div>
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Your admin account has been created. You can now log in.
                        </p>
                        <button onClick={() => navigate('/admin/login')} className="btn-primary w-full">
                            Go to Login
                        </button>
                    </div>
                </div>
            </>
        );
    }

    // ── Setup form ───────────────────────────────────────────────────────────────
    return (
        <>
            <Helmet><title>Admin Setup – Shiv Event Management</title></Helmet>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link to="/" className="font-display text-2xl font-bold gradient-text">Shiv Event Management</Link>
                        <p className="text-gray-500 mt-1 text-sm">First-time Admin Setup</p>
                    </div>

                    <div className="card p-8 shadow-xl">
                        <h2 className="font-display text-xl font-bold text-gray-900 mb-1">Create Admin Account</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            This page is only available once — when no admin account exists yet.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Admin Name"
                                    className="input-field"
                                    disabled={loading}
                                    minLength={2}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                                <input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="admin@example.com"
                                    className="input-field"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        placeholder="Minimum 8 characters"
                                        className="input-field pr-10"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirm Password</label>
                                <input
                                    required
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                    placeholder="Re-enter password"
                                    className="input-field"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Creating…
                                    </>
                                ) : '🛡️ Create Admin Account'}
                            </button>
                        </form>

                        <p className="text-center text-gray-500 text-xs mt-6">
                            Already have an account?{' '}
                            <Link to="/admin/login" className="text-primary-600 hover:text-primary-400">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}