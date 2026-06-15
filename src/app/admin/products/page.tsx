'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Package, Upload, Image as ImageIcon, Plus, Edit3, Trash2, Save, X, Eye,
  Search, Filter, RefreshCw, ArrowUpDown, CheckCircle2, AlertCircle, Copy,
  Sparkles, Tag, DollarSign, Archive, LayoutGrid, List
} from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  galleryUrls: string[];
  isFeatured: boolean;
  isActive: boolean;
  isFestiveDrop: boolean;
  category: { id: string; name: string; slug: string };
  rating: number;
  reviewCount: number;
}

export default function ProductsAdmin() {
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginSecret, setLoginSecret] = useState('');
  const [loginError, setLoginError] = useState('');

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Editor
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auth check
  useEffect(() => {
    const stored = sessionStorage.getItem('admin_token');
    if (stored) {
      setToken(stored);
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin', { headers: { 'x-admin-token': token } });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (token) fetchProducts(); }, [token, fetchProducts]);

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin', { headers: { 'x-admin-token': loginSecret } });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('admin_token', loginSecret);
        setToken(loginSecret);
        setIsAuthenticated(true);
        setProducts(data.products || []);
        setLoading(false);
      } else {
        setLoginError('Invalid credentials');
      }
    } catch {
      setLoginError('Connection failed');
    }
  };

  // Save product
  const saveProduct = async (product: Partial<Product>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'x-admin-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsertProduct', data: product }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Product saved successfully' });
        setShowEditor(false);
        fetchProducts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Save failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'x-admin-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteProduct', data: { id } }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Product deleted' });
        fetchProducts();
      }
    } catch {}
  };

  // Filtered products
  const filtered = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && p.isActive) ||
                         (filterActive === 'inactive' && !p.isActive);
    return matchesSearch && matchesFilter;
  });

  // ─── Login Gate ─────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-space-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Package className="h-7 w-7 text-cyan-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Product Manager</h1>
            <p className="text-xs text-white/40">Enter admin credentials</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={loginSecret}
              onChange={(e) => setLoginSecret(e.target.value)}
              placeholder="Admin Secret"
              className="w-full px-4 py-3 bg-space-900 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-500/50 focus:outline-none"
            />
            {loginError && <p className="text-xs text-red-400">{loginError}</p>}
            <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg text-sm">
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Main Dashboard ─────────────────────────────────
  return (
    <div className="min-h-screen bg-space-950 text-white">
      {/* Top Bar */}
      <div className="border-b border-white/5 bg-space-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Package className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold">Product Catalog</h1>
              <p className="text-[10px] text-white/40 font-mono">{products.length} products · {products.filter(p => p.isActive).length} active</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploader(true)}
              className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-medium hover:bg-purple-500/20 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Images
            </button>
            <button
              onClick={() => { setEditingProduct(null); setShowEditor(true); }}
              className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-300 text-xs font-medium hover:bg-cyan-500/20 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Status Message */}
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg border ${message.type === 'success' ? 'bg-green-500/5 border-green-500/20 text-green-300' : 'bg-red-500/5 border-red-500/20 text-red-300'}`}>
            {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span className="text-sm">{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-auto"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2.5 bg-space-900/60 border border-white/5 rounded-lg text-sm text-white placeholder-white/30 focus:border-cyan-500/30 focus:outline-none"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center rounded-lg border border-white/5 overflow-hidden bg-space-900/60">
            {(['all', 'active', 'inactive'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterActive(f)}
                className={`px-3 py-2.5 text-xs font-medium capitalize transition-colors ${filterActive === f ? 'bg-cyan-500/10 text-cyan-300' : 'text-white/40 hover:text-white/60'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-white/5 overflow-hidden bg-space-900/60">
            <button
              onClick={() => setView('grid')}
              className={`p-2.5 ${view === 'grid' ? 'bg-cyan-500/10 text-cyan-300' : 'text-white/40'}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2.5 ${view === 'list' ? 'bg-cyan-500/10 text-cyan-300' : 'text-white/40'}`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          <button onClick={fetchProducts} className="p-2.5 text-white/40 hover:text-white/70">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Product Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <Package className="h-10 w-10 text-white/10 mx-auto" />
            <p className="text-sm text-white/40">No products found</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} onEdit={() => { setEditingProduct(product); setShowEditor(true); }} onDelete={() => deleteProduct(product.id)} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(product => (
              <ProductRow key={product.id} product={product} onEdit={() => { setEditingProduct(product); setShowEditor(true); }} onDelete={() => deleteProduct(product.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Image Uploader Modal */}
      {showUploader && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-space-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-400" />
                Image Upload Studio
              </h2>
              <button onClick={() => setShowUploader(false)} className="p-2 hover:bg-white/5 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-white/50">
              Upload product images. They&apos;ll be auto-optimized to WebP format with thumbnails generated.
            </p>
            <ImageUploader token={token} maxFiles={10} />
          </div>
        </div>
      )}

      {/* Product Editor Modal */}
      {showEditor && (
        <ProductEditor
          product={editingProduct}
          token={token}
          onSave={saveProduct}
          onClose={() => setShowEditor(false)}
          saving={saving}
        />
      )}
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────
function ProductCard({ product, onEdit, onDelete }: { product: Product; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="group bg-space-900/60 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all">
      <div className="relative aspect-square bg-space-950">
        <img src={product.imageUrl || '/images/products/default.jpg'} alt={product.title} className="w-full h-full object-cover" />
        {/* Status badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {product.isFeatured && (
            <span className="px-2 py-0.5 bg-gold-500/90 text-space-950 text-[9px] font-bold rounded-full flex items-center gap-0.5">
              <Sparkles className="h-2.5 w-2.5" /> Featured
            </span>
          )}
          {!product.isActive && (
            <span className="px-2 py-0.5 bg-red-500/80 text-white text-[9px] font-bold rounded-full">Inactive</span>
          )}
        </div>
        {/* Actions overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button onClick={onEdit} className="p-2.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
            <Edit3 className="h-4 w-4" />
          </button>
          <button onClick={onDelete} className="p-2.5 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors text-red-300">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-semibold truncate">{product.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gold-400 font-bold">₹{product.price}</span>
          <span className="text-[10px] text-white/30 font-mono">{product.category?.name || '—'}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Product Row (List View) ──────────────────────────
function ProductRow({ product, onEdit, onDelete }: { product: Product; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-space-900/40 border border-white/5 rounded-lg hover:border-white/10 transition-all">
      <img src={product.imageUrl || '/images/products/default.jpg'} alt="" className="w-12 h-12 rounded-lg object-cover" />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold truncate">{product.title}</h3>
        <p className="text-[10px] text-white/40">{product.slug} · {product.category?.name}</p>
      </div>
      <span className="text-sm font-bold text-gold-400">₹{product.price}</span>
      <div className="flex items-center gap-1">
        {product.isFeatured && <Sparkles className="h-3.5 w-3.5 text-gold-400" />}
        <div className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onEdit} className="p-2 hover:bg-white/5 rounded-lg"><Edit3 className="h-3.5 w-3.5 text-white/50" /></button>
        <button onClick={onDelete} className="p-2 hover:bg-white/5 rounded-lg"><Trash2 className="h-3.5 w-3.5 text-red-400/50" /></button>
      </div>
    </div>
  );
}

// ─── Product Editor Modal ─────────────────────────────
function ProductEditor({ product, token, onSave, onClose, saving }: {
  product: Product | null;
  token: string;
  onSave: (data: any) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const isNew = !product;
  const [form, setForm] = useState({
    id: product?.id || undefined,
    title: product?.title || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price || 0,
    imageUrl: product?.imageUrl || '',
    galleryUrls: product?.galleryUrls || [],
    isFeatured: product?.isFeatured || false,
    isActive: product?.isActive ?? true,
    isFestiveDrop: product?.isFestiveDrop || false,
    categoryId: product?.category?.id || '',
  });

  const [galleryInput, setGalleryInput] = useState('');

  const updateField = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Auto-generate slug from title
    if (key === 'title' && isNew) {
      setForm(prev => ({
        ...prev,
        [key]: value,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      }));
    }
  };

  const addGalleryImage = () => {
    if (galleryInput.trim()) {
      setForm(prev => ({ ...prev, galleryUrls: [...prev.galleryUrls, galleryInput.trim()] }));
      setGalleryInput('');
    }
  };

  const removeGalleryImage = (index: number) => {
    setForm(prev => ({ ...prev, galleryUrls: prev.galleryUrls.filter((_, i) => i !== index) }));
  };

  const handleImageUpload = (files: any[]) => {
    if (files.length > 0) {
      // Set first uploaded as primary if no primary
      if (!form.imageUrl) {
        setForm(prev => ({ ...prev, imageUrl: files[0].url }));
        // Rest go to gallery
        if (files.length > 1) {
          setForm(prev => ({ ...prev, galleryUrls: [...prev.galleryUrls, ...files.slice(1).map(f => f.url)] }));
        }
      } else {
        // All go to gallery
        setForm(prev => ({ ...prev, galleryUrls: [...prev.galleryUrls, ...files.map(f => f.url)] }));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-space-900 border border-white/10 rounded-2xl w-full max-w-3xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {isNew ? <Plus className="h-5 w-5 text-cyan-400" /> : <Edit3 className="h-5 w-5 text-gold-400" />}
            {isNew ? 'Create Product' : 'Edit Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Title</label>
              <input
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full px-3 py-2.5 bg-space-950 border border-white/10 rounded-lg text-sm focus:border-cyan-500/40 focus:outline-none"
                placeholder="Zodiac Thread Bracelet"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                className="w-full px-3 py-2.5 bg-space-950 border border-white/10 rounded-lg text-sm font-mono focus:border-cyan-500/40 focus:outline-none"
                placeholder="zodiac-thread-bracelet"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 bg-space-950 border border-white/10 rounded-lg text-sm focus:border-cyan-500/40 focus:outline-none resize-none"
              placeholder="Handcrafted celestial bracelet with zodiac-aligned thread knotting..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Price (₹)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-space-950 border border-white/10 rounded-lg text-sm focus:border-cyan-500/40 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Category ID</label>
              <input
                value={form.categoryId}
                onChange={(e) => updateField('categoryId', e.target.value)}
                className="w-full px-3 py-2.5 bg-space-950 border border-white/10 rounded-lg text-sm font-mono focus:border-cyan-500/40 focus:outline-none"
                placeholder="category-uuid"
              />
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'isActive', label: 'Active', color: 'green' },
              { key: 'isFeatured', label: 'Featured', color: 'gold' },
              { key: 'isFestiveDrop', label: 'Festive Drop', color: 'purple' },
            ].map(flag => (
              <label key={flag.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(form as any)[flag.key]}
                  onChange={(e) => updateField(flag.key, e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border ${(form as any)[flag.key] ? `bg-${flag.color}-500/20 border-${flag.color}-500/50` : 'border-white/10'} flex items-center justify-center`}>
                  {(form as any)[flag.key] && <div className={`w-2 h-2 rounded-sm bg-${flag.color}-400`} />}
                </div>
                <span className="text-xs text-white/60">{flag.label}</span>
              </label>
            ))}
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3 border-t border-white/5 pt-5">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-purple-400" />
              Product Images
            </h3>
            
            {/* Primary Image */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Primary Image URL</label>
              <div className="flex gap-2">
                <input
                  value={form.imageUrl}
                  onChange={(e) => updateField('imageUrl', e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-space-950 border border-white/10 rounded-lg text-sm font-mono focus:border-cyan-500/40 focus:outline-none"
                  placeholder="/images/products/your-image.webp"
                />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                )}
              </div>
            </div>

            {/* Upload directly */}
            <ImageUploader token={token} maxFiles={5} onUploadComplete={handleImageUpload} />

            {/* Gallery */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Gallery Images</label>
              {form.galleryUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {form.galleryUrls.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeGalleryImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={galleryInput}
                  onChange={(e) => setGalleryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addGalleryImage()}
                  className="flex-1 px-3 py-2 bg-space-950 border border-white/10 rounded-lg text-xs font-mono focus:border-cyan-500/40 focus:outline-none"
                  placeholder="Add gallery URL and press Enter"
                />
                <button onClick={addGalleryImage} className="px-3 py-2 bg-white/5 rounded-lg text-xs hover:bg-white/10">Add</button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-2.5 text-sm text-white/50 hover:text-white/70">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.title || !form.slug}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {isNew ? 'Create Product' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
