'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { useStore, formatPrice } from '@/store/useStore';
import { Sparkles, Package, Heart, RefreshCw, Star, Trash2, Shield, Calendar, Pause, Play, CheckCircle2 } from 'lucide-react';

function AccountContent() {
  const searchParams = useSearchParams();
  const { currency, language, savedDesigns, deleteDesign, loyaltyPoints } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'drafts' | 'wallet' | 'subscriptions'>('orders');
  
  // Order Tracking States
  const [trackOrderId, setTrackOrderId] = useState(searchParams.get('track') || '');
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  // Subscription States
  const [subStatus, setSubStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');
  const [subMessage, setSubMessage] = useState('');

  // Mocked general order history for initial state
  const mockOrderHistory = [
    {
      id: 'celestial_order_seed_01',
      total: 1097,
      status: 'SHIPPED',
      createdAt: '2026-05-18T12:00:00Z',
      items: [
        { product: { title: 'Aura Alignment Thread Bracelet' }, quantity: 1, price: 599 }
      ]
    }
  ];

  const fetchTrackedOrder = async (orderId: string) => {
    if (!orderId) return;
    setTrackingLoading(true);
    setTrackingError('');
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();
      if (data.success && data.order) {
        setTrackingOrder(data.order);
      } else {
        setTrackingError('Order not found. Check ID and try again.');
        setTrackingOrder(null);
      }
    } catch (e) {
      console.error(e);
      setTrackingError('Failed to retrieve order. Check connection.');
    } finally {
      setTrackingLoading(false);
    }
  };

  useEffect(() => {
    const trackParam = searchParams.get('track');
    if (trackParam) {
      setTrackOrderId(trackParam);
      fetchTrackedOrder(trackParam);
    }
  }, [searchParams]);

  // Subscription Skip/Pause handlers
  const handleToggleSubscription = () => {
    if (subStatus === 'ACTIVE') {
      setSubStatus('PAUSED');
      setSubMessage('Your Zodiac birth-flower subscription box has been paused.');
    } else {
      setSubStatus('ACTIVE');
      setSubMessage('Your Zodiac subscription box has been resumed!');
    }
    setTimeout(() => setSubMessage(''), 4000);
  };

  const handleSkipMonth = () => {
    setSubMessage('Next month delivery successfully skipped. Resuming July 2026.');
    setTimeout(() => setSubMessage(''), 4000);
  };

  // Order status stage tracking steps helper
  const orderSteps = [
    { key: 'PENDING', label: 'Under Preparation', desc: 'Sourcing threads & alignment layout' },
    { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Assigned to Rajasthan artisanal hub' },
    { key: 'HANDCRAFTING', label: 'Handweaving Stage', desc: 'Knotting threads & plating custom metals' },
    { key: 'SHIPPED', label: 'Dispatched', desc: 'Cosmic cargo carrier transit' },
    { key: 'DELIVERED', label: 'Arrived', desc: 'Celestial item delivered' }
  ];

  const getActiveStepIndex = (status: string) => {
    const idx = orderSteps.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-grow flex flex-col">
      <div className="flex flex-col md:flex-row gap-8 flex-1">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-card border border-clay-200 rounded-craft p-6 space-y-4 shadow-tactile">
            <div className="border-b border-clay-200 pb-4">
              <h2 className="font-serif text-lg font-bold text-foreground">Luna Celeste</h2>
              <p className="text-xs text-primary font-bold">Loyalty Points: {loyaltyPoints}</p>
            </div>
            
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left text-sm py-2 px-3 rounded-craft transition-colors flex items-center gap-2 ${
                  activeTab === 'orders' ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-clay-100 text-foreground/80'
                }`}
              >
                <Package className="h-4 w-4" />
                Track Orders
              </button>

              <button
                onClick={() => setActiveTab('drafts')}
                className={`w-full text-left text-sm py-2 px-3 rounded-craft transition-colors flex items-center gap-2 ${
                  activeTab === 'drafts' ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-clay-100 text-foreground/80'
                }`}
              >
                <Heart className="h-4 w-4" />
                Saved Drafts ({savedDesigns.length})
              </button>

              <button
                onClick={() => setActiveTab('wallet')}
                className={`w-full text-left text-sm py-2 px-3 rounded-craft transition-colors flex items-center gap-2 ${
                  activeTab === 'wallet' ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-clay-100 text-foreground/80'
                }`}
              >
                <Star className="h-4 w-4" />
                Loyalty Wallet
              </button>

              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`w-full text-left text-sm py-2 px-3 rounded-craft transition-colors flex items-center gap-2 ${
                  activeTab === 'subscriptions' ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-clay-100 text-foreground/80'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Subscriptions
              </button>
            </nav>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 bg-card border border-clay-200 rounded-craft p-6 sm:p-8 shadow-tactile min-h-[400px]">
          
          {/* TAB 1: ORDER TRACKING TIMELINE */}
          {activeTab === 'orders' && (
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground">Cosmic Order Tracking</h3>
                <p className="text-sm text-foreground/60 mt-1">Enter your celestial order ID to view active handcrafting stages.</p>
              </div>

              {/* Order ID Search bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="E.g. order_8f9da..."
                  value={trackOrderId}
                  onChange={(e) => setTrackOrderId(e.target.value)}
                  className="flex-1 border border-clay-300 rounded-craft p-2.5 text-sm focus:outline-none"
                />
                <button
                  onClick={() => fetchTrackedOrder(trackOrderId)}
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-craft text-sm font-semibold hover:bg-clay-700 transition-colors"
                >
                  Track Stage
                </button>
              </div>

              {trackingLoading && (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              )}

              {trackingError && (
                <p className="text-sm text-red-600 font-semibold">{trackingError}</p>
              )}

              {/* Stepper Timeline Visualizer */}
              {trackingOrder ? (
                <div className="space-y-8 border border-clay-200 rounded-craft p-6 bg-clay-50/40">
                  <div className="flex justify-between items-center border-b border-clay-200 pb-3">
                    <div>
                      <span className="text-xs text-foreground/50">Tracking Order</span>
                      <h4 className="font-mono text-sm font-bold text-primary">{trackingOrder.id}</h4>
                    </div>
                    <span className="bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                      {trackingOrder.status}
                    </span>
                  </div>

                  {/* Horizontal/Vertical Steps Stepper */}
                  <div className="relative pl-6 space-y-6 border-l-2 border-clay-300">
                    {orderSteps.map((stepItem, index) => {
                      const activeIndex = getActiveStepIndex(trackingOrder.status);
                      const isCompleted = index <= activeIndex;
                      const isCurrent = index === activeIndex;

                      return (
                        <div key={stepItem.key} className="relative">
                          {/* Dot indicator */}
                          <span
                            className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 transition-all flex items-center justify-center ${
                              isCompleted
                                ? 'bg-primary border-primary ring-4 ring-primary/25'
                                : 'bg-background border-clay-300'
                            }`}
                          >
                            {isCompleted && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>

                          <div className="flex flex-col">
                            <span
                              className={`text-sm font-serif font-bold ${
                                isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-foreground/40'
                              }`}
                            >
                              {stepItem.label}
                            </span>
                            <span className="text-xs text-foreground/60">{stepItem.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Show standard order list
                <div className="space-y-4">
                  <h4 className="font-serif text-base font-bold text-foreground">Past Transactions</h4>
                  {mockOrderHistory.map((ord) => (
                    <div key={ord.id} className="p-4 border border-clay-200 rounded-craft flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold">{ord.items[0].product.title}</p>
                        <p className="text-foreground/50">{new Date(ord.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatPrice(ord.total, currency, language)}</p>
                        <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">{ord.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED DESIGN DRAFTS */}
          {activeTab === 'drafts' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground">Your Saved Drafts</h3>
                <p className="text-sm text-foreground/60 mt-1">Revisit or order your personal celestial formulas.</p>
              </div>

              {savedDesigns.length === 0 ? (
                <div className="text-center py-12 bg-clay-50/50 rounded border border-dashed border-clay-300">
                  <p className="text-sm text-foreground/60 italic">No saved design drafts found. Try customizing a bracelet!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedDesigns.map((draft) => (
                    <div key={draft.id} className="p-4 border border-clay-200 rounded-craft flex justify-between items-start gap-4">
                      <div className="space-y-2">
                        <h4 className="font-serif text-sm font-bold">{draft.title}</h4>
                        <div className="text-[10px] text-foreground/60 space-y-0.5">
                          <p>Size: {draft.customization.size}</p>
                          <p>Metal Plating: {draft.customization.metalFinish}</p>
                          <p>Charm: {draft.customization.charm}</p>
                          {draft.customization.engravingText && (
                            <p>Engraved: &ldquo;{draft.customization.engravingText}&rdquo;</p>
                          )}
                        </div>
                        {/* Link carrying prefilled customization queries */}
                        <a
                          href={`/product/${draft.productId === 'celestial-constellation-drop-earrings' ? 'celestial-constellation-drop-earrings' : 'aura-alignment-thread-bracelet'}?zodiac=${draft.customization.zodiacSign || ''}&metal=${draft.customization.metalFinish}&thread=${draft.customization.threadColor || ''}&charm=${draft.customization.charm}&engraving=${draft.customization.engravingText || ''}`}
                          className="inline-block text-[10px] font-bold text-primary uppercase tracking-wider hover:underline"
                        >
                          Load Customizer
                        </a>
                      </div>
                      <button
                        onClick={() => deleteDesign(draft.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete draft"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LOYALTY WALLET AND LEDGER */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground">Celestial Loyalty Rewards</h3>
                <p className="text-sm text-foreground/60 mt-1">Earn points for purchases and reviews. Redeem them for discounts at checkout.</p>
              </div>

              {/* Wallet Card */}
              <div className="p-6 bg-gradient-to-r from-clay-800 to-clay-950 text-white rounded-craft shadow-tactile border border-clay-800 flex justify-between items-center relative overflow-hidden">
                <div className="space-y-2 z-10">
                  <span className="text-[10px] uppercase font-bold text-accent tracking-widest">Active Member Balance</span>
                  <div className="font-serif text-4xl font-bold">{loyaltyPoints} Points</div>
                  <p className="text-[10px] text-clay-400">Equivalent to ₹{loyaltyPoints} off on your next purchase</p>
                </div>
                <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center text-accent border border-white/10 z-10">
                  <Star className="h-8 w-8 fill-accent text-accent" />
                </div>
                {/* Background radial glow */}
                <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-primary/20 rounded-full blur-xl" />
              </div>

              {/* Ledger history */}
              <div className="space-y-3">
                <h4 className="font-serif text-base font-bold text-foreground">Points Ledger</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 border-b border-clay-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold">Initial Seed Reward</p>
                      <p className="text-[10px] text-foreground/50">Joined Chochete community</p>
                    </div>
                    <span className="text-green-600 font-bold">+100 PTS</span>
                  </div>
                  <div className="p-3 border-b border-clay-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold">Astrological Styling Review</p>
                      <p className="text-[10px] text-foreground/50">Feedback reward</p>
                    </div>
                    <span className="text-green-600 font-bold">+50 PTS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GIFTING SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground">Birth-Flower Subscriptions</h3>
                <p className="text-sm text-foreground/60 mt-1">Receive customized seasonal zodiac threads at milestones throughout the year.</p>
              </div>

              {subMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-xs text-green-800 flex gap-2 items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>{subMessage}</span>
                </div>
              )}

              {/* Active Subscription Details */}
              <div className="border border-clay-200 rounded-craft p-6 bg-clay-50/30 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-foreground/50">Active Tier</span>
                    <h4 className="font-serif text-lg font-bold text-foreground">Seasonal Alignment Capsule</h4>
                    <p className="text-xs text-foreground/60">1x Custom Zodiac Charm & cord every 2 months</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    subStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {subStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-clay-200/50">
                  <div>
                    <span className="text-foreground/50">Next Delivery Date</span>
                    <p className="font-bold text-foreground">June 15, 2026</p>
                  </div>
                  <div>
                    <span className="text-foreground/50">Billing Amount</span>
                    <p className="font-bold text-primary">₹799 / shipment</p>
                  </div>
                </div>

                {/* Sub Controls: Skipped & paused triggers */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-clay-200/50">
                  <button
                    onClick={handleToggleSubscription}
                    className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-craft text-xs font-semibold hover:bg-olive-600 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {subStatus === 'ACTIVE' ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        Pause Subscription
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        Resume Subscription
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSkipMonth}
                    disabled={subStatus === 'PAUSED'}
                    className="flex-1 border border-clay-300 py-2 px-4 rounded-craft text-xs font-semibold hover:bg-clay-50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Skip Shipment
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="bg-clay-100/30 border-b border-clay-200/50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Celestial Sanctuary
          </h1>
          <p className="text-sm text-foreground/75 mt-2 max-w-xl mx-auto">
            Manage your saved cosmic drafts, track live order stages, and control subscription intervals.
          </p>
        </div>
      </div>
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      }>
        <AccountContent />
      </Suspense>
      <Footer />
    </div>
  );
}
