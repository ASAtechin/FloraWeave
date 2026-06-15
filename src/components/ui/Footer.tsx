'use client';

import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Shield, Sparkles, Heart, Globe, Moon, Phone, Mail, MapPin, ShieldCheck, Truck, Gift } from 'lucide-react';

export default function Footer() {
  const { language } = useStore();

  return (
    <footer className="bg-clay-900 text-clay-100 border-t border-clay-800">

      {/* Trust Badges Banner */}
      <div className="border-b border-clay-800 bg-clay-800/60">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, title: 'Secure Payments', sub: 'SSL & UPI encrypted' },
              { icon: Truck, title: 'Free Shipping', sub: 'On orders above ₹999' },
              { icon: Gift, title: 'Gift Wrapping', sub: 'Complimentary on ₹799+' },
              { icon: Heart, title: 'Handcrafted', sub: 'By verified artisans' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-clay-700/60 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-bold text-clay-200">{title}</p>
                  <p className="text-[10px] text-clay-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">

          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-serif text-2xl font-semibold tracking-wide text-accent">
              Chochete ✦
            </h3>
            <p className="text-sm text-clay-300 leading-relaxed">
              {language === 'hi'
                ? 'राशि चक्र और जन्म के फूलों से प्रेरित हस्तनिर्मित सहायक उपकरण, जो प्यार, कहानियों और इरादों के साथ बुने गए हैं।'
                : 'Handcrafted zodiac & birth-flower thread accessories, woven with love and cosmic intentions by skilled artisans in Bangalore, India.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {['100% Yarn', 'Bangalore Made', 'Zodiac Aligned', 'Eco Packaging'].map((tag) => (
                <span key={tag} className="text-[10px] border border-clay-700 px-2 py-1 rounded-full bg-clay-800/40 text-clay-400">
                  {tag}
                </span>
              ))}
            </div>

            {/* Contact */}
            <div className="space-y-2 text-xs text-clay-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-clay-500 flex-shrink-0" />
                <span>Craft Hub, Chickpet, Bangalore 560053</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-clay-500 flex-shrink-0" />
                <a href="tel:+919999999999" className="hover:text-accent transition-colors">+91 99999 99999</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-clay-500 flex-shrink-0" />
                <a href="mailto:hello@chochete.in" className="hover:text-accent transition-colors">hello@chochete.in</a>
              </div>
            </div>
          </div>

          {/* Zodiac Quick Links */}
          <div>
            <h4 className="font-serif text-sm font-bold text-clay-200 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Moon className="h-4 w-4 text-accent" />
              Shop Zodiac Sign
            </h4>
            <ul className="space-y-2 text-xs text-clay-400">
              {[
                ['Aries', 'मेष'], ['Taurus', 'वृषभ'], ['Gemini', 'मिथुन'],
                ['Cancer', 'कर्क'], ['Leo', 'सिंह'], ['Virgo', 'कन्या'],
                ['Libra', 'तुला'], ['Scorpio', 'वृश्चिक'], ['Sagittarius', 'धनु'],
                ['Capricorn', 'मकर'], ['Aquarius', 'कुम्भ'], ['Pisces', 'मीन'],
              ].map(([sign, hindi]) => (
                <li key={sign}>
                  <Link href={`/shop?zodiac=${sign}`} className="hover:text-accent transition-colors">
                    {sign} <span className="text-clay-600">({hindi})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Birth Flowers Links */}
          <div>
            <h4 className="font-serif text-sm font-bold text-clay-200 mb-4 uppercase tracking-wider">
              Shop Birth Flower
            </h4>
            <ul className="space-y-2 text-xs text-clay-400">
              {[
                ['Carnation', 'January'], ['Violet', 'February'], ['Daffodil', 'March'],
                ['Daisy', 'April'], ['Hawthorn', 'May'], ['Rose', 'June'],
                ['Delphinium', 'July'], ['Chrysanthemum', 'November'],
              ].map(([flower, month]) => (
                <li key={flower}>
                  <Link href={`/shop?flower=${flower}`} className="hover:text-accent transition-colors">
                    {month} — {flower}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Support */}
          <div className="space-y-6">
            <div>
              <h4 className="font-serif text-sm font-bold text-clay-200 mb-4 uppercase tracking-wider">
                Our Promise
              </h4>
              <div className="space-y-3 text-xs text-clay-400">
                {[
                  { icon: Heart, text: '100% Hand-knotted by verified local artisans.' },
                  { icon: Shield, text: 'Premium wooden keepsake & recycled kraft packaging.' },
                  { icon: Globe, text: 'Supporting ethical wages & artisan split commissions.' },
                  { icon: Sparkles, text: 'AI Celestial Customizer for personalised gifting.' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-2">
                    <Icon className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="text-xs font-bold text-clay-500 uppercase tracking-wider mb-3">We Accept</h4>
              <div className="flex flex-wrap gap-2">
                {['UPI', 'PhonePe', 'GPay', 'Cards', 'COD'].map((method) => (
                  <span key={method} className="text-[10px] px-2 py-1 bg-clay-800 rounded border border-clay-700 text-clay-400 font-semibold">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-clay-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-clay-500 gap-4">
          <p>© {new Date().getFullYear()} Chochete Accessories Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-clay-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-clay-300 transition-colors">Terms of Service</Link>
            <Link href="/returns" className="hover:text-clay-300 transition-colors">Returns & Refunds</Link>
            <Link href="/compliance" className="hover:text-clay-300 transition-colors">Artisan KYC</Link>
          </div>
          <p className="flex items-center gap-1">
            Made with <Sparkles className="h-3 w-3 text-accent" /> in Bangalore, India
          </p>
        </div>
      </div>
    </footer>
  );
}
