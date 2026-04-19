// ==================== ServicesPage ====================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
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
      <Helmet><title>Our Services – EventPro</title></Helmet>
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

// ==================== ServiceDetailPage ====================
import { useParams } from 'react-router-dom';

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
      <Helmet><title>{service.title} – EventPro</title></Helmet>
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

// ==================== PortfolioPage ====================
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
      <Helmet><title>Portfolio – EventPro</title></Helmet>
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

// ==================== ContactPage ====================
import { contactAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { settings } = useSettings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactAPI.create(form);
      setSubmitted(true);
      toast.success('Message sent! We\'ll reply within 24 hours.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    settings?.address && { icon: '📍', title: 'Address', value: settings.address },
    settings?.phone && { icon: '📞', title: 'Phone', value: settings.phone },
    settings?.email && { icon: '✉️', title: 'Email', value: settings.email },
    settings?.workingHours && { icon: '🕒', title: 'Working Hours', value: settings.workingHours },
  ].filter(Boolean);

  return (
    <>
      <Helmet><title>Contact Us – EventPro</title></Helmet>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-2">Reach Out</p>
            <h1 className="section-title">Get in <span className="gradient-text">Touch</span></h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Info */}
            <div className="space-y-6">
              {contactInfo.map((item, i) => (
                <div key={i} className="card p-5 flex items-start gap-4">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{item.title}</div>
                    <div className="text-gray-900 text-sm font-medium">{item.value}</div>
                  </div>
                </div>
              ))}
              {contactInfo.length === 0 && (
                <div className="card p-8 text-center text-gray-400">
                  <p>Contact information will be available soon.</p>
                </div>
              )}
              {settings?.whatsapp && (
                <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=Hi! I'm interested in booking an event.`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 p-5 bg-green-50 border border-green-200 hover:bg-green-100 rounded-2xl text-green-600 font-medium transition-all">
                  💬 Chat on WhatsApp
                </a>
              )}
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">✉️</div>
                  <h3 className="font-display text-2xl text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 mb-6">We'll get back to you within 24 hours.</p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }} className="btn-primary">Send Another Message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 font-medium mb-1.5">Name *</label>
                      <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 font-medium mb-1.5">Email *</label>
                      <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">Phone</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="9876543210" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">Subject</label>
                    <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="How can we help?" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1.5">Message *</label>
                    <textarea required minLength={10} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us about your event…" rows={4} className="input-field resize-none" />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                    {loading ? 'Sending…' : '📤 Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// ==================== PricingPage ====================
import { pricingAPI } from '../services/api';

export function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pricingAPI.getAll()
      .then(r => setPlans(r.data.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet><title>Pricing – EventPro</title></Helmet>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-2">Transparent Pricing</p>
            <h1 className="section-title">Choose Your <span className="gradient-text">Package</span></h1>
            <p className="section-subtitle mx-auto">No hidden charges. Every rupee goes towards making your event unforgettable.</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <div key={i} className="h-80 animate-pulse bg-gray-100 rounded-2xl" />)}
            </div>
          ) : plans.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {plans.map((plan, i) => (
                  <div key={plan._id} className={`bg-white rounded-2xl shadow-sm border p-8 relative transition-all ${plan.isPopular ? 'border-primary-300 shadow-lg shadow-primary-100 -mt-4 ring-1 ring-primary-200' : 'border-gray-100'}`}>
                    {plan.tag && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs px-4 py-1 rounded-full font-medium">{plan.tag}</span>}
                    <h3 className="font-display text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                    {plan.description && <p className="text-gray-500 text-sm mb-4">{plan.description}</p>}
                    <div className="text-4xl font-bold text-gray-900 mb-6">{plan.price}</div>
                    {plan.features?.length > 0 && (
                      <ul className="space-y-2.5 mb-8">
                        {plan.features.map((f, j) => (
                          <li key={j} className="flex items-center gap-2.5 text-sm text-gray-600">
                            <span className="text-primary-600 text-base">✓</span>{f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link to={plan.ctaLink || '/booking'} className={`w-full py-3 rounded-xl font-medium text-sm text-center block transition-all ${plan.isPopular ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'border border-primary-200 text-primary-600 hover:bg-primary-600 hover:text-white hover:border-primary-600'}`}>
                      {plan.ctaText || 'Get Started'}
                    </Link>
                  </div>
                ))}
              </div>
              <p className="text-center text-gray-400 text-sm mt-10">All packages can be customized. <Link to="/contact" className="text-primary-600 hover:underline">Contact us</Link> for a custom quote.</p>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="font-display text-xl text-gray-900 mb-2">Pricing plans coming soon</h3>
              <p className="text-gray-500 mb-6">We're setting up our pricing. Contact us for a custom quote!</p>
              <Link to="/contact" className="btn-primary">Get a Quote</Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

// ==================== BlogPage ====================
import { blogAPI } from '../services/api';

export function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogAPI.getAll()
      .then(r => setBlogs(r.data.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet><title>Blog – EventPro</title></Helmet>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-2">Insights</p>
            <h1 className="section-title">Event Planning <span className="gradient-text">Blog</span></h1>
            <p className="section-subtitle mx-auto">Tips, trends, and inspiration for every occasion.</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <div key={i} className="h-64 animate-pulse bg-gray-100 rounded-2xl" />)}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map(blog => (
                <Link key={blog._id} to={`/blog/${blog.slug}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:border-primary-200 hover:-translate-y-1 transition-all duration-300">
                  {blog.image && <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover" loading="lazy" />}
                  <div className="p-6">
                    <span className="text-xs text-primary-600 font-medium bg-primary-50 px-3 py-1 rounded-full">{blog.category}</span>
                    <h3 className="font-display text-lg font-semibold text-gray-900 mt-3 mb-2 group-hover:text-primary-600 transition-colors">{blog.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{blog.excerpt}</p>
                    <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                      <span>{new Date(blog.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                      {blog.views > 0 && <span>👁 {blog.views}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="font-display text-xl text-gray-900 mb-2">No blog posts yet</h3>
              <p className="text-gray-500">Blog content is coming soon. Stay tuned!</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

// ==================== BlogDetailPage ====================
export function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogAPI.getOne(slug)
      .then(r => setBlog(r.data.data))
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!blog) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="font-display text-3xl text-gray-900 mb-3">Blog not found</h2>
          <p className="text-gray-500 mb-6">The article you're looking for doesn't exist.</p>
          <Link to="/blog" className="btn-primary">Back to Blog</Link>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <Helmet>
        <title>{blog.title} – EventPro Blog</title>
        <meta name="description" content={blog.metaDescription || blog.excerpt || blog.title} />
      </Helmet>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <Link to="/blog" className="text-primary-600 text-sm hover:text-primary-700 flex items-center gap-1 mb-8">← Back to Blog</Link>
          <span className="text-xs text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{blog.category}</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-4">{blog.title}</h1>
          <div className="flex items-center gap-4 text-gray-400 text-sm mb-8">
            <span>{blog.author || 'EventPro Team'}</span>
            <span>•</span>
            <span>{new Date(blog.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
            {blog.views > 0 && <><span>•</span><span>👁 {blog.views} views</span></>}
          </div>
          {blog.image && <img src={blog.image} alt={blog.title} className="w-full rounded-2xl mb-8 max-h-96 object-cover" />}
          <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }} />
          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
              {blog.tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-xs text-gray-500">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
