import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useUserAuth } from '../context/UserAuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function SignupPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', city: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useUserAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
        setLoading(true);
        try {
            const user = await register({
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                city: form.city,
            });
            toast.success(`Welcome, ${user.name}! Account created successfully.`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet><title>Sign Up – EventPro</title></Helmet>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-20 pb-16">
                <div className="relative w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                        <p className="text-gray-500">Join us and start planning your perfect event</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1.5 font-medium">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="John Doe"
                                    className="input-field"
                                    autoComplete="name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-700 mb-1.5 font-medium">Email Address *</label>
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

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1.5 font-medium">Phone</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        placeholder="9876543210"
                                        className="input-field"
                                        autoComplete="tel"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1.5 font-medium">City</label>
                                    <input
                                        type="text"
                                        value={form.city}
                                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                        placeholder="Mumbai"
                                        className="input-field"
                                        autoComplete="address-level2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-700 mb-1.5 font-medium">Password *</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        placeholder="Minimum 6 characters"
                                        className="input-field pr-12"
                                        autoComplete="new-password"
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

                            <div>
                                <label className="block text-sm text-gray-700 mb-1.5 font-medium">Confirm Password *</label>
                                <input
                                    type="password"
                                    required
                                    value={form.confirmPassword}
                                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                    placeholder="Re-enter password"
                                    className="input-field"
                                    autoComplete="new-password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full justify-center py-3 text-base mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Creating Account…
                                    </span>
                                ) : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-500 text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                                    Sign In
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
