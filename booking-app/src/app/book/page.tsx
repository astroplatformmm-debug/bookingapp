'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Clock, Calendar, User, Mail, Phone, CheckCircle2, Loader2, Flame } from 'lucide-react';
import { ServiceType, SlotType } from '@/types';
import { formatPrice, formatDate, formatTime, cn } from '@/lib/utils';

type Step = 'service' | 'slot' | 'details' | 'payment';
const STEPS: Step[] = ['service', 'slot', 'details', 'payment'];
const STEP_LABELS = ['Service', 'Slot', 'Details', 'Payment'];

interface RazorpayOptions {
  key: string; amount: number; currency: string; name: string; description: string;
  order_id: string; handler: (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string }; modal: { ondismiss: () => void };
}
declare global { interface Window { Razorpay: new (o: RazorpayOptions) => { open: () => void }; } }

export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('service');
  const [services, setServices] = useState<ServiceType[]>([]);
  const [slots, setSlots] = useState<Record<string, SlotType[]>>({});
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(setServices).catch(() => toast.error('Failed to load services'));
  }, []);

  const loadSlots = useCallback(async (serviceId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/slots?serviceId=${serviceId}`);
      const data = await res.json();
      setSlots(data.grouped || {});
      const first = Object.keys(data.grouped || {})[0];
      if (first) setSelectedDate(first);
    } catch { toast.error('Failed to load slots'); }
    finally { setLoading(false); }
  }, []);

  const stepIndex = STEPS.indexOf(step);
  const goNext = () => setStep(STEPS[stepIndex + 1]);
  const goBack = () => setStep(STEPS[stepIndex - 1]);

  const handleServiceSelect = (svc: ServiceType) => { setSelectedService(svc); loadSlots(svc.id); goNext(); };
  const handleSlotSelect = (slot: SlotType) => { setSelectedSlot(slot); goNext(); };

  const validateDetails = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'नाम आवश्यक है';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Valid email दर्ज करें';
    if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, '').slice(-10))) e.phone = 'Valid 10-digit phone दर्ज करें';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const loadRazorpay = () => new Promise<boolean>(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true); s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });

  const handlePayment = async () => {
    if (!validateDetails() || !selectedService || !selectedSlot) return;
    setPaying(true);
    try {
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: selectedService.id, slotId: selectedSlot.id, customerName: formData.name, customerEmail: formData.email, customerPhone: formData.phone, notes: formData.notes }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) { toast.error(orderData.error || 'Failed to create order'); setPaying(false); return; }
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway load failed'); setPaying(false); return; }
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount, currency: orderData.currency,
        name: 'OMKKAAR Astroworld', description: selectedService.name,
        order_id: orderData.orderId,
        handler: async (response) => {
          setPaying(true);
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, bookingId: orderData.bookingId }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) router.push(`/confirm/${orderData.bookingId}`);
          else { toast.error(verifyData.error || 'Verification failed'); setPaying(false); }
        },
        prefill: { name: formData.name, email: formData.email, contact: formData.phone },
        theme: { color: '#f59e0b' },
        modal: { ondismiss: () => { setPaying(false); toast('Payment cancelled'); } },
      });
      rzp.open();
    } catch { toast.error('Something went wrong'); setPaying(false); }
  };

  const inputClass = (field: string) => cn(
    'w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all',
    errors[field] ? 'border-red-500' : 'border-white/10'
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-4 border-b border-white/5">
        <button onClick={() => router.push('/')} className="text-white/40 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-bold text-sm">ॐ</div>
          <span className="font-bold text-white">OMKKAAR Astroworld</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-3 py-1.5 rounded-full">
          <Flame className="w-3 h-3 animate-pulse" /> सीमित स्लॉट
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                i < stepIndex ? 'bg-amber-500 text-black' : i === stepIndex ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/30'
              )}>
                {i < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn('ml-1.5 text-xs font-semibold hidden sm:block', i === stepIndex ? 'text-amber-400' : 'text-white/30')}>{label}</span>
              {i < STEP_LABELS.length - 1 && <div className={cn('flex-1 h-px mx-3', i < stepIndex ? 'bg-amber-500' : 'bg-white/10')} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* STEP 1: SERVICE */}
        {step === 'service' && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-black mb-1">सेवा चुनें</h2>
            <p className="text-white/40 text-sm mb-6">अपनी परामर्श प्रकार चुनें</p>
            {services.length === 0 ? (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center text-white/30">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" /> Loading...
              </div>
            ) : (
              <div className="space-y-4">
                {services.map(svc => (
                  <button key={svc.id} onClick={() => handleServiceSelect(svc)}
                    className="w-full text-left bg-white/[0.03] border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5 rounded-2xl p-6 transition-all group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{svc.name}</h3>
                        <p className="text-white/40 text-sm mt-1">{svc.description}</p>
                        <div className="flex items-center gap-1 mt-3 text-white/30 text-xs">
                          <Clock className="w-3 h-3" /> {svc.duration} min
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <div className="text-white/30 line-through text-sm">₹999</div>
                        <div className="text-2xl font-black text-amber-400">{formatPrice(svc.price)}</div>
                        <ChevronRight className="w-5 h-5 text-white/20 mt-1 ml-auto group-hover:text-amber-400 transition-colors" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SLOT */}
        {step === 'slot' && (
          <div className="animate-slide-up">
            <button onClick={goBack} className="flex items-center gap-1 text-white/40 hover:text-white text-sm mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" /> वापस
            </button>
            <h2 className="text-2xl font-black mb-1">समय चुनें</h2>
            <p className="text-white/40 text-sm mb-6">सेवा: <span className="text-amber-400 font-semibold">{selectedService?.name}</span></p>

            {loading ? (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center text-white/30">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" /> स्लॉट लोड हो रहे हैं...
              </div>
            ) : Object.keys(slots).length === 0 ? (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-12 text-center">
                <Calendar className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">कोई स्लॉट उपलब्ध नहीं है</p>
                <p className="text-white/20 text-sm mt-1">कृपया हमसे संपर्क करें</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {Object.keys(slots).map(date => (
                    <button key={date} onClick={() => setSelectedDate(date)}
                      className={cn('flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                        selectedDate === date ? 'bg-amber-500 text-black' : 'bg-white/5 border border-white/10 text-white/60 hover:border-amber-500/40'
                      )}>
                      {new Date(date + 'T00:00:00').toLocaleDateString('hi-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </button>
                  ))}
                </div>
                {selectedDate && (
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                    <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wide mb-4">
                      {formatDate(selectedDate + 'T00:00:00')} के लिए उपलब्ध समय
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {slots[selectedDate]?.map(slot => (
                        <button key={slot.id} onClick={() => handleSlotSelect(slot)}
                          className="flex flex-col items-center py-3 px-4 rounded-xl border border-white/10 hover:border-amber-500 hover:bg-amber-500/10 transition-all text-white/60 hover:text-amber-400">
                          <Clock className="w-4 h-4 mb-1" />
                          <span className="text-sm font-semibold">{formatTime(slot.startTime)}</span>
                          <span className="text-xs text-white/30 mt-0.5">to {formatTime(slot.endTime)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: DETAILS */}
        {step === 'details' && (
          <div className="animate-slide-up">
            <button onClick={goBack} className="flex items-center gap-1 text-white/40 hover:text-white text-sm mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" /> वापस
            </button>
            <h2 className="text-2xl font-black mb-1">आपकी जानकारी</h2>
            <p className="text-white/40 text-sm mb-6">बुकिंग कन्फर्म करने के लिए</p>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/40">सेवा</span>
                <span className="text-white font-semibold">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/40">दिनांक</span>
                <span className="text-white font-semibold">{selectedSlot && formatDate(selectedSlot.date + 'T00:00:00')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">समय</span>
                <span className="text-white font-semibold">{selectedSlot && formatTime(selectedSlot.startTime)}</span>
              </div>
              <div className="border-t border-white/10 mt-3 pt-3 flex justify-between">
                <span className="text-white/40 text-sm">कुल राशि</span>
                <span className="text-amber-400 font-black text-xl">{selectedService && formatPrice(selectedService.price)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <User className="w-3 h-3 inline mr-1" />पूरा नाम
                </label>
                <input className={inputClass('name')} placeholder="राम कुमार" value={formData.name}
                  onChange={e => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: '' }); }} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <Mail className="w-3 h-3 inline mr-1" />Email
                </label>
                <input type="email" className={inputClass('email')} placeholder="ram@example.com" value={formData.email}
                  onChange={e => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }} />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <Phone className="w-3 h-3 inline mr-1" />फोन नंबर
                </label>
                <input type="tel" className={inputClass('phone')} placeholder="9876543210" value={formData.phone}
                  onChange={e => { setFormData({ ...formData, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }} />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">सवाल / नोट्स (वैकल्पिक)</label>
                <textarea className={inputClass('')} rows={3} placeholder="कोई विशेष सवाल या जन्म विवरण..."
                  value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <button onClick={goNext} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:from-amber-400 hover:to-orange-400 transition-all active:scale-95">
                भुगतान की ओर बढ़ें <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PAYMENT */}
        {step === 'payment' && (
          <div className="animate-slide-up">
            <button onClick={goBack} className="flex items-center gap-1 text-white/40 hover:text-white text-sm mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" /> वापस
            </button>
            <h2 className="text-2xl font-black mb-1">समीक्षा और भुगतान</h2>
            <p className="text-white/40 text-sm mb-6">भुगतान से पहले विवरण जांचें</p>

            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6 space-y-4">
              <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wide border-b border-white/10 pb-3">बुकिंग सारांश</h3>
              {[
                { label: 'सेवा', value: selectedService?.name },
                { label: 'दिनांक', value: selectedSlot && formatDate(selectedSlot.date + 'T00:00:00') },
                { label: 'समय', value: selectedSlot && `${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)}` },
                { label: 'नाम', value: formData.name },
                { label: 'Email', value: formData.email },
                { label: 'फोन', value: formData.phone },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-white/40">{label}</span>
                  <span className="text-white font-medium text-right max-w-[60%]">{value}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-4 flex justify-between">
                <span className="font-bold text-white">कुल राशि</span>
                <span className="text-3xl font-black text-amber-400">{selectedService && formatPrice(selectedService.price)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 text-sm text-green-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Razorpay द्वारा 100% सुरक्षित भुगतान। UPI, Card, NetBanking सब accepted।
            </div>

            <button onClick={handlePayment} disabled={paying}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-lg py-5 rounded-2xl flex items-center justify-center gap-2 hover:from-amber-400 hover:to-orange-400 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-amber-500/30">
              {paying ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <>अभी भुगतान करें {selectedService && formatPrice(selectedService.price)}</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
