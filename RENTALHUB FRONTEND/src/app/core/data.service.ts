import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API, Booking, Equipment, Payment, PaymentOrder, UserRow } from './api';

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);

  // public catalogue
  equipment(q = '', category = '') {
    let p = new HttpParams();
    if (q) p = p.set('q', q);
    if (category) p = p.set('category', category);
    return this.http.get<Equipment[]>(`${API}/api/equipment`, { params: p });
  }
  equipmentById(id: number) { return this.http.get<Equipment>(`${API}/api/equipment/${id}`); }

  // bookings
  createBooking(body: { equipmentId: number; quantity: number; startDate: string; endDate: string }) {
    return this.http.post<Booking>(`${API}/api/bookings`, body);
  }
  myBookings() { return this.http.get<Booking[]>(`${API}/api/bookings`); }
  booking(id: number) { return this.http.get<Booking>(`${API}/api/bookings/${id}`); }
  cancel(id: number) { return this.http.post<Booking>(`${API}/api/bookings/${id}/cancel`, {}); }

  // payments
  initiate(bookingId: number) { return this.http.post<PaymentOrder>(`${API}/api/payments/booking/${bookingId}/initiate`, {}); }
  verify(orderId: string, gatewayPaymentId: string, signature: string) {
    return this.http.post<Payment>(`${API}/api/payments/verify`, { orderId, gatewayPaymentId, signature });
  }
  payment(bookingId: number) { return this.http.get<Payment>(`${API}/api/payments/booking/${bookingId}`); }

  // admin
  adminEquipment() { return this.http.get<Equipment[]>(`${API}/api/admin/equipment`); }
  saveEquipment(item: Partial<Equipment>) {
    return item.id
      ? this.http.put<Equipment>(`${API}/api/admin/equipment/${item.id}`, item)
      : this.http.post<Equipment>(`${API}/api/admin/equipment`, item);
  }
  removeEquipment(id: number) { return this.http.delete(`${API}/api/admin/equipment/${id}`); }
  adminBookings() { return this.http.get<Booking[]>(`${API}/api/admin/bookings`); }
  setStatus(id: number, to: string) { return this.http.patch<Booking>(`${API}/api/admin/bookings/${id}/status`, {}, { params: { to } }); }
  settle(id: number, deductionAmount: number, reason: string) {
    return this.http.post<Payment>(`${API}/api/admin/payments/booking/${id}/settle-deposit`, { deductionAmount, reason });
  }
  users() { return this.http.get<UserRow[]>(`${API}/api/admin/users`); }
  approveVendor(id: number) { return this.http.patch(`${API}/api/admin/vendors/${id}/approve`, {}); }
}
