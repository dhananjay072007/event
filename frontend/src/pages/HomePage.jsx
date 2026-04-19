import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { serviceAPI, testimonialAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';

export default function HomePage() {
  const [current, setCurrent] = useState(0);
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const intervalRef = useRef(null);
  const { settings } = useSettings();

  const slides = settings?.heroSlides?.length > 0 ? settings.heroSlides : [];
  const stats = settings?.stats || {};
  const hasStats = stats.eventsCompleted || stats.clientSatisfaction || stats.yearsExperience || stats.teamMembers;

  useEffect(() => {
    if (slides.length > 1) {
      intervalRef.current = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
      return () => clearInterval(intervalRef.current);
    }
  }, [slides.length]);

  useEffect(() => {
    serviceAPI.getAll()
      .then(r => setServices(r.data.data.slice(0, 6)))
      .catch(() => { })
      .finally(() => setLoadingServices(false));
    testimonialAPI.getAll()
      .then(r => setTestimonials(r.data.data))
      .catch(() => { })
      .finally(() => setLoadingTestimonials(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>{settings?.metaTitle || 'EventPro – Premium Event Management'}</title>
        <meta name="description" content={settings?.metaDescription || 'India\'s trusted event management company. Book your dream event today.'} />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="relative h-screen overflow-hidden">
        {slides.length > 0 ? (
          <>
            {slides.map((slide, i) => (
              <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}>
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
              </div>
            ))}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 animate-fadeInUp">
              <span className="inline-block px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium mb-6 animate-slideInDown">
                ✨ {slides[current]?.tag}
              </span>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 drop-shadow-lg animate-fadeInUp">
                {slides[current]?.title}
              </h1>
              <p className="text-white/90 text-xl md:text-2xl mb-10 max-w-2xl animate-fadeInUp" style={{ animationDelay: '0.1s' }}>{slides[current]?.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <Link to="/booking" className="btn-primary text-base px-8 py-4 shadow-xl">🎉 Book Your Event</Link>
                <Link to="/portfolio" className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium rounded-xl hover:bg-white/30 transition-all">View Our Work</Link>
              </div>
            </div>
            {slides.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="h-full bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 flex flex-col items-center justify-center text-center px-4 animate-blur-in">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 animate-fadeInDown">
              {settings?.companyName || 'EventPro'}
            </h1>
            <p className="text-white/80 text-xl md:text-2xl mb-10 animate-fadeInUp">{settings?.tagline || 'Premium Event Management'}</p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <Link to="/booking" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:shadow-xl transition-all">🎉 Book Your Event</Link>
              <Link to="/portfolio" className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium rounded-xl hover:bg-white/30 transition-all">View Our Work</Link>
            </div>
          </div>
        )}
      </section>

      {/* Stats */}
      {hasStats && (
        <section className="py-16 bg-gradient-to-r from-primary-600 via-primary-700 to-purple-800 animate-blur-in">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.eventsCompleted && (
              <div className="text-center animate-fadeInUp">
                <div className="font-display text-4xl md:text-5xl font-bold text-white">{stats.eventsCompleted}</div>
                <div className="text-primary-100 text-sm mt-2">Events Completed</div>
              </div>
            )}
            {stats.clientSatisfaction && (
              <div className="text-center animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                <div className="font-display text-4xl md:text-5xl font-bold text-white">{stats.clientSatisfaction}</div>
                <div className="text-primary-100 text-sm mt-2">Client Satisfaction</div>
              </div>
            )}
            {stats.yearsExperience && (
              <div className="text-center animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <div className="font-display text-4xl md:text-5xl font-bold text-white">{stats.yearsExperience}</div>
                <div className="text-primary-100 text-sm mt-2">Years Experience</div>
              </div>
            )}
            {stats.teamMembers && (
              <div className="text-center animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <div className="font-display text-4xl md:text-5xl font-bold text-white">{stats.teamMembers}</div>
                <div className="text-primary-100 text-sm mt-2">Expert Team Members</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Services */}
      <section className="py-24 px-4 max-w-7xl mx-auto animate-fadeInUp">
        <div className="text-center mb-14">
          <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-3 animate-fadeInUp">What We Do</p>
          <h2 className="section-title">Our <span className="gradient-text">Services</span></h2>
          <p className="section-subtitle mx-auto animate-fadeInUp">From intimate gatherings to grand spectacles, we handle every detail with precision and passion.</p>
        </div>
        {loadingServices ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-48 animate-pulse bg-gray-100 rounded-2xl" />)}
          </div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, idx) => (
              <Link key={s._id} to={`/services/${s.slug}`}
                className="card p-7 group hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{s.icon || '🎉'}</div>
                <h3 className="font-display text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.shortDescription || s.description?.slice(0, 100)}</p>
                <div className="mt-4 text-primary-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn more <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12 animate-fadeInUp">No services available yet. Check back soon!</div>
        )}
        {services.length > 0 && (
          <div className="text-center mt-10">
            <Link to="/services" className="btn-outline animate-fadeInUp" style={{ animationDelay: '0.3s' }}>View All Services</Link>
          </div>
        )}
      </section>

      {/* Why Us */}
      {settings?.aboutText && (
        <section className="py-24 bg-gray-50 animate-blur-in">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="animate-fadeInLeft">
                <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-3 animate-fadeInUp">Why Choose Us</p>
                <h2 className="section-title mb-6">Events That <span className="gradient-text">Exceed</span> Expectations</h2>
                <p className="text-gray-500 leading-relaxed mb-8 animate-fadeInUp">{settings.aboutText}</p>
                <Link to="/booking" className="btn-primary mt-4 inline-flex animate-fadeInUp" style={{ animationDelay: '0.2s' }}>Get a Free Quote</Link>
              </div>
              <div className="grid grid-cols-2 gap-4 animate-fadeInRight">
                <div className="rounded-2xl h-48 w-full bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 flex items-center justify-center hover:scale-105 transition-transform duration-300">
                  <span className="text-6xl animate-float">🎉</span>
                </div>
                <div className="rounded-2xl h-48 w-full bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 flex items-center justify-center mt-8 hover:scale-105 transition-transform duration-300">
                  <span className="text-6xl animate-float" style={{ animationDelay: '0.5s' }}>💍</span>
                </div>
                <div className="rounded-2xl h-48 w-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center -mt-8 hover:scale-105 transition-transform duration-300">
                  <span className="text-6xl animate-float" style={{ animationDelay: '1s' }}>🏢</span>
                </div>
                <div className="rounded-2xl h-48 w-full bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 flex items-center justify-center hover:scale-105 transition-transform duration-300">
                  <span className="text-6xl animate-float" style={{ animationDelay: '1.5s' }}>🎂</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-24 px-4 max-w-7xl mx-auto animate-fadeInUp">
          <div className="text-center mb-14">
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-widest mb-3 animate-fadeInUp">Client Love</p>
            <h2 className="section-title">What Our <span className="gradient-text">Clients</span> Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={t._id} className="card p-7 animate-fadeInUp" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex gap-1 mb-4 animate-fadeInUp">
                  {[...Array(t.rating || 5)].map((_, j) => <span key={j} className="text-yellow-500 text-lg animate-float" style={{ animationDelay: `${j * 0.1}s` }}>★</span>)}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform duration-300">{t.name[0]}</div>
                  <div>
                    <div className="text-gray-900 font-medium text-sm">{t.name}</div>
                    {t.role && <div className="text-gray-400 text-xs">{t.role}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 px-4 animate-fadeInUp">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 rounded-3xl p-12 md:p-16 shadow-2xl hover:shadow-primary-600/30 transition-all duration-300">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 animate-fadeInDown">Ready to Plan Your Dream Event?</h2>
          <p className="text-primary-100 text-lg mb-8 animate-fadeInUp">Let's create something unforgettable together. Get a free consultation today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:shadow-xl transition-all text-base hover:scale-105 duration-300 animate-slideInUp">🎉 Book Now</Link>
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 border border-white/30 text-white font-medium rounded-xl hover:bg-white/30 transition-all text-base hover:scale-105 duration-300 animate-slideInUp" style={{ animationDelay: '0.1s' }}>💬 Talk to Us</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
