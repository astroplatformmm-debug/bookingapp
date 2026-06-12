// src/app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { sendBookingConfirmationEmail } from '@/lib/email';
import { format } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
    }

    // Verify the signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Update booking and slot atomically
    const booking = await prisma.$transaction(async (tx) => {
      const existingBooking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { slot: true, service: true },
      });

      if (!existingBooking) throw new Error('Booking not found');
      if (existingBooking.orderId !== razorpay_order_id) throw new Error('Order mismatch');
      if (existingBooking.paymentStatus === 'PAID') {
        // Idempotent — already confirmed
        return existingBooking;
      }

      // Mark slot as booked
      await tx.slot.update({
        where: { id: existingBooking.slotId },
        data: { isBooked: true },
      });

      // Confirm booking
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paymentId: razorpay_payment_id,
        },
        include: { slot: true, service: true },
      });

      return updated;
    });

    // Send confirmation emails (non-blocking)
    try {
      await sendBookingConfirmationEmail({
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        serviceName: booking.service.name,
        date: format(booking.slot.date, 'EEEE, d MMMM yyyy'),
        startTime: booking.slot.startTime,
        endTime: booking.slot.endTime,
        bookingId: booking.id,
        amountPaid: booking.amountPaid,
      });
    } catch (emailErr) {
      console.error('Email failed (non-fatal):', emailErr);
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: 'Booking confirmed',
    });
  } catch (error: unknown) {
    console.error('Payment verification error:', error);
    const message = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
