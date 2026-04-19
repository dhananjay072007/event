import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminSetup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
        setLoading(true);
        try {
            await api.post('/auth/setup', { name: form.name, email: form.email, password: form.password });
            toast.success('Admin account created! You can now log in.');
            setDone(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Setup failed. An admin may already exist.');
        } finally { setLoading(false); }
    };

    return (
        <>
            <Helmet><title>Setup – EventPro</title></Helmet>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link to="/" className="font-display text-2xl font-bold gradient-text">EventPro</Link>
                        <p className="text-gray-500 mt-2">Admin Setup</p>
                    </div>

                    {done ? (
                        <div className="card p-8 text-center">
                            <div className="text-4xl mb-4">✅</div>
                            <h2 className="font-display text-xl text-gray-900 mb-2">Setup Complete!</h2>
                            <p className="text-gray-500 text-sm mb-6">Your admin account has been created successfully.</p>
                            <button onClick={() => navigate('/admin/login')} className="btn-primary w-full">Go to Login</button>
                        </div>
                    ) : (
                        <div className="card p-8">
                            <h2 className="font-display text-xl text-gray-900 mb-1">Create Admin Account</h2>
                            <p className="text-gray-500 text-sm mb-6">Set up your first administrator account to manage events.</p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Full Name</label>
                                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Admin Name" className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Email</label>
                                    <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@example.com" className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Password</label>
                                    <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Minimum 6 characters" className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Confirm Password</label>
                                    <input required type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Re-enter password" className="input-field" />
                                </div>
                                <button type="submit" disabled={loading} className="btn-primary w-full">
                                    {loading ? 'Creating…' : 'Create Admin Account'}
                                </button>
                            </form>

                            <p className="text-center text-gray-500 text-xs mt-6">
                                Already have an account? <Link to="/admin/login" className="text-primary-600 hover:text-primary-300">Log in</Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
