import { db } from '@/lib/db';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, MessageCircle, Star, ArrowRight, Sparkles, MapPin } from 'lucide-react';

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let order: any = null;
  try {
    order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { include: { category: true } } }
        }
      }
    });
  } catch (e) {
    console.error('Failed to fetch order:', e);
  }

  const formatINR = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const shippingAddr = order?.shippingAddress as any;
  const pointsEarned = order?.pointsEarned || 0;

  // Order status steps
  const steps = [
    { key: 'PENDING', label: 'Order Received', sub: 'We have your order!', done: true },
    { key: 'CONFIRMED', label: 'Artisan Assigned', sub: 'Sent to Bangalore hub', done: false },
    { key: 'HANDCRAFTING', label: 'Handweaving', sub: 'Being crafted with love', done: false },
    { key: 'SHIPPED', label: 'Dispatched', sub: 'On the way to you', done: false },
    { key: 'DELIVERED', label: 'Delivered', sub: 'Enjoy your piece!', done: false },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-clay-50/40">
      <Header />

      {/* Hero confirmation band */}
      <section className="relative overflow-hidden bg-gradient-to-br from-clay-800 to-clay-950 text-white py-16 text-center">
        <div className="cosmic-glow bg-gold-300/40 left-1/4 top-0 h-64 w-64" />
        <div className="cosmic-glow bg-primary/30 right-1/4 bottom-0 h-64 w-64" />
        <div className="relative z-10 space-y-4 max-w-lg mx-auto px-4">
          <div className="h-16 w-16 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center mx-auto animate-scale-in">
            <CheckCircle2 className="h-9 w-9 text-green-400" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">Order Confirmed! ✨</h1>
          <p className="text-clay-300 text-sm leading-relaxed">
            Your celestial piece is now queued with our artisans in Bangalore. You'll receive a WhatsApp update at every milestone.
          </p>
          <div className="inline-block bg-white/10 border border-white/20 rounded-xl px-5 py-3 font-mono text-xs text-clay-200">
            Order ID: <span className="text-gold-300 font-bold">{id?.slice(0, 16)}...</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 w-full space-y-8">

        {order ? (
          <>
            {/* ─── Order Details Grid ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Items */}
              <div className="bg-card border border-clay-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="font-serif font-bold text-lg text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Items Ordered
                </h2>
                <div className="space-y-3">
                  {order.items.map((item: any) => {
                    const customData = item.customizationData as any;
                    return (
                      <div key={item.id} className="flex gap-4 p-3 bg-clay-50/50 rounded-xl border border-clay-100">
                        <div className="h-14 w-14 rounded-lg bg-clay-100 overflow-hidden flex-shrink-0">
                          <img
                            src={customData?.zodiacSign
                              ? `/images/zodiac/${customData.zodiacSign.toLowerCase()}.png`
                              : item.product?.imageUrl || '/images/zodiac/default.jpg'}
                            alt={item.product?.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">{item.product?.title}</p>
                          <p className="text-xs text-foreground/50 mt-0.5">
                            {customData?.zodiacSign && `${customData.zodiacSign} · `}
                            {customData?.size && `Size ${customData.size} · `}
                            Qty {item.quantity}
                          </p>
                          {customData?.engravingText && (
                            <p className="text-xs text-primary font-serif italic mt-0.5">"{customData.engravingText}"</p>
                          )}
                        </div>
                        <p className="font-bold text-primary text-sm flex-shrink-0">{formatINR(item.price * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-clay-100 pt-4 space-y-1 text-sm">
                  <div className="flex justify-between text-foreground/70">
                    <span>Subtotal</span><span>{formatINR(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-foreground/70">
                    <span>Shipping</span>
                    <span>{order.shippingFee === 0 ? <span className="text-green-600 font-semibold">FREE</span> : formatINR(order.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-foreground/70">
                    <span>GST</span><span>{formatINR(order.tax)}</span>
                  </div>
                  {order.loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-green-700 font-semibold">
                      <span>Points Discount</span><span>-{formatINR(order.loyaltyDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base text-foreground pt-2 border-t border-clay-100">
                    <span>Total Paid</span>
                    <span className="text-primary font-serif text-lg">{formatINR(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info + Points */}
              <div className="space-y-4">
                {shippingAddr && (
                  <div className="bg-card border border-clay-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Shipping Address
                    </h3>
                    <div className="text-sm text-foreground/70 space-y-0.5">
                      <p className="font-semibold text-foreground">{order.contactEmail}</p>
                      <p>{shippingAddr.street}</p>
                      <p>{shippingAddr.city}{shippingAddr.state ? `, ${shippingAddr.state}` : ''} – {shippingAddr.postalCode}</p>
                      <p>{order.contactPhone}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-foreground/50 mt-2 p-2 bg-clay-50 rounded-lg">
                      <Truck className="h-3.5 w-3.5" />
                      Estimated delivery: <strong className="text-foreground">5–7 business days</strong>
                    </div>
                  </div>
                )}

                {/* Points Earned */}
                {pointsEarned > 0 && (
                  <div className="bg-gradient-to-br from-gold-50 to-clay-50 border border-gold-200 rounded-2xl p-5 shadow-sm space-y-2 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-gold-500 fill-gold-500" />
                      <h3 className="font-serif font-bold text-base text-foreground">Points Earned!</h3>
                    </div>
                    <p className="text-3xl font-bold font-serif text-gold-600">+{pointsEarned} pts</p>
                    <p className="text-xs text-foreground/60">
                      These points are added to your Celestial Wallet and can be redeemed on your next order (1 pt = ₹1 off).
                    </p>
                  </div>
                )}

                {/* WhatsApp CTA */}
                <a
                  href={`https://wa.me/919999999999?text=Hi! I placed Order ${id?.slice(0, 8)}. Can you help me track it?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full p-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-2xl transition-colors text-sm shadow-sm"
                >
                  <MessageCircle className="h-5 w-5" />
                  Track via WhatsApp
                </a>
              </div>
            </div>

            {/* ─── Order Timeline ─── */}
            <div className="bg-card border border-clay-200 rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif font-bold text-lg text-foreground mb-6">Handcrafting Journey</h2>
              <div className="relative pl-6 space-y-6 border-l-2 border-clay-200">
                {steps.map((s, i) => {
                  const isActive = i === 0;
                  const isDone = s.done;
                  return (
                    <div key={s.key} className="relative">
                      <span className={`absolute -left-[27px] top-1 h-5 w-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold transition-all ${
                        isActive
                          ? 'bg-primary border-primary text-white ring-4 ring-primary/20 animate-pulse-glow'
                          : isDone
                          ? 'bg-primary border-primary text-white'
                          : 'bg-background border-clay-300 text-foreground/30'
                      }`}>
                        {isDone ? '✓' : i + 1}
                      </span>
                      <div className={isActive ? '' : 'opacity-50'}>
                        <p className={`text-sm font-bold font-serif ${isActive ? 'text-primary' : 'text-foreground'}`}>{s.label}</p>
                        <p className="text-xs text-foreground/50">{s.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-card border border-clay-200 rounded-2xl p-10 text-center shadow-sm">
            <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold">Your order has been placed!</h2>
            <p className="text-sm text-foreground/60 mt-2">
              Order ID: <span className="font-mono font-bold text-primary">{id}</span>
            </p>
            <p className="text-xs text-foreground/50 mt-4">
              You'll receive updates via WhatsApp & email. Save your Order ID to track later.
            </p>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pb-4">
          <Link
            href={`/account?track=${id}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-primary text-primary font-semibold rounded-2xl hover:bg-primary/5 transition-colors text-sm"
          >
            <Package className="h-4 w-4" />
            Track This Order
          </Link>
          <Link
            href="/shop"
            className="btn-primary flex-1 text-sm py-3"
          >
            <Sparkles className="h-4 w-4" />
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
