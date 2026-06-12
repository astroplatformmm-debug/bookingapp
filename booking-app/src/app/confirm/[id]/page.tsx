'use client';
// src/app/confirm/[id]/page.tsx

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Calendar, Clock, User, Mail, Phone, Home, Loader2, Sparkles } from 'lucide-react';
import { BookingType } from '@/types';
import { formatPrice, formatDate, formatTime } from '@/lib/utils';

export default function ConfirmPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Rahul Raj Astro';

  useEffect(() => {
    if (!id) return;
    fetch(`/api/bookings/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Booking not found');
        return r.json();
      })
      .then((data) => {
        if (data.paymentStatus !== 'PAID') {
          router.push('/book');
          return;
        }
        setBooking(data);
      })
      .catch(() => setError('Booking not found. Please check your confirmation email.'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-deep-400 mx-auto mb-3" />
          <p className="text-deep-400">Loading your booking...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="card text-center max-w-sm">
          <p className="text-deep-500 mb-4">{error || 'Something went wrong.'}</p>
          <Link href="/book" className="btn-primary">Book Again</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="hero-gradient px-6 py-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-saffron" />
        <span className="font-display text-white text-lg">{businessName}</span>
      </header>

      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="font-display text-3xl text-deep-800 mb-2">Booking Confirmed!</h1>
          <p className="text-deep-400">
            A confirmation has been sent to <span className="font-semibold text-deep-600">{booking.customerEmail}</span>
          </p>
        </div>

        {/* Booking Card */}
        <div className="card animate-slide-up mb-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-brand-100">
            <h2 className="font-display text-lg text-deep-700">Booking Details</h2>
            <span className="badge badge-green">Confirmed</span>
          </div>

          <div className="space-y-4">
            <InfoRow icon={<Calendar className="w-4 h-4 text-saffron" />} label="Service">
              {booking.service?.name}
            </InfoRow>
            <InfoRow icon={<Calendar className="w-4 h-4 text-saffron" />} label="Date">
              {booking.slot && formatDate(booking.slot.date + 'T00:00:00')}
            </InfoRow>
            <InfoRow icon={<Clock className="w-4 h-4 text-saffron" />} label="Time">
              {booking.slot && `${formatTime(booking.slot.startTime)} – ${formatTime(booking.slot.endTime)}`}
            </InfoRow>
            <InfoRow icon={<User className="w-4 h-4 text-saffron" />} label="Name">
              {booking.customerName}
            </InfoRow>
            <InfoRow icon={<Mail className="w-4 h-4 text-saffron" />} label="Email">
              {booking.customerEmail}
            </InfoRow>
            <InfoRow icon={<Phone className="w-4 h-4 text-saffron" />} label="Phone">
              {booking.customerPhone}
            </InfoRow>
          </div>

          <div className="border-t border-brand-100 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-deep-500">Amount Paid</span>
              <span className="text-2xl font-bold text-saffron">{formatPrice(booking.amountPaid)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-deep-400">Booking ID</span>
              <span className="font-mono text-xs bg-deep-50 px-2 py-1 rounded text-deep-500">{booking.id}</span>
            </div>
            {booking.paymentId && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-deep-400">Payment ID</span>
                <span className="font-mono text-xs bg-deep-50 px-2 py-1 rounded text-deep-500">{booking.paymentId}</span>
              </div>
            )}
          </div>
        </div>

        {/* What's Next */}
        <div className="card bg-deep-900 border-0 mb-6">
          <h3 className="font-semibold text-saffron mb-3">What happens next?</h3>
          <ul className="space-y-2">
            {[
              'Check your email for the confirmation and joining link (for online consultations).',
              'You can WhatsApp us if you need to reschedule.',
              'Join the video call 5 minutes early for online consultations.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-deep-200 text-sm">
                <span className="w-5 h-5 rounded-full bg-saffron/20 text-saffron flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/" className="btn-outline w-full flex items-center justify-center gap-2">
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-deep-400">
        {icon} {label}
      </span>
      <span className="font-medium text-deep-700 text-right max-w-[60%]">{children}</span>
    </div>
  );
}
