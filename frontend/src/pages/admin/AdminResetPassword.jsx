import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!newPassword || newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.post(`/auth/reset-password/${token}`, {
                newPassword,
                confirmPassword
            });
            toast.success('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/admin/login'), 2000);
        } catch (error) {
            const msg = error.response?.data?.message || error.message;
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-center">
                        <h1 className="text-3xl font-bold text-white mb-2">🔑 Set New Password</h1>
                        <p className="text-indigo-100">Enter your new secure password</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8">
                        {/* New Password */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                🔐 New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none transition"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                                    tabIndex="-1"
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">At least 8 characters</p>
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                ✓ Confirm Password
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none transition"
                                disabled={loading}
                            />
                        </div>

                        {/* Password Strength Indicator */}
                        {newPassword && (
                            <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs font-semibold text-blue-900 mb-2">✓ Password strength:</p>
                                <div className="flex gap-1 h-2">
                                    <div className={`flex-1 rounded ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <div className={`flex-1 rounded ${newPassword.length >= 12 ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <div className={`flex-1 rounded ${/[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !newPassword || !confirmPassword}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                <>🔑 Reset Password</>
                            )}
                        </button>

                        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                            <Link to="/admin/login" className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                                ← Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
