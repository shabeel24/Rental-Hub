// Change this if your backend runs somewhere else.
export const API = 'http://localhost:8080';

export type Role = 'CUSTOMER' | 'VENDOR' | 'ADMIN';

export interface Equipment {
  id: number;
  name: string;
  description: string;
  category: string;
  pricePerDay: number;
  depositAmount: number;
  totalStock: number;
  imageUrl?: string;
  active: boolean;
}

export interface Booking {
  id: number;
  status: 'REQUESTED' | 'CONFIRMED' | 'PICKED_UP' | 'RETURNED' | 'CLOSED' | 'CANCELLED';
  paymentStatus?: string;
  equipmentId?: number;
  equipmentName?: string;
  customerEmail?: string;
  quantity: number;
  startDate: string;
  endDate: string;
  days: number;
  rentAmount: number;
  depositAmount: number;
  totalAmount: number;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface Payment {
  status: string;
  amount: number;
  gatewayPaymentId?: string;
  paidAt?: string;
  refundedAmount?: number;
  deductedAmount?: number;
  deductionReason?: string;
}

export interface UserRow {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  enabled: boolean;
}

export function errorText(e: any): string {
  const b = e?.error;
  if (e?.status === 0) return 'Cannot reach the server. Start the backend on ' + API + ' and try again.';
  if (b?.details && typeof b.details === 'object') return Object.values(b.details).join('. ');
  return b?.error || b?.message || 'Something went wrong. Please try again.';
}

export const rupees = (n: number | string | null | undefined) =>
  '₹' + Number(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
