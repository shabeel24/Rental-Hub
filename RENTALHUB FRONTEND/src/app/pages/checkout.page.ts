import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../core/data.service';
import { Booking, errorText, rupees } from '../core/api';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink],
  template: `
  <section class="page wrap">
    @if (done()) {
      <div class="done">
        <svg viewBox="0 0 80 80" class="tick" aria-hidden="true"><circle cx="40" cy="40" r="36"/><path d="M24 41l11 11 21-24"/></svg>
        <h1 class="title">Payment received</h1>
        <p class="lede">Your booking #{{ booking()?.id }} is confirmed. We will have {{ booking()?.quantity }} × {{ booking()?.equipmentName || 'your equipment' }} ready for {{ booking()?.startDate }}.</p>
        <a routerLink="/my-bookings" class="btn btn-dark">View my bookings</a>
      </div>
    } @else if (booking(); as b) {
      <div class="grid">
        <div class="sl">
          <h1 class="title">Review and pay</h1>
          <p class="lede">Booking #{{ b.id }} · {{ b.startDate }} to {{ b.endDate }} ({{ b.days }} {{ b.days === 1 ? 'day' : 'days' }})</p>
          @if (b.status !== 'REQUESTED') { <p class="notice" style="margin-top:24px">This booking is {{ b.status.toLowerCase().replace('_', ' ') }} and is not waiting for payment.</p> }
        </div>
        <div class="panel sr">
          <div class="r"><span>Rent</span><b class="num">{{ rupees(b.rentAmount) }}</b></div>
          <div class="r"><span>Refundable deposit</span><b class="num">{{ rupees(b.depositAmount) }}</b></div>
          <div class="r total"><span>Total</span><b class="num">{{ rupees(b.totalAmount) }}</b></div>
          @if (error()) { <p class="err">{{ error() }}</p> }
          <button class="btn btn-dark full" (click)="pay()" [disabled]="busy() || b.status !== 'REQUESTED'">
            {{ busy() ? 'Processing payment…' : 'Pay ' + rupees(b.totalAmount) }}
          </button>
          <p class="small fine">Test mode: the payment is simulated by the mock gateway. For Razorpay, open its checkout here with the order id.</p>
        </div>
      </div>
    } @else if (error()) { <p class="err">{{ error() }}</p> }
  </section>`,
  styles: [`
  .page{padding-block:160px 120px;min-height:80vh}
  .grid{display:grid;grid-template-columns:1.1fr 1fr;gap:72px;align-items:start}
  .lede{margin-top:16px}
  .panel{background:#fff;border:1px solid var(--line);padding:40px;border-radius:6px}
  .r{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--line);color:var(--stone)} .r b{font-weight:400;color:var(--ink)}
  .total{border-bottom:0;margin:6px 0 26px;color:var(--ink);font-size:18px} .total b{font-weight:500;font-size:30px;letter-spacing:-.02em}
  .full{width:100%} .fine{margin:16px 0 0}
  .done{max-width:540px;margin:0 auto;text-align:center;display:flex;flex-direction:column;align-items:center;gap:20px}
  .tick{width:96px;fill:none;stroke:var(--ok);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
  .tick circle{stroke-dasharray:226;stroke-dashoffset:226;animation:dr 1s var(--ease) forwards}
  .tick path{stroke-dasharray:60;stroke-dashoffset:60;animation:dr .6s var(--ease) .7s forwards}
  @keyframes dr{to{stroke-dashoffset:0}}
  @media(max-width:860px){.grid{grid-template-columns:1fr;gap:40px}.panel{padding:28px}}`]
})
export class CheckoutPage implements OnInit {
  private data = inject(DataService);
  private route = inject(ActivatedRoute);
  rupees = rupees;
  booking = signal<Booking | null>(null);
  busy = signal(false);
  done = signal(false);
  error = signal('');

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.data.booking(id).subscribe({ next: b => this.booking.set(b), error: e => this.error.set(errorText(e)) });
  }

  pay() {
    const b = this.booking(); if (!b) return;
    this.busy.set(true); this.error.set('');
    this.data.initiate(b.id).subscribe({
      next: order => {
        // Mock gateway: any payment id starting with "pay_" and the signature MOCK_SUCCESS is accepted.
        const paymentId = 'pay_' + Math.random().toString(36).slice(2, 12);
        setTimeout(() => this.data.verify(order.orderId, paymentId, 'MOCK_SUCCESS').subscribe({
          next: () => { this.busy.set(false); this.done.set(true); },
          error: e => { this.busy.set(false); this.error.set(errorText(e)); }
        }), 900);
      },
      error: e => { this.busy.set(false); this.error.set(errorText(e)); }
    });
  }
}
