'use client';
// src/app/book/page.tsx

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Clock, Calendar, User, Mail, Phone, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { ServiceType, SlotType } from '@/types';
import { formatPrice, formatDate, formatTime, cn } from '@/lib/utils';

type Step = 'service' | 'slot' | 'details' | 'payment';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

const STEPS: Step[] = ['service', 'slot', 'details', 'payment'];
const STEP_LABELS = ['Service', 'Slot', 'Details', 'Payment'];

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

  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Rahul Raj Astro';

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then(setServices)
      .catch(() => toast.error('Failed to load services'));
  }, []);

  const loadSlots = useCallback(async (serviceId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/slots?serviceId=${serviceId}`);
      const data = await res.json();
      setSlots(data.grouped || {});
      const firstDate = Object.keys(data.grouped || {})[0];
      if (firstDate) setSelectedDate(firstDate);
    } catch {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  }, []);

  const stepIndex = STEPS.indexOf(step);

  const goNext = () => setStep(STEPS[stepIndex + 1]);
  const goBack = () => setStep(STEPS[stepIndex - 1]);

  const handleServiceSelect = (svc: ServiceType) => {
    setSelectedService(svc);
    loadSlots(svc.id);
    goNext();
  };

  const handleSlotSelect = (slot: SlotType) => {
    setSelectedSlot(slot);
    goNext();
  };

  const validateDetails = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Valid email required';
    if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, '').slice(-10))) e.phone = 'Valid 10-digit Indian phone required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });

  const handlePayment = async () => {
    if (!validateDetails() || !selectedService || !selectedSlot) return;
    setPaying(true);

    try {
      // Create order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          slotId: selectedSlot.id,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          notes: formData.notes,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        toast.error(orderData.error || 'Failed to create order');
        setPaying(false);
        return;
      }

      // Load Razorpay
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Payment gateway failed to load. Check your connection.');
        setPaying(false);
        return;
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: businessName,
        description: selectedService.name,
        order_id: orderData.orderId,
        handler: async (response) => {
          setPaying(true);
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: orderData.bookingId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              router.push(`/confirm/${orderData.bookingId}`);
            } else {
              toast.error(verifyData.error || 'Payment verification failed');
            }
          } catch {
            toast.error('Verification error. Please contact support.');
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: '#2f4694' },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error('Something went wrong. Please try again.');
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="hero-gradient px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push('/')} className="text-deep-300 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-saffron" />
          <span className="font-display text-white text-lg">{businessName}</span>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-brand-100 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  i < stepIndex ? 'bg-saffron text-white'
                  : i === stepIndex ? 'bg-deep-500 text-white'
                  : 'bg-brand-100 text-deep-300'
                )}>
                  {i < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn(
                  'ml-1.5 text-xs font-semibold hidden sm:block',
                  i === stepIndex ? 'text-deep-600' : 'text-deep-300'
                )}>{label}</span>
                {i < STEP_LABELS.length - 1 && (
                  <div className={cn('flex-1 h-0.5 mx-3', i < stepIndex ? 'bg-saffron' : 'bg-brand-100')} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* STEP 1: SERVICE */}
        {step === 'service' && (
          <div className="animate-slide-up">
            <h2 className="font-display text-2xl text-deep-800 mb-2">Choose a Service</h2>
            <p className="text-deep-400 text-sm mb-6">Select the consultation type that fits your needs.</p>
            {services.length === 0 ? (
              <div className="card text-center py-12 text-deep-300">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                Loading services...
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => handleServiceSelect(svc)}
                    className="card w-full text-left hover:border-deep-300 hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-display text-lg text-deep-800 group-hover:text-deep-600 transition-colors">
                          {svc.name}
                        </h3>
                        <p className="text-deep-400 text-sm mt-1 leading-relaxed">{svc.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="flex items-center gap-1 text-deep-400 text-xs">
                            <Clock className="w-3 h-3" />
                            {svc.duration} min
                          </span>
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <span className="text-2xl font-bold text-saffron">{formatPrice(svc.price)}</span>
                        <ChevronRight className="w-5 h-5 text-deep-300 mt-2 ml-auto group-hover:text-deep-500 transition-colors" />
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
            <button onClick={goBack} className="flex items-center gap-1 text-deep-400 hover:text-deep-600 text-sm mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="font-display text-2xl text-deep-800 mb-1">Pick a Date & Time</h2>
            <p className="text-deep-400 text-sm mb-6">
              Service: <span className="font-semibold text-deep-600">{selectedService?.name}</span>
            </p>

            {loading ? (
              <div className="card text-center py-12 text-deep-300">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                Loading available slots...
              </div>
            ) : Object.keys(slots).length === 0 ? (
              <div className="card text-center py-12">
                <Calendar className="w-10 h-10 text-deep-200 mx-auto mb-3" />
                <p className="text-deep-400 font-medium">No slots available in the next 30 days.</p>
                <p className="text-deep-300 text-sm mt-1">Please contact us to schedule a custom time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Date Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {Object.keys(slots).map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                        selectedDate === date
                          ? 'bg-deep-500 text-white shadow'
                          : 'bg-white border border-brand-200 text-deep-500 hover:border-deep-300'
                      )}
                    >
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </button>
                  ))}
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="card">
                    <h3 className="font-semibold text-deep-600 mb-4 text-sm uppercase tracking-wide">
                      Available Times — {formatDate(selectedDate + 'T00:00:00')}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {slots[selectedDate]?.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleSlotSelect(slot)}
                          className={cn(
                            'flex flex-col items-center py-3 px-4 rounded-xl border-2 transition-all',
                            'border-brand-200 hover:border-deep-400 hover:bg-deep-50 text-deep-600'
                          )}
                        >
                          <Clock className="w-4 h-4 text-saffron mb-1" />
                          <span className="text-sm font-semibold">{formatTime(slot.startTime)}</span>
                          <span className="text-xs text-deep-400 mt-0.5">to {formatTime(slot.endTime)}</span>
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
            <button onClick={goBack} className="flex items-center gap-1 text-deep-400 hover:text-deep-600 text-sm mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="font-display text-2xl text-deep-800 mb-1">Your Details</h2>
            <p className="text-deep-400 text-sm mb-6">We'll use these to confirm your booking.</p>

            {/* Summary Card */}
            <div className="bg-deep-900/5 border border-deep-100 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-deep-400">Service</span>
                <span className="font-semibold text-deep-700">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-deep-400">Date & Time</span>
                <span className="font-semibold text-deep-700">
                  {selectedSlot && formatDate(selectedSlot.date + 'T00:00:00')}, {selectedSlot && formatTime(selectedSlot.startTime)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-deep-400">Amount</span>
                <span className="font-bold text-saffron text-base">{selectedService && formatPrice(selectedService.price)}</span>
              </div>
            </div>

            <div className="card space-y-5">
              <div>
                <label className="label">
                  <User className="w-3 h-3 inline mr-1" />Full Name
                </label>
                <input
                  className={cn('input-field', errors.name && 'border-red-400 focus:ring-red-400')}
                  placeholder="Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setErrors({ ...errors, name: '' }); }}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="label">
                  <Mail className="w-3 h-3 inline mr-1" />Email Address
                </label>
                <input
                  type="email"
                  className={cn('input-field', errors.email && 'border-red-400 focus:ring-red-400')}
                  placeholder="ramesh@example.com"
                  value={formData.email}
                  onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setErrors({ ...errors, email: '' }); }}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="label">
                  <Phone className="w-3 h-3 inline mr-1" />Phone Number
                </label>
                <input
                  type="tel"
                  className={cn('input-field', errors.phone && 'border-red-400 focus:ring-red-400')}
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setErrors({ ...errors, phone: '' }); }}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="label">Questions / Notes (optional)</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Any specific questions or your date of birth details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <button onClick={goNext} className="btn-primary w-full flex items-center justify-center gap-2">
                Continue to Payment <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PAYMENT REVIEW */}
        {step === 'payment' && (
          <div className="animate-slide-up">
            <button onClick={goBack} className="flex items-center gap-1 text-deep-400 hover:text-deep-600 text-sm mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <h2 className="font-display text-2xl text-deep-800 mb-1">Review & Pay</h2>
            <p className="text-deep-400 text-sm mb-6">Confirm your booking details before payment.</p>

            <div className="card mb-6 space-y-4">
              <h3 className="font-semibold text-deep-600 text-sm uppercase tracking-wide border-b border-brand-100 pb-3">Booking Summary</h3>
              {[
                { label: 'Service', value: selectedService?.name },
                { label: 'Date', value: selectedSlot && formatDate(selectedSlot.date + 'T00:00:00') },
                { label: 'Time', value: selectedSlot && `${formatTime(selectedSlot.startTime)} – ${formatTime(selectedSlot.endTime)}` },
                { label: 'Duration', value: `${selectedService?.duration} minutes` },
                { label: 'Name', value: formData.name },
                { label: 'Email', value: formData.email },
                { label: 'Phone', value: formData.phone },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-deep-400">{label}</span>
                  <span className="font-medium text-deep-700 text-right max-w-[60%]">{value}</span>
                </div>
              ))}
              <div className="border-t border-brand-100 pt-4 flex justify-between">
                <span className="font-bold text-deep-700">Total Amount</span>
                <span className="font-bold text-2xl text-saffron">{selectedService && formatPrice(selectedService.price)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Payments secured by Razorpay. Your card details are never stored on our servers.</span>
            </div>

            <button
              onClick={handlePayment}
              disabled={paying}
              className="btn-saffron w-full text-base py-4 flex items-center justify-center gap-2"
            >
              {paying ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                <>Pay {selectedService && formatPrice(selectedService.price)} via Razorpay</>
              )}
            </button>
            <p className="text-center text-deep-300 text-xs mt-3">
              By proceeding, you agree to our cancellation policy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
