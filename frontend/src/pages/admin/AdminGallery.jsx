import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { galleryAPI } from '../../services/api';
import imageCompression from 'browser-image-compression';

const CATEGORIES = ['Wedding', 'Corporate', 'Birthday', 'Anniversary', 'Conference', 'Concert', 'Other'];

export default function AdminGallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
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

        setUploading(true);
        try {
            setUploadProgress('Compressing image…');
            const compressed = await imageCompression(file, { maxSizeMB: 0.8, maxWidthOrHeight: 900, useWebWorker: true });
            setUploadProgress('Uploading to server…');
            const data = new FormData();
            data.append('image', compressed, file.name);
            data.append('title', uploadForm.title.trim());
            data.append('category', uploadForm.category);
            data.append('description', uploadForm.description);
            await galleryAPI.upload(data);
            toast.success('Image uploaded!');
            setFile(null);
            setPreview(null);
            setUploadForm({ title: '', category: 'Other', description: '' });
            setUploadProgress('');
            fetchImages();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
            setUploadProgress('');
        } finally { setUploading(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this image?')) return;
        try {
            await galleryAPI.delete(id);
            toast.success('Image deleted successfully');
            setImages(imgs => imgs.filter(i => i._id !== id));
        } catch (err) {
            console.error('Delete error:', err);
            const message = err.response?.data?.message || err.message || 'Delete failed. Please try again.';
            toast.error(message);
        }
    };

    const filtered = activeCategory === 'All' ? images : images.filter(i => i.category === activeCategory);

    return (
        <>
            <Helmet><title>Gallery – Shiv Event Management Admin</title></Helmet>
            <div className="mb-6">
                <h1 className="font-display text-2xl font-bold text-gray-900">Gallery</h1>
                <p className="text-gray-500 text-sm">{images.length} images</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card p-6">
                    <h2 className="font-semibold text-gray-900 mb-5">Upload New Image</h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${preview ? 'border-primary-500/50' : 'border-gray-200 hover:border-gray-400'}`}>
                            {preview ? (
                                <img src={preview} className="w-full h-32 object-cover rounded-lg" alt="preview" />
                            ) : (
                                <>
                                    <div className="text-3xl mb-2">📷</div>
                                    <p className="text-gray-500 text-sm text-center">Click to choose image<br /><span className="text-xs text-gray-400">JPG, PNG, WebP · Max 5MB</span></p>
                                </>
                            )}
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                        <input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} placeholder="Image title *" className="input-field" required />
                        <select value={uploadForm.category} onChange={e => setUploadForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <textarea value={uploadForm.description} onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))} placeholder="Image description (optional)" rows={2} className="input-field resize-none" />
                        <button type="submit" disabled={uploading || !file} className="btn-primary w-full justify-center">
                            {uploading ? (
                                <span className="flex items-center gap-2">
                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {uploadProgress || 'Uploading…'}
                                </span>
                            ) : '📤 Upload Image'}
                        </button>
                    </form>
                </div>
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