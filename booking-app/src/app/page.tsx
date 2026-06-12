// src/app/page.tsx
import Link from 'next/link';
import { Star, Clock, Shield, PhoneCall, ChevronRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Rahul Raj Astro';
  const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+91 9876543210';

  const testimonials = [
    { name: 'Priya S.', text: 'Accurate predictions, life-changing guidance. Highly recommend!', stars: 5 },
    { name: 'Rahul M.', text: 'The Kundali reading was incredibly detailed and insightful.', stars: 5 },
    { name: 'Meera K.', text: 'Booking was seamless and the consultation was worth every rupee.', stars: 5 },
  ];

  const services = [
    {
      name: 'Kundali Online',
      price: '₹1,100',
      description: 'Video call consultation with detailed birth chart analysis and life guidance.',
      duration: '60 min',
      icon: '🔮',
    },
    {
      name: 'Kundali Office Visit',
      price: '₹500',
      description: 'In-person consultation with printed birth chart. Includes tea and personalised guidance.',
      duration: '60 min',
      icon: '🏛️',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <nav className="hero-gradient px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-saffron" />
          <span className="font-display text-white text-lg font-semibold">{businessName}</span>
        </div>
        <div className="flex gap-3 items-center">
          <a href={`tel:${businessPhone}`} className="hidden sm:flex items-center gap-1.5 text-brand-200 hover:text-saffron text-sm transition-colors">
            <PhoneCall className="w-4 h-4" />
            {businessPhone}
          </a>
          <Link href="/book" className="btn-saffron !py-2 !px-4 text-sm">
            Book Now
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-gradient px-6 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #E8A020 0%, transparent 50%), radial-gradient(circle at 80% 50%, #5267b3 0%, transparent 50%)'
        }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-brand-200 text-sm px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
            Trusted by 5,000+ families across India
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-white mb-6 leading-tight">
            Discover Your{' '}
            <span className="text-gradient">Cosmic Path</span>
          </h1>
          <p className="text-deep-200 text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Personalised Kundali readings by expert astrologers. Get clarity on relationships, career, health, and your life's true purpose.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="btn-saffron text-base flex items-center justify-center gap-2">
              Book Your Consultation
              <ChevronRight className="w-5 h-5" />
            </Link>
            <a href={`tel:${businessPhone}`} className="btn-outline !border-white/30 !text-white hover:!bg-white/10 text-base flex items-center justify-center gap-2">
              <PhoneCall className="w-4 h-4" />
              Call Us
            </a>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-white border-b border-brand-100">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { icon: '🌟', label: '5,000+', sub: 'Consultations Done' },
            { icon: '⭐', label: '4.9/5', sub: 'Average Rating' },
            { icon: '🎓', label: '15+ Yrs', sub: 'Experience' },
            { icon: '🔒', label: '100%', sub: 'Secure Payments' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="font-display text-xl text-deep-700 font-bold">{item.label}</div>
              <div className="text-xs text-deep-400 mt-0.5">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-saffron text-sm font-semibold uppercase tracking-widest">Our Services</span>
          <h2 className="font-display text-3xl sm:text-4xl text-deep-800 mt-2">Choose Your Consultation</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {services.map((svc) => (
            <div key={svc.name} className="card hover:shadow-md transition-shadow border-brand-200/80">
              <div className="text-4xl mb-4">{svc.icon}</div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-display text-xl text-deep-800">{svc.name}</h3>
                <span className="text-saffron font-bold text-xl">{svc.price}</span>
              </div>
              <p className="text-deep-500 text-sm mb-4 leading-relaxed">{svc.description}</p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-deep-400 text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  {svc.duration}
                </span>
                <Link href="/book" className="text-deep-500 hover:text-saffron font-semibold text-sm flex items-center gap-1 transition-colors">
                  Book Now <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-deep-900 px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-saffron text-sm font-semibold uppercase tracking-widest">Simple Process</span>
          <h2 className="font-display text-3xl sm:text-4xl text-white mt-2 mb-12">Book in 3 Steps</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Pick a Service & Slot', desc: 'Choose your consultation type and a time that works for you.' },
              { step: '02', title: 'Enter Your Details', desc: 'Share your name, email, and any specific questions you have.' },
              { step: '03', title: 'Pay & Confirm', desc: 'Secure payment via Razorpay. Instant email confirmation.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="font-display text-5xl text-saffron/30 font-bold mb-3">{item.step}</div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-deep-300 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/book" className="btn-saffron mt-12 inline-flex items-center gap-2">
            Get Started <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-saffron text-sm font-semibold uppercase tracking-widest">Testimonials</span>
          <h2 className="font-display text-3xl sm:text-4xl text-deep-800 mt-2">What Clients Say</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card bg-deep-50/50">
              <div className="flex mb-3">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-saffron fill-saffron" />
                ))}
              </div>
              <p className="text-deep-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <span className="text-deep-400 text-xs font-semibold">— {t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-saffron px-6 py-14 text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-white mb-4">
          Your Stars Are Waiting
        </h2>
        <p className="text-white/80 mb-8 max-w-md mx-auto">
          Book your personalised Kundali reading today and gain the clarity you deserve.
        </p>
        <Link href="/book" className="bg-white text-saffron font-bold px-8 py-3.5 rounded-xl hover:bg-cream transition-colors inline-flex items-center gap-2">
          Book Consultation <ChevronRight className="w-5 h-5" />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="hero-gradient px-6 py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-saffron" />
          <span className="font-display text-white">{businessName}</span>
        </div>
        <p className="text-deep-300 text-sm">
          © {new Date().getFullYear()} {businessName}. All rights reserved.
        </p>
        <div className="flex justify-center gap-6 mt-4">
          <a href={`tel:${businessPhone}`} className="text-deep-300 hover:text-saffron text-sm transition-colors flex items-center gap-1">
            <PhoneCall className="w-3.5 h-3.5" /> {businessPhone}
          </a>
          <Link href="/admin" className="text-deep-500 hover:text-deep-300 text-sm transition-colors flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
