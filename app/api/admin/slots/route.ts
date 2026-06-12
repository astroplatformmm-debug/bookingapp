// src/app/api/admin/slots/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { serviceId, date, slots } = await req.json();
  // slots: [{ startTime, endTime }]

  if (!serviceId || !date || !slots?.length) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const created = await prisma.$transaction(
    slots.map((s: { startTime: string; endTime: string }) =>
      prisma.slot.upsert({
        where: {
          serviceId_date_startTime: {
            serviceId,
            date: new Date(date),
            startTime: s.startTime,
          },
        },
        update: {},
        create: {
          serviceId,
          date: new Date(date),
          startTime: s.startTime,
          endTime: s.endTime,
          isBooked: false,
        },
      })
    )
  );

  return NextResponse.json({ created: created.length });
}

export async function DELETE(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slotId } = await req.json();

  const slot = await prisma.slot.findUnique({ where: { id: slotId } });
  if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
  if (slot.isBooked) return NextResponse.json({ error: 'Cannot delete a booked slot' }, { status: 409 });

  await prisma.slot.delete({ where: { id: slotId } });
  return NextResponse.json({ success: true });
}
