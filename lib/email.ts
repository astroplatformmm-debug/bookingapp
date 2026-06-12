// src/lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  bookingId: string;
  amountPaid: number;
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Our Business';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Inter, sans-serif; background: #f9f6f0; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #2f4694, #1b2a5c); padding: 32px; text-align: center; }
        .header h1 { color: #E8A020; font-size: 24px; margin: 0 0 4px; font-family: Georgia, serif; }
        .header p { color: #a8b3d9; margin: 0; font-size: 14px; }
        .body { padding: 32px; }
        .greeting { font-size: 18px; font-weight: 600; color: #1b2a5c; margin-bottom: 8px; }
        .detail-card { background: #fdf8f0; border: 1px solid #f3d09e; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #faebd7; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #78460e; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-value { color: #1b2a5c; font-size: 14px; font-weight: 500; }
        .amount { font-size: 20px; font-weight: 700; color: #2f4694; }
        .footer { background: #f0f0f0; padding: 20px 32px; text-align: center; }
        .footer p { color: #666; font-size: 12px; margin: 0; }
        .booking-id { background: #eef0f7; border-radius: 6px; padding: 10px 16px; font-family: monospace; font-size: 12px; color: #5267b3; display: inline-block; margin-top: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${businessName}</h1>
          <p>Booking Confirmation</p>
        </div>
        <div class="body">
          <div class="greeting">Namaste, ${data.customerName}! 🙏</div>
          <p style="color:#555; margin: 8px 0 20px;">Your appointment has been confirmed. Here are your booking details:</p>
          
          <div class="detail-card">
            <div class="detail-row">
              <span class="detail-label">Service</span>
              <span class="detail-value">${data.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date</span>
              <span class="detail-value">${data.date}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time</span>
              <span class="detail-value">${data.startTime} – ${data.endTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount Paid</span>
              <span class="detail-value amount">₹${(data.amountPaid / 100).toLocaleString('en-IN')}</span>
            </div>
          </div>
          
          <p style="color:#555; font-size:14px;">Please save your booking ID for future reference:</p>
          <div class="booking-id">${data.bookingId}</div>

          <p style="color:#555; font-size:14px; margin-top:24px;">
            If you need to reschedule or have any questions, please contact us at 
            <a href="tel:${process.env.NEXT_PUBLIC_BUSINESS_PHONE}" style="color:#2f4694;">${process.env.NEXT_PUBLIC_BUSINESS_PHONE}</a>.
          </p>
        </div>
        <div class="footer">
          <p>${businessName} &bull; Powered by LevelUp Automation</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.customerEmail,
    subject: `✅ Booking Confirmed – ${data.serviceName} on ${data.date}`,
    html,
  });

  // Notify admin
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `New Booking: ${data.customerName} – ${data.serviceName}`,
    text: `
New booking received:

Customer: ${data.customerName}
Email: ${data.customerEmail}
Service: ${data.serviceName}
Date: ${data.date}
Time: ${data.startTime} – ${data.endTime}
Amount: ₹${(data.amountPaid / 100).toLocaleString('en-IN')}
Booking ID: ${data.bookingId}

View in dashboard: ${appUrl}/admin
    `.trim(),
  });
}
