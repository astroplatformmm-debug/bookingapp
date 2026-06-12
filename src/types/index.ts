// src/types/index.ts
export interface ServiceType {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  active: boolean;
}

export interface SlotType {
  id: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface BookingType {
  id: string;
  slotId: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  paymentId?: string;
  orderId?: string;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  amountPaid: number;
  createdAt: string;
  service?: ServiceType;
  slot?: SlotType;
}

export interface BookingFormData {
  serviceId: string;
  slotId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}
