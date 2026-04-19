// ============= AdminContacts =============
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { contactAPI } from '../../services/api';

export function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await contactAPI.getAll({ limit: 50 });
      setContacts(res.data.data);
    } catch { toast.error('Failed to load messages'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    await contactAPI.markRead(id).catch(() => { });
    setContacts(c => c.map(x => x._id === id ? { ...x, isRead: true } : x));
    if (selected?._id === id) setSelected(s => ({ ...s, isRead: true }));
  };

  const del = async (id) => {
    if (!confirm('Delete this message?')) return;
    await contactAPI.delete(id);
    toast.success('Deleted');
    setContacts(c => c.filter(x => x._id !== id));
    setSelected(null);
  };

  const openContact = (c) => {
    setSelected(c);
    if (!c.isRead) markRead(c._id);
  };

  return (
    <>
      <Helmet><title>Messages – EventPro Admin</title></Helmet>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 text-sm">{contacts.filter(c => !c.isRead).length} unread</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>
          ) : contacts.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No messages yet</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {contacts.map(c => (
                <li key={c._id} onClick={() => openContact(c)}
                  className={`px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${selected?._id === c._id ? 'bg-primary-500/5 border-l-2 border-primary-500' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${c.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{c.name}</span>
                        {!c.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5 truncate max-w-xs">{c.subject || c.message.slice(0, 60)}</p>
                    </div>
                    <span className="text-gray-600 text-xs whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString('en-IN', { dateStyle: 'short' })}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selected ? (
          <div className="card p-7">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900">{selected.name}</h2>
                <p className="text-gray-500 text-sm">{selected.email}{selected.phone ? ` · ${selected.phone}` : ''}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-900 text-2xl">×</button>
            </div>
            {selected.subject && <p className="text-primary-600 text-sm font-medium mb-3">{selected.subject}</p>}
            <div className="bg-gray-100 rounded-xl p-4 text-gray-700 text-sm leading-relaxed mb-5">{selected.message}</div>
            <p className="text-gray-500 text-xs mb-5">{new Date(selected.createdAt).toLocaleString('en-IN')}</p>
            <div className="flex gap-3">
              <a href={`mailto:${selected.email}`} className="btn-primary text-sm px-4 py-2">Reply via Email</a>
              {selected.phone && <a href={`https://wa.me/91${selected.phone}`} target="_blank" rel="noreferrer" className="btn-outline text-sm px-4 py-2">WhatsApp</a>}
              <button onClick={() => del(selected._id)} className="px-4 py-2 text-sm text-red-600 border border-red-500/30 rounded-xl hover:bg-red-50 transition-all ml-auto">Delete</button>
            </div>
          </div>
        ) : (
          <div className="card flex items-center justify-center text-gray-500 text-sm h-48">Select a message to read</div>
        )}
      </div>
    </>
  );
}

// ============= AdminBlogs =============
import { blogAPI } from '../../services/api';

export function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', content: '', excerpt: '', category: 'General', isPublished: false });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await blogAPI.getAllAdmin();
      setBlogs(res.data.data);
    } catch { toast.error('Failed to load blogs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', content: '', excerpt: '', category: 'General', isPublished: false });
    setShowForm(true);
  };

  const openEdit = (blog) => {
    setEditing(blog);
    setForm({ title: blog.title, content: blog.content, excerpt: blog.excerpt || '', category: blog.category || 'General', isPublished: blog.isPublished });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await blogAPI.update(editing._id, form);
        toast.success('Blog updated');
      } else {
        await blogAPI.create(form);
        toast.success('Blog created');
      }
      setShowForm(false);
      fetchBlogs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this blog?')) return;
    await blogAPI.delete(id);
    toast.success('Deleted');
    fetchBlogs();
  };

  return (
    <>
      <Helmet><title>Blogs – EventPro Admin</title></Helmet>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 text-sm">{blogs.length} posts</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">+ New Post</button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />)}</div>
        ) : blogs.length === 0 ? (
          <p className="p-10 text-center text-gray-500">No blog posts yet. Create your first one!</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              {['Title', 'Category', 'Status', 'Views', 'Created', 'Actions'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {blogs.map(b => (
                <tr key={b._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-4 text-gray-900 font-medium max-w-xs truncate">{b.title}</td>
                  <td className="px-5 py-4 text-gray-500">{b.category}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.isPublished ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                      {b.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{b.views || 0}</td>
                  <td className="px-5 py-4 text-gray-500">{new Date(b.createdAt).toLocaleDateString('en-IN', { dateStyle: 'short' })}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEdit(b)} className="text-primary-600 text-xs hover:text-primary-300">Edit</button>
                      <button onClick={() => handleDelete(b._id)} className="text-red-600 text-xs hover:text-red-300">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="card max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-gray-900">{editing ? 'Edit Post' : 'New Blog Post'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900 text-2xl">×</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Title *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Post title" className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Excerpt</label>
                <textarea rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short summary…" className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Content *</label>
                <textarea required rows={8} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write blog content (supports HTML)…" className="input-field resize-none font-mono text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                    {['General', 'Wedding', 'Corporate', 'Birthday', 'Tips', 'Trends'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-11 h-6 rounded-full transition-colors relative ${form.isPublished ? 'bg-primary-600' : 'bg-gray-100 border border-gray-300'}`}
                      onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-sm text-gray-600">Publish</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : editing ? 'Update Post' : 'Create Post'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ============= AdminGallery =============
import { galleryAPI } from '../../services/api';

const CATEGORIES = ['Wedding', 'Corporate', 'Birthday', 'Anniversary', 'Conference', 'Concert', 'Other'];

export function AdminGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', category: 'Other', description: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await galleryAPI.getAll();
      setImages(res.data.data);
    } catch { toast.error('Failed to load gallery'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchImages(); }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast.error('Only image files allowed');
    if (f.size > 5 * 1024 * 1024) return toast.error('Max file size is 5MB');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select an image');
    if (!uploadForm.title.trim()) return toast.error('Please enter a title');
    if (!uploadForm.category) return toast.error('Please select a category');

    setUploading(true);
    const data = new FormData();
    data.append('image', file);
    data.append('title', uploadForm.title.trim());
    data.append('category', uploadForm.category);
    data.append('description', uploadForm.description);

    try {
      await galleryAPI.upload(data);
      toast.success('Image uploaded!');
      setFile(null);
      setPreview(null);
      setUploadForm({ title: '', category: 'Other', description: '' });
      fetchImages();
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return;
    try {
      await galleryAPI.delete(id);
      toast.success('Deleted');
      setImages(imgs => imgs.filter(i => i._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const filtered = activeCategory === 'All' ? images : images.filter(i => i.category === activeCategory);

  return (
    <>
      <Helmet><title>Gallery – EventPro Admin</title></Helmet>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Gallery</h1>
        <p className="text-gray-500 text-sm">{images.length} images</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Upload New Image</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            {/* File drop */}
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${preview ? 'border-primary-500/50' : 'border-gray-200 hover:border-gray-400'}`}>
              {preview ? (
                <img src={preview} className="w-full h-32 object-cover rounded-lg" alt="preview" />
              ) : (
                <><div className="text-3xl mb-2">📷</div><p className="text-gray-500 text-sm text-center">Click to choose image<br /><span className="text-xs text-gray-400">JPG, PNG, WebP · Max 5MB</span></p></>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            <input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} placeholder="Image title *" className="input-field" required />
            <select value={uploadForm.category} onChange={e => setUploadForm(f => ({ ...f, category: e.target.value }))} className="input-field">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <textarea value={uploadForm.description} onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))} placeholder="Image description (optional)" rows={2} className="input-field resize-none" />
            <button type="submit" disabled={uploading || !file} className="btn-primary w-full justify-center relative">
              {uploading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading… (please wait)
                </>
              ) : '📤 Upload Image'}
            </button>
          </form>
        </div>

        {/* Gallery Grid */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-2 mb-4">
            {['All', ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === cat ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}>
                {cat}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-gray-200 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-10 text-center text-gray-500">No images in this category</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map(img => (
                <div key={img._id} className="group relative aspect-square rounded-xl overflow-hidden card">
                  <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  <div className="absolute inset-0 bg-gray-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <p className="text-white text-xs font-medium text-center px-2">{img.title}</p>
                    <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{img.category}</span>
                    <button onClick={() => handleDelete(img._id)} className="mt-2 px-3 py-1 text-xs text-red-300 border border-red-500/30 rounded-lg hover:bg-red-50">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============= AdminServices =============
import { serviceAPI } from '../../services/api';

export function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', icon: '🎉', shortDescription: '', description: '', startingPrice: '', isActive: true, features: '' });
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await serviceAPI.getAllAdmin();
      setServices(res.data.data);
    } catch { toast.error('Failed to load services'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', icon: '🎉', shortDescription: '', description: '', startingPrice: '', isActive: true, features: '' });
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ title: s.title, icon: s.icon || '🎉', shortDescription: s.shortDescription || '', description: s.description || '', startingPrice: s.startingPrice || '', isActive: s.isActive, features: (s.features || []).join('\n') });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, startingPrice: form.startingPrice ? Number(form.startingPrice) : undefined, features: form.features.split('\n').filter(Boolean) };
    try {
      if (editing) { await serviceAPI.update(editing._id, payload); toast.success('Updated'); }
      else { await serviceAPI.create(payload); toast.success('Created'); }
      setShowForm(false); fetchServices();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    await serviceAPI.delete(id);
    toast.success('Deleted');
    fetchServices();
  };

  return (
    <>
      <Helmet><title>Services – EventPro Admin</title></Helmet>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 text-sm">{services.length} services</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">+ Add Service</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? [...Array(6)].map((_, i) => <div key={i} className="card h-40 animate-pulse bg-gray-200" />) :
          services.map(s => (
            <div key={s._id} className={`card p-6 ${!s.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{s.icon || '🎉'}</div>
                <span className={`px-2 py-0.5 rounded-full text-xs ${s.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="font-display font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-3">{s.shortDescription}</p>
              {s.startingPrice && <p className="text-primary-600 text-sm">₹{s.startingPrice.toLocaleString('en-IN')}</p>}
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(s)} className="text-primary-600 text-xs hover:text-primary-300">Edit</button>
                <button onClick={() => handleDelete(s._id)} className="text-red-600 text-xs hover:text-red-300 ml-auto">Delete</button>
              </div>
            </div>
          ))
        }
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="card max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-gray-900">{editing ? 'Edit Service' : 'New Service'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900 text-2xl">×</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Icon</label>
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="input-field text-center text-2xl" maxLength={2} />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-gray-500 mb-1.5">Title *</label>
                  <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Wedding Planning" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Short Description</label>
                <input value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} placeholder="Brief one-liner" className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Full Description *</label>
                <textarea required rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed description…" className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Starting Price (₹)</label>
                <input type="number" value={form.startingPrice} onChange={e => setForm(f => ({ ...f, startingPrice: e.target.value }))} placeholder="50000" className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Features (one per line)</label>
                <textarea rows={4} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder={"Full planning\nVendor coordination\n24/7 support"} className="input-field resize-none text-sm" />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-green-600' : 'bg-gray-100 border border-gray-300'}`}
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm text-gray-600">Active</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ============= AdminTestimonials =============
import { testimonialAPI } from '../../services/api';

export function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', text: '', rating: 5, isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await testimonialAPI.getAllAdmin();
      setTestimonials(res.data.data);
    } catch { toast.error('Failed to load testimonials'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', role: '', text: '', rating: 5, isActive: true });
    setShowForm(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name, role: t.role || '', text: t.text, rating: t.rating || 5, isActive: t.isActive });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await testimonialAPI.update(editing._id, form); toast.success('Updated'); }
      else { await testimonialAPI.create(form); toast.success('Created'); }
      setShowForm(false); fetchTestimonials();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    await testimonialAPI.delete(id);
    toast.success('Deleted');
    fetchTestimonials();
  };

  return (
    <>
      <Helmet><title>Testimonials – EventPro Admin</title></Helmet>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-500 text-sm">{testimonials.length} testimonials</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">+ Add Testimonial</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="card h-40 animate-pulse bg-gray-200" />) :
          testimonials.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">No testimonials yet. Add your first client review!</div>
          ) :
            testimonials.map(t => (
              <div key={t._id} className={`card p-6 ${!t.isActive ? 'opacity-60' : ''}`}>
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating || 5)].map((_, j) => <span key={j} className="text-gold text-sm">★</span>)}
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 mb-3">"{t.text}"</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xs">{t.name[0]}</div>
                  <div>
                    <div className="text-gray-900 text-sm font-medium">{t.name}</div>
                    {t.role && <div className="text-gray-500 text-xs">{t.role}</div>}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${t.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                    {t.isActive ? 'Active' : 'Hidden'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(t)} className="text-primary-600 text-xs hover:text-primary-300">Edit</button>
                    <button onClick={() => handleDelete(t._id)} className="text-red-600 text-xs hover:text-red-300">Delete</button>
                  </div>
                </div>
              </div>
            ))
        }
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="card max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-gray-900">{editing ? 'Edit Testimonial' : 'New Testimonial'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900 text-2xl">×</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Client Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Priya Sharma" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Role / Title</label>
                  <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Bride / CEO, Company" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Testimonial Text *</label>
                <textarea required rows={4} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} placeholder="What the client said about your service…" className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button key={r} type="button" onClick={() => setForm(f => ({ ...f, rating: r }))}
                      className={`text-2xl transition-colors ${r <= form.rating ? 'text-gold' : 'text-gray-600'}`}>★</button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-11 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-green-600' : 'bg-gray-100 border border-gray-300'}`}
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm text-gray-600">Show on website</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ============= AdminPricing =============
import { pricingAPI } from '../../services/api';

export function AdminPricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', description: '', features: '', tag: '', ctaText: 'Get Started', ctaLink: '/booking', isPopular: false, isActive: true, order: 0 });
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await pricingAPI.getAllAdmin();
      setPlans(res.data.data);
    } catch { toast.error('Failed to load pricing'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', price: '', description: '', features: '', tag: '', ctaText: 'Get Started', ctaLink: '/booking', isPopular: false, isActive: true, order: 0 });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, price: p.price, description: p.description || '', features: (p.features || []).join('\n'), tag: p.tag || '', ctaText: p.ctaText || 'Get Started', ctaLink: p.ctaLink || '/booking', isPopular: p.isPopular, isActive: p.isActive, order: p.order || 0 });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, features: form.features.split('\n').filter(Boolean), order: Number(form.order) || 0 };
    try {
      if (editing) { await pricingAPI.update(editing._id, payload); toast.success('Updated'); }
      else { await pricingAPI.create(payload); toast.success('Created'); }
      setShowForm(false); fetchPlans();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this pricing plan?')) return;
    await pricingAPI.delete(id);
    toast.success('Deleted');
    fetchPlans();
  };

  return (
    <>
      <Helmet><title>Pricing – EventPro Admin</title></Helmet>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Pricing Plans</h1>
          <p className="text-gray-500 text-sm">{plans.length} plans</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm">+ Add Plan</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="card h-48 animate-pulse bg-gray-200" />) :
          plans.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">No pricing plans yet. Create your first one!</div>
          ) :
            plans.map(p => (
              <div key={p._id} className={`card p-6 ${p.isPopular ? 'border-primary-500/50' : ''} ${!p.isActive ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-display text-lg font-bold text-gray-900">{p.name}</h3>
                    {p.tag && <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{p.tag}</span>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${p.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>
                    {p.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{p.price}</div>
                {p.description && <p className="text-gray-500 text-sm mb-3">{p.description}</p>}
                {p.features?.length > 0 && (
                  <ul className="space-y-1 mb-3">
                    {p.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-center gap-1"><span className="text-primary-600">✓</span>{f}</li>
                    ))}
                    {p.features.length > 4 && <li className="text-xs text-gray-500">+{p.features.length - 4} more…</li>}
                  </ul>
                )}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)} className="text-primary-600 text-xs hover:text-primary-300">Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="text-red-600 text-xs hover:text-red-300 ml-auto">Delete</button>
                </div>
              </div>
            ))
        }
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="card max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-gray-900">{editing ? 'Edit Plan' : 'New Pricing Plan'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-900 text-2xl">×</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Plan Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Essential" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Price *</label>
                  <input required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="₹49,999" className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Perfect for small celebrations" className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Features (one per line)</label>
                <textarea rows={5} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder={"Up to 50 guests\nBasic décor\nEvent coordinator"} className="input-field resize-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Badge/Tag</label>
                  <input value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} placeholder="Most Popular" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Order</label>
                  <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Button Text</label>
                  <input value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} placeholder="Get Started" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Button Link</label>
                  <input value={form.ctaLink} onChange={e => setForm(f => ({ ...f, ctaLink: e.target.value }))} placeholder="/booking" className="input-field" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${form.isPopular ? 'bg-primary-600' : 'bg-gray-100 border border-gray-300'}`}
                    onClick={() => setForm(f => ({ ...f, isPopular: !f.isPopular }))}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isPopular ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm text-gray-600">Popular</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-green-600' : 'bg-gray-100 border border-gray-300'}`}
                    onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm text-gray-600">Active</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-900 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ============= AdminSettings =============
import { settingsAPI } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

export function AdminSettings() {
  const { refetch } = useSettings();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slideForm, setSlideForm] = useState({ title: '', subtitle: '', image: '', tag: '' });
  const [editSlideIdx, setEditSlideIdx] = useState(-1);

  useEffect(() => {
    settingsAPI.get()
      .then(r => setForm(r.data.data))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.update(form);
      toast.success('Settings saved!');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const addSlide = () => {
    if (!slideForm.title || !slideForm.image) return toast.error('Title and Image URL are required');
    if (editSlideIdx >= 0) {
      const slides = [...(form.heroSlides || [])];
      slides[editSlideIdx] = slideForm;
      setForm(f => ({ ...f, heroSlides: slides }));
      setEditSlideIdx(-1);
    } else {
      setForm(f => ({ ...f, heroSlides: [...(f.heroSlides || []), slideForm] }));
    }
    setSlideForm({ title: '', subtitle: '', image: '', tag: '' });
  };

  const removeSlide = (idx) => {
    setForm(f => ({ ...f, heroSlides: f.heroSlides.filter((_, i) => i !== idx) }));
  };

  const editSlide = (idx) => {
    setSlideForm(form.heroSlides[idx]);
    setEditSlideIdx(idx);
  };

  if (loading || !form) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <Helmet><title>Settings – EventPro Admin</title></Helmet>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-500 text-sm">Manage your website content and company information</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        {/* Company Info */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-5">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Company Name</label>
              <input value={form.companyName || ''} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Owner Name</label>
              <input value={form.ownerName || ''} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} placeholder="e.g., Kuldeep Rajput" className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Tagline</label>
              <input value={form.tagline || ''} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Premium Event Management" className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Owner Phone</label>
              <input value={form.ownerPhone || ''} onChange={e => setForm(f => ({ ...f, ownerPhone: e.target.value }))} placeholder="e.g., 6394352002" className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Phone</label>
              <input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Email</label>
              <input value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="hello@eventpro.com" className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">WhatsApp Number</label>
              <input value={form.whatsapp || ''} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="919876543210" className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Working Hours</label>
              <input value={form.workingHours || ''} onChange={e => setForm(f => ({ ...f, workingHours: e.target.value }))} placeholder="Mon - Sat: 9 AM - 8 PM" className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1.5">Address</label>
              <input value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Event Street, Mumbai" className="input-field" />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-5">Social Media Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['instagram', 'facebook', 'twitter', 'youtube'].map(platform => (
              <div key={platform}>
                <label className="block text-xs text-gray-500 mb-1.5 capitalize">{platform}</label>
                <input value={form.socialLinks?.[platform] || ''} onChange={e => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, [platform]: e.target.value } }))}
                  placeholder={`https://${platform}.com/yourpage`} className="input-field" />
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-5">Homepage Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Events Completed</label>
              <input value={form.stats?.eventsCompleted || ''} onChange={e => setForm(f => ({ ...f, stats: { ...f.stats, eventsCompleted: e.target.value } }))} placeholder="500+" className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Client Satisfaction</label>
              <input value={form.stats?.clientSatisfaction || ''} onChange={e => setForm(f => ({ ...f, stats: { ...f.stats, clientSatisfaction: e.target.value } }))} placeholder="98%" className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Years Experience</label>
              <input value={form.stats?.yearsExperience || ''} onChange={e => setForm(f => ({ ...f, stats: { ...f.stats, yearsExperience: e.target.value } }))} placeholder="10+" className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Team Members</label>
              <input value={form.stats?.teamMembers || ''} onChange={e => setForm(f => ({ ...f, stats: { ...f.stats, teamMembers: e.target.value } }))} placeholder="50+" className="input-field" />
            </div>
          </div>
        </div>

        {/* Hero Slides */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-5">Hero Slides</h2>
          {form.heroSlides?.length > 0 && (
            <div className="space-y-3 mb-5">
              {form.heroSlides.map((slide, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-100 rounded-xl">
                  {slide.image && <img src={slide.image} alt="" className="w-16 h-10 object-cover rounded-lg" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 text-sm font-medium truncate">{slide.title}</div>
                    <div className="text-gray-500 text-xs truncate">{slide.subtitle}</div>
                  </div>
                  <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{slide.tag}</span>
                  <button type="button" onClick={() => editSlide(idx)} className="text-primary-600 text-xs hover:text-primary-300">Edit</button>
                  <button type="button" onClick={() => removeSlide(idx)} className="text-red-600 text-xs hover:text-red-300">Remove</button>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input value={slideForm.title} onChange={e => setSlideForm(f => ({ ...f, title: e.target.value }))} placeholder="Slide Title *" className="input-field" />
            <input value={slideForm.subtitle} onChange={e => setSlideForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Subtitle" className="input-field" />
            <input value={slideForm.image} onChange={e => setSlideForm(f => ({ ...f, image: e.target.value }))} placeholder="Image URL *" className="input-field" />
            <input value={slideForm.tag} onChange={e => setSlideForm(f => ({ ...f, tag: e.target.value }))} placeholder="Tag (e.g. Wedding)" className="input-field" />
          </div>
          <button type="button" onClick={addSlide} className="btn-outline text-sm">{editSlideIdx >= 0 ? 'Update Slide' : '+ Add Slide'}</button>
        </div>

        {/* About & SEO */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-5">About & SEO</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">About Text (shown on homepage)</label>
              <textarea rows={3} value={form.aboutText || ''} onChange={e => setForm(f => ({ ...f, aboutText: e.target.value }))} placeholder="Tell visitors about your company…" className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Meta Title</label>
                <input value={form.metaTitle || ''} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} placeholder="EventPro - Premium Event Management" className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Meta Description</label>
                <input value={form.metaDescription || ''} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} placeholder="India's premier event management..." className="input-field" />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary text-base px-8 py-3">
          {saving ? 'Saving…' : '💾 Save All Settings'}
        </button>
      </form>
    </>
  );
}
