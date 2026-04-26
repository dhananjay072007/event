import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { serviceAPI } from '../services/api';

export function ServiceDetailPage() {
    const { slug } = useParams();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        serviceAPI.getOne(slug)
            .then(r => setService(r.data.data))
            .catch(() => setService(null))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!service) return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4">🔍</div>
                    <h2 className="font-display text-3xl text-gray-900 mb-3">Service Not Found</h2>
                    <p className="text-gray-500 mb-6">The service you're looking for doesn't exist.</p>
                    <Link to="/services" className="btn-primary">View All Services</Link>
                </div>
            </div>
            <Footer />
        </>
    );

    return (
        <>
            <Helmet><title>{service.title} – Shiv Event Management</title></Helmet>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4">
                    <Link to="/services" className="text-primary-600 text-sm hover:text-primary-700 flex items-center gap-1 mb-8">← Back to Services</Link>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
                        {service.image && <img src={service.image} alt={service.title} className="w-full h-64 object-cover rounded-xl mb-6" />}
                        <div className="text-5xl mb-5">{service.icon || '🎉'}</div>
                        <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">{service.title}</h1>
                        <p className="text-gray-600 leading-relaxed text-lg mb-6">{service.description}</p>
                        {service.features?.length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">What's Included</h3>
                                <ul className="space-y-2">
                                    {service.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-600"><span className="text-primary-600">✓</span>{f}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {service.startingPrice && <p className="text-2xl font-bold text-primary-600 mb-6">Starting at ₹{service.startingPrice.toLocaleString('en-IN')}</p>}
                        <Link to="/booking" className="btn-primary text-base px-8 py-4">Book This Service</Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ServiceDetailPage;
