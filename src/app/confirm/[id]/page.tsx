'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Calendar, Clock, User, Mail, Phone, Loader2 } from 'lucide-react';
import { BookingType } from '@/types';
import { formatPrice, formatDate, formatTime } from '@/lib/utils';

export default function ConfirmPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/bookings/${id}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(data => { if (data.paymentStatus !== 'PAID') { router.push('/book'); return; } setBooking(data); })
      .catch(() => setError('बुकिंग नहीं मिली।'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
        <p className="text-white/40">लोड हो रहा है...</p>
      </div>
    </div>
  );

  if (error || !booking) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center max-w-sm">
        <p className="text-white/60 mb-4">{error}</p>
        <Link href="/book" className="bg-amber-500 text-black font-bold px-6 py-3 rounded-xl">फिर से बुक करें</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center font-bold text-sm">ॐ</div>
        <span className="font-bold">OMKKAAR Astroworld</span>
      </header>

      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Success */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-black mb-2">बुकिंग कन्फर्म! 🙏</h1>
          <p className="text-white/40">
            कन्फर्मेशन <span className="text-amber-400">{booking.customerEmail}</span> पर भेज दी गई है
          </p>
        </div>

        {/* Booking Card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <h2 className="font-bold text-white/70 text-sm uppercase tracking-wide">बुकिंग विवरण</h2>
            <span className="bg-green-500/20 border border-green-500/30 text-green-400 text-xs px-3 py-1 rounded-full font-semibold">Confirmed</span>
          </div>
          <div className="space-y-4">
            {[
              { icon: <Calendar className="w-4 h-4 text-amber-400" />, label: 'सेवा', value: booking.service?.name },
              { icon: <Calendar className="w-4 h-4 text-amber-400" />, label: 'दिनांक', value: booking.slot && formatDate(booking.slot.date + 'T00:00:00') },
              { icon: <Clock className="w-4 h-4 text-amber-400" />, label: 'समय', value: booking.slot && `${formatTime(booking.slot.startTime)} – ${formatTime(booking.slot.endTime)}` },
              { icon: <User className="w-4 h-4 text-amber-400" />, label: 'नाम', value: booking.customerName },
              { icon: <Mail className="w-4 h-4 text-amber-400" />, label: 'Email', value: booking.customerEmail },
              { icon: <Phone className="w-4 h-4 text-amber-400" />, label: 'फोन', value: booking.customerPhone },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/40">{icon}{label}</span>
                <span className="text-white font-medium text-right max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-4 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-sm">भुगतान राशि</span>
              <span className="text-3xl font-black text-amber-400">{formatPrice(booking.amountPaid)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-white/20 text-xs">Booking ID</span>
              <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded text-white/40">{booking.id}</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-amber-400 mb-3">आगे क्या होगा?</h3>
          <ul className="space-y-2">
            {[
              'आपको email पर कन्फर्मेशन मिल गई है।',
              'Pt. Gupta WhatsApp/Phone पर आपसे जुड़ेंगे।',
              'समय पर उपलब्ध रहें — कॉल मिस न करें।',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">{i + 1}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Link href="/" className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 text-white font-semibold py-3.5 rounded-xl transition-all">
          होम पर वापस जाएं
        </Link>
      </div>
    </div>
  );
}