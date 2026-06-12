import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, format } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  // Admin
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.admin.upsert({
    where: { email: 'admin@omkkaar.com' },
    update: {},
    create: {
      email: 'admin@omkkaar.com',
      password: hashedPassword,
      name: 'Mukesh Gupta',
    },
  });

  // Sirf ek service
  const service = await prisma.service.upsert({
    where: { id: 'service-kundali' },
    update: { name: 'कुंडली परामर्श', price: 19900 },
    create: {
      id: 'service-kundali',
      name: 'कुंडली परामर्श',
      description: 'Pt. Mukesh Ravindra Gupta के साथ व्यक्तिगत कुंडली विश्लेषण — करियर, विवाह, भविष्य',
      duration: 30,
      price: 19900,
      active: true,
    },
  });

  // Purani services delete karo
  await prisma.service.deleteMany({
    where: { id: { notIn: ['service-kundali'] } },
  });

  // Slots for next 14 days
  const timeSlots = [
    { start: '11:00', end: '11:30' },
    { start: '11:30', end: '12:00' },
    { start: '12:00', end: '12:30' },
    { start: '18:00', end: '18:30' },
    { start: '18:30', end: '19:00' },
    { start: '19:00', end: '19:30' },
  ];

  for (let i = 1; i <= 14; i++) {
    const date = addDays(new Date(), i);
    if (date.getDay() === 0) continue; // Skip Sunday

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

  console.log('✅ Done');
  console.log('Admin: admin@omkkaar.com / admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());