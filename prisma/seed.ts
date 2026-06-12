// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, format } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  // Create admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.admin.upsert({
    where: { email: 'admin@yourbusiness.com' },
    update: {},
    create: {
      email: 'admin@yourbusiness.com',
      password: hashedPassword,
      name: 'Admin',
    },
  });

  // Create services
  const service1 = await prisma.service.upsert({
    where: { id: 'service-kundali-online' },
    update: {},
    create: {
      id: 'service-kundali-online',
      name: 'Kundali Online Consultation',
      description: 'Personal astrology consultation via video call. Detailed birth chart analysis and life guidance.',
      duration: 60,
      price: 110000, // ₹1100 in paise
      active: true,
    },
  });

  const service2 = await prisma.service.upsert({
    where: { id: 'service-kundali-office' },
    update: {},
    create: {
      id: 'service-kundali-office',
      name: 'Kundali Office Visit',
      description: 'In-person astrology consultation at our office. Includes printed birth chart.',
      duration: 60,
      price: 50000, // ₹500 in paise
      active: true,
    },
  });

  // Generate slots for next 14 days
  const timeSlots = [
    { start: '11:00', end: '12:00' },
    { start: '12:00', end: '13:00' },
    { start: '13:00', end: '14:00' },
    { start: '18:00', end: '19:00' },
    { start: '19:00', end: '20:00' },
  ];

  for (let i = 1; i <= 14; i++) {
    const date = addDays(new Date(), i);
    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
    if (dayOfWeek === 0) continue; // Skip Sundays

    for (const service of [service1, service2]) {
      for (const slot of timeSlots) {
        await prisma.slot.upsert({
          where: {
            serviceId_date_startTime: {
              serviceId: service.id,
              date: new Date(format(date, 'yyyy-MM-dd')),
              startTime: slot.start,
            },
          },
          update: {},
          create: {
            serviceId: service.id,
            date: new Date(format(date, 'yyyy-MM-dd')),
            startTime: slot.start,
            endTime: slot.end,
            isBooked: false,
          },
        });
      }
    }
  }

  console.log('✅ Database seeded successfully');
  console.log('Admin login: admin@yourbusiness.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
