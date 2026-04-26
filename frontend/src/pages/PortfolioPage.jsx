import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { galleryAPI } from '../services/api';

const CATEGORIES = ['All', 'Wedding', 'Corporate', 'Birthday', 'Anniversary', 'Conference', 'Concert', 'Other'];

export function PortfolioPage() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        galleryAPI.getAll()
            .then(r => setImages(r.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = activeCategory === 'All' ? images : images.filter(img => img.category === activeCategory);

    return (
        <>
            <Helmet><title>Portfolio – Shiv Event Management</title></Helmet>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-2">Our Work</p>
                        <h1 className="section-title">Event <span className="gradient-text">Portfolio</span></h1>
                        <p className="section-subtitle mx-auto">A glimpse into the magical events we've crafted over the years.</p>
                    </div>
                    {/* Filter tabs */}
                    <div className="flex flex-wrap gap-2 justify-center mb-10">
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />)}
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map((img) => (
                                <div key={img._id} className="group relative overflow-hidden rounded-2xl aspect-square shadow-sm border border-gray-100">
                                    <img src={img.imageUrl} alt={img.title} loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        <div>
                                            <p className="text-white font-medium text-sm">{img.title}</p>
                                            <p className="text-primary-300 text-xs">{img.category}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-4">🖼️</div>
                            <h3 className="font-display text-xl text-gray-900 mb-2">No gallery images yet</h3>
                            <p className="text-gray-500">Our portfolio is being updated. Check back soon!</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default PortfolioPage;
