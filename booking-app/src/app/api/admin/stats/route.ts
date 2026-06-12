// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';
import { startOfDay, startOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(new Date());

  const [
    totalBookings,
    confirmedBookings,
    todayBookings,
    monthBookings,
    totalRevenue,
    monthRevenue,
    pendingBookings,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.count({
      where: { createdAt: { gte: today }, status: 'CONFIRMED' },
    }),
    prisma.booking.count({
      where: { createdAt: { gte: monthStart }, status: 'CONFIRMED' },
    }),
    prisma.booking.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { amountPaid: true },
    }),
    prisma.booking.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: monthStart } },
      _sum: { amountPaid: true },
    }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
  ]);

  return NextResponse.json({
    totalBookings,
    confirmedBookings,
    todayBookings,
    monthBookings,
    pendingBookings,
    totalRevenue: totalRevenue._sum.amountPaid || 0,
    monthRevenue: monthRevenue._sum.amountPaid || 0,
  });
}
