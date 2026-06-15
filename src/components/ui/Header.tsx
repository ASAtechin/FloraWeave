'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore, formatPrice } from '@/store/useStore';
import { ShoppingBag, X, Star, Globe, Sparkles, User, Gift, ChevronRight, Check, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Header() {
  const {
    cart,
    currency,
    language,
    setCurrency,
    setLanguage,
    removeFromCart,
    updateQuantity,
    rushOrder,
    setRushOrder,
    appliedPoints,
    applyPoints,
    loyaltyPoints,
    clearCart
  } = useStore();

  const [cartOpen, setCartOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState('');

  // Cart total calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.customPrice * item.quantity, 0);
  const shippingFee = cartSubtotal >= 1000 || cartSubtotal === 0 ? 0 : 80;
  const tax = cartSubtotal * 0.03;
  const rushFee = rushOrder ? 250 : 0;
  const loyaltyDiscount = appliedPoints > 0 ? Math.min(appliedPoints, Math.floor(cartSubtotal * 0.3)) : 0;
  const finalTotal = cartSubtotal + shippingFee + tax + rushFee - loyaltyDiscount;

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d4a327', '#a97e61', '#6d8453', '#fcfaf7'],
    });
  };

  const handleCheckoutSubmit = async () => {
    setCheckingOut(true);
    try {
      // Mock order submission API call
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart.map((item) => ({
            productId: item.productId,
            title: item.title,
            quantity: item.quantity,
            customization: item.customization
          })),
          shippingAddress: {
            street: '12 Celestial Way',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'IN'
          },
          contactPhone: '+919999988888',
          contactEmail: 'buyer.luna@chochete.com',
          userId: 'buyer-luna-id', // Match seed customer
          appliedPoints,
          rushOrder,
          currency
        })
      });

      const data = await response.json();
      if (data.success) {
        setSuccessOrderId(data.orderId);
        setCheckoutSuccess(true);
        triggerConfetti();
        clearCart();
      } else {
        alert('Checkout error: ' + data.error);
      }
    } catch (e) {
      console.error(e);
      alert('Network checkout error');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-space-800/80 bg-space-950/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-3xl font-bold tracking-wide text-gold-400">
                Chochete
              </span>
              <Sparkles className="h-5 w-5 text-accent animate-pulse" />
            </Link>

            {/* Nav Menu */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground/80">
              <Link href="/shop" className="hover:text-gold-400 transition-colors">
                {language === 'hi' ? 'दुकान' : 'Shop'}
              </Link>
              <Link href="/gift-wizard" className="hover:text-gold-400 transition-colors flex items-center gap-1">
                <Gift className="h-4 w-4 text-accent" />
                {language === 'hi' ? 'उपहार विज़ार्ड' : 'Gift Finder'}
              </Link>
              <Link href="/shop?category=gift-sets" className="hover:text-gold-400 transition-colors">
                {language === 'hi' ? 'गिफ्ट बॉक्स' : 'Gift Sets'}
              </Link>
              <Link href="/#artisan-hub" className="hover:text-gold-400 transition-colors">
                {language === 'hi' ? 'कारीगर' : 'Artisans'}
              </Link>
            </nav>
          </div>

          {/* User Settings & Controls */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="p-2 rounded-full hover:bg-space-900 transition-colors text-foreground/80 flex items-center gap-1 text-xs font-semibold"
              title="Change Language"
            >
              <Globe className="h-4 w-4" />
              <span>{language === 'en' ? 'EN' : 'हि'}</span>
            </button>

            {/* Currency Select */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="bg-space-900 border border-space-700 text-foreground text-xs font-medium rounded px-2 py-1 focus:outline-none"
            >
              <option value="INR" className="bg-space-905">₹ INR</option>
              <option value="USD" className="bg-space-905">$ USD</option>
              <option value="EUR" className="bg-space-905">€ EUR</option>
            </select>

            {/* Account Dashboard Link */}
            <Link
              href="/account"
              className="p-2 rounded-full hover:bg-space-900 transition-colors text-foreground/80"
              title="Account Dashboard"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Owner Management Link */}
            <Link
              href="/admin"
              className="p-2 rounded-full hover:bg-space-900 transition-colors text-gold-400"
              title="Owner Hub"
            >
              <ShieldCheck className="h-5 w-5" />
            </Link>

            {/* Cart Icon */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-space-900 transition-colors text-foreground/80"
              title="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-bounce">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Cart Sidebar Slide-over */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-space-900 border-l border-space-800 shadow-2xl flex flex-col">
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between border-b border-space-800 pb-4">
                  <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-gold-400" />
                    {language === 'hi' ? 'आपकी टोकरी' : 'Your Basket'}
                  </h2>
                  <button onClick={() => setCartOpen(false)} className="text-foreground/60 hover:text-foreground">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {checkoutSuccess ? (
                  <div className="flex flex-col items-center justify-center text-center py-16 px-4">
                    <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                      <Check className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="font-serif text-2xl font-semibold mb-2">Order Confirmed!</h3>
                    <p className="text-sm text-foreground/70 mb-6">
                      Your celestial threads are being hand-woven. Order ID: <span className="font-mono font-bold text-gold-400">{successOrderId.slice(0, 8)}</span>
                    </p>
                    <Link
                      href={`/account?track=${successOrderId}`}
                      onClick={() => {
                        setCartOpen(false);
                        setCheckoutSuccess(false);
                      }}
                      className="bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 px-6 py-3 rounded-craft font-bold hover:from-gold-400 hover:to-gold-300 transition-all shadow-md"
                    >
                      Track Handcrafting Stages
                    </Link>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-20">
                    <div className="h-20 w-20 rounded-full bg-space-950 flex items-center justify-center mb-6 border border-space-800">
                      <ShoppingBag className="h-10 w-10 text-foreground/30" />
                    </div>
                    <p className="text-foreground/75 font-medium mb-4">Your cart is empty.</p>
                    <Link
                      href="/shop"
                      onClick={() => setCartOpen(false)}
                      className="bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 px-6 py-2.5 rounded-craft font-bold hover:from-gold-400 hover:to-gold-300 transition-all text-xs"
                    >
                      Browse Zodiac Accessories
                    </Link>
                  </div>
                ) : (
                  <div className="mt-8 space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex py-4 border-b border-space-800/80 gap-4">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-craft border border-space-800">
                          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between text-base font-medium">
                            <h4 className="font-serif text-foreground font-semibold">{item.title}</h4>
                            <p className="text-gold-400 font-medium">{formatPrice(item.customPrice * item.quantity, currency, language)}</p>
                          </div>
                          
                          {/* Customization Details Summary */}
                          <div className="mt-1 text-xs text-foreground/60 space-y-0.5">
                            {item.customization.zodiacSign && (
                              <p>Zodiac: <span className="font-semibold text-gold-400">{item.customization.zodiacSign}</span></p>
                            )}
                            {item.customization.birthFlower && (
                              <p>Flower: <span className="font-semibold text-gold-400">{item.customization.birthFlower}</span></p>
                            )}
                            <p>Material: {item.customization.metalFinish} | Size: {item.customization.size}</p>
                            {item.customization.threadColor && (
                              <p className="flex items-center gap-1">
                                Thread: 
                                <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: item.customization.threadColor }} />
                              </p>
                            )}
                            {item.customization.engravingText && (
                              <p>Engraving: &ldquo;<span className="italic font-serif">{item.customization.engravingText}</span>&rdquo;</p>
                            )}
                            <p>For: {item.customization.madeFor}</p>
                          </div>

                          {/* Quantity update & delete */}
                          <div className="flex items-center justify-between text-sm mt-4">
                            <div className="flex items-center gap-2">
                              <label htmlFor={`quantity-${item.id}`} className="sr-only">Quantity</label>
                              <select
                                id={`quantity-${item.id}`}
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                className="bg-space-950 border border-space-700 text-foreground text-xs rounded p-1"
                              >
                                {[1, 2, 3, 4, 5].map((q) => (
                                  <option key={q} value={q}>{q}</option>
                                ))}
                              </select>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-xs text-red-400 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && !checkoutSuccess && (
                <div className="border-t border-space-800 py-6 px-4 sm:px-6 space-y-4 bg-space-950/80">
                  {/* Rush Order Toggle */}
                  <div className="flex items-center justify-between border-b border-space-800 pb-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-accent animate-pulse" />
                        Rush Handcrafting Mode (+{formatPrice(250, currency, language)})
                      </span>
                      <span className="text-[10px] text-foreground/60 font-medium">Dispatched in 24 hours instead of 3 days</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={rushOrder}
                      onChange={(e) => setRushOrder(e.target.checked)}
                      className="rounded border-space-700 text-gold-500 focus:ring-gold-500 bg-space-900 h-4 w-4"
                    />
                  </div>

                  {/* Loyalty Points Redemption Panel */}
                  {loyaltyPoints > 0 && (
                    <div className="flex items-center justify-between border-b border-space-800 pb-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground">
                          Redeem Points (Balance: {loyaltyPoints})
                        </span>
                        <span className="text-[10px] text-foreground/60 font-medium">Save up to 30% on cosmic items</span>
                      </div>
                      <select
                        value={appliedPoints}
                        onChange={(e) => applyPoints(parseInt(e.target.value))}
                        className="bg-space-900 border border-space-700 text-foreground text-xs rounded p-1"
                      >
                        <option value="0">None</option>
                        {loyaltyPoints >= 50 && <option value="50">Redeem 50 (₹50 off)</option>}
                        {loyaltyPoints >= 100 && <option value="100">Redeem 100 (₹100 off)</option>}
                        {loyaltyPoints >= 150 && <option value="150">Redeem 150 (₹150 off)</option>}
                      </select>
                    </div>
                  )}

                  {/* Totals */}
                  <div className="space-y-1.5 text-sm text-foreground/80">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartSubtotal, currency, language)}</span>
                    </div>
                    {rushOrder && (
                      <div className="flex justify-between">
                        <span>Rush handcrafting fee</span>
                        <span>{formatPrice(250, currency, language)}</span>
                      </div>
                    )}
                    {appliedPoints > 0 && (
                      <div className="flex justify-between text-emerald-400 font-semibold">
                        <span>Loyalty Discount</span>
                        <span>-{formatPrice(loyaltyDiscount, currency, language)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee, currency, language)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Tax (3% GST)</span>
                      <span>{formatPrice(tax, currency, language)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-foreground border-t border-space-800 pt-2">
                      <span>Total Due</span>
                      <span className="text-gold-400">{formatPrice(finalTotal, currency, language)}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={() => setCartOpen(false)}
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 py-3 rounded-craft font-bold hover:from-gold-400 hover:to-gold-300 transition-all flex items-center justify-center gap-2 shadow-tactile text-sm"
                  >
                    Proceed to Checkout
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={clearCart}
                    className="w-full text-xs text-foreground/50 hover:text-red-400 transition-colors py-1 underline"
                  >
                    Clear Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
