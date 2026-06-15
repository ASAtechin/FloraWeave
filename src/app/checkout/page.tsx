'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { useStore, formatPrice } from '@/store/useStore';
import {
  MapPin, CreditCard, ShieldCheck, Truck, Gift, ChevronRight,
  Package, Sparkles, Check, Phone, Mail, Lock, Star
} from 'lucide-react';
import Link from 'next/link';
import StellarSky from '@/components/ui/StellarSky';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, rushOrder, appliedPoints, loyaltyPoints, currency, language, applyPoints, clearCart } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
    cardName: '',
    upiId: '',
    paymentMethod: 'upi' as 'upi' | 'card' | 'cod',
  });

  const setField = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  // ─── Price Calculations ──────────────────────────────
  const subtotal = useMemo(
    () => cart.reduce((s, item) => s + item.customPrice * item.quantity, 0),
    [cart]
  );
  const shippingFee = subtotal >= 1000 ? 0 : 80;
  const rushFee = rushOrder ? 250 : 0;
  const loyaltyDiscount = Math.min(appliedPoints, Math.floor(subtotal * 0.3));
  const tax = Math.round(subtotal * 0.03);
  const total = subtotal + shippingFee + rushFee + tax - loyaltyDiscount;

  const handlePlaceOrder = async () => {
    if (!form.email || !form.phone || !form.street || !form.city || !form.postalCode) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart.map((item) => ({
            productId: item.productId,
            title: item.title,
            quantity: item.quantity,
            customization: item.customization,
          })),
          shippingAddress: {
            street: form.street,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          },
          billingAddress: {
            street: form.street,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          },
          contactPhone: form.phone,
          contactEmail: form.email,
          appliedPoints: loyaltyDiscount,
          rushOrder,
          currency,
        }),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        router.push(`/order-confirmation/${data.orderId}`);
      } else {
        setError(data.error || 'Failed to place order. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setError('Network error. Please check connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col min-h-screen relative bg-space-950 text-foreground overflow-hidden">
        <StellarSky />
        <Header />
        <div className="flex-grow flex items-center justify-center flex-col gap-6 px-4 text-center relative z-10">
          <div className="h-20 w-20 rounded-full bg-space-900 border border-space-800 flex items-center justify-center text-gold-400 shadow-md">
            <Package className="h-10 w-10" />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold">Your basket is empty</h2>
            <p className="text-sm text-foreground/60 mt-1 max-w-sm">Add some customized celestial pieces before checking out.</p>
          </div>
          <Link
            href="/shop"
            className="bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 font-bold px-6 py-3 rounded-craft hover:from-gold-400 hover:to-gold-300 transition-all flex items-center gap-2 border border-gold-300"
          >
            <Sparkles className="h-4 w-4 text-space-950 animate-pulse" />
            Explore Collection
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen relative bg-space-950 text-foreground overflow-hidden">
      <StellarSky />
      <Header />

      {/* Page Header */}
      <div className="border-b border-space-800/80 bg-space-900/30 py-8 relative z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-foreground/50 mb-3">
            <Link href="/shop" className="hover:text-gold-400 transition-colors">Shop</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/" className="hover:text-gold-400 transition-colors">Cart</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-semibold">Checkout</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground">Secure Checkout</h1>
          
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-5">
            {[
              { n: 1, label: 'Address' },
              { n: 2, label: 'Payment' },
              { n: 3, label: 'Review' },
            ].map(({ n, label }, i) => (
              <div key={n} className="flex items-center gap-2">
                <button
                  onClick={() => { if (n < step) setStep(n as 1 | 2 | 3); }}
                  className={`h-8 w-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                    step >= n
                      ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 border border-gold-300 shadow'
                      : 'bg-space-900 text-foreground/40 border border-space-850'
                  }`}
                >
                  {step > n ? <Check className="h-4 w-4 text-space-950" /> : n}
                </button>
                <span className={`text-xs font-bold hidden sm:block ${step >= n ? 'text-gold-400' : 'text-foreground/45'}`}>
                  {label}
                </span>
                {i < 2 && <ChevronRight className="h-4 w-4 text-space-800" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ─── Left: Form Sections ──────────────────── */}
          <div className="lg:col-span-3 space-y-6">

            {/* STEP 1 — Delivery Address */}
            {step === 1 && (
              <div className="animate-fade-in bg-space-900/60 border border-space-800 rounded-craft p-6 shadow-sm space-y-6 backdrop-blur">
                <div className="flex items-center gap-3 pb-4 border-b border-space-800">
                  <div className="h-9 w-9 rounded-full bg-gold-400/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-gold-400" />
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-lg text-foreground animate-fade-in">Delivery Address</h2>
                    <p className="text-xs text-foreground/50">Where should we send your handcrafted piece?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">First Name *</label>
                    <input
                      className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none focus:border-gold-400"
                      placeholder="e.g., Priya"
                      value={form.firstName}
                      onChange={(e) => setField('firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Last Name *</label>
                    <input
                      className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none focus:border-gold-400"
                      placeholder="e.g., Sharma"
                      value={form.lastName}
                      onChange={(e) => setField('lastName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-gold-400" /> Email *
                    </label>
                    <input
                      type="email"
                      className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none focus:border-gold-400"
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-gold-400" /> Mobile *
                    </label>
                    <input
                      type="tel"
                      className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none focus:border-gold-400"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Street Address *</label>
                  <input
                    className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none focus:border-gold-400"
                    placeholder="House no., Street, Area"
                    value={form.street}
                    onChange={(e) => setField('street', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">City *</label>
                    <input
                      className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none focus:border-gold-400"
                      placeholder="e.g., Bangalore"
                      value={form.city}
                      onChange={(e) => setField('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">State</label>
                    <input
                      className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none focus:border-gold-400"
                      placeholder="e.g., Rajasthan"
                      value={form.state}
                      onChange={(e) => setField('state', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">PIN Code *</label>
                    <input
                      className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none focus:border-gold-400"
                      placeholder="302001"
                      value={form.postalCode}
                      onChange={(e) => setField('postalCode', e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!form.email || !form.phone || !form.street || !form.city || !form.postalCode) {
                      setError('Please fill all required fields to continue.');
                      return;
                    }
                    setError('');
                    setStep(2);
                  }}
                  className="w-full mt-2 bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 py-3 rounded-craft font-bold hover:from-gold-400 hover:to-gold-300 transition-all flex items-center justify-center gap-2 border border-gold-300 shadow"
                >
                  Continue to Payment
                  <ChevronRight className="h-4 w-4" />
                </button>
                {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
              </div>
            )}

            {/* STEP 2 — Payment */}
            {step === 2 && (
              <div className="animate-fade-in bg-space-900/60 border border-space-800 rounded-craft p-6 shadow-sm space-y-6 backdrop-blur">
                <div className="flex items-center gap-3 pb-4 border-b border-space-800">
                  <div className="h-9 w-9 rounded-full bg-gold-400/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-gold-400" />
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-lg text-foreground">Payment Method</h2>
                    <p className="text-xs text-foreground/50">Choose how you'd like to pay</p>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="space-y-3">
                  {[
                    { id: 'upi', label: 'UPI / GPay / PhonePe', sub: 'Instant transfer via UPI', icon: '🌌' },
                    { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, Rupay', icon: '💳' },
                    { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when you receive', icon: '💵' },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 border rounded-craft cursor-pointer transition-all ${
                        form.paymentMethod === method.id
                          ? 'border-gold-400 bg-gold-400/5'
                          : 'border-space-800 hover:border-space-700 bg-space-950/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={form.paymentMethod === method.id}
                        onChange={() => setField('paymentMethod', method.id)}
                        className="accent-gold-500"
                      />
                      <div className="text-2xl">{method.icon}</div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{method.label}</p>
                        <p className="text-xs text-foreground/50">{method.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {form.paymentMethod === 'upi' && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">UPI ID</label>
                    <input
                      className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none focus:border-gold-400"
                      placeholder="yourname@upi"
                      value={form.upiId}
                      onChange={(e) => setField('upiId', e.target.value)}
                    />
                  </div>
                )}

                {form.paymentMethod === 'card' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Name on Card</label>
                      <input
                        className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none focus:border-gold-400"
                        placeholder="As on card"
                        value={form.cardName}
                        onChange={(e) => setField('cardName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Card Number</label>
                      <input
                        className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none focus:border-gold-400"
                        placeholder="•••• •••• •••• ••••"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">Expiry</label>
                        <input
                          className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none focus:border-gold-400"
                          placeholder="MM / YY"
                          maxLength={7}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground/60 uppercase tracking-wider">CVV</label>
                        <input
                          className="w-full bg-space-950 border border-space-700 text-foreground rounded-craft p-2.5 text-sm focus:outline-none focus:border-gold-400"
                          placeholder="•••"
                          maxLength={4}
                          type="password"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Loyalty Points Redemption */}
                {loyaltyPoints > 0 && (
                  <div className="p-4 bg-space-950/80 border border-gold-400/20 rounded-craft space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-gold-400 fill-gold-400 animate-pulse" />
                        <span className="text-sm font-bold text-foreground">Apply Loyalty Points</span>
                      </div>
                      <span className="text-xs text-gold-400 font-semibold">{loyaltyPoints} pts available</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        max={loyaltyPoints}
                        min={0}
                        defaultValue={0}
                        className="bg-space-900 border border-space-750 text-foreground rounded-craft px-3 py-2 text-xs focus:outline-none flex-grow"
                        placeholder="Points to redeem"
                        onChange={(e) => applyPoints(Math.min(parseInt(e.target.value) || 0, loyaltyPoints))}
                      />
                      <button
                        onClick={() => applyPoints(loyaltyPoints)}
                        className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 text-xs font-bold rounded-craft hover:from-gold-400 hover:to-gold-300 transition-colors border border-gold-300"
                      >
                        Apply All
                      </button>
                    </div>
                    {loyaltyDiscount > 0 && (
                      <p className="text-xs text-emerald-400 font-semibold">✓ Saving {formatPrice(loyaltyDiscount, currency, language)} with points!</p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-space-800 rounded-craft text-sm font-semibold hover:bg-space-850 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 rounded-craft font-bold hover:from-gold-400 hover:to-gold-300 transition-all flex items-center justify-center gap-2 border border-gold-300"
                  >
                    Review Order
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 — Review & Place */}
            {step === 3 && (
              <div className="animate-fade-in bg-space-900/60 border border-space-800 rounded-craft p-6 shadow-sm space-y-6 backdrop-blur">
                <div className="flex items-center gap-3 pb-4 border-b border-space-800">
                  <div className="h-9 w-9 rounded-full bg-gold-400/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-gold-400" />
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-lg text-foreground">Review & Confirm</h2>
                    <p className="text-xs text-foreground/50">Double-check everything before we handcraft your order</p>
                  </div>
                </div>

                {/* Delivery Summary */}
                <div className="p-4 bg-space-950 rounded-craft space-y-1 text-sm border border-space-800">
                  <p className="font-bold text-gold-400 text-xs uppercase tracking-wider mb-2">Shipping To</p>
                  <p className="font-semibold text-foreground">{form.firstName} {form.lastName}</p>
                  <p className="text-foreground/70">{form.street}, {form.city} – {form.postalCode}</p>
                  <p className="text-foreground/70">{form.email} · {form.phone}</p>
                  <p className="text-foreground/70 capitalize">Payment: {form.paymentMethod.toUpperCase()}</p>
                </div>

                {/* Cart Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 border border-space-800 bg-space-950/40 rounded-craft">
                      <div className="h-14 w-14 rounded-lg bg-space-950 overflow-hidden flex-shrink-0 border border-space-800">
                        <img
                          src={item.customization.zodiacSign
                            ? `/images/zodiac/${item.customization.zodiacSign.toLowerCase()}.png`
                            : item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{item.title}</p>
                        <p className="text-xs text-foreground/50">
                          {item.customization.zodiacSign && `${item.customization.zodiacSign} · `}
                          {item.customization.size} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-gold-400 text-sm flex-shrink-0">
                        {formatPrice(item.customPrice * item.quantity, currency, language)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Security Notice */}
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-craft text-xs text-emerald-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Your personal data and payment are protected with 256-bit SSL encryption.</span>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-craft text-sm text-red-400">{error}</div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 border border-space-800 rounded-craft text-sm font-semibold hover:bg-space-850 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-space-950 rounded-craft font-bold hover:from-gold-400 hover:to-gold-300 transition-all flex items-center justify-center gap-2 border border-gold-300 shadow-md text-base"
                  >
                    {loading ? (
                      <><div className="h-4 w-4 border-2 border-space-950/30 border-t-space-950 rounded-full animate-spin" /> Processing...</>
                    ) : (
                      <><Lock className="h-4 w-4 text-space-950" /> Place Order · {formatPrice(total, currency, language)}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ─── Right: Order Summary ─────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-space-900/60 border border-space-800 rounded-craft p-5 shadow-sm sticky top-24 space-y-5 backdrop-blur">
              <h3 className="font-serif font-bold text-lg text-foreground border-b border-space-800 pb-3">
                Order Summary
              </h3>

              {/* Cart Items (compact) */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div className="h-12 w-12 rounded-lg bg-space-950 border border-space-800 overflow-hidden flex-shrink-0">
                      <img
                        src={item.customization.zodiacSign
                          ? `/images/zodiac/${item.customization.zodiacSign.toLowerCase()}.png`
                          : item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground line-clamp-2">{item.title}</p>
                      <p className="text-[10px] text-foreground/50">Qty {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-gold-400 flex-shrink-0">
                      {formatPrice(item.customPrice * item.quantity, currency, language)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-space-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-foreground/70">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal, currency, language)}</span>
                </div>
                <div className="flex justify-between text-sm text-foreground/70">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" /> Shipping
                  </span>
                  <span>{shippingFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : formatPrice(shippingFee, currency, language)}</span>
                </div>
                {rushOrder && (
                  <div className="flex justify-between text-sm text-foreground/70">
                    <span>Rush Crafting</span>
                    <span>+{formatPrice(rushFee, currency, language)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-foreground/70">
                  <span>GST (3%)</span>
                  <span>{formatPrice(tax, currency, language)}</span>
                </div>
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-400 font-semibold">
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-current" /> Points Discount</span>
                    <span>-{formatPrice(loyaltyDiscount, currency, language)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base text-foreground border-t border-space-800 pt-3 mt-1">
                  <span>Total</span>
                  <span className="text-gold-400 font-serif text-lg">{formatPrice(total, currency, language)}</span>
                </div>
              </div>

              {/* Free Shipping Nudge */}
              {shippingFee > 0 && (
                <div className="p-3 bg-space-950 border border-gold-500/20 rounded-craft text-xs text-gold-400">
                  🎁 Add {formatPrice(1000 - subtotal, currency, language)} more for <strong>FREE shipping</strong>!
                </div>
              )}

              {/* Trust signals */}
              <div className="border-t border-space-800 pt-4 space-y-2">
                {[
                  { icon: ShieldCheck, text: '100% Secure Payments' },
                  { icon: Gift, text: 'Free Gift Wrapping on orders ₹799+' },
                  { icon: Truck, text: 'Free Shipping on orders ₹1000+' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-[11px] text-foreground/70">
                    <Icon className="h-4 w-4 text-gold-400 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
