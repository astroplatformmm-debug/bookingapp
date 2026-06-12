// src/app/page.tsx
import Link from 'next/link';
import { Star, Clock, PhoneCall, ChevronRight, CheckCircle2, Flame, Users, Award, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* URGENCY BAR */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white text-center py-2.5 text-sm font-semibold tracking-wide">
        <Flame className="w-4 h-4 inline mr-1.5 animate-pulse" />
        सीमित स्लॉट बचे हैं — आज ही बुक करें और अपना भविष्य जानें!
        <Flame className="w-4 h-4 inline ml-1.5 animate-pulse" />
      </div>

      {/* NAV */}
      <nav className="px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-lg font-bold">ॐ</div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">OMKKAAR</div>
            <div className="text-amber-400 text-xs">Astroworld</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="tel:+917069110573" className="hidden sm:flex items-center gap-1.5 text-white/60 hover:text-amber-400 text-sm transition-colors">
            <PhoneCall className="w-3.5 h-3.5" />
            +91 70691 10573
          </a>
          <Link href="/book" className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 rounded-full text-sm transition-all active:scale-95">
            अभी बुक करें
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-6 pt-16 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-[200px] h-[200px] bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm mb-8">
            <div className="flex -space-x-1">
              {['🧑', '👩', '👨', '🧕', '👴'].map((e, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-xs border border-black">{e}</div>
              ))}
            </div>
            <span className="text-white/70">12,000+ लोगों ने अपना भविष्य जाना</span>
            <span className="flex">{'⭐'.repeat(5)}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-tight">
            क्या आपकी कुंडली में
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              छुपा है आपका भाग्य?
            </span>
          </h1>

          <p className="text-white/60 text-lg sm:text-xl mb-4 max-w-xl mx-auto leading-relaxed">
            25+ वर्षों के अनुभव के साथ <span className="text-white font-semibold">Pt. Mukesh Ravindra Gupta</span> आपकी कुंडली देखकर बताएंगे — प्रेम, करियर, विवाह और भविष्य का सच।
          </p>

          <div className="flex flex-col items-center gap-4 mt-10">
            <div className="flex items-center gap-3">
              <span className="text-white/30 line-through text-xl">₹999</span>
              <span className="bg-amber-500 text-black font-black text-3xl px-4 py-1 rounded-lg">₹199</span>
              <span className="bg-green-500/20 border border-green-500/40 text-green-400 text-sm px-3 py-1 rounded-full font-semibold">80% OFF</span>
            </div>
            <Link href="/book" className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xl px-10 py-5 rounded-2xl transition-all active:scale-95 shadow-lg shadow-amber-500/30 flex items-center gap-3">
              अपनी कुंडली अभी बुक करें
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-white/40 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              100% Secure Payment · Razorpay Protected
            </p>
          </div>
        </div>
      </section>

      {/* TRUST STATS */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { icon: <Users className="w-5 h-5" />, num: '12,000+', label: 'संतुष्ट ग्राहक' },
            { icon: <Award className="w-5 h-5" />, num: '25+ वर्ष', label: 'अनुभव' },
            { icon: <Star className="w-5 h-5 fill-amber-400 text-amber-400" />, num: '4.9/5', label: 'औसत रेटिंग' },
            { icon: <Zap className="w-5 h-5" />, num: '24 घंटे', label: 'में रिपोर्ट' },
          ].map((s) => (
            <div key={s.num}>
              <div className="flex justify-center text-amber-400 mb-2">{s.icon}</div>
              <div className="text-2xl font-black text-white">{s.num}</div>
              <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ASTROLOGER */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid sm:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center sm:justify-start">
            <img
              src="/mukesh.jpeg"
              alt="Pt. Mukesh Ravindra Gupta"
              className="w-56 h-64 sm:w-72 sm:h-80 rounded-3xl object-cover object-top border-2 border-amber-500/30 shadow-2xl shadow-amber-500/10"
            />
          </div>
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">आपके ज्योतिषाचार्य</span>
            <h2 className="text-3xl font-black mt-2 mb-1">Pt. Mukesh Ravindra Gupta</h2>
            <p className="text-white/40 text-sm mb-5">Certified Vedic Astrologer · Vadodara, Gujarat</p>
            <div className="space-y-3">
              {[
                'ISO 9001-2015 Certified Professional',
                'Trademark Certified Astrologer',
                '25+ वर्षों का वैदिक ज्योतिष अनुभव',
                'करियर, विवाह, व्यापार में विशेषज्ञता',
                '12,000+ सफल कुंडली परामर्श',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Link href="/book" className="inline-flex items-center gap-2 mt-8 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm">
              Pt. Gupta से अभी बात करें <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="bg-gradient-to-b from-amber-500/5 to-transparent px-6 py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">सिर्फ ₹199 में मिलेगा</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-2">आपको क्या मिलेगा?</h2>
        </div>
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
          {[
            { icon: '📋', title: 'विस्तृत कुंडली रिपोर्ट', desc: '20+ पेज की PDF रिपोर्ट — सभी 12 भावों का विश्लेषण' },
            { icon: '🎯', title: 'व्यक्तिगत परामर्श', desc: 'Pt. Gupta के साथ 1-on-1 सत्र — आपके सवालों के जवाब' },
            { icon: '⚡', title: '24 घंटे में डिलीवरी', desc: 'बुकिंग के 24 घंटे के भीतर रिपोर्ट और परामर्श' },
            { icon: '🔮', title: 'उपाय और समाधान', desc: 'ग्रह दोष, करियर, विवाह के लिए व्यावहारिक उपाय' },
            { icon: '💑', title: 'प्रेम और विवाह', desc: 'सही साथी, विवाह का शुभ समय और संबंध विश्लेषण' },
            { icon: '💰', title: 'धन और करियर', desc: 'व्यापार, नौकरी और आर्थिक स्थिति का भविष्य' },
          ].map((item) => (
            <div key={item.title} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 flex gap-4 hover:border-amber-500/30 transition-colors">
              <div className="text-3xl flex-shrink-0">{item.icon}</div>
              <div>
                <div className="font-bold text-white text-sm mb-1">{item.title}</div>
                <div className="text-white/50 text-xs leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">ग्राहकों की राय</span>
          <h2 className="text-3xl font-black mt-2">12,000+ लोगों ने बदली अपनी ज़िंदगी</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { name: 'Priya Sharma', city: 'Ahmedabad', text: 'Pt. Gupta जी ने मेरी कुंडली देखकर सटीक भविष्यवाणी की। विवाह का जो समय बताया वो बिल्कुल सही निकला।', stars: 5 },
            { name: 'Rahul Patel', city: 'Surat', text: 'करियर में बहुत परेशानी थी। Pt. Gupta के उपाय करने के बाद नई नौकरी मिली। 100% genuine astrologer हैं।', stars: 5 },
            { name: 'Meera Joshi', city: 'Vadodara', text: 'बेटे की शादी नहीं हो रही थी। कुंडली मिलान और उपाय के बाद 3 महीने में शादी हो गई।', stars: 5 },
          ].map((t) => (
            <div key={t.name} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-amber-500/20 transition-colors">
              <div className="flex mb-3">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <div className="text-white font-semibold text-sm">{t.name}</div>
                <div className="text-white/30 text-xs">{t.city}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 py-10 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black">अक्सर पूछे जाने वाले सवाल</h2>
        </div>
        <div className="space-y-3">
          {[
            { q: 'क्या ₹199 में सब कुछ मिलेगा?', a: 'हां — ₹199 में विस्तृत कुंडली रिपोर्ट और व्यक्तिगत परामर्श दोनों शामिल हैं।' },
            { q: 'कितने समय में रिपोर्ट मिलेगी?', a: 'बुकिंग के 24 घंटे के भीतर आपकी रिपोर्ट और परामर्श की व्यवस्था होगी।' },
            { q: 'Online consultation कैसे होगी?', a: 'बुकिंग के बाद आपको WhatsApp/Phone पर Pt. Gupta से जोड़ा जाएगा।' },
            { q: 'Payment secure है?', a: 'हां — Razorpay के माध्यम से 100% secure payment। UPI, Card, NetBanking सब accepted।' },
          ].map((faq) => (
            <div key={faq.q} className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-5">
              <div className="font-semibold text-sm mb-2 text-white">{faq.q}</div>
              <div className="text-white/50 text-sm">{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STICKY BOTTOM CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black via-black/95 to-transparent">
        <div className="max-w-sm mx-auto">
          <Link href="/book" className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black px-6 py-4 rounded-2xl shadow-xl shadow-amber-500/40 active:scale-95 transition-all">
            <div>
              <div className="text-base">कुंडली बुक करें</div>
              <div className="text-xs font-normal opacity-70">सिर्फ ₹199 · Limited Slots</div>
            </div>
            <div className="text-2xl font-black">₹199 →</div>
          </Link>
        </div>
      </div>

      <div className="h-28" />

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-bold text-sm">ॐ</div>
          <span className="font-bold text-white">OMKKAAR Astroworld</span>
        </div>
        <p className="text-white/30 text-xs">22/FF, Emperor Building, Fatehgunj, Vadodara - 390002</p>
        <p className="text-white/30 text-xs mt-1">© 2026 Omkkaar Astroworld · All rights reserved</p>
      </footer>
    </div>
  );
}
