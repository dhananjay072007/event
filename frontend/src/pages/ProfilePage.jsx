import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useUserAuth } from '../context/UserAuthContext';
import { userAuthAPI, bookingAPI } from '../services/api';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function ProfilePage() {
    const { user, logout, updateProfile, isLoggedIn, loading: authLoading } = useUserAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState('bookings');
    const [form, setForm] = useState({ name: '', phone: '', city: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [saving, setSaving] = useState(false);
    const [myBookings, setMyBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            navigate('/login', { replace: true });
        }
    }, [authLoading, isLoggedIn, navigate]);

    useEffect(() => {
        if (user) {
            setForm({ name: user.name || '', phone: user.phone || '', city: user.city || '' });
        }
    }, [user]);

    useEffect(() => {
        if (isLoggedIn) {
            setBookingsLoading(true);
            bookingAPI.getMy()
                .then(res => setMyBookings(res.data.data || []))
                .catch(() => { })
                .finally(() => setBookingsLoading(false));
        }
    }, [isLoggedIn]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return toast.error('Name is required');
        setSaving(true);
        try {
            await updateProfile(form);
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally { setSaving(false); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
        if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
        setSaving(true);
        try {
            await userAuthAPI.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            toast.success('Password changed successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Password change failed');
        } finally { setSaving(false); }
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    if (authLoading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!user) return null;

    return (
        <>
            <Helmet><title>My Profile – EventPro</title></Helmet>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-24 pb-16">
                <div className="max-w-3xl mx-auto px-4">
                    {/* Profile Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                                {user.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="font-display text-2xl font-bold text-gray-900">{user.name}</h1>
                                <p className="text-gray-500 text-sm">{user.email}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                    {user.phone && <span className="flex items-center gap-1">📞 {user.phone}</span>}
                                    {user.city && <span className="flex items-center gap-1">📍 {user.city}</span>}
                                </div>
                            </div>
                            <button onClick={handleLogout} className="px-4 py-2 rounded-xl text-sm text-red-500 border border-red-200 hover:bg-red-50 transition-all">
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-xl">
                        {[{ key: 'bookings', label: 'My Bookings' }, { key: 'profile', label: 'Edit Profile' }, { key: 'password', label: 'Change Password' }].map(t => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* My Bookings */}
                    {tab === 'bookings' && (
                        <div className="space-y-4">
                            {bookingsLoading ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : myBookings.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                                    <div className="text-5xl mb-4">📅</div>
                                    <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                                    <p className="text-gray-500 text-sm mb-4">You haven't booked any events yet.</p>
                                    <a href="/booking" className="btn-primary inline-flex">Book an Event</a>
                                </div>
                            ) : myBookings.map(b => (
                                <div key={b._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-gray-900 font-semibold">{b.eventType}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${b.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                                                    b.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                                                        b.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                                            'bg-yellow-50 text-yellow-600'
                                                    }`}>
                                                    {b.status?.charAt(0).toUpperCase() + b.status?.slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                                                <span>📅 {new Date(b.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                                                {b.budget > 0 && <span>💰 ₹{b.budget.toLocaleString('en-IN')}</span>}
                                                <span className={`font-medium ${b.paymentStatus === 'paid' ? 'text-green-600' : b.paymentStatus === 'partial' ? 'text-yellow-600' : 'text-gray-400'}`}>
                                                    Payment: {b.paymentStatus?.charAt(0).toUpperCase() + b.paymentStatus?.slice(1)}
                                                </span>
                                            </div>
                                            {b.message && <p className="text-gray-400 text-sm mt-2 line-clamp-2">{b.message}</p>}
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                                        Booked on {new Date(b.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Profile Edit Form */}
                    {tab === 'profile' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="font-display text-lg font-semibold text-gray-900 mb-5">Edit Profile</h2>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1.5 font-medium">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1.5 font-medium">Email</label>
                                    <input type="email" value={user.email} disabled className="input-field opacity-50 cursor-not-allowed" />
                                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-1.5 font-medium">Phone</label>
                                        <input
                                            type="tel"
                                            value={form.phone}
                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                            placeholder="9876543210"
                                            className="input-field"
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
                                        />
                                    </div>
                                </div>
                                <button type="submit" disabled={saving} className="btn-primary mt-2">
                                    {saving ? 'Saving…' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Password Change Form */}
                    {tab === 'password' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="font-display text-lg font-semibold text-gray-900 mb-5">Change Password</h2>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1.5 font-medium">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordForm.currentPassword}
                                        onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                                        placeholder="Enter current password"
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1.5 font-medium">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordForm.newPassword}
                                        onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                                        placeholder="Minimum 6 characters"
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1.5 font-medium">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordForm.confirmPassword}
                                        onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                                        placeholder="Re-enter new password"
                                        className="input-field"
                                    />
                                </div>
                                <button type="submit" disabled={saving} className="btn-primary mt-2">
                                    {saving ? 'Updating…' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
