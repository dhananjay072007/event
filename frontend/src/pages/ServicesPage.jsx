import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { serviceAPI } from '../services/api';

export function ServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        serviceAPI.getAll()
            .then(r => setServices(r.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <Helmet><title>Our Services – Shiv Event Management</title></Helmet>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-14">
                        <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-2">What We Offer</p>
                        <h1 className="section-title">Our <span className="gradient-text">Services</span></h1>
                        <p className="section-subtitle mx-auto">Every service is crafted with passion, precision, and a commitment to excellence.</p>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => <div key={i} className="h-48 animate-pulse bg-gray-100 rounded-2xl" />)}
                        </div>
                    ) : services.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((s) => (
                                <Link key={s._id} to={`/services/${s.slug}`}
                                    className="card p-7 group hover:border-primary-200 hover:-translate-y-1 transition-all duration-300">
                                    <div className="text-4xl mb-4">{s.icon || '🎉'}</div>
                                    <h3 className="font-display text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{s.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.shortDescription}</p>
                                    {s.startingPrice && <p className="text-primary-600 text-sm font-medium">Starting ₹{s.startingPrice.toLocaleString('en-IN')}</p>}
                                    <div className="mt-3 text-primary-600 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Know more →</div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-4">🎯</div>
                            <h3 className="font-display text-xl text-gray-900 mb-2">No services available yet</h3>
                            <p className="text-gray-500">Our services are being set up. Please check back soon!</p>
                        </div>
                    )}
                    <div className="mt-14 text-center bg-gradient-to-br from-primary-600 to-purple-700 rounded-3xl p-10">
                        <h2 className="font-display text-3xl text-white mb-3">Don't see what you need?</h2>
                        <p className="text-primary-100 mb-6">We handle all kinds of events. Let's talk about your unique requirements.</p>
                        <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:shadow-xl transition-all">Get in Touch</Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ServicesPage;
