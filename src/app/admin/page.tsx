'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import StellarSky from '@/components/ui/StellarSky';
import { formatPrice } from '@/store/useStore';
import { getCelestialBody } from '@/lib/services/celestial';
import { 
  TrendingUp, ShoppingBag, ShieldCheck, Star, Sparkles, CheckCircle2, XCircle, 
  Edit3, Plus, Settings, RefreshCw, Users, AlertCircle, Save, Lock, LogOut, Trash2, Copy, Info
} from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminDashboard() {
  // ─── Authentication Gate ────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginSecret, setLoginSecret] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const getToken = () => typeof window !== 'undefined' ? sessionStorage.getItem('admin_token') || '' : '';

  // Check session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('admin_token');
    if (stored) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      // Validate the secret against the API
      const res = await fetch('/api/admin', {
        headers: { 'x-admin-token': loginSecret }
      });
      const json = await res.json();
      if (json.success) {
        sessionStorage.setItem('admin_token', loginSecret);
        setIsAuthenticated(true);
        setData(json);
        setLoading(false);
      } else {
        setLoginError('Invalid admin secret. Access denied.');
      }
    } catch (err) {
      setLoginError('Connection failure. Check backend service.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setLoginSecret('');
    setData({ orders: [], reviews: [], products: [], categories: [], artisans: [], loyaltyWallets: [], experiments: [] });
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>({
    orders: [],
    reviews: [],
    products: [],
    categories: [],
    artisans: [],
    loyaltyWallets: [],
    experiments: []
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'catalog' | 'reviews' | 'artisans' | 'loyalty' | 'experiments'>('overview');
  
  // Modals / Editing States
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [adjustingWallet, setAdjustingWallet] = useState<any>(null);
  const [pointsChange, setPointsChange] = useState('50');
  const [pointsReason, setPointsReason] = useState('ADMIN_ADJUSTMENT');
  const [moderatingReview, setModeratingReview] = useState<any>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');

  // Fetch all admin data
  const fetchData = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin', {
        headers: { 'x-admin-token': token }
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else if (res.status === 401) {
        handleLogout();
        return;
      } else {
        setError(json.error || 'Failed to load system data');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure. Check backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // ─── Mutate Data Helpers ────────────────────────────────
  const handleOrderStatusUpdate = async (
    orderId: string,
    status: string,
    paymentStatus: string,
    artisanId?: string,
    trackingNumber?: string,
    carrier?: string
  ) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': getToken() },
        body: JSON.stringify({
          action: 'updateOrderStatus',
          orderId,
          status,
          paymentStatus,
          artisanId,
          trackingNumber,
          carrier
        })
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      } else {
        alert(json.error || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network update failure');
    }
  };

  const handleReviewModerationSubmit = async (state: 'APPROVED' | 'REJECTED') => {
    if (!moderatingReview) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': getToken() },
        body: JSON.stringify({ 
          action: 'moderateReview', 
          reviewId: moderatingReview.id, 
          moderationState: state,
          moderatorNotes 
        })
      });
      const json = await res.json();
      if (json.success) {
        setData((prev: any) => ({
          ...prev,
          reviews: prev.reviews.map((r: any) => r.id === moderatingReview.id ? { ...r, moderationState: state, moderatorNotes } : r)
        }));
        setModeratingReview(null);
        setModeratorNotes('');
      } else {
        alert(json.error || 'Moderation update failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network moderation failure');
    }
  };

  // Gallery URL management helpers
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const handleProductUpsert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': getToken() },
        body: JSON.stringify({ action: 'upsertProduct', ...editingProduct })
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
        setEditingProduct(null);
        setIsAddingProduct(false);
        setNewGalleryUrl('');
      } else {
        alert(json.error || 'Product save failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network catalog save failure');
    }
  };

  const handlePointsAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingWallet) return;
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': getToken() },
        body: JSON.stringify({ 
          action: 'adjustPoints', 
          walletId: adjustingWallet.id, 
          pointsChange, 
          reason: pointsReason 
        })
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
        setAdjustingWallet(null);
        setPointsChange('50');
        setPointsReason('ADMIN_ADJUSTMENT');
      } else {
        alert(json.error || 'Wallet adjustment failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network wallet adjustment failure');
    }
  };

  const handleExperimentToggle = async (experimentId: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': getToken() },
        body: JSON.stringify({ action: 'toggleExperiment', experimentId, isActive: !currentActive })
      });
      const json = await res.json();
      if (json.success) {
        setData((prev: any) => ({
          ...prev,
          experiments: prev.experiments.map((e: any) => e.id === experimentId ? { ...e, isActive: !currentActive } : e)
        }));
      } else {
        alert(json.error || 'Experiment toggle failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network experiment action failure');
    }
  };

  // Financial aggregation logic
  const financialStats = useMemo(() => {
    let totalRevenue = 0;
    let pendingOrders = 0;
    let completedOrders = 0;

    data.orders.forEach((o: any) => {
      if (o.paymentStatus === 'PAID' && o.status !== 'CANCELLED') {
        totalRevenue += o.total;
        completedOrders++;
      } else if (o.status === 'PENDING') {
        pendingOrders++;
      }
    });

    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
    return { totalRevenue, pendingOrders, completedOrders, averageOrderValue };
  }, [data.orders]);

  // ─── Login Gate Screen ────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-space-950 text-foreground relative overflow-hidden">
        <StellarSky />
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 relative z-10">
          <div className="w-full max-w-md">
            <div className="bg-space-900/60 backdrop-blur-md border border-space-800 rounded-craft p-8 shadow-tactile space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-gold-400/10 rounded-full flex items-center justify-center border border-gold-400/25">
                  <Lock className="h-8 w-8 text-gold-400 animate-pulse" />
                </div>
                <h1 className="font-serif text-2xl font-bold text-foreground tracking-wide">Owner Control Access</h1>
                <p className="text-xs text-foreground/60">Enter the cryptographic admin secret to access the celestial command station.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gold-400 mb-2">Admin Secret</label>
                  <input
                    type="password"
                    value={loginSecret}
                    onChange={(e) => setLoginSecret(e.target.value)}
                    placeholder="Enter owner secret..."
                    required
                    autoFocus
                    className="w-full bg-space-950/80 border border-space-700 focus:border-gold-400 text-foreground px-4 py-3 text-sm rounded-craft focus:outline-none placeholder:text-foreground/30 transition-colors"
                  />
                </div>

                {loginError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-craft flex items-center gap-2 text-red-400 text-xs font-semibold">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading || !loginSecret}
                  className="w-full bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 py-3 rounded-craft font-bold text-xs uppercase tracking-wider hover:from-gold-400 hover:to-gold-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-tactile cursor-pointer"
                >
                  {loginLoading ? (
                    <div className="h-4 w-4 border-2 border-space-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  {loginLoading ? 'Authenticating...' : 'Unlock Systems'}
                </button>
              </form>

              <p className="text-[9px] text-center text-foreground/45">
                Protected by server-side verification. Edit the <code>ADMIN_SECRET</code> key in your local workspace <code>.env</code> settings to reset credentials.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-space-950 text-foreground relative overflow-hidden">
      <StellarSky />
      <Header />

      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-space-800 pb-6 mb-8 gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-gold-400" /> Command Management Center
            </h1>
            <p className="text-xs text-foreground/60 mt-1">Supervise and control Chochete storefront operations, catalog designs, and financials.</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/admin/products"
              className="flex items-center justify-center gap-2 border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 px-4 py-2 rounded-craft text-xs font-semibold transition-colors"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Product Studio
            </a>
            <button 
              onClick={fetchData} 
              disabled={loading} 
              className="flex items-center justify-center gap-2 border border-space-700 bg-space-900/60 hover:bg-space-850 px-4 py-2 rounded-craft text-xs font-semibold text-foreground/80 hover:text-foreground transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-gold-400 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-craft text-xs font-semibold transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout System
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-craft flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab System Selector */}
        <div className="flex flex-wrap gap-2 border-b border-space-800 pb-4 mb-8">
          {[
            { id: 'overview', label: '📊 Financial Stats', icon: TrendingUp },
            { id: 'orders', label: '📦 Orders Ledger', icon: ShoppingBag },
            { id: 'catalog', label: '💎 Product Catalog', icon: Sparkles },
            { id: 'reviews', label: '⭐ Review Mod', icon: Star },
            { id: 'artisans', label: '👩‍🎨 Artisan Hub', icon: Users },
            { id: 'loyalty', label: '🎁 Loyalty Wallets', icon: Plus },
            { id: 'experiments', label: '🧪 A/B Testing', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setError('');
                }}
                className={`flex items-center gap-2 px-4.5 py-2.5 rounded-craft text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 border-gold-400 shadow-md scale-102'
                    : 'bg-space-900/60 text-foreground/70 border-space-800 hover:border-gold-400/50 hover:text-gold-400'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-serif italic text-gold-400/70">Connecting to Chochete Core databases...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-scale-in">

            {/* 📊 FINANCIAL OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Matrix Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-space-900/40 backdrop-blur-md border border-space-800 rounded-craft p-6 shadow-tactile hover:border-gold-500/20 transition-colors">
                    <h3 className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Gross Revenue</h3>
                    <p className="font-serif text-3xl font-bold text-gold-400 mt-2">{formatPrice(financialStats.totalRevenue, 'INR', 'en')}</p>
                    <span className="text-[9px] text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full mt-2.5 inline-block">100% Secure Receipts</span>
                  </div>
                  <div className="bg-space-900/40 backdrop-blur-md border border-space-800 rounded-craft p-6 shadow-tactile hover:border-gold-500/20 transition-colors">
                    <h3 className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Paid Fulfillments</h3>
                    <p className="font-serif text-3xl font-bold text-gold-400 mt-2">{financialStats.completedOrders} Orders</p>
                    <span className="text-[9px] text-foreground/60 mt-2.5 inline-block">Completed checkout flows</span>
                  </div>
                  <div className="bg-space-900/40 backdrop-blur-md border border-space-800 rounded-craft p-6 shadow-tactile hover:border-gold-500/20 transition-colors">
                    <h3 className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Average Ticket (AOV)</h3>
                    <p className="font-serif text-3xl font-bold text-gold-400 mt-2">{formatPrice(financialStats.averageOrderValue, 'INR', 'en')}</p>
                    <span className="text-[9px] text-foreground/60 mt-2.5 inline-block">Average cart spending metric</span>
                  </div>
                  <div className="bg-space-900/40 backdrop-blur-md border border-space-800 rounded-craft p-6 shadow-tactile hover:border-gold-500/20 transition-colors">
                    <h3 className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">Pending Orders</h3>
                    <p className="font-serif text-3xl font-bold text-red-400 mt-2">{financialStats.pendingOrders} Open</p>
                    <span className="text-[9px] text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full mt-2.5 inline-block">Needs crafting/shipment</span>
                  </div>
                </div>

                {/* Main Financial Report & Chart Mock */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-space-900/40 backdrop-blur-md border border-space-800 rounded-craft p-6 shadow-tactile space-y-4">
                    <h3 className="font-serif text-lg font-bold text-foreground">Artisan Revenue Sharing</h3>
                    <p className="text-xs text-foreground/75 leading-relaxed">
                      Chochete supports generational loom weavers. Below is the active splitting configuration breakdown.
                    </p>
                    <div className="space-y-3 pt-2">
                      <div className="bg-space-950/80 border border-space-800 p-4 rounded-craft flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-foreground">Generational Weaver Payouts (Direct)</p>
                          <p className="text-[10px] text-foreground/50 mt-0.5">Automated on order shipment</p>
                        </div>
                        <span className="text-base font-bold text-gold-400 font-mono">60.0% split</span>
                      </div>
                      <div className="bg-space-950/80 border border-space-800 p-4 rounded-craft flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-foreground">Digital Creator Solstice Curator split</p>
                          <p className="text-[10px] text-foreground/50 mt-0.5">For promotional campaigns</p>
                        </div>
                        <span className="text-base font-bold text-gold-400 font-mono">15.0% split</span>
                      </div>
                      <div className="bg-space-950/80 border border-space-800 p-4 rounded-craft flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-foreground">Chochete Platform Operations & Logistics</p>
                          <p className="text-[10px] text-foreground/50 mt-0.5">Server maintenance and raw yarn materials</p>
                        </div>
                        <span className="text-base font-bold text-gold-400 font-mono">25.0% split</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-space-900/40 backdrop-blur-md border border-space-800 rounded-craft p-6 shadow-tactile space-y-4">
                    <h3 className="font-serif text-lg font-bold text-foreground">System Audit Logs</h3>
                    <p className="text-xs text-foreground/70">Secure logs mapping dashboard operations.</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {data.orders.slice(0, 5).map((o: any) => (
                        <div key={o.id} className="text-[10px] p-2.5 bg-space-950/80 border border-space-850 rounded text-foreground/75 leading-normal">
                          <span className="font-bold text-gold-400">[ORDER]</span> Completed check for ₹{o.total} by {o.user?.profile?.firstName || 'Guest'} ({new Date(o.createdAt).toLocaleDateString()})
                        </div>
                      ))}
                      <div className="text-[10px] p-2.5 bg-space-950/80 border border-space-850 rounded text-foreground/75 leading-normal">
                        <span className="font-bold text-purple-400">[AUTHENTIC]</span> Dashboard session validated successfully.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 📦 ORDERS CONTROL TAB */}
            {activeTab === 'orders' && (
              <div className="bg-space-900/40 backdrop-blur-md border border-space-800 rounded-craft p-6 shadow-tactile space-y-6">
                <h3 className="font-serif text-xl font-bold text-foreground">Global Operations Orders Ledger</h3>
                
                <div className="overflow-x-auto border border-space-800 rounded-craft">
                  <table className="min-w-full text-xs divide-y divide-space-800">
                    <thead>
                      <tr className="bg-space-950/90 text-left text-[10px] font-bold uppercase tracking-wider text-gold-400">
                        <th className="py-4 px-4">Order ID / Customer</th>
                        <th className="py-4 px-4">Configured Items</th>
                        <th className="py-4 px-4">Total Amount</th>
                        <th className="py-4 px-4">Fulfillment Status</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-space-850 bg-space-900/10">
                      {data.orders.map((order: any) => (
                        <tr key={order.id} className="hover:bg-space-950/50 transition-colors">
                          <td className="py-4 px-4 space-y-1">
                            <div className="font-mono font-bold text-foreground">{order.id.slice(0, 8).toUpperCase()}</div>
                            <div className="text-foreground/70">{order.user?.profile?.firstName || 'Guest'} ({order.user?.email || 'No email'})</div>
                            <div className="text-[9px] text-foreground/40">{new Date(order.createdAt).toLocaleString()}</div>
                          </td>
                          <td className="py-4 px-4 max-w-xs space-y-1">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="text-foreground/80 font-medium">
                                • {item.product?.title} (x{item.quantity})
                                <div className="text-[9px] text-gold-400/80 pl-2">
                                  Zodiac: {item.customization?.zodiac || 'None'} | Thread: {item.customization?.threadColor || 'None'}
                                </div>
                              </div>
                            ))}
                          </td>
                          <td className="py-4 px-4 font-bold text-gold-400 font-mono">
                            {formatPrice(order.total, 'INR', 'en')}
                            <div className="mt-1">
                              <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${order.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 space-y-2">
                            <div>
                              <label className="block text-[9px] font-semibold text-foreground/40 uppercase mb-0.5">Status</label>
                              <select
                                value={order.status}
                                onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value, order.paymentStatus, order.fulfillmentOrders?.[0]?.artisanId)}
                                className="w-full bg-space-950 border border-space-700 text-foreground text-[10px] rounded px-2 py-1.5 focus:outline-none focus:border-gold-400"
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="HANDCRAFTING">HANDCRAFTING</option>
                                <option value="SHIPPED">SHIPPED</option>
                                <option value="DELIVERED">DELIVERED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-[9px] font-semibold text-foreground/40 uppercase mb-0.5">Assign Artisan</label>
                              <select
                                value={order.fulfillmentOrders?.[0]?.artisanId || ''}
                                onChange={(e) => handleOrderStatusUpdate(order.id, order.status, order.paymentStatus, e.target.value)}
                                className="w-full bg-space-950 border border-space-700 text-foreground text-[10px] rounded px-2 py-1.5 focus:outline-none focus:border-gold-400"
                              >
                                <option value="">Unassigned</option>
                                {data.artisans.map((art: any) => (
                                  <option key={art.id} value={art.id}>
                                    🎨 {art.storeName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right space-y-2 min-w-[150px]">
                            <button
                              onClick={() => handleOrderStatusUpdate(order.id, order.status, order.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID', order.fulfillmentOrders?.[0]?.artisanId)}
                              className="text-[10px] uppercase font-bold text-gold-400 bg-space-950 px-2.5 py-1.5 rounded border border-space-750 hover:border-gold-400 transition-colors w-full text-center"
                            >
                              Toggle Paid
                            </button>

                            {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                              <div className="text-left space-y-1 bg-space-950/60 p-2 rounded border border-space-850">
                                <span className="text-[9px] font-bold text-gold-400 block">🚚 Ship Tracking</span>
                                <input
                                  type="text"
                                  placeholder="Carrier (e.g. DHL)"
                                  defaultValue={order.fulfillmentOrders?.[0]?.carrier || ''}
                                  onBlur={(e) => {
                                    const val = e.target.value;
                                    if (val !== (order.fulfillmentOrders?.[0]?.carrier || '')) {
                                      handleOrderStatusUpdate(order.id, order.status, order.paymentStatus, order.fulfillmentOrders?.[0]?.artisanId, order.fulfillmentOrders?.[0]?.trackingNumber, val);
                                    }
                                  }}
                                  className="w-full bg-space-950 border border-space-700 text-[9px] text-foreground px-1.5 py-0.5 rounded focus:outline-none focus:border-gold-400"
                                />
                                <input
                                  type="text"
                                  placeholder="Tracking #"
                                  defaultValue={order.fulfillmentOrders?.[0]?.trackingNumber || ''}
                                  onBlur={(e) => {
                                    const val = e.target.value;
                                    if (val !== (order.fulfillmentOrders?.[0]?.trackingNumber || '')) {
                                      handleOrderStatusUpdate(order.id, order.status, order.paymentStatus, order.fulfillmentOrders?.[0]?.artisanId, val, order.fulfillmentOrders?.[0]?.carrier);
                                    }
                                  }}
                                  className="w-full bg-space-950 border border-space-700 text-[9px] text-foreground px-1.5 py-0.5 rounded focus:outline-none focus:border-gold-400"
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 💎 PRODUCT CATALOG MANAGER TAB */}
            {activeTab === 'catalog' && (
              <div className="space-y-8">
                {/* Catalog Header Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-space-900/40 border border-space-800 rounded-craft p-6 backdrop-blur">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-foreground">Celestial Catalog Manager</h3>
                    <p className="text-xs text-foreground/50 mt-1">{data.products.length} products across {data.categories.length} categories</p>
                  </div>
                  {!isAddingProduct && !editingProduct && (
                    <button 
                      onClick={() => {
                        setEditingProduct({
                          title: '',
                          price: '',
                          description: '',
                          categoryId: data.categories[0]?.id || '',
                          imageUrl: '',
                          galleryUrls: [],
                          isFeatured: false,
                          isFestiveDrop: false,
                          isActive: true
                        });
                        setIsAddingProduct(true);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 px-5 py-2.5 rounded-craft text-xs font-bold uppercase tracking-wider hover:from-gold-400 hover:to-gold-300 transition-all shadow cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Product
                    </button>
                  )}
                </div>

                {/* ────── Dedicated Double Column Product Editor ────── */}
                {(isAddingProduct || editingProduct) && (
                  <form onSubmit={handleProductUpsert} className="bg-space-900/60 border border-gold-400/30 rounded-craft p-6 sm:p-8 shadow-tactile backdrop-blur space-y-6 animate-scale-in">
                    <div className="flex items-center justify-between border-b border-space-800 pb-4">
                      <h4 className="font-serif text-lg font-bold text-gold-400 flex items-center gap-2">
                        {isAddingProduct && !editingProduct?.id ? (
                          <><Plus className="h-5 w-5 text-gold-400" /> Create New Cosmic Piece</>
                        ) : (
                          <><Edit3 className="h-5 w-5 text-gold-400" /> Editing Product Configuration</>
                        )}
                      </h4>
                      <button 
                        type="button" 
                        onClick={() => { setEditingProduct(null); setIsAddingProduct(false); setNewGalleryUrl(''); }}
                        className="text-foreground/50 hover:text-gold-400 transition-colors"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* LEFT COLUMN: Data Configurations */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5 border-b border-space-800 pb-2">
                            <Info className="h-4 w-4" /> Basic Details
                          </h5>
                          
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1.5">Product Title *</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. Aura Alignment Thread Bracelet"
                              value={editingProduct?.title || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                              className="w-full bg-space-950 border border-space-700 rounded-craft px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold-400 text-foreground transition-colors"
                            />
                            {editingProduct?.title && (
                              <div className="flex justify-between items-center mt-1.5 px-1">
                                <span className="text-[9px] text-foreground/40 font-mono">
                                  Slug: {editingProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                                </span>
                                <span className="text-[9px] text-gold-400 font-bold bg-space-950 px-2 py-0.5 rounded border border-gold-500/20">
                                  Resonates: {getCelestialBody(editingProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).name}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1.5">Base Price (₹) *</label>
                              <input 
                                type="number" 
                                required 
                                min="0"
                                placeholder="699"
                                value={editingProduct?.price || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                className="w-full bg-space-950 border border-space-700 rounded-craft px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold-400 text-foreground transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1.5">Store Category *</label>
                              <select 
                                value={editingProduct?.categoryId || ''}
                                onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                                className="w-full bg-space-950 border border-space-700 rounded-craft px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold-400 text-foreground transition-colors"
                              >
                                <option value="" disabled>Select category...</option>
                                {data.categories.map((cat: any) => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5 border-b border-space-800 pb-2">
                            ✨ Catalog Badges & Status
                          </h5>
                          <div className="grid grid-cols-3 gap-3">
                            <label className="flex items-center justify-center gap-2 cursor-pointer bg-space-950 border border-space-800 rounded-craft p-3 select-none hover:border-gold-400/30 transition-colors">
                              <input 
                                type="checkbox"
                                checked={editingProduct?.isActive ?? true}
                                onChange={(e) => setEditingProduct({ ...editingProduct, isActive: e.target.checked })}
                                className="accent-gold-400 h-4 w-4"
                              />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">Active</span>
                            </label>
                            <label className="flex items-center justify-center gap-2 cursor-pointer bg-space-950 border border-space-800 rounded-craft p-3 select-none hover:border-gold-400/30 transition-colors">
                              <input 
                                type="checkbox"
                                checked={editingProduct?.isFeatured ?? false}
                                onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                                className="accent-gold-400 h-4 w-4"
                              />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">⭐ Feature</span>
                            </label>
                            <label className="flex items-center justify-center gap-2 cursor-pointer bg-space-950 border border-space-800 rounded-craft p-3 select-none hover:border-gold-400/30 transition-colors">
                              <input 
                                type="checkbox"
                                checked={editingProduct?.isFestiveDrop ?? false}
                                onChange={(e) => setEditingProduct({ ...editingProduct, isFestiveDrop: e.target.checked })}
                                className="accent-gold-400 h-4 w-4"
                              />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">🎉 Festive</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/50">Description & Craftsmanship Story *</label>
                          <textarea 
                            rows={5}
                            required 
                            placeholder="Describe the product intentions, organic threads structure, and raw crystals utilized..."
                            value={editingProduct?.description || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            className="w-full bg-space-950 border border-space-700 rounded-craft px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold-400 text-foreground transition-colors"
                          />
                        </div>
                      </div>

                      {/* RIGHT COLUMN: Visual Assets & Live Preview */}
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5 border-b border-space-800 pb-2">
                            🖼️ Media & Gallery Assets
                          </h5>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1.5">Primary Image URL *</label>
                            <input 
                              type="text" 
                              placeholder="/images/products/my-accessory.jpg"
                              value={editingProduct?.imageUrl || ''}
                              onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                              className="w-full bg-space-950 border border-space-700 rounded-craft px-3.5 py-2.5 text-sm focus:outline-none focus:border-gold-400 text-foreground transition-colors"
                            />
                            <p className="text-[9px] text-foreground/40 mt-1.5">Ensure files are in the <code>public/images/products/</code> folder.</p>
                          </div>

                          <div className="mt-4 p-4 border border-space-800 rounded-craft bg-space-950/40">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gold-400 mb-2">Drag & Drop Image Studio</label>
                            <ImageUploader 
                              token={getToken()} 
                              maxFiles={5} 
                              onUploadComplete={(files) => {
                                if (files.length > 0) {
                                  setEditingProduct((prev: any) => {
                                    if (!prev) return prev;
                                    const updated = { ...prev };
                                    if (!updated.imageUrl) {
                                      updated.imageUrl = files[0].url;
                                      if (files.length > 1) {
                                        updated.galleryUrls = [...(updated.galleryUrls || []), ...files.slice(1).map(f => f.url)];
                                      }
                                    } else {
                                      updated.galleryUrls = [...(updated.galleryUrls || []), ...files.map(f => f.url)];
                                    }
                                    return updated;
                                  });
                                }
                              }} 
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/50 mb-1.5">Add Gallery Image</label>
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                placeholder="/images/products/gallery-zoom.jpg"
                                value={newGalleryUrl}
                                onChange={(e) => setNewGalleryUrl(e.target.value)}
                                className="flex-grow bg-space-950 border border-space-700 rounded-craft px-3.5 py-2 text-xs focus:outline-none focus:border-gold-400 text-foreground"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (newGalleryUrl.trim()) {
                                    setEditingProduct({
                                      ...editingProduct,
                                      galleryUrls: [...(editingProduct?.galleryUrls || []), newGalleryUrl.trim()]
                                    });
                                    setNewGalleryUrl('');
                                  }
                                }}
                                className="bg-space-950 text-gold-400 border border-gold-500/30 hover:border-gold-400 px-4 py-2 rounded-craft text-xs font-bold transition-all"
                              >
                                Add
                              </button>
                            </div>
                            
                            {(editingProduct?.galleryUrls || []).length > 0 && (
                              <div className="flex flex-wrap gap-2.5 mt-3 bg-space-950/50 p-2.5 border border-space-850 rounded-craft">
                                {(editingProduct?.galleryUrls || []).map((url: string, i: number) => (
                                  <div key={i} className="relative group">
                                    <img 
                                      src={url} 
                                      alt={`Gallery preview ${i}`} 
                                      className="w-14 h-14 object-cover rounded border border-space-800"
                                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/default.jpg'; }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...(editingProduct?.galleryUrls || [])];
                                        updated.splice(i, 1);
                                        setEditingProduct({ ...editingProduct, galleryUrls: updated });
                                      }}
                                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full h-4.5 w-4.5 flex items-center justify-center text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* LIVE PREVIEW CARD MATCHING STOREFRONT */}
                        <div className="space-y-3">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5 border-b border-space-800 pb-2">
                            🔍 Live Storefront Preview
                          </h5>
                          <div className="flex justify-center">
                            <div className="w-full max-w-xs bg-space-950/80 border border-space-800 rounded-craft overflow-hidden shadow-tactile">
                              <div className="relative aspect-square w-full bg-space-900 flex items-center justify-center text-xs text-foreground/30">
                                {editingProduct?.imageUrl ? (
                                  <img 
                                    src={editingProduct.imageUrl} 
                                    alt="Live Preview" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/default.jpg'; }}
                                  />
                                ) : (
                                  <span>Primary image will appear here</span>
                                )}
                                <div className="absolute top-2 left-2 bg-space-950/90 text-gold-400 text-[8px] font-bold px-2 py-0.5 rounded-full border border-gold-400/20 uppercase">
                                  Preview Mode
                                </div>
                              </div>
                              <div className="p-4 space-y-2">
                                <div className="flex justify-between items-center text-[9px] font-bold text-gold-400 uppercase">
                                  <span>Accessory Preview</span>
                                  <span>★ 5.0 (0)</span>
                                </div>
                                <h6 className="font-serif font-bold text-sm text-foreground leading-tight truncate">
                                  {editingProduct?.title || 'Celestial Creation'}
                                </h6>
                                <p className="text-[10px] text-foreground/60 line-clamp-1 leading-normal">
                                  {editingProduct?.description || 'Draft product description text details...'}
                                </p>
                                <div className="text-[9px] text-gold-400 font-bold bg-space-900 px-2 py-0.5 rounded border border-gold-500/25 w-fit">
                                  Resonates: {getCelestialBody(editingProduct?.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '').name}
                                </div>
                                <div className="flex items-center justify-between pt-2.5 border-t border-space-850">
                                  <span className="text-sm font-bold text-gold-400 font-serif">
                                    ₹{(editingProduct?.price || 0).toLocaleString('en-IN')}
                                  </span>
                                  <span className="bg-gold-500 text-space-950 text-[9px] font-bold px-3 py-1 rounded-craft">
                                    Configure
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 justify-end border-t border-space-850 pt-4">
                      <button 
                        type="button" 
                        onClick={() => { setEditingProduct(null); setIsAddingProduct(false); setNewGalleryUrl(''); }}
                        className="border border-space-700 bg-space-950 text-foreground px-5 py-2.5 rounded-craft text-xs font-bold uppercase tracking-wider hover:border-foreground/30 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 hover:from-gold-400 hover:to-gold-300 px-6 py-2.5 rounded-craft text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow shadow-gold-500/10 cursor-pointer"
                      >
                        <Save className="h-4 w-4" />
                        {editingProduct?.id ? 'Save Configuration' : 'Release Product'}
                      </button>
                    </div>
                  </form>
                )}

                {/* ────── Clean & Beautiful Product Manager Grid ────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.products.map((prod: any) => {
                    const resonantBody = getCelestialBody(prod.slug);
                    return (
                      <div 
                        key={prod.id} 
                        className={`bg-space-900/40 border backdrop-blur-md rounded-craft overflow-hidden shadow-tactile transition-all duration-300 hover:border-gold-500/30 flex flex-col justify-between ${
                          !prod.isActive ? 'opacity-50 border-red-500/20' : 'border-space-800'
                        }`}
                      >
                        <div>
                          {/* Image Box */}
                          <div className="relative h-44 bg-space-950/80 border-b border-space-850">
                            <img 
                              src={prod.imageUrl} 
                              alt={prod.title} 
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/images/products/default.jpg'; }}
                            />
                            {/* Badges overlay */}
                            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                              {prod.isFeatured && (
                                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[8px] font-bold px-2 py-0.5 rounded shadow-sm">⭐ Featured</span>
                              )}
                              {prod.isFestiveDrop && (
                                <span className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[8px] font-bold px-2 py-0.5 rounded shadow-sm">🎉 Festive</span>
                              )}
                              {!prod.isActive && (
                                <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[8px] font-bold px-2 py-0.5 rounded shadow-sm">Hidden</span>
                              )}
                            </div>
                            <div className="absolute bottom-3 right-3 bg-space-950/90 text-gold-400 text-xs font-bold px-2.5 py-1 rounded border border-gold-500/25 font-mono">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </div>
                          </div>

                          {/* Card Content Body */}
                          <div className="p-5 space-y-3">
                            <div>
                              <div className="flex justify-between items-center text-[9px] font-bold text-gold-400/80 uppercase">
                                <span>{prod.category?.name || 'Accessories'}</span>
                                <span className="font-mono text-foreground/30">ID: {prod.id.slice(0, 8).toUpperCase()}</span>
                              </div>
                              <h4 className="font-serif font-bold text-base text-foreground mt-1 line-clamp-1 leading-snug">{prod.title}</h4>
                            </div>

                            <p className="text-xs text-foreground/60 line-clamp-2 leading-relaxed">{prod.description}</p>

                            {/* Celestial Resonance Badge */}
                            <div className="text-[10px] text-gold-400 font-bold flex items-center gap-1 bg-space-950/80 px-2 py-1 rounded border border-gold-500/20 w-fit">
                              <span>{resonantBody.icon}</span>
                              <span>Resonates: {resonantBody.name}</span>
                            </div>

                            {/* Quick Metadata */}
                            <div className="flex items-center gap-3 text-[10px] text-foreground/45 border-t border-space-850 pt-2.5">
                              <span className="flex items-center gap-0.5">★ {prod.rating?.toFixed(1) || '0.0'}</span>
                              <span>• {prod.reviewCount || 0} reviews</span>
                              <span>• {(prod.galleryUrls || []).length} gallery media</span>
                            </div>
                          </div>
                        </div>

                        {/* Card CTA Actions */}
                        <div className="p-5 pt-0 flex gap-2">
                          <button
                            onClick={() => {
                              setIsAddingProduct(false);
                              setEditingProduct({ ...prod, galleryUrls: prod.galleryUrls || [] });
                              window.scrollTo({ top: 150, behavior: 'smooth' });
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold text-gold-400 bg-space-950 border border-gold-500/20 hover:border-gold-400 py-2 rounded-craft transition-colors cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => {
                              const cloned = { ...prod, galleryUrls: prod.galleryUrls || [] };
                              delete cloned.id;
                              cloned.title = prod.title + ' (Copy)';
                              setIsAddingProduct(true);
                              setEditingProduct(cloned);
                              window.scrollTo({ top: 150, behavior: 'smooth' });
                            }}
                            className="flex items-center justify-center gap-1.5 text-xs font-bold text-foreground/60 bg-space-950 border border-space-800 hover:text-foreground hover:border-space-700 px-3 py-2 rounded-craft transition-colors cursor-pointer"
                            title="Clone product details"
                          >
                            <Copy className="h-3.5 w-3.5" /> Clone
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ⭐ REVIEW MODERATION TAB */}
            {activeTab === 'reviews' && (
              <div className="bg-space-900/40 backdrop-blur-md border border-space-800 rounded-craft p-6 shadow-tactile space-y-6">
                <h3 className="font-serif text-xl font-bold text-foreground">Review Moderation Center</h3>

                {moderatingReview && (
                  <div className="p-4 bg-gold-400/5 border border-gold-400/30 rounded-craft space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gold-400">Moderate Customer Review</h4>
                    <p className="text-sm text-foreground/80 italic">"{moderatingReview.body}"</p>
                    <textarea 
                      placeholder="Add moderator note (optional)..."
                      rows={2}
                      value={moderatorNotes}
                      onChange={(e) => setModeratorNotes(e.target.value)}
                      className="w-full bg-space-950 border border-space-850 rounded-craft p-2 text-xs focus:outline-none focus:border-gold-400 text-foreground"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleReviewModerationSubmit('APPROVED')}
                        className="bg-green-600 hover:bg-green-700 text-space-950 px-3 py-1.5 rounded-craft text-xs font-bold transition-colors cursor-pointer"
                      >
                        Approve Review
                      </button>
                      <button 
                        onClick={() => handleReviewModerationSubmit('REJECTED')}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-craft text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reject & Hide
                      </button>
                      <button 
                        type="button"
                        onClick={() => setModeratingReview(null)}
                        className="border border-space-700 bg-space-950 text-foreground px-3 py-1.5 rounded-craft text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {data.reviews.map((rev: any) => (
                    <div key={rev.id} className="p-4 bg-space-950/60 border border-space-850 rounded-craft flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{rev.user?.profile?.firstName || 'Anonymous'}</span>
                          <span className="text-[10px] text-foreground/50">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex text-gold-400 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs font-bold text-foreground mt-1">Product: <span className="font-normal text-foreground/80">{rev.product?.title}</span></p>
                        <p className="text-xs italic text-foreground/80 mt-1">"{rev.body}"</p>
                        {rev.moderatorNotes && (
                          <p className="text-[10px] text-gold-400 bg-gold-400/5 border border-gold-500/10 p-1.5 rounded inline-block mt-2">Mod: {rev.moderatorNotes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rev.moderationState === 'APPROVED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          rev.moderationState === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {rev.moderationState}
                        </span>
                        {rev.moderationState === 'PENDING' && (
                          <button
                            onClick={() => setModeratingReview(rev)}
                            className="bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 px-3 py-1 rounded-craft text-xs font-bold cursor-pointer"
                          >
                            Moderate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 👩‍🎨 ARTISAN HUB TAB */}
            {activeTab === 'artisans' && (
              <div className="bg-space-900/40 backdrop-blur-md border border-space-800 rounded-craft p-6 shadow-tactile space-y-6">
                <h3 className="font-serif text-xl font-bold text-foreground">Generational Handloom Artisan Directory</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.artisans.map((art: any) => (
                    <div key={art.id} className="p-5 bg-space-950/60 border border-space-850 rounded-craft flex gap-4">
                      <img 
                        src={art.avatarUrl || '/images/artisans/default.jpg'} 
                        alt={art.storeName}
                        className="w-16 h-16 object-cover rounded-full border border-space-700"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'; }}
                      />
                      <div className="space-y-1 flex-grow">
                        <h4 className="font-serif font-bold text-base text-foreground">{art.storeName}</h4>
                        <p className="text-xs text-foreground/70">{art.user?.profile?.firstName} {art.user?.profile?.lastName} ({art.user?.email})</p>
                        <p className="text-xs italic text-foreground/60 mt-1">{art.bio}</p>
                        
                        <div className="pt-2.5 flex justify-between items-center text-xs border-t border-space-850 mt-3.5">
                          <span className="font-bold text-foreground/70">Commission Split: <span className="text-gold-400 font-mono">{(art.commissionRate * 100).toFixed(0)}%</span></span>
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">Active Maker</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🎁 LOYALTY & WALLETS TAB */}
            {activeTab === 'loyalty' && (
              <div className="bg-space-900/40 backdrop-blur-md border border-space-800 rounded-craft p-6 shadow-tactile space-y-6">
                <h3 className="font-serif text-xl font-bold text-foreground">Loyalty Wallet Ledgers</h3>

                {adjustingWallet && (
                  <form onSubmit={handlePointsAdjustSubmit} className="p-4 bg-gold-400/5 border border-gold-400/30 rounded-craft space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gold-400">
                      Adjust Points: {adjustingWallet.user?.profile?.firstName || adjustingWallet.user?.email}
                    </h4>
                    <div className="flex flex-wrap gap-3 items-end">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-foreground/60 mb-1">Points Change</label>
                        <input 
                          type="number" 
                          value={pointsChange}
                          onChange={(e) => setPointsChange(e.target.value)}
                          className="w-32 bg-space-950 border border-space-800 rounded-craft px-2 py-1.5 text-xs text-foreground focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-foreground/60 mb-1">Reason Description</label>
                        <input 
                          type="text" 
                          value={pointsReason}
                          onChange={(e) => setPointsReason(e.target.value)}
                          placeholder="ADMIN_ADJUSTMENT"
                          className="w-48 bg-space-950 border border-space-800 rounded-craft px-2 py-1.5 text-xs text-foreground focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 px-3.5 py-1.5 rounded-craft text-xs font-bold cursor-pointer">Apply</button>
                        <button type="button" onClick={() => setAdjustingWallet(null)} className="border border-space-700 bg-space-950 text-foreground px-3.5 py-1.5 rounded-craft text-xs font-bold cursor-pointer">Cancel</button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto border border-space-800 rounded-craft">
                  <table className="min-w-full text-xs divide-y divide-space-800">
                    <thead>
                      <tr className="bg-space-950/80 text-left text-[10px] font-bold uppercase tracking-wider text-gold-400">
                        <th className="py-4 px-4">User</th>
                        <th className="py-4 px-4">Tier Status</th>
                        <th className="py-4 px-4">Active Point Balance</th>
                        <th className="py-4 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-space-850">
                      {data.loyaltyWallets.map((wallet: any) => (
                        <tr key={wallet.id} className="hover:bg-space-950/40 transition-colors">
                          <td className="py-4 px-4 font-semibold text-foreground/80">{wallet.user?.profile?.firstName || 'Anonymous'} ({wallet.user?.email})</td>
                          <td className="py-4 px-4 font-mono font-bold text-xs text-gold-400">{wallet.tier}</td>
                          <td className="py-4 px-4 font-bold text-foreground">{wallet.points} Points</td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => setAdjustingWallet(wallet)}
                              className="text-[10px] uppercase font-bold text-gold-400 bg-space-950 px-2.5 py-1.5 rounded border border-space-750 hover:border-gold-400 transition-colors"
                            >
                              Adjust Points
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 🧪 A/B TESTING & CAMPAIGNS TAB */}
            {activeTab === 'experiments' && (
              <div className="bg-space-900/40 backdrop-blur-md border border-space-800 rounded-craft p-6 shadow-tactile space-y-6">
                <h3 className="font-serif text-xl font-bold text-foreground">Marketing & Experience Experiments</h3>

                <div className="space-y-4">
                  {data.experiments.map((exp: any) => {
                    const total = exp.assignments.length;
                    const convs = exp.assignments.filter((a: any) => a.converted).length;
                    const cRate = total > 0 ? (convs / total) * 100 : 0;
                    
                    return (
                      <div key={exp.id} className="p-5 bg-space-950/60 border border-space-850 rounded-craft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <h4 className="font-mono font-bold text-sm text-gold-400">{exp.name}</h4>
                          <p className="text-xs text-foreground/60">{exp.description}</p>
                          <div className="flex gap-4 pt-2 text-[11px] text-foreground/50">
                            <span>Variations: <strong className="font-mono text-gold-400">{JSON.stringify(exp.variations)}</strong></span>
                            <span>Sample Size: <strong>{total} devices</strong></span>
                            <span>Conv Rate: <strong className="text-emerald-400">{cRate.toFixed(1)}%</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            exp.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-space-950 text-foreground/40 border border-space-800'
                          }`}>
                            {exp.isActive ? 'RUNNING' : 'PAUSED'}
                          </span>
                          <button
                            onClick={() => handleExperimentToggle(exp.id, exp.isActive)}
                            className={`px-3 py-1.5 rounded-craft text-[10px] font-bold uppercase tracking-wider transition-all border ${
                              exp.isActive 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                                : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                            } cursor-pointer`}
                          >
                            {exp.isActive ? 'Pause Exp' : 'Launch Exp'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
