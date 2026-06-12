// src/app/api/admin/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { status } = await req.json();
  if (!['CONFIRMED', 'CANCELLED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const booking = await prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({
      where: { id: params.id },
      data: { status },
      include: { service: true, slot: true },
    });

    if (status === 'CANCELLED') {
      await tx.slot.update({
        where: { id: updated.slotId },
        data: { isBooked: false },
      });
    }

    return updated;
  });

  return NextResponse.json(booking);
}
