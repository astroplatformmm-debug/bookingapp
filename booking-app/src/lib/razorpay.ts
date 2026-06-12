// src/lib/razorpay.ts
import crypto from 'crypto';

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const key = process.env.RAZORPAY_KEY_SECRET!;
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', key)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

export function getRazorpayInstance() {
  // Server-side Razorpay instance
  const Razorpay = require('razorpay');
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}
