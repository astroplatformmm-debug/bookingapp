// src/app/api/slots/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addDays, startOfDay } from 'date-fns';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const serviceId = searchParams.get('serviceId');
  const dateStr = searchParams.get('date'); // 'YYYY-MM-DD' or null for all upcoming

  if (!serviceId) {
    return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
  }

  try {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 30);

    const whereClause: {
      serviceId: string;
      isBooked: boolean;
      date: { gte: Date; lte: Date } | { equals: Date };
    } = {
      serviceId,
      isBooked: false,
      date: dateStr
        ? { equals: new Date(dateStr) }
        : { gte: addDays(today, 1), lte: maxDate },
    };

    const slots = await prisma.slot.findMany({
      where: whereClause,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    // Group by date
    const grouped: Record<string, typeof slots> = {};
    for (const slot of slots) {
      const key = slot.date.toISOString().split('T')[0];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(slot);
    }

    return NextResponse.json({ slots, grouped });
  } catch (error) {
    console.error('Error fetching slots:', error);
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}
